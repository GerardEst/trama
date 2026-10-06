import { expect, Locator, test } from '@playwright/test'

async function expectAnswersAtBottom(container: Locator) {
  await expect.poll(() => container.evaluate(element => {
    const answers = element.querySelectorAll('.node__answers')
    const last = answers.item(answers.length - 1)
    const content = last.closest('.node__content')!
    const view = element.querySelector('polo-single-game, polo-cumulative-game')!
    const padding = parseFloat(getComputedStyle(content).paddingBottom) + parseFloat(getComputedStyle(view).paddingBottom)
    return Math.abs(element.getBoundingClientRect().bottom - last.getBoundingClientRect().bottom - padding)
  })).toBeLessThan(2)
}

for (const cumulativeMode of [false, true]) {
  for (const viewport of [{ width: 1200, height: 900 }, { width: 390, height: 844 }]) {
    test(`answers fill the reading area in ${cumulativeMode ? 'cumulative' : 'single'} mode at ${viewport.width}px (mocked story)`, async ({ page }) => {
      await page.setViewportSize(viewport)
      const story = {
        id: 'answer-layout', name: 'Answer layout regression', cumulativeMode,
        tracking: false, sharing: false, tapLink: false, footer: {},
        tree: { refs: {}, categories: [], nodes: [
          { id: 'node_0', type: 'content', top: 0, left: 0, text: 'First short passage',
            answers: [{ id: 'answer_0_0', text: 'Continue', join: [{ node: 'node_1' }] }] },
          { id: 'node_1', type: 'content', top: 0, left: 0, text: 'Automatic passage', join: [{ node: 'node_2' }] },
          { id: 'node_2', type: 'content', top: 0, left: 0, text: 'Current short passage',
            answers: [{ id: 'answer_2_0', text: 'Finish', join: [{ node: 'node_3' }] }] },
          { id: 'node_3', type: 'end', top: 0, left: 0, text: 'End' },
        ] },
      }
      await page.route('**/rest/v1/stories?*', route => route.fulfill({ json: [story] }))
      await page.goto(`/private/${story.id}`)
      const container = page.locator('.gameContainer')
      await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeVisible()
      await expectAnswersAtBottom(container)
      await page.getByRole('button', { name: 'Continue', exact: true }).click()
      await expect(page.getByRole('button', { name: 'Finish', exact: true })).toBeVisible()
      await expect(page.getByText('Automatic passage', { exact: true })).toBeVisible()
      await expectAnswersAtBottom(container)
      if (cumulativeMode) {
        const history = container.locator('polo-cumulative-game > polo-game-step').first()
        expect((await history.boundingBox())!.height).toBeLessThan((await container.boundingBox())!.height)
      }
      await page.setViewportSize({ ...viewport, height: viewport.height + 180 })
      await expectAnswersAtBottom(container)
      await page.getByRole('button', { name: 'Finish', exact: true }).click()
      await expect(page.getByText('End', { exact: true })).toBeVisible()
    })
  }

  test(`long passages scroll naturally above answers in ${cumulativeMode ? 'cumulative' : 'single'} mode (mocked story)`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const story = {
      id: 'long-answer-layout', name: 'Long passage regression', cumulativeMode,
      tracking: false, sharing: false, tapLink: false, footer: {},
      tree: { refs: {}, categories: [], nodes: [
        { id: 'node_0', type: 'content', top: 0, left: 0, text: 'A long passage line.\n'.repeat(100),
          answers: [{ id: 'answer_0_0', text: 'Finish long passage', join: [{ node: 'node_1' }] }] },
        { id: 'node_1', type: 'end', top: 0, left: 0, text: 'End' },
      ] },
    }
    await page.route('**/rest/v1/stories?*', route => route.fulfill({ json: [story] }))
    await page.goto(`/private/${story.id}`)
    const container = page.locator('.gameContainer')
    await expect(page.getByText('A long passage line.', { exact: false }).first()).toBeVisible()
    await expect.poll(() => container.evaluate(element => element.scrollHeight - element.clientHeight)).toBeGreaterThan(500)
    await container.evaluate(element => { element.scrollTop = element.scrollHeight })
    await expectAnswersAtBottom(container)
    const passage = await container.locator('.node__passage').boundingBox()
    const answers = await container.locator('.node__answers').boundingBox()
    expect(answers!.y).toBeGreaterThanOrEqual(passage!.y + passage!.height)
    await page.getByRole('button', { name: 'Finish long passage', exact: true }).click()
    await expect(page.getByText('End', { exact: true })).toBeVisible()
  })
}
