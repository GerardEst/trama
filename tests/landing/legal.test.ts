import { test, expect } from '@playwright/test'

test('the privacy policy names its owner first and gives their details at the end', async ({ page }) => {
  await page.goto('/privacy')
  await expect(page).toHaveTitle('Privacy policy — Trama')
  await expect(page.locator('h1')).toHaveText('Privacy policy')

  await expect(page.locator('#controller')).toContainText('Gerard Esteve Busquets')
  const owner = page.locator('#owner')
  await expect(owner).toContainText('41549796C')
  await expect(owner).toContainText('17455 Caldes de Malavella')
  // The details close the page, after the last section.
  const last = await page.locator('.legal__body section').last().boundingBox()
  expect((await owner.boundingBox())!.y).toBeGreaterThan(last!.y)
  await page.locator('#controller a[href="#owner"]').click()
  await expect(owner).toBeInViewport()

  const index = page.getByRole('navigation', { name: 'Contents' })
  await index.getByRole('link', { name: 'Players’ data' }).click()
  await expect(page).toHaveURL(/\/privacy#players$/)
  await expect(page.locator('#players')).toBeInViewport()
})

test('the terms link to the privacy policy and to pricing', async ({ page }) => {
  await page.goto('/terms')
  await expect(page).toHaveTitle('Terms of service — Trama')
  await expect(page.locator('#provider')).toContainText('Gerard Esteve Busquets')
  await expect(page.locator('#owner')).toContainText('41549796C')
  await expect(page.locator('#payment a[href="/pricing"]').first()).toBeVisible()

  await page.locator('#termination a[href="/privacy"]').click()
  await expect(page).toHaveURL(/\/privacy$/)
})

test('every footer links to both texts in the reader’s language', async ({ page }) => {
  for (const [path, privacy, terms] of [
    ['/', 'Privacy', 'Terms'],
    ['/es/pricing', 'Privacidad', 'Condiciones'],
    ['/ca/docs/features', 'Privacitat', 'Condicions'],
  ]) {
    await page.goto(path)
    const prefix = path.match(/^\/(es|ca)\b/)?.[0] ?? ''
    await expect(page.locator(`.footer a[href="${prefix}/privacy"]`)).toHaveText(privacy)
    await expect(page.locator(`.footer a[href="${prefix}/terms"]`)).toHaveText(terms)
  }
})

for (const [lang, path, title] of [
  ['es', '/es/privacy', 'Política de privacidad — Trama'],
  ['ca', '/ca/terms', 'Condicions de servei — Trama'],
]) {
  test(`the legal texts are served in ${lang}`, async ({ page }) => {
    await page.goto(path)
    await expect(page).toHaveTitle(title)
    await expect(page.locator('html')).toHaveAttribute('lang', lang)
  })
}

test('signing up links to the terms and the privacy policy', async ({ page }) => {
  await page.goto('/login?mode=register')
  const notice = page.locator('.login-legal')
  await expect(notice.getByRole('link', { name: 'Terms of service' })).toHaveAttribute('href', /\/terms$/)
  await expect(notice.getByRole('link', { name: 'Privacy policy' })).toHaveAttribute('href', /\/privacy$/)
})
