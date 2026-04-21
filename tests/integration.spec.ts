import { test, expect } from '@playwright/test'

// Configure for testing against local dev server
test.use({
  baseURL: 'http://localhost:5173',
})

test.describe('WC Tickets Marketplace', () => {
  test('browse tickets and view listing detail', async ({ page }) => {
    await page.goto('/browse')
    
    // Find a listing card link
    const listingLinks = page.locator('a[href*="/listings/"]')
    await expect(listingLinks.first()).toBeVisible()
    
    const firstListingHref = await listingLinks.first().getAttribute('href')
    expect(firstListingHref).toMatch(/^\/listings\/[a-f0-9-]{36}$/)
    
    // Click and navigate
    await listingLinks.first().click()
    
    // Verify correct URL (bug fix 1: was /listing/id instead of /listings/id)
    await expect(page).toHaveURL(/\/listings\/[a-f0-9-]{36}$/)
    
    // Verify listing content loads
    await expect(page.locator('text=Brazil')).toBeVisible()
  })

  test('seller name displays instead of anonymous (bug fix 2)', async ({ page }) => {
    await page.goto('/browse')
    
    // Get first listing
    const listingLink = page.locator('a[href*="/listings/"]').first()
    await listingLink.click()
    
    // Check that seller is NOT anonymous
    const sellerSection = page.locator('heading:has-text("SELLER")').first()
    const sellerName = sellerSection.locator('p').first()
    const nameText = await sellerName.textContent()
    
    expect(nameText).not.toBe('Anonymous')
    expect(nameText?.length).toBeGreaterThan(0)
  })

  test('create a new listing from profile', async ({ page }) => {
    await page.goto('/profile')
    
    // Click "New Listing" button
    const newListingBtn = page.locator('button:has-text("New Listing")')
    await newListingBtn.click()
    
    // Should navigate to create page
    await expect(page).toHaveURL('/sell')
    
    // Fill form
    const matchSelect = page.locator('[role="listbox"]').first()
    await matchSelect.click()
    
    // Select first match option
    const firstOption = page.locator('option').first()
    await firstOption.click()
    
    // Fill seat details
    await page.fill('input[name="section"]', '200')
    await page.fill('input[name="row_label"]', 'K')
    await page.fill('input[name="seat_number"]', '5')
    
    // Submit
    const postBtn = page.locator('button:has-text("Post Listing")')
    await postBtn.click()
    
    // Should redirect to listing detail
    await expect(page).toHaveURL(/\/listings\/[a-f0-9-]{36}$/)
    
    // Verify listing content
    await expect(page.locator('text=Section 200')).toBeVisible()
    await expect(page.locator('text=Row K')).toBeVisible()
    await expect(page.locator('text=Seat 5')).toBeVisible()
    
    // Verify seller is shown with name, not Anonymous
    const sellerName = page.locator('heading:has-text("SELLER")').locator('p').first()
    const text = await sellerName.textContent()
    expect(text).not.toBe('Anonymous')
  })

  test('search and filter listings', async ({ page }) => {
    await page.goto('/browse')
    
    // Filter by match - select "Brazil"
    const matchFilter = page.locator('input[placeholder*="Match"]').first()
    await matchFilter.click()
    
    // Wait for options and select first
    await page.locator('option').first().click()
    
    // Should show only Brazil listings
    const listingText = page.locator('a[href*="/listings/"]').first()
    await expect(listingText).toContainText('Brazil')
  })

  test('navigate back from listing detail to browse', async ({ page }) => {
    // Go to a listing
    await page.goto('/browse')
    const listingLink = page.locator('a[href*="/listings/"]').first()
    await listingLink.click()
    await expect(page).toHaveURL(/\/listings\//)
    
    // Click "Browse Listings" button
    const browseBtn = page.locator('button:has-text("Browse Listings")')
    await expect(browseBtn).toBeVisible()
    await browseBtn.click()
    
    // Should be back on browse
    await expect(page).toHaveURL('/browse')
  })

  test('sign in and sign out workflow', async ({ page }) => {
    // Go to home
    await page.goto('/')
    
    // Sign out button should be visible if logged in
    const signOutBtn = page.locator('button:has-text("Sign Out")')
    if (await signOutBtn.isVisible()) {
      await signOutBtn.click()
      
      // Should now see Sign In button
      const signInBtn = page.locator('button:has-text("Sign In")')
      await expect(signInBtn).toBeVisible()
      
      // Click Sign In to open modal
      await signInBtn.click()
      
      // Modal should appear with email input
      const emailInput = page.locator('input[type="email"]')
      await expect(emailInput).toBeVisible()
    }
  })
})
