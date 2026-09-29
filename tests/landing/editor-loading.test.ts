import { test, expect, Response } from '@playwright/test'

test.describe('Landing editor loading', () => {
  test('downloads the text editor only when someone starts editing a node', async ({ page }) => {
    const editorScripts: string[] = []
    const inspected: Promise<void>[] = []
    page.on('response', (response: Response) => {
      if (response.request().resourceType() !== 'script') return
      inspected.push(response.text().then(
        body => { if (body.includes('tiptap')) editorScripts.push(response.url()) },
        () => undefined,
      ))
    })

    await page.goto('/')
    const previews = page.locator('polo-board polo-node .richTextField__preview')
    await expect(previews.first()).toBeAttached()
    await page.waitForLoadState('networkidle')
    await Promise.all(inspected)
    expect(editorScripts).toEqual([])

    // The demo board is larger than its viewport; edit a node the visitor can actually hit.
    const index = await previews.evaluateAll(elements => elements.findIndex(element => {
      const before = element.getBoundingClientRect()
      window.scrollTo(0, window.scrollY + before.top - window.innerHeight / 2)
      const box = element.getBoundingClientRect()
      const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)
      return box.width > 0 && !!hit && element.contains(hit)
    }))
    expect(index).toBeGreaterThanOrEqual(0)
    const preview = previews.nth(index)

    await preview.click()
    await expect(preview.locator('.tiptap[contenteditable="true"]')).toBeFocused()
    await Promise.all(inspected)
    expect(editorScripts.length).toBeGreaterThan(0)
  })
})
