import { expect, Page, test } from '@playwright/test'
import { environment } from '../../src/environments/environment'

// All Supabase and optimization requests are mocked; no real account is required.
test.use({ storageState: { cookies: [], origins: [] } })

const apiUrl = environment.apiUrl
const authorId = '00000000-0000-4000-8000-000000000033'
const storyId = '00000000-0000-4000-8000-000000000034'
const image = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64')

type ImageTree = { nodes: { id: string; image?: { path: string }; [key: string]: unknown }[] }

async function mockImagesBackend(page: Page, holdUpload = false) {
  const user = { id: authorId, aud: 'authenticated', role: 'authenticated', email: 'images@example.com' }
  let savedTree: ImageTree = { nodes: [
    { id: 'node_0', type: 'content', text: 'Start', top: 5000, left: 5000 },
    { id: 'node_1', type: 'content', text: 'Illustrated node', top: 5000, left: 5340 },
  ] }
  const uploaded: string[] = []
  const removed: string[] = []
  let releaseUpload: () => void = () => undefined
  const uploadGate = new Promise<void>(resolve => { releaseUpload = resolve })

  await page.addInitScript(({ apiUrl, user, storyId }) => {
    const project = new URL(apiUrl).hostname.split('.')[0]
    const expiresAt = Math.floor(Date.now() / 1000) + 3600
    const token = `${btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))}.${btoa(JSON.stringify({ sub: user.id, exp: expiresAt, role: 'authenticated' }))}.test-signature`
    localStorage.setItem(`sb-${project}-auth-token`, JSON.stringify({
      access_token: token, refresh_token: 'images-refresh-token', token_type: 'bearer',
      expires_in: 3600, expires_at: expiresAt, user,
    }))
    localStorage.setItem('polo-id', storyId)
  }, { apiUrl, user, storyId })

  await page.route('https://*.lambda-url.eu-west-2.on.aws/**', route => route.fulfill({
    status: 200, contentType: 'image/png', body: image,
  }))
  await page.route(`${apiUrl}/**`, async route => {
    const request = route.request()
    const url = new URL(request.url())
    if (url.pathname === '/auth/v1/user') {
      await route.fulfill({ json: user })
    } else if (url.pathname === '/rest/v1/profiles') {
      await route.fulfill({ json: [{ subscription_status: 'active', plan: 'pro', user_name: 'Image author' }] })
    } else if (url.pathname === '/rest/v1/projects') {
      await route.fulfill({ json: [] })
    } else if (url.pathname === '/rest/v1/stories') {
      if (request.method() === 'PATCH') {
        const body = request.postDataJSON() as { tree?: ImageTree }
        if (body.tree) savedTree = body.tree
        await route.fulfill({ json: { id: storyId } })
      } else {
        await route.fulfill({ json: [{ id: storyId, author: authorId, name: 'Image story', tree: savedTree, modified: '2026-01-01T00:00:00Z' }] })
      }
    } else if (request.method() === 'POST' && url.pathname.startsWith('/storage/v1/object/images/')) {
      const path = url.pathname.replace('/storage/v1/object/images/', '')
      uploaded.push(path)
      if (holdUpload) await uploadGate
      await route.fulfill({ json: { Key: `images/${path}`, Id: 'mock-image' } })
    } else if (request.method() === 'DELETE' && url.pathname === '/storage/v1/object/images') {
      removed.push(...(request.postDataJSON() as { prefixes: string[] }).prefixes)
      await route.fulfill({ json: [] })
    } else if (url.pathname.startsWith('/storage/v1/object/public/images/')) {
      await route.fulfill({ contentType: 'image/png', body: image })
    } else {
      await route.abort()
    }
  })
  await page.setViewportSize({ width: 1600, height: 1000 })

  return { uploaded, removed, tree: () => savedTree, releaseUpload: () => releaseUpload() }
}

async function selectImage(page: Page) {
  const node = page.locator('polo-node').filter({ has: page.locator('.node[data-board-join-node="node_1"]') })
  await node.getByLabel('Add image', { exact: true }).setInputFiles({ name: 'illustration.png', mimeType: 'image/png', buffer: image })
}

test.describe('Story image lifecycle', () => {
  test('upload, removal, undo and redo preserve the file until the saved deletion leaves history', async ({ page }) => {
    const backend = await mockImagesBackend(page)
    await page.goto('/dashboard')
    const node = page.locator('.node[data-board-join-node="node_1"]')
    await expect(node).toBeVisible()
    await selectImage(page)
    const preview = node.getByRole('img', { name: 'Node illustration', exact: true })
    await expect(preview).toBeVisible()
    await expect.poll(() => backend.tree().nodes[1].image?.path).toBe(backend.uploaded[0])
    const uploadedPath = backend.uploaded[0]
    expect(uploadedPath).toMatch(new RegExp(`^${authorId}/${storyId}/node_1-`))
    await node.getByRole('button', { name: 'Remove', exact: true }).click()
    await expect(preview).toHaveCount(0)
    await expect.poll(() => backend.tree().nodes[1].image).toBeUndefined()
    expect(backend.removed).toEqual([])
    await page.getByRole('button', { name: 'Undo', exact: true }).click()
    await expect(preview).toBeVisible()
    await expect(preview).toHaveAttribute('src', `${apiUrl}/storage/v1/object/public/images/${uploadedPath}`)
    await page.getByRole('button', { name: 'Redo', exact: true }).click()
    await expect(preview).toHaveCount(0)
    await expect.poll(() => backend.tree().nodes[1].image).toBeUndefined()
    expect(backend.removed).toEqual([])
    await expect(page.locator('polo-menu-top [role="status"]')).toContainText('Board changes saved')
    await page.locator('polo-menu').getByRole('link', { name: 'Docs', exact: true }).click()
    await expect(page).toHaveURL(/\/docs\/features/)
    await expect.poll(() => backend.removed).toEqual([uploadedPath])
  })

  test('selecting the current story preserves an in-flight upload and earlier undo steps', async ({ page }) => {
    const backend = await mockImagesBackend(page, true)
    try {
      await page.goto('/dashboard')
      const start = page.locator('.node[data-board-join-node="node_0"]')
      const node = page.locator('.node[data-board-join-node="node_1"]')
      await start.getByRole('textbox', { name: 'Node text', exact: true }).click()
      await start.locator('[contenteditable="true"]').fill('Earlier text edit')
      await start.locator('.node__header').focus()
      await expect.poll(() => backend.tree().nodes[0].text).toBe('<p>Earlier text edit</p>')
      await selectImage(page)
      await expect.poll(() => backend.uploaded.length).toBe(1)
      await page.getByRole('button', { name: 'Image story', exact: true }).click()
      backend.releaseUpload()
      await expect(node.getByRole('img', { name: 'Node illustration', exact: true })).toBeVisible()
      await expect.poll(() => backend.tree().nodes[1].image?.path).toBe(backend.uploaded[0])
      await page.getByRole('button', { name: 'Undo', exact: true }).click()
      await expect(node.getByRole('img', { name: 'Node illustration', exact: true })).toHaveCount(0)
      await expect(start.getByRole('textbox', { name: 'Node text', exact: true })).toHaveText('Earlier text edit')
      await page.getByRole('button', { name: 'Undo', exact: true }).click()
      await expect(start.getByRole('textbox', { name: 'Node text', exact: true })).toHaveText('Start')
      expect(backend.removed).toEqual([])
    } finally {
      backend.releaseUpload()
    }
  })

  test('an upload finishing after node deletion cannot attach to the node restored by undo', async ({ page }) => {
    const backend = await mockImagesBackend(page, true)
    try {
      await page.goto('/dashboard')
      const node = page.locator('.node[data-board-join-node="node_1"]')
      await expect(node).toBeVisible()
      await selectImage(page)
      await expect.poll(() => backend.uploaded.length).toBe(1)
      await node.getByRole('button', { name: 'Node options', exact: true }).click()
      await node.getByRole('button', { name: 'Delete', exact: true }).click()
      await expect(node).toHaveCount(0)
      await expect.poll(() => backend.tree().nodes.length).toBe(1)
      await page.getByRole('button', { name: 'Undo', exact: true }).click()
      await expect(node).toBeVisible()
      backend.releaseUpload()
      await expect.poll(() => backend.removed).toEqual(backend.uploaded)
      await expect(node.getByRole('img', { name: 'Node illustration', exact: true })).toHaveCount(0)
      await expect.poll(() => backend.tree().nodes[1].image).toBeUndefined()
    } finally {
      backend.releaseUpload()
    }
  })
})
