import { expect, Page, test } from '@playwright/test'
import { environment } from '../../src/environments/environment'

// All auth, story reads and writes are intercepted. No real account or production writes.
test.use({ storageState: { cookies: [], origins: [] } })

async function prepareAuthor(page: Page) {
  const user = { id: '00000000-0000-4000-8000-000000000011', email: 'sharing-test@example.com', aud: 'authenticated', role: 'authenticated' }
  const story = {
    id: '00000000-0000-4000-8000-000000000012', name: 'The island', custom_id: null as string | null,
    tracking: false, sharing: true, tapLink: false, cumulativeMode: false, footer: {},
    tree: { refs: {}, categories: [], nodes: [{ id: 'node_0', type: 'end', left: 5000, top: 5000, text: 'The murderer was the captain.' }] },
  }
  const authKey = `sb-${new URL(environment.apiUrl).hostname.split('.')[0]}-auth-token`
  await page.addInitScript(({ user, storyId, authKey }) => {
    const exp = Math.floor(Date.now() / 1000) + 3600
    const token = `${btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))}.${btoa(JSON.stringify({ sub: user.id, exp, role: 'authenticated' }))}.test`
    localStorage.setItem(authKey, JSON.stringify({ access_token: token, refresh_token: 'test-refresh', token_type: 'bearer', expires_at: exp, expires_in: 3600, user }))
    localStorage.setItem('polo-id', storyId)
  }, { user, storyId: story.id, authKey })

  let rejected = false
  let patches = 0
  const routeApi = async (target: Page) => {
    await target.route(`${environment.apiUrl}/**`, async route => {
      const path = new URL(route.request().url()).pathname
      if (path === '/auth/v1/user') return route.fulfill({ json: user })
      if (path === '/rest/v1/profiles') return route.fulfill({ json: [{ subscription_status: 'canceled', plan: 'free', user_name: 'Test author' }] })
      if (path === '/rest/v1/stories' && route.request().method() === 'PATCH') {
        patches++
        if (rejected) return route.fulfill({ status: 409, json: { code: '23505', message: 'Duplicate address' } })
        const body = route.request().postDataJSON()
        Object.assign(story, body)
        return route.fulfill({ json: { id: story.id, custom_id: story.custom_id, sharing: story.sharing } })
      }
      if (path === '/rest/v1/stories') return route.fulfill({ json: [story] })
      return route.abort()
    })
  }
  await routeApi(page)
  return { story, routeApi, reject: () => { rejected = true }, allow: () => { rejected = false }, patches: () => patches }
}

async function openShare(page: Page, labels = { navigation: 'Your stories', toggle: 'Toggle menu', share: 'Share', readingLink: 'Reading link' }) {
  await page.goto('/dashboard')
  const nav = page.getByRole('navigation', { name: labels.navigation, exact: true })
  if (page.viewportSize()!.width <= 760) {
    await nav.getByRole('button', { name: labels.toggle, exact: true }).click()
    await page.mouse.move(page.viewportSize()!.width - 8, 200)
  }
  await page.locator('polo-menu-tree-legend').getByRole('button', { name: labels.share, exact: true }).click()
  await expect(page.getByLabel(labels.readingLink, { exact: true })).toBeVisible()
  return page.locator('polo-share-story')
}

for (const width of [1440, 375, 320]) {
  test(`author copies a saved link and a player without a session can open and reshare it (${width}px)`, async ({ page, browser }) => {
    await page.setViewportSize({ width, height: width < 760 ? 812 : 1000 })
    const backend = await prepareAuthor(page)
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async (url: string) => {
        (window as Window & { copiedLink?: string }).copiedLink = url
      } } })
    })
    const modal = await openShare(page)
    await expect(modal.getByText('Anyone with the link can play without an account.', { exact: false })).toBeVisible()
    await modal.getByLabel('Customize the link', { exact: true }).fill('the-island')
    await modal.getByRole('button', { name: 'Save address', exact: true }).click()
    await expect(modal.getByRole('status').filter({ hasText: 'Address saved.' })).toBeVisible()
    await expect(modal.getByRole('link', { name: 'Open as a player' })).toHaveAttribute('href', 'http://localhost:4200/the-island')
    await modal.getByRole('button', { name: 'Copy link', exact: true }).click()
    await expect(modal.getByText('Link copied.', { exact: true })).toBeVisible()
    expect(await page.evaluate(() => (window as Window & { copiedLink?: string }).copiedLink)).toBe('http://localhost:4200/the-island')
    expect(await modal.locator('.modal').evaluate(element => element.getBoundingClientRect().right <= window.innerWidth)).toBe(true)
    await page.screenshot({ path: test.info().outputPath(`sharing-${width}.png`) })

    const reader = await browser.newContext({ locale: 'en-US' })
    try {
      const player = await reader.newPage()
      await backend.routeApi(player)
      await player.addInitScript(() => {
        Object.defineProperty(navigator, 'share', { configurable: true, value: async (data: ShareData) => {
          (window as Window & { sharedStory?: ShareData }).sharedStory = data
        } })
      })
      await player.goto('http://localhost:4200/the-island?utm_source=friend')
      await expect(player.getByRole('heading', { name: 'The island', exact: true })).toBeVisible()
      await player.getByRole('button', { name: 'Share this story', exact: true }).click()
      expect(await player.evaluate(() => (window as Window & { sharedStory?: ShareData }).sharedStory)).toEqual({
        title: 'The island', text: 'Play “The island” and choose your own path.', url: 'http://localhost:4200/the-island',
      })
      expect(await player.evaluate(() => Object.keys(localStorage).some(key => key.endsWith('-auth-token')))).toBe(false)
    } finally {
      await reader.close()
    }
  })
}

const localizedLabels = {
  en: { navigation: 'Your stories', toggle: 'Toggle menu', share: 'Share', readingLink: 'Reading link', copy: 'Copy link' },
  ca: { navigation: 'Les teves històries', toggle: 'Mostra o amaga el menú', share: 'Comparteix', readingLink: 'Enllaç de lectura', copy: 'Copia l’enllaç' },
  es: { navigation: 'Tus historias', toggle: 'Mostrar u ocultar el menú', share: 'Compartir', readingLink: 'Enlace de lectura', copy: 'Copia el enlace' },
}

for (const lang of ['en', 'ca', 'es'] as const) {
  for (const theme of ['light', 'dark'] as const) {
    for (const width of [1440, 320]) {
      test(`sharing layout stays readable in ${lang}, ${theme}, ${width}px with a long story name`, async ({ page }) => {
        await page.setViewportSize({ width, height: 812 })
        await page.emulateMedia({ colorScheme: theme })
        await page.addInitScript(lang => localStorage.setItem('polo-lang', lang), lang)
        const backend = await prepareAuthor(page)
        backend.story.name = 'La biblioteca dels camins que encara no hem recorregut'
        const modal = await openShare(page, localizedLabels[lang])
        await expect(modal.getByRole('heading', { name: backend.story.name, exact: true })).toBeVisible()
        const copy = modal.getByRole('button', { name: localizedLabels[lang].copy, exact: true })
        await expect(copy).toBeVisible()
        await expect(copy).toHaveCSS('background-color', theme === 'light' ? 'rgb(41, 75, 62)' : 'rgb(182, 211, 176)')
        expect((await copy.boundingBox())!.height).toBeGreaterThanOrEqual(44)
        const frame = modal.locator('.modal')
        await page.evaluate(() => document.fonts.ready)
        await expect(frame).toHaveCSS('margin-top', '0px')
        await expect(frame).toHaveCSS('opacity', '1')
        const bounds = (await frame.boundingBox())!
        expect(bounds.x).toBeGreaterThanOrEqual(8)
        expect(bounds.y).toBeGreaterThanOrEqual(8)
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(width - 8)
        expect(bounds.y + bounds.height).toBeLessThanOrEqual(804)
        expect(await modal.locator('.modal__body').evaluate(element => element.scrollWidth <= element.clientWidth + 1)).toBe(true)
        await page.screenshot({ path: test.info().outputPath(`sharing-${lang}-${theme}-${width}.png`) })
        await modal.locator('.liveNote').scrollIntoViewIfNeeded()
        await expect(modal.locator('.liveNote')).toBeInViewport()
      })
    }
  }
}

test('duplicate or reserved addresses never replace the saved link and can be corrected', async ({ page }) => {
  const backend = await prepareAuthor(page)
  const modal = await openShare(page)
  const field = modal.getByLabel('Customize the link', { exact: true })
  const savedLink = await modal.getByLabel('Reading link', { exact: true }).inputValue()
  await field.fill('ca')
  await modal.getByRole('button', { name: 'Save address', exact: true }).click()
  await expect(modal.getByText('This address is reserved for Trama. Choose another one.')).toBeVisible()
  expect(backend.patches()).toBe(0)
  backend.reject()
  await field.fill('already-taken')
  await modal.getByRole('button', { name: 'Save address', exact: true }).click()
  await expect(modal.getByText('This address is already in use. Choose another one.')).toBeVisible()
  await expect(field).toBeVisible()
  await expect(modal.getByLabel('Reading link', { exact: true })).toHaveValue(savedLink)
  backend.allow()
  await field.fill('available-island')
  await modal.getByRole('button', { name: 'Save address', exact: true }).click()
  await expect(modal.getByLabel('Reading link', { exact: true })).toHaveValue('http://localhost:4200/available-island')
  await field.fill('new-island')
  await modal.getByRole('button', { name: 'Save address', exact: true }).click()
  await expect(modal.getByText('The previous custom link will stop working.', { exact: false })).toBeVisible()
  await expect(modal.getByLabel('Reading link', { exact: true })).toHaveValue('http://localhost:4200/available-island')
  await modal.getByRole('button', { name: 'Confirm address change', exact: true }).click()
  await expect(modal.getByLabel('Reading link', { exact: true })).toHaveValue('http://localhost:4200/new-island')
})

test('an unfinished story must have a connected start before sharing', async ({ page }) => {
  const backend = await prepareAuthor(page)
  backend.story.tree.nodes = []
  const modal = await openShare(page)
  await expect(modal.getByText('Connect Start to a scene before sharing this story.')).toBeVisible()
  await expect(modal.getByRole('button', { name: 'Copy link', exact: true })).toBeDisabled()
  await expect(modal.getByRole('button', { name: 'Share…', exact: true })).toBeDisabled()
  await expect(modal.getByText('Open as a player', { exact: false })).not.toHaveAttribute('href')
})

test('story options use the same keyboard-accessible sharing dialog with all features unlocked', async ({ page }) => {
  const backend = await prepareAuthor(page)
  const modal = await openShare(page)
  await expect(page.getByRole('dialog', { name: 'Share your story' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(modal).toHaveCount(0)
  await page.getByRole('button', { name: 'Story options', exact: true }).click()
  await page.getByRole('button', { name: 'Share your story', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'Share your story' })).toBeVisible()
  const lastInput = page.getByLabel('Show a share button at the end of the story')
  await expect(lastInput).toBeEnabled()
  await expect(modal.locator('.planBadge')).toHaveCount(0)
  await lastInput.uncheck()
  await expect(lastInput).not.toBeChecked()
  expect(backend.story.sharing).toBe(false)
  await modal.getByRole('button', { name: 'Close', exact: true }).focus()
  await page.keyboard.press('Shift+Tab')
  expect(await modal.evaluate(element => element.contains(document.activeElement))).toBe(true)
})

test('legacy subscription metadata does not lock tracking, branding, analytics or external links', async ({ page }) => {
  const backend = await prepareAuthor(page)
  await page.goto('/dashboard')
  const node = page.locator('.node[data-board-join-node="node_0"]')
  await expect(node.getByRole('button', { name: 'add', exact: true })).toBeEnabled()
  await page.getByRole('button', { name: 'Story options', exact: true }).click()
  const tracking = page.getByLabel('Enable tracking', { exact: true })
  await expect(tracking).toBeEnabled()
  await expect(tracking).not.toBeChecked()
  await expect(page.getByLabel('Hide Trama link', { exact: true })).toBeEnabled()
  await expect(page.getByLabel('Footer text', { exact: true })).toBeEnabled()
  await expect(page.getByLabel('Footer link', { exact: true })).toBeEnabled()
  await expect(page.getByRole('button', { name: 'Open analytics', exact: true })).toBeEnabled()
  await tracking.check()
  await expect.poll(() => backend.story.tracking).toBe(true)
  await page.getByLabel('Footer text', { exact: true }).fill('My author page')
  await page.getByLabel('Footer text', { exact: true }).press('Tab')
  await expect.poll(() => backend.story.footer).toEqual({ text: 'My author page', link: '' })
})

test('denied clipboard access offers manual copying instead of a false confirmation', async ({ page }) => {
  await prepareAuthor(page)
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
    writeText: async () => { throw new DOMException('Denied', 'NotAllowedError') },
  } }))
  const modal = await openShare(page)
  await modal.getByRole('button', { name: 'Copy link', exact: true }).click()
  await expect(modal.getByText('Could not copy the link.', { exact: false })).toBeVisible()
  await expect(modal.getByText('Link copied.', { exact: true })).toHaveCount(0)
  const address = modal.getByLabel('Reading link', { exact: true })
  await address.focus()
  expect(await address.evaluate((element: HTMLInputElement) => element.selectionStart === 0 && element.selectionEnd === element.value.length)).toBe(true)
  expect(errors).toEqual([])
})
