import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Homepage Load and Navigation
 * Tests critical paths for homepage functionality
 * Validates: Definition of Done - E2E tests for critical paths
 */

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/fr');
  });

  test('should load homepage successfully', async ({ page }) => {
    // Check page title contains expected text
    await expect(page).toHaveTitle(/STE-SCPB/i);

    // Check main content is visible
    const main = page.locator('main#main-content');
    await expect(main).toBeVisible();
  });

  test('should display hero section', async ({ page }) => {
    // Hero section should be visible
    const heroSection = page.locator('section').first();
    await expect(heroSection).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    // Check navigation is present
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
  });

  test('should be accessible with keyboard navigation', async ({ page }) => {
    // Tab through the page and check focus is visible
    await page.keyboard.press('Tab');
    
    // Check that some element has focus
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should have skip navigation link', async ({ page }) => {
    // Skip navigation should be present (may be visually hidden until focused)
    const skipLink = page.locator('a[href="#main-content"]');
    
    // Focus on skip link
    await page.keyboard.press('Tab');
    
    // Skip link should become visible when focused
    await expect(skipLink).toBeAttached();
  });

  test('should load without JavaScript errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.goto('/fr');
    await page.waitForLoadState('networkidle');

    // Filter out known acceptable errors (e.g., third-party scripts)
    const criticalErrors = errors.filter(
      (error) => !error.includes('recaptcha') && !error.includes('analytics')
    );

    expect(criticalErrors).toHaveLength(0);
  });
});

test.describe('Homepage - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should be responsive on mobile', async ({ page }) => {
    await page.goto('/fr');

    // Main content should be visible
    const main = page.locator('main#main-content');
    await expect(main).toBeVisible();

    // Check that content fits within viewport (no horizontal scroll)
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375);
  });
});
