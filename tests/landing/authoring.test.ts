import { test, expect } from '@playwright/test'
import { landing as en } from '../../site/src/i18n/en'
import { landing as ca } from '../../site/src/i18n/ca'
import { landing as es } from '../../site/src/i18n/es'

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
    for (const view of views) {
      const button = authoring.getByRole('button', { name: new RegExp(copy.authoring[view].title) })
      await button.focus()
      await page.keyboard.press('Enter')
      await expect(button).toHaveAttribute('aria-pressed', 'true')
      await expect(authoring.locator('button[aria-pressed="true"]')).toHaveCount(1)
      // Only the chosen capture is shown, as a responsive image linking to its full size.
      const image = authoring.locator('img:visible')
      await expect(image).toHaveCount(1)
      await expect(image).toHaveAttribute('src', new RegExp(`/_astro/${lang}-${view}\\.`))
      await expect(image).toHaveAttribute('srcset', /1600w/)
      await expect(image).toHaveAttribute('alt', copy.authoring[view].alt)
      await expect(image).toHaveJSProperty('complete', true)
      await expect(authoring.locator('figcaption')).toContainText(copy.authoring[view].caption)
      await expect(authoring.getByRole('link')).toHaveAttribute('href', new RegExp(`/_astro/${lang}-${view}\\.`))
    }
    await expect(page.locator('polo-board, polo-rich-text-editor')).toHaveCount(0)
    expect(errors).toEqual([])
  })

  test(`${lang}: answers common questions without selling plans`, async ({ page }) => {
    await page.goto(path)
    const questions = page.locator('#questions')
    await expect(questions.locator('details')).toHaveCount(5)
    for (const key of ['code', 'readers', 'download', 'export', 'create'] as const) {
      const question = questions.locator('details').filter({ has: page.getByText(copy.questions[key].question, { exact: true }) })
      await question.locator('summary').focus()
      await page.keyboard.press('Enter')
      await expect(question).toHaveAttribute('open', '')
      await expect(question.locator('p')).toHaveText(copy.questions[key].answer)
    }
    await expect(page.locator('main')).not.toContainText(/\bPro\b/)
    await expect(page.locator('#trust')).toContainText(copy.trust.data.description)
  })

  for (const width of [1440, 390, 320]) {
    for (const theme of ['light', 'dark'] as const) {
      test(`${lang}: authoring, features and questions stay readable at ${width}px in ${theme}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1000 })
        await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' })
        await page.goto(path)
        await page.locator('#authoring').scrollIntoViewIfNeeded()
        await expect(page.locator('#authoring img:visible')).toHaveJSProperty('complete', true)
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
        for (const selector of ['#authoring button', '#trust article', '#questions summary', '.feature-card__copy']) {
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
        await page.locator('#questions').screenshot({ path: test.info().outputPath(`${lang}-${width}-${theme}-questions.png`),
          style: '.site-header { visibility: hidden }' })
      })
    }
  }
}

test('keeps the authoring section selected when changing language', async ({ page }) => {
  await page.goto('/ca#authoring')
  await page.locator('.footer language-selector').getByRole('link', { name: 'Español' }).click()
  await expect(page).toHaveURL(/\/es#authoring$/)
  await expect(page.locator('#authoring h2')).toHaveText(es.authoring.title)
})
