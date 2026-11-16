import { test, expect } from '@playwright/test'

// The hero offers several stories side by side; the one in the middle can be
// played, and each paints the hero with its own landscape.
test('passing between the hero stories paints each one’s landscape and plays only the one in the middle', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/ca')
  const hero = page.locator('.e-hero')
  const slides = page.locator('story-carousel .sc-slide')
  await expect(slides).toHaveCount(3)
  await expect(hero).toHaveAttribute('data-scene', 'valley')
  await expect(slides.nth(1).locator('.sc-page')).toHaveJSProperty('inert', true)

  await page.getByRole('button', { name: 'Història següent' }).click()
  await expect(hero).toHaveAttribute('data-scene', 'coast')
  await expect(page.locator('written-world')).toHaveAttribute('inactive', '')
  await expect(slides.nth(0).locator('.sc-page')).toHaveJSProperty('inert', true)
  const lighthouse = page.locator('#try-lighthouse')
  await lighthouse.getByRole('button', { name: /Corre cap al far/ }).click()
  await expect(lighthouse).toContainText('La porta del far és oberta')

  await page.locator('.sc-tabs').getByRole('button', { name: 'L’oasi' }).click()
  await expect(hero).toHaveAttribute('data-scene', 'desert')
  await expect(page.getByRole('button', { name: 'Història següent' })).toBeDisabled()

  await page.locator('.sc-tabs').getByRole('button', { name: 'El darrer llindar' }).click()
  await expect(hero).toHaveAttribute('data-scene', 'valley')
  await expect(page.locator('written-world')).not.toHaveAttribute('inactive', '')
})

test('on a phone a swipe passes to the next story', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/es')
  const track = page.locator('story-carousel .sc-track')
  await track.evaluate(element => element.scrollTo({ left: element.scrollWidth }))
  await expect(page.locator('.e-hero')).toHaveAttribute('data-scene', 'desert')
  await expect(page.locator('#try-oasis')).toContainText('Hace tres días que la tormenta')
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390)
})
