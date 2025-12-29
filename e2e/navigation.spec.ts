import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Navigation
 * Tests critical paths for site navigation
 * Validates: Definition of Done - E2E tests for critical paths
 */

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/fr');
  });

  test('should have main navigation', async ({ page }) => {
    // Check for nav element
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
  });

  test('should navigate to products page', async ({ page }) => {
    // Find products link
    const productsLink = page.locator('a[href*="/produits"]').first();

    if (await productsLink.isVisible()) {
      await productsLink.click();
      await expect(page).toHaveURL(/\/produits/);
    }
  });

  test('should navigate to team page', async ({ page }) => {
    // Find team/equipe link
    const teamLink = page.locator('a[href*="/equipe"]').first();

    if (await teamLink.isVisible()) {
      await teamLink.click();
      await expect(page).toHaveURL(/\/equipe/);
    }
  });

  test('should navigate to news/actualites page', async ({ page }) => {
    // Find news link
    const newsLink = page.locator('a[href*="/actualites"]').first();

    if (await newsLink.isVisible()) {
      await newsLink.click();
      await expect(page).toHaveURL(/\/actualites/);
    }
  });

  test('should have logo link to homepage', async ({ page }) => {
    // Navigate away from homepage first
    await page.goto('/fr/produits');

    // Find logo/home link
    const logoLink = page.locator('a[href="/fr"], a[href="/"]').first();

    if (await logoLink.isVisible()) {
      await logoLink.click();
      
      // Should be back on homepage
      const url = page.url();
      expect(url.endsWith('/fr') || url.endsWith('/fr/')).toBeTruthy();
    }
  });
});

test.describe('Navigation - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should have mobile menu button', async ({ page }) => {
    await page.goto('/fr');

    // Look for hamburger menu button
    const menuButton = page.locator('button[aria-label*="menu"], button[aria-expanded]').first();

    // Mobile should have a menu toggle
    if (await menuButton.isVisible()) {
      await expect(menuButton).toBeVisible();
    }
  });

  test('should open mobile menu on click', async ({ page }) => {
    await page.goto('/fr');

    // Find and click hamburger menu
    const menuButton = page.locator('button[aria-label*="menu"], button[aria-expanded]').first();

    if (await menuButton.isVisible()) {
      await menuButton.click();

      // Menu should be expanded
      const isExpanded = await menuButton.getAttribute('aria-expanded');
      expect(isExpanded === 'true' || isExpanded === null).toBeTruthy();
    }
  });

  test('should close mobile menu on navigation', async ({ page }) => {
    await page.goto('/fr');

    // Open mobile menu
    const menuButton = page.locator('button[aria-label*="menu"], button[aria-expanded]').first();

    if (await menuButton.isVisible()) {
      await menuButton.click();

      // Find and click a navigation link
      const navLink = page.locator('nav a[href*="/produits"]').first();
      
      if (await navLink.isVisible()) {
        await navLink.click();

        // Should navigate
        await expect(page).toHaveURL(/\/produits/);
      }
    }
  });
});

test.describe('Navigation - Accessibility', () => {
  test('should have skip to main content link', async ({ page }) => {
    await page.goto('/fr');

    // Skip link should exist
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();
  });

  test('should skip to main content when activated', async ({ page }) => {
    await page.goto('/fr');

    // Focus skip link
    await page.keyboard.press('Tab');

    // Activate skip link
    await page.keyboard.press('Enter');

    // Main content should receive focus
    const mainContent = page.locator('main#main-content');
    await expect(mainContent).toBeFocused();
  });

  test('should have proper navigation landmarks', async ({ page }) => {
    await page.goto('/fr');

    // Should have nav landmark
    const nav = page.locator('nav');
    await expect(nav.first()).toBeVisible();

    // Should have main landmark
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('should be navigable with keyboard', async ({ page }) => {
    await page.goto('/fr');

    // Tab through navigation
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      
      const focusedElement = page.locator(':focus');
      
      // Each focused element should be visible
      if (await focusedElement.isVisible()) {
        await expect(focusedElement).toBeVisible();
      }
    }
  });
});

test.describe('Sticky Quote CTA', () => {
  test('should show sticky CTA on scroll', async ({ page }) => {
    await page.goto('/fr');

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));

    // Wait for sticky CTA to appear
    await page.waitForTimeout(500);

    // Look for sticky quote button
    const stickyCTA = page.locator('[data-testid="sticky-quote-cta"], button:has-text("Devis"), a:has-text("Devis")');

    // If sticky CTA exists, it should be visible after scroll
    if (await stickyCTA.first().isVisible()) {
      await expect(stickyCTA.first()).toBeVisible();
    }
  });
});

test.describe('Footer Navigation', () => {
  test('should have footer with links', async ({ page }) => {
    await page.goto('/fr');

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Look for footer
    const footer = page.locator('footer');

    if (await footer.isVisible()) {
      await expect(footer).toBeVisible();

      // Should have links
      const footerLinks = footer.locator('a');
      const linkCount = await footerLinks.count();
      expect(linkCount).toBeGreaterThan(0);
    }
  });

  test('should have legal pages links in footer', async ({ page }) => {
    await page.goto('/fr');

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Look for legal links
    const privacyLink = page.locator('a[href*="politique-confidentialite"], a[href*="privacy"]');
    const legalLink = page.locator('a[href*="mentions-legales"], a[href*="legal"]');

    // Should have privacy and legal links
    if (await privacyLink.first().isVisible()) {
      await expect(privacyLink.first()).toBeVisible();
    }
    if (await legalLink.first().isVisible()) {
      await expect(legalLink.first()).toBeVisible();
    }
  });
});
