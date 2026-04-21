import { test, expect, Page } from '@playwright/test'

let page: Page

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage()
})

test.afterAll(async () => {
  await page.close()
})

test('end-to-end: sign in, create listing, view it', async ({ page: testPage }) => {
  // Sign in with magic link
  await testPage.goto('http://localhost:5173')
  await testPage.click('button:has-text("Sign In")')
  
  const emailInput = testPage.locator('input[type="email"]')
  await emailInput.fill('testuser@example.com')
  
  // Check Mailpit for link (local dev)
  const sendButton = testPage.locator('button:has-text("Send Magic Link")')
  await sendButton.click()
  
  // For testing: simulate authenticated state
  await testPage.goto('http://localhost:5173/create')
  
  // Create a listing
  await testPage.click('button:has-text("Pick a Match")')
  await testPage.waitForSelector('text=Brazil')
  await testPage.click('button:has-text("Brazil")')
  
  await testPage.fill('input[name="section"]', '101')
  await testPage.fill('input[name="row_label"]', 'A')
  await testPage.fill('input[name="seat_number"]', '12')
  await testPage.selectOption('select[name="category"]', '1')
  
  await testPage.click('button:has-text("Post Listing")')
  
  // Should redirect to listing detail
  await testPage.waitForURL('/listings/**')
  const url = testPage.url()
  const listingId = url.split('/').pop()
  
  // Verify listing is visible and seller is not anonymous
  await expect(testPage.locator('text=Section 101')).toBeVisible()
  await expect(testPage.locator('text=Anonymous')).not.toBeVisible()
  
  // Browse and click listing
  await testPage.goto('http://localhost:5173/browse')
  const listingLink = testPage.locator(`a[href="/listings/${listingId}"]`).first()
  await listingLink.click()
  
  // Verify URL is correct (bug 1 check)
  await expect(testPage).toHaveURL(`http://localhost:5173/listings/${listingId}`)
})

test('bug: listing shows non-anonymous seller', async ({ page: testPage }) => {
  await testPage.goto('http://localhost:5173/listings/7ac609a9-9ee3-48e3-b34e-d86a9ce043d4')
  
  // Should not show "Anonymous" if seller has full_name set
  const sellerName = testPage.locator('//heading[text()="SELLER"]/..//p').first()
  const text = await sellerName.textContent()
  expect(text).not.toBe('Anonymous')
})
