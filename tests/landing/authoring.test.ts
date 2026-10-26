import { test, expect } from '@playwright/test'
import { landing as en } from '../../src/app/core/i18n/en/landing'
import { landing as ca } from '../../src/app/core/i18n/ca/landing'
import { landing as es } from '../../src/app/core/i18n/es/landing'

const languages = [
  { lang: 'en', path: '/', copy: en },
  { lang: 'ca', path: '/ca', copy: ca },
  { lang: 'es', path: '/es', copy: es },
] as const
const views = ['write', 'map', 'preview', 'share'] as const

test.use({ storageState: { cookies: [], origins: [] } })

for (const { lang, path, copy } of languages) {
  test(`${lang}: shows the real author workflow with keyboard-selectable, localised captures`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(path)
    await expect(page.locator('h1')).toContainText(copy.hero.titleStart)
    await expect(page.locator('.hero__reassurance')).toContainText(copy.hero.free)
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', copy.meta.description)
    await page.getByRole('link', { name: copy.demoBridge.action }).click()
    await expect(page).toHaveURL(new RegExp(`${path}#authoring$`))
    const authoring = page.locator('#authoring')
    await expect(authoring.getByRole('heading', { level: 2 })).toHaveText(copy.authoring.title)
    const image = authoring.locator('img')
    for (const view of views) {
      const button = authoring.getByRole('button', { name: new RegExp(copy.authoring[view].title) })
      await button.focus()
      await page.keyboard.press('Enter')
      await expect(button).toHaveAttribute('aria-pressed', 'true')
      await expect(authoring.locator('button[aria-pressed="true"]')).toHaveCount(1)
      await expect(image).toHaveAttribute('src', `/assets/images/landing/authoring/${lang}-${view}.webp`)
      await expect(image).toHaveAttribute('alt', copy.authoring[view].alt)
      await expect(image).toHaveJSProperty('naturalWidth', 1600)
      await expect(authoring.locator('figcaption')).toContainText(copy.authoring[view].caption)
      await expect(authoring.getByRole('link')).toHaveAttribute('href', `/assets/images/landing/authoring/${lang}-${view}.webp`)
    }
    await expect(page.locator('polo-board, polo-rich-text-editor')).toHaveCount(0)
    expect(errors).toEqual([])
  })

  test(`${lang}: shows Creator and the planned Pro purchase without selling export`, async ({ page }) => {
    await page.goto(path)
    const pricing = page.locator('#pricing')
    await expect(pricing.locator('.pricing__plan')).toHaveCount(2)
    await expect(pricing).not.toContainText('299')
    await expect(pricing).not.toContainText('Basic')
    await expect(pricing.locator('.pricing__plan--pro')).toContainText('200')
    await expect(pricing.locator('.pricing__plan--pro a, .pricing__plan--pro button')).toHaveCount(0)
    const questions = pricing.locator('.questions__list')
    await expect(questions.locator('details')).toHaveCount(7)
    for (const key of ['code', 'free', 'readers', 'download', 'export', 'cancel'] as const) {
      const question = questions.locator('details').filter({ has: page.getByText(copy.questions[key].question, { exact: true }) })
      await question.locator('summary').focus()
      await page.keyboard.press('Enter')
      await expect(question).toHaveAttribute('open', '')
      await expect(question.locator('p')).toHaveText(copy.questions[key].answer)
    }
    await expect(questions.locator('.questions__contact')).toHaveAttribute('href', 'mailto:gesteve.12@gmail.com')
    await expect(page.locator('#trust')).toContainText(copy.trust.data.description)
  })

  for (const width of [1440, 390, 320]) {
    for (const theme of ['light', 'dark'] as const) {
      test(`${lang}: authoring, features and plans stay readable at ${width}px in ${theme}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1000 })
        await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' })
        await page.goto(path)
        await page.locator('#authoring').scrollIntoViewIfNeeded()
        await expect(page.locator('#authoring img')).toHaveJSProperty('naturalWidth', 1600)
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
        for (const selector of ['#authoring button', '#trust article', '.pricing__plan', '.card__copy']) {
          for (const element of await page.locator(selector).all()) {
            const bounds = await element.boundingBox()
            expect(bounds).not.toBeNull()
            expect(bounds!.x).toBeGreaterThanOrEqual(0)
            expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1)
            expect(await element.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true)
          }
        }
        await page.locator('#authoring').screenshot({ path: test.info().outputPath(`${lang}-${width}-${theme}-authoring.png`),
          style: '.site-header { visibility: hidden }' })
        await page.locator('#pricing').screenshot({ path: test.info().outputPath(`${lang}-${width}-${theme}-pricing.png`),
          style: '.site-header { visibility: hidden }' })
      })
    }
  }
}

test('keeps the authoring section selected when changing language', async ({ page }) => {
  await page.goto('/ca#authoring')
  await page.locator('.footer polo-language-selector').getByRole('button', { name: 'Español' }).click()
  await expect(page).toHaveURL(/\/es#authoring$/)
  await expect(page.locator('#authoring h2')).toHaveText(es.authoring.title)
})
