import { expect, Page, test } from '@playwright/test'
import { environment } from '../../src/environments/environment'

// Synthetic credentials and intercepted requests only; no real project writes.
test.use({ storageState: { cookies: [], origins: [] } })

const user = {
  id: '00000000-0000-4000-8000-000000000061', email: 'creator-test@example.com', aud: 'authenticated', role: 'authenticated',
  user_metadata: { user_name: 'Test author' }, app_metadata: { provider: 'email' },
}
const lastStory = '00000000-0000-4000-8000-000000000062'
const pickedStory = '00000000-0000-4000-8000-000000000063'
let names: Record<string, string> = {}
let patches: { id: string, body: Record<string, unknown> }[] = []

let deleted: string[] = []

test.beforeEach(async ({ page }) => {
  deleted = []
  patches = []
  names = { [lastStory]: 'The island', [pickedStory]: 'The lighthouse' }
  const authKey = `sb-${new URL(environment.apiUrl).hostname.split('.')[0]}-auth-token`
  await page.addInitScript(({ authKey, user, lastStory }) => {
    const expiresAt = Math.floor(Date.now() / 1000) + 3600
    const token = `${btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))}.${btoa(JSON.stringify({ sub: user.id, exp: expiresAt, role: 'authenticated' }))}.invalid-test-signature`
    localStorage.setItem(authKey, JSON.stringify({
      access_token: token, refresh_token: 'creator-test-refresh', token_type: 'bearer',
      expires_at: expiresAt, expires_in: 3600, user,
    }))
    localStorage.setItem('polo-id', lastStory)
    localStorage.setItem('polo-lang', 'en')
  }, { authKey, user, lastStory })

  await page.route(`${environment.apiUrl}/**`, async route => {
    const request = route.request()
    const url = new URL(request.url())
    const select = url.searchParams.get('select') ?? ''
    const id = url.searchParams.get('id')?.replace('eq.', '')
    if (url.pathname === '/auth/v1/user') await route.fulfill({ json: user })
    else if (url.pathname === '/rest/v1/profiles') await route.fulfill({ json: [{ subscription_status: 'active', plan: 'pro', user_name: 'Test author' }] })
    else if (url.pathname === '/rest/v1/stories' && select.includes('games(count)')) await route.fulfill({ json: [
      { id: pickedStory, name: names[pickedStory], custom_id: 'the-lighthouse', tracking: true, updated_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), plays: [{ count: 42 }], recent: [{ count: 7 }], last: [{ created_at: '2026-11-12T10:00:00Z' }] },
      { id: lastStory, name: names[lastStory], custom_id: null, tracking: false, updated_at: '2026-10-01T10:00:00Z', plays: [{ count: 0 }], recent: [{ count: 0 }], last: [] },
    ].filter((story) => !deleted.includes(story.id)) })
    // The plays of the recent window, for the strip of days: two today.
    else if (url.pathname === '/rest/v1/games') await route.fulfill({ json: [{ created_at: new Date().toISOString() }, { created_at: new Date().toISOString() }] })
    else if (url.pathname === '/rest/v1/stories' && request.method() === 'PATCH') {
      const body = request.postDataJSON() as Record<string, unknown>
      patches.push({ id: id!, body })
      if (typeof body['name'] === 'string') names[id!] = body['name']
      await route.fulfill({ status: 204 })
    }
    else if (url.pathname === '/rest/v1/stories' && request.method() === 'DELETE') {
      deleted.push(id!)
      await route.fulfill({ status: 204 })
    }
    // A story that does not exist, or is not the author's, comes back empty.
    else if (url.pathname === '/rest/v1/stories' && request.method() === 'GET' && id && !names[id]) await route.fulfill({ json: [] })
    else if (url.pathname === '/rest/v1/stories' && request.method() === 'GET') {
      const storyId = id ?? lastStory
      await route.fulfill({ json: id || select.includes('tree') || select === '*' ? [{
        id: storyId, name: names[storyId], tracking: false, sharing: false, tapLink: false, cumulativeMode: false,
        footer: {}, custom_id: null,
        tree: { refs: {}, categories: [], entryPoint: { left: 4800, top: 4900, targetNodeId: 'node_0' }, nodes: [{ id: 'node_0', type: 'content', left: 5000, top: 5000, text: names[storyId] }] },
      }] : Object.entries(names).map(([storyId, name]) => ({ id: storyId, name })) })
    }
    else await route.abort()
  })
})

test('the dashboard lists every story with its plays and opens the one the author picks in the board (mocked backend)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/dashboard')

  await expect(page.getByRole('heading', { level: 1, name: 'Stories' })).toBeVisible()
  await expect(page.locator('.activity__number')).toHaveText(/^7\s*plays$/)
  await expect(page.locator('.activity__legend dd')).toHaveText(['42', '2', '1 of 2'])
  await expect(page.locator('.activity__days i').last()).toHaveAttribute('style', /--fill: 100%/)
  // The new story comes first on the shelf, and the first visit's welcome is gone.
  await expect(page.locator('.shelf > li').first().getByRole('button', { name: /New story/ })).toBeVisible()
  await expect(page.locator('polo-first-steps')).toHaveCount(0)
  const cards = page.locator('.card')
  await expect(cards).toHaveCount(2)
  await expect(cards.nth(0)).toContainText('The lighthouse')
  await expect(cards.nth(0)).toContainText('/the-lighthouse')
  await expect(cards.nth(1)).toContainText('Tracking off')
  await expect(cards.nth(1)).toContainText('Never')

  // The whole card opens the story, not only its title.
  const stats = (await cards.nth(0).locator('.card__stats').boundingBox())!
  await page.mouse.click(stats.x + stats.width / 2, stats.y + stats.height / 2)
  // The story picked here wins over the last one edited, and the address names it.
  await expect(page).toHaveURL(new RegExp(`/story/${pickedStory}/board$`))
  await expect(page.locator('.node[data-board-join-node="node_0"]')).toContainText('The lighthouse')
  expect(await page.evaluate(() => localStorage.getItem('polo-id'))).toBe(pickedStory)

  await page.locator('polo-board-header').getByRole('link', { name: 'Home', exact: true }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Stories' })).toBeVisible()
})

test('the dashboard deletes a story from its card menu (mocked backend)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/dashboard')
  await expect(page.locator('.card').first()).toContainText('Edited 3 hours ago')

  const lighthouse = page.locator('.card').filter({ hasText: 'The lighthouse' })
  await lighthouse.getByRole('button', { name: 'More actions for The lighthouse', exact: true }).click()
  await expect(page.getByRole('link', { name: 'Statistics', exact: true })).toHaveAttribute('href', `/story/${pickedStory}/statistics`)
  await expect(page.getByRole('link', { name: 'Open in the editor', exact: true })).toHaveAttribute('href', `/story/${pickedStory}/board`)
  await page.getByRole('button', { name: 'Delete', exact: true }).click()
  const confirm = page.locator('polo-delete-story')
  await expect(confirm).toContainText('Are you sure you want to delete “The lighthouse”?')
  await confirm.getByRole('button', { name: 'Delete', exact: true }).click()
  await expect(page.locator('.card')).toHaveCount(1)
  await expect(page.locator('.card')).toContainText('The island')
  expect(deleted).toEqual([pickedStory])
  await expect(page.locator('.activity__legend dd').nth(1)).toHaveText('1')
})

test('a story has its own page with the editor options, its sharing and deleting it (mocked backend)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/dashboard')
  const lighthouse = page.locator('.card').filter({ hasText: 'The lighthouse' })
  await lighthouse.getByRole('button', { name: 'More actions for The lighthouse', exact: true }).click()
  await page.getByRole('link', { name: 'Options', exact: true }).click()
  await expect(page).toHaveURL(new RegExp(`/story/${pickedStory}$`))
  await expect(page.getByRole('heading', { level: 1, name: 'General' })).toBeVisible()
  const nav = page.getByRole('navigation', { name: 'The lighthouse', exact: true })
  await expect(nav.getByRole('link', { name: 'General', exact: true })).toHaveAttribute('aria-current', 'page')

  // Renaming here renames the story everywhere, the side menu first.
  const name = page.getByRole('textbox', { name: 'Name', exact: true })
  await expect(name).toHaveValue('The lighthouse')
  // Saved on Enter, like every other option of the story, without a button of its own.
  await name.fill('The far lighthouse')
  await name.press('Enter')
  await expect(page.getByRole('status').filter({ hasText: 'Name saved.' })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'The far lighthouse', exact: true })).toBeVisible()
  expect(patches).toContainEqual({ id: pickedStory, body: { name: 'The far lighthouse' } })

  // The same options as in the editor.
  await page.getByRole('switch', { name: 'Enable tracking' }).click()
  await expect.poll(() => patches).toContainEqual({ id: pickedStory, body: { tracking: true } })

  // Sharing is a dialog now; its settings, such as the link's address, are here in General.
  const storyNav = page.getByRole('navigation', { name: 'The far lighthouse', exact: true })
  await expect(storyNav.getByRole('link', { name: 'Sharing', exact: true })).toHaveCount(0)
  await expect(page.getByRole('heading', { level: 2, name: 'Sharing' })).toBeVisible()
  await expect(page.getByLabel('Reading link', { exact: true })).toHaveValue(new RegExp(`/private/${pickedStory}$`))
  await expect(page.locator('polo-modal-window')).toHaveCount(0)
  // The old address of the sharing page opens General.
  await page.goto(`/story/${pickedStory}/sharing`)
  await expect(page).toHaveURL(new RegExp(`/story/${pickedStory}$`))
  // Statistics stay inside the story, its menu beside them; old addresses still arrive there.
  await storyNav.getByRole('link', { name: 'Statistics', exact: true }).click()
  await expect(page).toHaveURL(new RegExp(`/story/${pickedStory}/statistics$`))
  await expect(page.getByRole('heading', { level: 1, name: 'Statistics' })).toBeVisible()
  await expect(storyNav.getByRole('link', { name: 'Statistics', exact: true })).toHaveAttribute('aria-current', 'page')
  await page.goto(`/stadistics/${pickedStory}`)
  await expect(page).toHaveURL(new RegExp(`/story/${pickedStory}/statistics$`))

  // To the editor, the story's main action beside its name, and back through its story options.
  await page.getByRole('link', { name: 'Open in the editor', exact: true }).click()
  await expect(page).toHaveURL(new RegExp(`/story/${pickedStory}/board$`))
  await expect(page.getByRole('textbox', { name: 'Story name', exact: true })).toHaveValue('The far lighthouse')
  // The editor's story options are a dialog over the board, a shortcut to the story's page that has them all.
  await page.getByRole('button', { name: 'Story options', exact: true }).click()
  const optionsDialog = page.getByRole('dialog', { name: 'Story options' })
  await expect(optionsDialog).toContainText('The far lighthouse')
  await expect(optionsDialog.getByRole('button', { name: 'Export JSON' })).toHaveCount(0)
  await optionsDialog.getByRole('link', { name: /All the story’s settings/ }).click()
  await expect(page).toHaveURL(new RegExp(`/story/${pickedStory}$`))
  await expect(page.getByRole('dialog', { name: 'Story options' })).toHaveCount(0)

  await page.getByRole('button', { name: 'Delete story', exact: true }).click()
  const confirm = page.locator('polo-delete-story')
  await expect(confirm).toContainText('Are you sure you want to delete “The far lighthouse”?')
  await confirm.getByRole('button', { name: 'Delete', exact: true }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
  expect(deleted).toEqual([pickedStory])
})

test('a story that cannot be opened says so on its page (mocked backend)', async ({ page }) => {
  await page.goto('/story/00000000-0000-4000-8000-000000000099')
  await expect(page.getByRole('alert')).toContainText('This story does not exist or is not yours.')
  await page.getByRole('link', { name: 'Back to your stories', exact: true }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
})

test('the board names its story in the address, switches by link and goes back with the browser (mocked backend)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  const node = page.locator('.node[data-board-join-node="node_0"]')
  // /board opens the last story edited and puts it in the address without adding a history entry.
  await page.goto('/board')
  await expect(page).toHaveURL(new RegExp(`/story/${lastStory}/board$`))
  await expect(node).toContainText('The island')
  await expect(page.getByRole('textbox', { name: 'Story name', exact: true })).toHaveValue('The island')

  await page.getByRole('button', { name: 'Switch project', exact: true }).click()
  const switcher = page.locator('.switcherMenu')
  await expect(switcher.getByRole('link', { name: 'The island', exact: true })).toHaveAttribute('aria-current', 'page')
  await switcher.getByRole('link', { name: 'The lighthouse', exact: true }).click()
  await expect(page).toHaveURL(new RegExp(`/story/${pickedStory}/board$`))
  await expect(node).toContainText('The lighthouse')
  await expect(switcher).toBeHidden()

  await page.goBack()
  await expect(page).toHaveURL(new RegExp(`/story/${lastStory}/board$`))
  await expect(node).toContainText('The island')

  // The address is enough to open a story again, even after the last one edited changed.
  await page.goto(`/story/${pickedStory}/board`)
  await expect(page.getByRole('textbox', { name: 'Story name', exact: true })).toHaveValue('The lighthouse')

  // A story that cannot be opened falls back to another one, and the address follows.
  await page.goto('/story/00000000-0000-4000-8000-000000000099/board')
  await expect(page).toHaveURL(new RegExp(`/story/${lastStory}/board$`))
  await expect(node).toContainText('The island')

  // The project menu, as wide as the header, switches projects; the person's menu is at the other corner.
  await page.getByRole('button', { name: 'Switch project', exact: true }).click()
  const header = (await page.locator('polo-board-header .header').boundingBox())!
  const menu = (await switcher.boundingBox())!
  expect(Math.abs(menu.width - header.width)).toBeLessThanOrEqual(1)
  await expect(switcher.getByRole('link', { name: 'Home', exact: true })).toHaveCount(0)
  await page.keyboard.press('Escape')
  // Home has its own button, and the way back is the browser's.
  await page.locator('polo-board-header').getByRole('link', { name: 'Home', exact: true }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
  await page.goBack()
  await expect(page).toHaveURL(new RegExp(`/story/${lastStory}/board$`))
  // The account is not among the story's actions: it is a step away, at Home.
  await expect(page.locator('polo-board-actions polo-user-menu')).toHaveCount(0)
})

test('the board has its name on the top left, its actions on the top right, the project down the left and its controls along the foot (mocked backend)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  // Closed at first; afterwards it keeps what the author chose.
  await page.addInitScript(() => localStorage.getItem('polo-board-panel') ?? localStorage.setItem('polo-board-panel', 'closed'))
  await page.goto('/board')
  await expect(page.getByRole('textbox', { name: 'Story name', exact: true })).toHaveValue('The island')
  const header = (await page.locator('polo-board-header .header').boundingBox())!
  expect([header.x, header.y]).toEqual([16, 16])
  const actions = page.locator('polo-board-actions .actions')
  const actionsBox = (await actions.boundingBox())!
  expect(actionsBox.x + actionsBox.width).toBe(1280 - 16)
  expect(actionsBox.y).toBe(16)
  // Sharing is the one main action.
  await expect(actions.locator('button.primary')).toHaveText(/Share/)

  // The history, the kinds of node and the view, along the foot, all the same height.
  const groups = page.locator('polo-board-controls .controls')
  await expect(groups).toHaveCount(3)
  const boxes = await groups.evaluateAll((elements) => elements.map((element) => {
    const box = element.getBoundingClientRect()
    return { left: Math.round(box.left), right: Math.round(box.right), bottom: Math.round(box.bottom), height: Math.round(box.height) }
  }))
  expect(new Set(boxes.map((box) => box.bottom))).toEqual(new Set([900 - 16]))
  expect(new Set(boxes.map((box) => box.height)).size).toBe(1)
  expect(boxes[0].left).toBe(16)
  expect(boxes[0].right).toBeLessThan(boxes[1].left)
  expect(boxes[1].right).toBeLessThan(boxes[2].left)
  expect(boxes[2].right).toBe(1280 - 16)
  await expect(page.getByRole('button', { name: 'Undo', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Redo', exact: true })).toBeDisabled()
  // Group and frame only show up with several nodes selected.
  await expect(page.locator('.groupToolbar')).toHaveCount(0)

  // The project panel opens down the left, between the header and the controls that open it.
  const project = page.locator('#story-panel')
  await expect(project).toBeHidden()
  const toggle = page.getByRole('button', { name: 'Project panel', exact: true })
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await expect(project).toBeVisible()
  // It slides in from the left edge.
  await expect.poll(async () => (await project.boundingBox())!.x).toBe(16)
  const panel = (await project.boundingBox())!
  expect(panel.y).toBeGreaterThan(header.y + header.height)
  expect(panel.y + panel.height).toBeLessThan(boxes[0].bottom - boxes[0].height)
  await expect(project.locator('[aria-current="true"]')).toHaveText('The island')
  await expect(project.getByRole('button', { name: /Add a story/ })).toBeDisabled()
  await expect(project).toContainText('Characters')
  await expect(project).toContainText('Locations')
  await expect(project).toContainText('No stats, conditions or properties yet')
  // It stays as the author leaves it.
  await page.reload()
  await expect(page.locator('#story-panel')).toBeVisible()

  // The story's options open in a dialog, like sharing, from the actions on the top right.
  await actions.getByRole('button', { name: 'Story options', exact: true }).click()
  const options = page.getByRole('dialog', { name: 'Story options' })
  await expect(options.getByText('Enable tracking')).toBeVisible()
  // Its data and deleting it are in the story's page, linked from the dialog.
  await expect(options.getByRole('button', { name: 'Export JSON', exact: true })).toHaveCount(0)
  await expect(options.getByRole('link', { name: /All the story’s settings/ })).toBeVisible()
  await expect(options.getByRole('button', { name: /Share/ })).toHaveCount(0)
  await expect(options.getByRole('link', { name: 'All story options' })).toHaveCount(0)
})

test('nodes are created from the buttons at the foot, in the middle of the view, and the view fits the story (mocked backend)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.addInitScript(() => localStorage.setItem('polo-board-panel', 'closed'))
  await page.goto('/board')
  const nodes = page.locator('polo-node')
  await expect(nodes.first()).toBeVisible()
  const before = await nodes.count()
  await page.locator('polo-board-controls').getByRole('button', { name: 'End', exact: true }).click()
  await expect(nodes).toHaveCount(before + 1)
  const created = (await nodes.last().boundingBox())!
  // In the middle of the screen, where the author is looking.
  expect(Math.abs(created.x + created.width / 2 - 640)).toBeLessThan(80)
  expect(Math.abs(created.y + created.height / 2 - 450)).toBeLessThan(120)

  const zoom = page.locator('polo-board-controls .zoom')
  await page.getByRole('button', { name: 'Zoom out', exact: true }).click()
  await page.getByRole('button', { name: 'Zoom out', exact: true }).click()
  await expect(zoom).toHaveText('64%')
  await zoom.click()
  await expect(zoom).toHaveText('100%')
  // Moved away, the whole story comes back into view at once.
  const empty = await page.evaluate(() => {
    for (let y = 120; y < 800; y += 40) for (let x = 80; x < 1200; x += 40) {
      if (document.elementFromPoint(x, y)?.classList.contains('board')) return { x, y }
    }
    return { x: 640, y: 300 }
  })
  await page.mouse.move(empty.x, empty.y)
  await page.mouse.down()
  await page.mouse.move(empty.x - 600, empty.y, { steps: 8 })
  await page.mouse.up()
  await expect(nodes.first()).not.toBeInViewport({ ratio: 1 })
  await page.getByRole('button', { name: 'Fit the story on screen', exact: true }).click()
  for (const node of await nodes.all()) await expect(node).toBeInViewport({ ratio: 1 })
})

test('the side menu moves between the sections of the dashboard (mocked backend)', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 })
  await page.goto('/dashboard')
  const menu = page.getByRole('navigation', { name: 'Dashboard', exact: true })
  await expect(menu.getByRole('link', { name: 'Home', exact: true })).toHaveAttribute('aria-current', 'page')
  // With no story picked there is no board to open from here.
  await expect(menu.getByRole('link', { name: 'Open the board' })).toHaveCount(0)
  // On a wide screen the page sits in the middle of the room beside the menu.
  const room = (await page.locator('main.content').boundingBox())!
  const content = (await page.locator('main.content .page').boundingBox())!
  expect(Math.abs((content.x - room.x) - (room.x + room.width - content.x - content.width))).toBeLessThanOrEqual(1)

  for (const [link, heading, url] of [
    // Both are still being designed, and the menu says so before the author clicks.
    ['Access Coming soon', 'Access', /\/dashboard\/access$/],
    ['Creator profile Coming soon', 'Creator profile', /\/dashboard\/profile$/],
  ] as const) {
    await menu.getByRole('link', { name: link, exact: true }).click()
    await expect(page).toHaveURL(url)
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible()
    await expect(menu.getByRole('link', { name: link, exact: true })).toHaveAttribute('aria-current', 'page')
  }
  // Design only: the fieldset keeps every field read-only until the profile can be saved.
  await menu.getByRole('link', { name: 'Creator profile Coming soon', exact: true }).click()
  await expect(page.getByRole('textbox', { name: 'Public name' })).toHaveValue('Test author')
  expect(await page.getByRole('textbox', { name: 'Public name' }).evaluate((input) => input.matches(':disabled'))).toBe(true)
  // Brands are another public identity, added here once they exist.
  await expect(page.locator('.identity')).toHaveCount(1)
  await expect(page.getByRole('button', { name: 'Add a brand', exact: true })).toBeDisabled()
})

// The menu opens against the avatar, never centred on the screen, with or without CSS anchor positioning.
async function expectMenuNextToAvatar(page: Page, where: 'above' | 'below') {
  const avatar = (await page.locator('polo-user-menu .trigger').boundingBox())!
  const menu = (await page.locator('polo-user-menu .menu').boundingBox())!
  const distance = where === 'above' ? avatar.y - (menu.y + menu.height) : menu.y - (avatar.y + avatar.height)
  expect(distance).toBeGreaterThanOrEqual(0)
  expect(distance).toBeLessThanOrEqual(12)
  expect(menu.x).toBeGreaterThanOrEqual(0)
  expect(menu.x + menu.width).toBeLessThanOrEqual(page.viewportSize()!.width)
}

test('the avatar menu leads to the settings, which lead back to the dashboard (mocked backend)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/dashboard')
  const avatar = page.getByRole('button', { name: 'Test author, account menu' })
  const isOpen = () => page.locator('polo-user-menu .menu').evaluate((menu) => menu.matches(':popover-open'))
  expect(await isOpen()).toBe(false)
  await avatar.click()
  await expect(page.getByRole('link', { name: 'Account', exact: true })).toBeVisible()
  expect(await isOpen()).toBe(true)
  // The plan is reached from the account settings.
  await expect(page.locator('polo-user-menu').getByRole('link', { name: 'Plan and billing' })).toHaveCount(0)
  // Signing out is here too, where people look for it.
  await expect(page.locator('polo-user-menu').getByRole('button', { name: 'Logout', exact: true })).toBeVisible()
  // The person sits at the foot of the side menu, so the menu opens above them.
  await expectMenuNextToAvatar(page, 'above')
  await expect(page.locator('polo-user-menu')).toContainText('creator-test@example.com')
  // Escape closes the menu and gives the focus back to the avatar.
  await page.keyboard.press('Escape')
  await expect(page.getByRole('link', { name: 'Account', exact: true })).toBeHidden()
  await expect(avatar).toBeFocused()

  await avatar.click()
  await page.getByRole('link', { name: 'Account', exact: true }).click()
  await expect(page).toHaveURL(/\/settings\/account$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Account' })).toBeVisible()

  const settings = page.getByRole('navigation', { name: 'Settings', exact: true })
  await settings.getByRole('link', { name: 'Plan and billing', exact: true }).click()
  await expect(page).toHaveURL(/\/settings\/billing$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Plan and billing' })).toBeVisible()
  await expect(settings.getByRole('link', { name: 'Plan and billing', exact: true })).toHaveAttribute('aria-current', 'page')

  await settings.getByRole('link', { name: 'Preferences', exact: true }).click()
  await expect(page).toHaveURL(/\/settings\/preferences$/)
  await expect(page.getByRole('switch', { name: 'Night mode', exact: true })).toBeVisible()

  // Back Home, named as everywhere else.
  await page.getByRole('link', { name: 'Home', exact: true }).first().click()
  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Stories' })).toBeVisible()
})

test('/settings opens the account (mocked backend)', async ({ page }) => {
  await page.goto('/settings')
  await expect(page).toHaveURL(/\/settings\/account$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Account' })).toBeVisible()
})

test('on a phone the menu sits on top and every section fits the width (mocked backend)', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 })
  await page.goto('/dashboard')
  await page.getByRole('button', { name: 'Test author, account menu' }).click()
  await expectMenuNextToAvatar(page, 'below')

  for (const path of ['/dashboard', '/dashboard/access', '/dashboard/profile', '/settings/account', '/settings/preferences', '/settings/billing', `/story/${pickedStory}`, `/story/${pickedStory}/statistics`]) {
    await page.goto(path)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow, path).toBeLessThanOrEqual(0)
    // The person stays at hand beside the wordmark, as an avatar.
    await expect(page.getByRole('button', { name: 'Test author, account menu' })).toBeVisible()
  }
})

test('canceling the subscription is asked first, and afterwards Creator is offered again (mocked backend)', async ({ page }) => {
  let cancellations = 0
  // Registered after the shared mock, so it answers the edge function first.
  await page.route(`${environment.apiUrl}/functions/v1/cancel-subscription-request`, async route => {
    cancellations++
    await route.fulfill({ json: { ok: true } })
  })
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/settings/billing')
  await expect(page.locator('.summary__plan')).toHaveText('Pro (legacy)')
  // Nothing to choose while the subscription is live.
  await expect(page.locator('polo-billing-cycle')).toHaveCount(0)

  const cancel = page.getByRole('button', { name: 'Cancel subscription', exact: true })
  await cancel.click()
  const dialog = page.locator('polo-confirm-dialog')
  await expect(dialog).toContainText('Cancel your subscription?')
  await dialog.getByRole('button', { name: 'Keep subscription', exact: true }).click()
  await expect(dialog).toHaveCount(0)
  expect(cancellations).toBe(0)

  await cancel.click()
  await dialog.getByRole('button', { name: 'Cancel subscription', exact: true }).click()
  await expect(page.locator('.summary__state')).toHaveText('Subscription canceled')
  expect(cancellations).toBe(1)
  await expect(page.locator('polo-billing-cycle')).toHaveCount(1)
  await expect(page.locator('.recommendedPlan')).toContainText('Choose Creative')
})
