import { test, expect } from '@playwright/test'

test.describe('basic story', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(
      'http://localhost:4200/private/a1e23f34-ce24-4cba-a38b-07a24a17bb14'
    )
  })

  test('can see the first question', async ({ page }) => {
    // Title is on the tab
    await expect(page).toHaveTitle('TEST - Basic flow')

    // There is a title on top
    const title = page.getByText(/TEST - Basic flow/)
    await title.waitFor()
    expect(title).toBeInViewport()

    // There is a text
    const text = page.getByText('initial text')
    await text.waitFor()
    expect(text).toBeInViewport()

    // There are the answers
    const answer1 = page.getByText('answer 1')
    await answer1.waitFor()
    expect(answer1).toBeInViewport()

    const answer2 = page.getByText('answer 2')
    await answer2.waitFor()
    expect(answer2).toBeInViewport()
  })

  test('can jump to another step', async ({ page }) => {
    // When we click first answer
    await page.getByText('answer 1').waitFor()
    await page.getByText('answer 1').click()

    // We see the text and answers of the second step
    const text = page.getByText('answer 1 text')
    await text.waitFor()
    expect(text).toBeInViewport()

    const answer = page.getByText('step 2 answer')
    await answer.waitFor()
    expect(answer).toBeInViewport()
  })

  test('can jump to an end node', async ({ page }) => {
    const answer1 = page.getByText('answer 1')
    await answer1.waitFor()
    await answer1.click()

    const answer = page.getByText('step 2 answer')
    await answer.waitFor()
    await answer.click()

    // Can see text for final node
    const finalText = page.getByText('end')
    await finalText.waitFor()
    expect(finalText).toBeVisible()

    // Can see and use the link
    const finalLink = page.getByText('link')
    await finalLink.waitFor()
    expect(finalLink).toBeVisible()

    // Can see share default button
    // const shareButton = page.getByText('share')
    // expect(shareButton).toBeVisible()
  })

  test('it loads images correctly', async ({ page }) => {
    const answer1 = page.getByText('answer 1')
    await answer1.waitFor()
    await answer1.click()

    const image = page.getByRole('img')
    await image.waitFor()

    expect(image).toBeVisible()
    expect(image).toHaveAttribute(
      'src',
      'https://lsemostpqoguehpsbzgu.supabase.co/storage/v1/object/public/images/6a519598-5b4e-4d44-9902-b33be8370e9c/a1e23f34-ce24-4cba-a38b-07a24a17bb14/node_1'
    )
  })

  test('it uses the configurations correctly for this story', async ({
    page,
  }) => {
    const answer1 = page.getByText('answer 1')
    await answer1.waitFor()
    await answer1.click()

    const answer = page.getByText('step 2 answer')
    await answer.waitFor()
    await answer.click()

    const finalNode = page.getByText('end')
    await finalNode.waitFor()

    // Does not show the share button
    const share = page.locator('.sharebutton')
    await share.waitFor()
    expect(share).not.toBeInViewport()

    // Does not ask for a name
  })
})
