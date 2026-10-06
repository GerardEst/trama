import { expect, Page, test } from '@playwright/test'
import { tree } from '../../src/app/core/interfaces/interfaces'
import { environment } from '../../src/environments/environment'

// These regressions also run without an authenticated dashboard setup.
test.use({ storageState: { cookies: [], origins: [] } })

async function mockStory(page: Page) {
  const authorId = '00000000-0000-4000-8000-000000000011'
  const storyId = '00000000-0000-4000-8000-000000000012'
  const user = { id: authorId, email: 'linear-test@example.com', aud: 'authenticated', role: 'authenticated' }
  let gameWrites = 0
  let savedTree: tree = {
    nodes: [
      { id: 'node_0', type: 'content', top: 5000, left: 5000,
        text: '<p>Hello <span data-trama-variable="" data-kind="property" data-key="hero">#hero</span></p>',
        events: [
          { id: 'hero', type: 'property', action: 'alterProperty', target: 'hero', property: 'Anna', amount: '' },
          { id: 'gold', type: 'stat', action: 'alterStat', target: 'stat_gold', amount: '1' },
        ],
        answers: [{ id: 'answer_0_0', text: 'Keep going', join: [{ node: 'node_1' }],
          events: [{ id: 'reward', type: 'stat', action: 'alterStat', target: 'stat_gold', amount: '1' }] },
          { id: 'answer_0_1', text: 'Locked answer', join: [{ node: 'node_3' }],
            requirements: [{ target: 'stat_gold', type: 'stat', amount: 99 }] }] },
      { id: 'node_1', type: 'content', groupId: 'node_2', top: 5000, left: 5400,
        text: 'Gold: #stat_gold', events: [{ id: 'arrival', type: 'stat', action: 'alterStat', target: 'stat_gold', amount: '2' }],
        answers: [{ id: 'answer_1_0', text: 'Finish with #stat_gold gold', join: [{ node: 'node_3' }] }] },
      { id: 'node_2', type: 'group', text: 'Chapter', top: 5000, left: 5400 },
      { id: 'node_3', type: 'end', text: 'The end', top: 5000, left: 5800 },
    ],
    refs: { stat_gold: { name: 'Gold', type: 'stat' } }, categories: [],
  }
  const authKey = `sb-${new URL(environment.apiUrl).hostname.split('.')[0]}-auth-token`
  // Deliberately invalid test credentials: all API requests are intercepted.
  await page.addInitScript(({ authKey, user, storyId }) => {
    const expiresAt = Math.floor(Date.now() / 1000) + 3600
    const token = `${btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))}.${btoa(JSON.stringify({ sub: user.id, exp: expiresAt, role: 'authenticated' }))}.test-signature`
    localStorage.setItem(authKey, JSON.stringify({ access_token: token, refresh_token: 'test-refresh-token',
      token_type: 'bearer', expires_at: expiresAt, expires_in: 3600, user }))
    localStorage.setItem('polo-id', storyId)
  }, { authKey, user, storyId })

  await page.route(`${environment.apiUrl}/**`, async route => {
    const path = new URL(route.request().url()).pathname
    if (path === '/auth/v1/user') await route.fulfill({ json: user })
    else if (path === '/rest/v1/profiles') await route.fulfill({ json: [{ subscription_status: 'active', plan: 'pro', user_name: 'Test author' }] })
    else if (path === '/rest/v1/stories' && route.request().method() === 'PATCH') {
      const body = route.request().postDataJSON()
      if (body.tree) savedTree = body.tree
      await route.fulfill({ json: { id: storyId } })
    } else if (path === '/rest/v1/stories') {
      await route.fulfill({ json: [{ id: storyId, name: 'Linear regression', tree: savedTree,
        tracking: true, sharing: true, tapLink: true, cumulativeMode: true, footer: {}, custom_id: null }] })
    } else {
      if (path === '/rest/v1/games' && route.request().method() !== 'GET') gameWrites++
      await route.abort()
    }
  })
  return { tree: () => savedTree, gameWrites: () => gameWrites }
}

async function openLinearView(page: Page) {
  // On mobile the initially pinned story list covers the board's bottom tools.
  const viewport = page.viewportSize()!
  if (viewport.width <= 760 && await page.locator('polo-menu .menu').evaluate(element => element.classList.contains('fixedMenu'))) {
    await page.getByRole('navigation', { name: 'Your stories', exact: true }).getByRole('button', { name: 'Toggle menu', exact: true }).click()
    await page.mouse.move(viewport.width - 8, 200)
  }
  await page.locator('polo-menu-tree-legend').getByRole('button', { name: 'Preview', exact: true }).click()
}

test('preview and editing share text and preserve the path and player state (mocked backend)', async ({ page }) => {
  const backend = await mockStory(page)
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.setViewportSize({ width: 1600, height: 1000 })
  await page.goto('/dashboard')
  await openLinearView(page)
  const linear = page.locator('polo-linear-editor')
  await expect(linear.getByText('Hello Anna', { exact: true })).toBeVisible()
  await expect(linear.getByRole('textbox')).toHaveCount(0)
  await expect(linear.getByRole('toolbar')).toHaveCount(0)
  await expect.poll(() => linear.evaluate(element => {
    const container = element.querySelector('.linearContent')!
    const answers = element.querySelector('.node__answers')!
    const padding = parseFloat(getComputedStyle(element.querySelector('.node__content')!).paddingBottom)
    return Math.abs(container.getBoundingClientRect().bottom - answers.getBoundingClientRect().bottom - padding)
  })).toBeLessThan(2)
  await expect(page.locator('polo-node.node--playing .node')).toHaveAttribute('data-board-join-node', 'node_0')

  await linear.getByRole('button', { name: 'Edit', exact: true }).click()
  const passage = linear.getByRole('textbox', { name: 'Passage', exact: true })
  await expect(passage).toHaveText('Hello #hero')
  await expect(linear.getByRole('toolbar')).toHaveCount(1)
  await expect(linear.getByRole('textbox')).toHaveCount(3)
  await passage.click()
  await passage.press('End')
  await passage.pressSequentially(' corrected')
  await linear.getByRole('button', { name: 'Preview', exact: true }).click()
  await expect(linear.getByText('Hello Anna corrected', { exact: true })).toBeVisible()
  await expect.poll(() => backend.tree().nodes[0].text).toContain('data-trama-variable')
  await expect.poll(() => backend.tree().nodes[0].text).toContain('corrected')
  await expect(page.locator('.node[data-board-join-node="node_0"] .richTextField__preview').first()).toContainText('corrected')

  await linear.getByRole('button', { name: 'Keep going', exact: true }).click()
  await expect(linear.getByText('Gold: 4', { exact: true })).toBeVisible()
  await expect(page.locator('polo-node.node--playing .node')).toHaveAttribute('data-board-join-node', 'node_1')
  await expect(page.getByRole('button', { name: /Exit Chapter/ })).toBeVisible()
  await linear.getByRole('button', { name: 'Back', exact: true }).click()
  await linear.getByRole('button', { name: 'Keep going', exact: true }).click()
  await expect(linear.getByRole('button', { name: 'Finish with 4 gold', exact: true })).toBeVisible()

  await linear.getByRole('button', { name: 'Edit', exact: true }).click()
  await expect(passage).toHaveText('Gold: #stat_gold')
  const boardText = page.locator('.node[data-board-join-node="node_1"] .richTextField__preview').first()
  await boardText.click()
  await expect(page.locator('polo-node [contenteditable="true"]')).toBeVisible()
  await page.locator('polo-node [contenteditable="true"]').press('End')
  await page.locator('polo-node [contenteditable="true"]').pressSequentially('!')
  await linear.getByRole('heading', { name: 'Preview', exact: true }).click()
  await expect.poll(() => backend.tree().nodes[1].text).toContain('!')
  await expect(passage).toHaveText('Gold: #stat_gold!')
  await page.screenshot({ path: test.info().outputPath('linear-desktop.png') })
  await linear.getByRole('button', { name: 'Preview', exact: true }).click()
  await expect(linear.getByText('Gold: 4!', { exact: true })).toBeVisible()
  await linear.getByRole('button', { name: 'Finish with 4 gold', exact: true }).click()
  await expect(linear.getByText('The end', { exact: true })).toBeVisible()
  await expect(linear.locator('polo-game-end-actions, polo-cumulative-game')).toHaveCount(0)
  expect(backend.gameWrites()).toBe(0)
  expect(errors).toEqual([])
})

test('one toolbar edits plain answer surfaces below a divider without pencils or answer navigation (mocked backend)', async ({ page }) => {
  const backend = await mockStory(page)
  await page.setViewportSize({ width: 1600, height: 1000 })
  await page.goto('/dashboard')
  await openLinearView(page)
  const linear = page.locator('polo-linear-editor')
  await linear.getByRole('button', { name: 'Edit', exact: true }).click()
  const passage = linear.getByRole('textbox', { name: 'Passage', exact: true })
  const answer = linear.getByRole('textbox', { name: 'Answer 1', exact: true })
  const locked = linear.getByRole('textbox', { name: 'Answer 2', exact: true })
  await expect(linear.getByRole('textbox')).toHaveCount(3)
  await expect(linear.getByRole('toolbar')).toHaveCount(1)
  await expect(linear.locator('.answerEditButton, polo-game-answer')).toHaveCount(0)
  const answers = linear.locator('.authorAnswers')
  await expect(answers).toHaveCSS('border-top-style', 'solid')
  const secondAnswer = answers.locator(':scope > polo-rich-text-editor').nth(1)
  await expect(secondAnswer).toHaveCSS('border-top-style', 'solid')
  await expect(secondAnswer).toHaveCSS('border-top-width', '1px')
  await expect(secondAnswer).toHaveCSS('border-top-color', await answers.evaluate(element => getComputedStyle(element).borderTopColor))
  await answer.fill('Keep walking')
  await answer.press('ControlOrMeta+a')
  await linear.getByRole('button', { name: 'Bold', exact: true }).click()
  await expect(linear.getByRole('button', { name: 'Heading 1', exact: true })).toBeDisabled()
  await expect(passage).toHaveText('Hello #hero')
  await locked.fill('Corrected locked answer ')
  await locked.press('End')
  await linear.getByRole('combobox', { name: 'Insert variable', exact: true }).selectOption('stat:stat_gold')
  await expect.poll(() => backend.tree().nodes[0].answers![1].text).toContain('data-key="stat_gold"')
  await passage.click()
  await expect(linear.getByRole('button', { name: 'Heading 1', exact: true })).toBeEnabled()
  await linear.getByRole('button', { name: 'Preview', exact: true }).click()
  await expect(linear.getByRole('textbox')).toHaveCount(0)
  await expect.poll(() => backend.tree().nodes[0].answers![0].text).toContain('<strong>Keep walking</strong>')
  await expect(linear.getByText('Hello Anna', { exact: true })).toBeVisible()
  await expect(linear.getByRole('button', { name: 'Keep walking', exact: true })).toBeVisible()
  await linear.getByRole('button', { name: 'Keep walking', exact: true }).click()
  await expect(linear.getByRole('button', { name: 'Finish with 4 gold', exact: true })).toBeVisible()
  expect(backend.gameWrites()).toBe(0)
})

test('removing the edited node rewinds and retargets the shared toolbar (mocked backend)', async ({ page }) => {
  await mockStory(page)
  await page.setViewportSize({ width: 1600, height: 1000 })
  await page.goto('/dashboard')
  await openLinearView(page)
  const linear = page.locator('polo-linear-editor')
  await linear.getByRole('button', { name: 'Keep going', exact: true }).click()
  await expect(linear.getByRole('button', { name: 'Finish with 4 gold', exact: true })).toBeVisible()
  await linear.getByRole('button', { name: 'Edit', exact: true }).click()
  await expect(linear.getByRole('textbox', { name: 'Passage', exact: true })).toHaveText('Gold: #stat_gold')
  const current = page.locator('.node[data-board-join-node="node_1"]')
  await current.getByRole('button', { name: 'Node options', exact: true }).click()
  await current.getByRole('button', { name: 'Delete', exact: true }).click()
  await expect(linear.getByRole('textbox', { name: 'Passage', exact: true })).toHaveText('Hello #hero')
  await expect(linear.getByRole('toolbar')).toHaveCount(1)
  await expect(linear.getByRole('button', { name: 'Heading 1', exact: true })).toBeEnabled()
  await expect(page.locator('polo-node.node--playing .node')).toHaveAttribute('data-board-join-node', 'node_0')
})

test('disabling follow removes the highlight, including after navigation and explicit location (mocked backend)', async ({ page }) => {
  await mockStory(page)
  await page.setViewportSize({ width: 1600, height: 1000 })
  await page.goto('/dashboard')
  await openLinearView(page)
  const linear = page.locator('polo-linear-editor')
  const highlighted = page.locator('polo-node.node--playing')
  await expect(highlighted.locator('.node')).toHaveAttribute('data-board-join-node', 'node_0')

  const follow = linear.getByRole('checkbox', { name: 'Follow node', exact: true })
  await follow.uncheck()
  await expect(highlighted).toHaveCount(0)
  await linear.getByRole('button', { name: 'Keep going', exact: true }).click()
  await expect(linear.getByText('Gold: 4', { exact: true })).toBeVisible()
  await expect(highlighted).toHaveCount(0)
  await expect(page.locator('.node[data-board-join-node="node_0"]')).toBeVisible()
  await expect(page.locator('.node[data-board-join-node="node_1"]')).toHaveCount(0)

  await linear.getByRole('button', { name: 'node_1', exact: true }).click()
  await expect(page.locator('.node[data-board-join-node="node_1"]')).toBeVisible()
  await expect(highlighted).toHaveCount(0)
  await follow.check()
  await expect(highlighted.locator('.node')).toHaveAttribute('data-board-join-node', 'node_1')
  await expect(highlighted).toHaveAttribute('data-playing-label', 'You are previewing this node')
  await linear.getByRole('button', { name: 'Back', exact: true }).click()
  await expect(highlighted.locator('.node')).toHaveAttribute('data-board-join-node', 'node_0')
})

test('mobile switching preserves the visit and edit mode (mocked backend)', async ({ page }) => {
  await mockStory(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/dashboard')
  await openLinearView(page)
  const linear = page.locator('polo-linear-editor')
  await expect(linear.getByText('Hello Anna', { exact: true })).toBeVisible()
  await expect(page.locator('.boardPane')).toBeHidden()
  const bounds = await linear.boundingBox()
  expect(bounds!.width).toBeGreaterThan(370)
  expect(bounds!.y).toBe(16)
  expect(bounds!.height).toBe(844 - 32)
  await expect(page.locator('polo-menu-top .menu')).toBeHidden()
  await expect(page.locator('polo-menu .openMenu')).toBeHidden()
  await linear.getByRole('button', { name: 'Keep going', exact: true }).click()
  await expect(linear.getByRole('button', { name: 'Finish with 4 gold', exact: true })).toBeVisible()
  await linear.getByRole('button', { name: 'Edit', exact: true }).click()
  await expect(linear.getByRole('textbox', { name: 'Passage', exact: true })).toHaveText('Gold: #stat_gold')
  await linear.getByRole('button', { name: 'Show board', exact: true }).click()
  await expect(page.locator('.boardPane')).toBeVisible()
  await expect(page.locator('polo-menu-top .menu')).toBeVisible()
  await expect(page.locator('polo-menu .openMenu')).toBeVisible()
  await expect(linear).toBeHidden()
  await openLinearView(page)
  await expect(linear.getByRole('textbox', { name: 'Passage', exact: true })).toHaveText('Gold: #stat_gold')
  await expect(linear.getByRole('toolbar')).toHaveCount(1)
  await page.screenshot({ path: test.info().outputPath('linear-mobile.png') })
})

test('split view can be resized with the keyboard (mocked backend)', async ({ page }) => {
  await mockStory(page)
  await page.setViewportSize({ width: 1600, height: 1000 })
  await page.goto('/dashboard')
  await openLinearView(page)
  await expect(page.locator('polo-menu-tree-legend').getByRole('button', { name: 'Preview', exact: true })).toHaveCount(1)
  await expect(page.locator('.workspaceToggle')).toHaveCount(0)
  const linear = page.locator('polo-linear-editor')
  const top = page.locator('polo-menu-top .menu')
  const legend = page.locator('polo-menu-tree-legend .legend')
  const sidebar = page.getByRole('navigation', { name: 'Your stories', exact: true })
  const linearBox = (await linear.boundingBox())!
  const sidebarBox = (await sidebar.boundingBox())!
  expect(linearBox.width).toBe(550)
  expect(linearBox.y).toBe(sidebarBox.y)
  expect(linearBox.height).toBe(sidebarBox.height)
  for (const menu of [top, legend]) {
    const box = (await menu.boundingBox())!
    expect(box.x + box.width).toBeLessThan(linearBox.x)
  }
  await page.getByRole('button', { name: 'Story options', exact: true }).click()
  const dropdown = (await page.locator('polo-menu-top .dropdown').boundingBox())!
  expect(dropdown.x + dropdown.width).toBeLessThan(linearBox.x)
  await page.getByRole('button', { name: 'Story options', exact: true }).click()
  const separator = page.getByRole('separator', { name: 'Resize board and preview' })
  await separator.focus()
  await separator.press('ArrowLeft')
  await expect(separator).toHaveAttribute('aria-valuenow', '65')
  await expect.poll(async () => {
    const menu = (await top.boundingBox())!
    const pane = (await linear.boundingBox())!
    return pane.x - menu.x - menu.width
  }).toBeGreaterThan(0)
  await separator.press('Home')
  await expect(separator).toHaveAttribute('aria-valuenow', '70')
  const divider = (await separator.boundingBox())!
  await page.mouse.move(divider.x + divider.width / 2, divider.y + 100)
  await page.mouse.down()
  await page.mouse.move(1000, divider.y + 100)
  await expect(page.locator('.workspace')).toHaveClass(/workspace--resizing/)
  await expect(top).toHaveCSS('transition-duration', '0s')
  const menu = (await top.boundingBox())!
  const pane = (await linear.boundingBox())!
  expect(pane.x - menu.x - menu.width).toBeCloseTo(24, 0)
  await page.mouse.up()
  await expect(page.locator('.workspace')).not.toHaveClass(/workspace--resizing/)
})

test('preview keeps its desktop minimum and adapts on viewport resize (mocked backend)', async ({ page }) => {
  await mockStory(page)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 2000, height: 1000 })
  await page.goto('/dashboard')
  await openLinearView(page)
  const linear = page.locator('polo-linear-editor')
  await expect.poll(async () => (await linear.boundingBox())!.width).toBe(576)
  for (const width of [1600, 1200]) {
    await page.setViewportSize({ width, height: 1000 })
    await expect.poll(async () => (await linear.boundingBox())!.width).toBe(550)
    const pane = (await linear.boundingBox())!
    const board = (await page.locator('.boardPane').boundingBox())!
    expect(pane.x).toBe(board.width + 8)
    expect(pane.x + pane.width).toBe(width - 16)
    for (const selector of ['polo-menu-top .menu', 'polo-menu-tree-legend .legend']) {
      const menu = (await page.locator(selector).boundingBox())!
      expect(menu.x + menu.width).toBe(board.width - 16)
    }
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await expect.poll(async () => (await linear.boundingBox())!.width).toBe(374)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390)
})

for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test(`preview enters from the right respecting ${reducedMotion} motion (mocked backend)`, async ({ page }) => {
    await mockStory(page)
    await page.setViewportSize({ width: 1600, height: 1000 })
    await page.emulateMedia({ reducedMotion })
    await page.goto('/dashboard')
    // Freeze all three motions at insertion, without racing the frame clock.
    await page.locator('.workspace').evaluate(workspace => {
      const observer = new MutationObserver(() => {
        if (!workspace.classList.contains('workspace--linear')) return
        for (const element of workspace.querySelectorAll('.linearPane, polo-menu-top .menu, polo-menu-tree-legend .legend')) {
          for (const animation of element.getAnimations()) {
            animation.pause()
            animation.currentTime = 0
          }
        }
        observer.disconnect()
      })
      observer.observe(workspace, { attributes: true, attributeFilter: ['class'], childList: true })
    })
    await openLinearView(page)
    const pane = page.locator('.linearPane')
    await pane.waitFor({ state: 'attached' })
    if (reducedMotion === 'reduce') {
      await expect(pane).toHaveCSS('animation-name', 'none')
      expect((await pane.boundingBox())!.x).toBe(1034)
      await expect(page.locator('polo-menu-top .menu')).toHaveCSS('transition-duration', '0s')
      await expect(page.locator('polo-menu-tree-legend .legend')).toHaveCSS('transition-duration', '0s')
    } else {
      const positions = await page.locator('.workspace').evaluate(workspace => {
        return [...workspace.querySelectorAll('.linearPane, polo-menu-top .menu, polo-menu-tree-legend .legend')].map(element => {
          const animation = element.getAnimations()[0]
          animation.currentTime = 0
          const start = element.getBoundingClientRect().left
          animation.currentTime = 160
          const middle = element.getBoundingClientRect().left
          animation.finish()
          return { start, middle, end: element.getBoundingClientRect().left }
        })
      })
      expect(positions).toHaveLength(3)
      expect(positions[0].start).toBeGreaterThanOrEqual(1600)
      expect(positions[0].end).toBe(1034)
      for (const position of positions) {
        expect(position.start - position.end).toBeCloseTo(574, 0)
        expect(position.middle).toBeGreaterThan(position.end)
        expect(position.middle).toBeLessThan(position.start)
        expect(position.start - position.middle).toBeCloseTo(positions[0].start - positions[0].middle, 0)
      }
    }
    await expect(pane.getByRole('heading', { name: 'Preview', exact: true })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(1600)
  })
}
