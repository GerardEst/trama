import { test, expect } from '@playwright/test'

// Baskervville and Raleway default to old-style numerals (4,95 reads as 4,g5).
// Every page sets lining figures, including where a font shorthand would reset them.
for (const [path, selectors] of [
  ['/pricing', ['h1', '.pp-price__amount', '.pp-price__unit', '.e-btn', '#faq details p']],
  ['/use-cases', ['.uc-plan__name', '.us-state span', '.as td']],
  ['/', ['#compare td', '.lq details p', '.e-btn']],
  ['/docs/features', ['h1', '.chapter p']],
] as const) {
  test(`${path} sets every number in lining figures`, async ({ page }) => {
    await page.goto(path)
    for (const selector of selectors) {
      const element = page.locator(selector).first()
      await expect(element, selector).toHaveCSS('font-variant-numeric', 'lining-nums')
    }
  })
}
