import { test, expect } from '@playwright/test'
import { entryAt, openMockStory, token } from '../mock-story'

const story = {
  id: 'cumulative-flow', name: 'cumulativeflow.test', cumulativeMode: true,
  tree: { refs: { stat_visits: { name: 'visits', type: 'stat' } }, categories: [], entryPoint: entryAt(), nodes: [
    { id: 'node_0', type: 'text', top: 0, left: 0, text: '<p>Hello</p>',
      userTextOptions: { property: 'name' }, join: [{ node: 'node_1' }] },
    { id: 'node_1', type: 'content', top: 0, left: 0, text: `<p>${token('property', 'name')}</p>`, answers: [
      { id: 'answer_1_0', text: '<p>next</p>', join: [{ node: 'node_2' }] },
    ] },
    { id: 'node_2', type: 'content', top: 0, left: 0, text: '<p>no stop</p>', join: [{ node: 'node_3' }] },
    { id: 'node_3', type: 'content', top: 0, left: 0, text: '<p>no stop II</p>', join: [{ node: 'node_4' }] },
    { id: 'node_4', type: 'content', top: 0, left: 0, text: '<p>answers</p>', answers: [
      { id: 'answer_4_0', text: '<p>1</p>', join: [{ node: 'node_5' }],
        events: [{ id: 'visit', action: 'alterStat', type: 'stat', target: 'stat_visits', amount: '1' }] },
      { id: 'answer_4_1', text: '<p>distribute</p>', join: [{ node: 'node_6' }] },
    ] },
    { id: 'node_5', type: 'content', top: 0, left: 0, text: '<p>back to answers</p>', join: [{ node: 'node_4', toAnswer: true }] },
    { id: 'node_6', type: 'distributor', top: 0, left: 0,
      conditions: [{ id: 'condition_6_0', rules: [{ ref: 'stat_visits', comparator: 'morethan', value: 0 }], join: [{ node: 'node_7' }] }],
      fallbackCondition: { id: 'condition_6_fallback', join: [{ node: 'node_8' }] } },
    { id: 'node_7', type: 'end', top: 0, left: 0, text: '<p>end</p>' },
    { id: 'node_8', type: 'end', top: 0, left: 0, text: '<p>wrong route</p>' },
  ] },
}

test(
  'can complete the entire flow',
  { tag: '@interpolations @noAnswerNodes @jumpToAnswers @distributors @userTextNodes' },
  async ({ page }) => {
    await openMockStory(page, story)

    await expect(page.getByText('Hello')).toBeVisible()
    await page.getByRole('textbox').fill('User')
    await page.getByRole('button', { name: /continue/i }).click()

    await expect(page.locator('.node__passage').filter({ hasText: /^User$/ })).toBeVisible()
    await page.getByRole('button', { name: /next/i }).click()

    await expect(page.getByText('no stop', { exact: true })).toBeVisible()
    await expect(page.getByText('no stop II')).toBeVisible()
    await expect(page.getByText('answers', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: '1', exact: true }).click()

    // Earlier steps stay readable, and the jump back shows only the answers again.
    await expect(page.getByText('Hello')).toBeVisible()
    await expect(page.getByText('back to answers')).toBeVisible()
    await expect(page.getByText('answers', { exact: true })).toHaveCount(1)

    const activeDistributeButton = page.getByRole('button', { name: /distribute/i, disabled: false })
    await expect(activeDistributeButton).toHaveCount(1)
    await activeDistributeButton.click()

    await expect(page.getByText('end', { exact: true })).toBeVisible()
    await expect(page.getByText('wrong route')).toHaveCount(0)
  }
)
