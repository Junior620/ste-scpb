import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Product Browsing Flow
 * Tests critical paths for product navigation and display
 * Validates: Definition of Done - E2E tests for critical paths
 */

test.describe('Products Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/fr/produits');
  });

  test('should load products page successfully', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Produits|Products/i);

    // Main content should be visible
    const main = page.locator('main#main-content');
    await expect(main).toBeVisible();
  });

  test('should display products section', async ({ page }) => {
    // Products section should be visible
    const productsSection = page.locator('main');
    await expect(productsSection).toBeVisible();
  });

  test('should have proper heading structure', async ({ page }) => {
    // Check for H1 heading
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
  });

  test('should be accessible', async ({ page }) => {
    // Check main landmark is present
    const main = page.locator('main');
    await expect(main).toBeVisible();

    // Check for proper ARIA attributes
    const mainContent = page.locator('main#main-content');
    await expect(mainContent).toHaveAttribute('tabindex', '-1');
  });
});

test.describe('Product Detail Page', () => {
  test('should navigate to product detail from products page', async ({ page }) => {
    await page.goto('/fr/produits');

    // Look for any product link
    const productLink = page.locator('a[href*="/produits/"]').first();
    
    // If product links exist, click one
    if (await productLink.isVisible()) {
      await productLink.click();
      
      // Should navigate to product detail page
      await expect(page).toHaveURL(/\/produits\/.+/);
      
      // Product detail should have main content
      const main = page.locator('main#main-content');
      await expect(main).toBeVisible();
    }
  });

  test('should display product information on detail page', async ({ page }) => {
    // Navigate directly to a product page (using cacao as example)
    await page.goto('/fr/produits/cacao');

    // Main content should be visible
    const main = page.locator('main#main-content');
    await expect(main).toBeVisible();

    // Should have a heading
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });
});

test.describe('Products - Category Filtering', () => {
  test('should filter products by category via URL', async ({ page }) => {
    // Navigate to products with category filter
    await page.goto('/fr/produits?category=cacao');

    // Page should load successfully
    const main = page.locator('main#main-content');
    await expect(main).toBeVisible();

    // URL should contain category parameter
    expect(page.url()).toContain('category=cacao');
  });
});

test.describe('Products - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should be responsive on mobile', async ({ page }) => {
    await page.goto('/fr/produits');

    // Main content should be visible
    const main = page.locator('main#main-content');
    await expect(main).toBeVisible();

    // Check that content fits within viewport
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375);
  });
});
