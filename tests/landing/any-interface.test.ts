import { test, expect } from '@playwright/test'

for (const lang of ['en', 'es', 'ca']) {
  test(`${lang}: each interface advances and restarts independently`, async ({ page }) => {
    await page.goto(lang === 'en' ? '/' : `/${lang}`)
    await page.evaluate(() => customElements.whenDefined('any-interface'))
    const screens = page.locator('any-interface .ai-screen')
    await expect(screens).toHaveCount(3)
    await expect(page.locator('any-interface > figure')).toHaveCount(4)
    await expect(page.locator('any-interface [data-kind="chat"]')).toHaveCount(0)
    const invitation = page.locator('any-interface .ai-out--imagine')
    await expect(invitation).toBeVisible()
    await expect(invitation.locator('button')).toHaveCount(0)
    await expect(invitation.locator('p')).not.toBeEmpty()
    const initial = await screens.evaluateAll(elements => elements.map(element => element.innerHTML))

    for (let index = 0; index < 3; index++) {
      const screen = screens.nth(index)
      const before = await screens.evaluateAll(elements => elements.map(element => element.innerHTML))
      const expectOthersUnchanged = async () => {
        const after = await screens.evaluateAll(elements => elements.map(element => element.innerHTML))
        for (let other = 0; other < 3; other++) {
          if (other !== index) expect(after[other]).toBe(before[other])
        }
      }

      // Trust and the key belong to this interface's own playthrough.
      await screen.locator('[data-answer="help"]').click()
      await expect(screen.locator('[data-answer="tower"]')).toHaveCount(0)
      await expectOthersUnchanged()
      await screen.locator('[data-answer="help"]').click()
      await expect(screen.locator('[data-answer="thank"]')).toBeVisible()
      await expectOthersUnchanged()
      await screen.locator('[data-answer="thank"]').click()
      await screen.locator('[data-answer="tower"]').click()
      await expect(screen.locator('.ai-again')).toBeVisible()
      await expectOthersUnchanged()
      await screen.locator('.ai-again').click()
      expect(await screen.innerHTML()).toBe(initial[index])
      await expectOthersUnchanged()

      // Leave a different ending here while the next interface is played.
      await screen.locator('[data-answer="leave"]').click()
      await expect(screen.locator('.ai-again')).toBeVisible()
      await expectOthersUnchanged()
    }
  })
}
