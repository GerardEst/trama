import { test, expect } from '@playwright/test'

// The hero offers several stories side by side; the one in the middle can be
// played, and each paints the hero with its own landscape.
test('passing between the hero stories paints each one’s landscape and plays only the one in the middle', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/ca')
  const hero = page.locator('.e-hero')
  const cover = page.locator('written-world')
  const slides = page.locator('story-carousel .sc-slide')
  await expect(slides).toHaveCount(3)
  // The page opens on the dark lighthouse, in the middle, over its coast: the cover made of its words.
  await expect(hero).toHaveAttribute('data-scene', 'coast')
  await expect(cover).toHaveAttribute('data-scene', 'coast')
  await expect(cover).not.toHaveAttribute('inactive', '')
  await expect(slides.nth(1)).toContainText('EL FAR APAGAT')
  await expect(slides.nth(1)).toHaveAttribute('data-active', '')
  await expect(slides.nth(0).locator('.sc-page')).toHaveJSProperty('inert', true)
  await expect(slides.nth(2).locator('.sc-page')).toHaveJSProperty('inert', true)
  await expect(page.getByRole('button', { name: 'Història anterior' })).toBeEnabled()
  await expect(page.getByRole('button', { name: 'Història següent' })).toBeEnabled()
  // Centred on the track, with the other two waiting at its sides.
  const centre = (box: { x: number, width: number } | null) => box!.x + box!.width / 2
  const track = await page.locator('story-carousel .sc-track').boundingBox()
  expect(Math.abs(centre(await slides.nth(1).boundingBox()) - centre(track))).toBeLessThan(2)
  const lighthouse = page.locator('#try-it')
  await lighthouse.getByRole('button', { name: /Corre cap al far/ }).click()
  await expect(lighthouse).toContainText('La porta del far és oberta')

  await page.getByRole('button', { name: 'Història anterior' }).click()
  await expect(hero).toHaveAttribute('data-scene', 'valley')
  await expect(cover).toHaveAttribute('inactive', '')
  await expect(slides.nth(1).locator('.sc-page')).toHaveJSProperty('inert', true)
  await expect(page.locator('#try-threshold')).toContainText('Ciutadella Buida')
  await expect(page.getByRole('button', { name: 'Història anterior' })).toBeDisabled()

  await page.locator('.sc-tabs').getByRole('button', { name: 'L’oasi' }).click()
  await expect(hero).toHaveAttribute('data-scene', 'desert')
  await expect(page.getByRole('button', { name: 'Història següent' })).toBeDisabled()

  await page.locator('.sc-tabs').getByRole('button', { name: 'El far apagat' }).click()
  await expect(hero).toHaveAttribute('data-scene', 'coast')
  await expect(cover).not.toHaveAttribute('inactive', '')
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
