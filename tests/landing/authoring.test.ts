import { test, expect } from '@playwright/test'
import { copyFor } from '../../site/src/i18n'
import { ATLAS, atlasFor } from '../../site/src/components/landing/atlas'

const languages = [
  { lang: 'en', path: '/' },
  { lang: 'ca', path: '/ca' },
  { lang: 'es', path: '/es' },
] as const

test.use({ storageState: { cookies: [], origins: [] } })

for (const { lang, path } of languages) {
  const copy = copyFor(lang)
  const catalogue = atlasFor(lang)

  test(`${lang}: shows four authoring chapters with real localised boards and documentation`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(path)
    await expect(page.locator('h1')).toContainText(copy.hero.titleStart)
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', copy.meta.description)
    await expect(page.locator('.e-toc a')).toHaveCount(4)
    await expect(page.locator('board-demo')).toHaveCount(4)
    for (const chapter of ['write', 'connect', 'remember', 'publish'] as const) {
      await page.locator(`.e-toc a[href="#ch-${chapter}"]`).click()
      const section = page.locator(`#ch-${chapter}`)
      await expect(section.getByRole('heading', { level: 3 })).toHaveText(catalogue.chapters[chapter].title)
      await expect(section.locator('trama-board')).toHaveAttribute('ready', '', { timeout: 15000 })
      await expect(section.locator('polo-board')).toHaveCount(1)
    }
    for (const feature of ATLAS.filter(feature => feature.docs)) {
      await expect(page.locator(`#f-${feature.id} a`).first()).toHaveAttribute('href', `${lang === 'en' ? '' : `/${lang}`}/docs/features#${feature.docs}`)
    }
    expect(errors).toEqual([])
  })

  test(`${lang}: answers the catalogue's questions with keyboard-operated disclosures`, async ({ page }) => {
    await page.goto(path)
    const questions = page.locator('#faq')
    await expect(questions.locator('details')).toHaveCount(catalogue.faq.length)
    for (const [index, item] of catalogue.faq.entries()) {
      const question = questions.locator('details').nth(index)
      await expect(question.locator('summary')).toHaveText(item.question)
      if (await question.getAttribute('open') !== null) await question.locator('summary').click()
      await question.locator('summary').focus()
      await page.keyboard.press('Enter')
      await expect(question).toHaveAttribute('open', '')
      await expect(question.locator('p')).toHaveText(item.answer)
      await expect(question.locator('p')).toBeVisible()
    }
  })

  for (const width of [1440, 390, 320]) {
    for (const theme of ['light', 'dark'] as const) {
      test(`${lang}: chapters and questions stay readable at ${width}px in ${theme}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1000 })
        await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' })
        await page.goto(path)
        await page.evaluate(() => document.fonts.ready)
        for (const selector of ['.e-chapter__head', '.e-more > dl > div', '.st-pillar > h3', '#faq summary']) {
          const elements = page.locator(selector)
          expect(await elements.count()).toBeGreaterThan(0)
          for (const element of await elements.all()) {
            const bounds = (await element.boundingBox())!
            expect(bounds.x).toBeGreaterThanOrEqual(0)
            expect(bounds.x + bounds.width).toBeLessThanOrEqual(width + 1)
            expect(await element.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true)
          }
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
      })
    }
  }
}

test('keeps the chosen chapter when changing language', async ({ page }) => {
  await page.goto('/ca#ch-write')
  await page.locator('.footer language-selector').getByRole('link', { name: 'Español' }).click()
  await expect(page).toHaveURL(/\/es#ch-write$/)
  await expect(page.locator('#ch-write h3')).toHaveText(atlasFor('es').chapters.write.title)
})
