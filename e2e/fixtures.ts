import { test as base, expect } from '@playwright/test';

/**
 * Custom test fixtures for STE-SCPB E2E tests
 */

// Extend base test with custom fixtures
export const test = base.extend({
  // Add custom fixtures here as needed
});

export { expect };

/**
 * Test data constants
 */
export const TEST_DATA = {
  // Contact form test data
  contact: {
    name: 'Test User',
    email: 'test@example.com',
    phone: '+237 699 123 456',
    company: 'Test Company',
    message: 'This is a test message for E2E testing purposes.',
  },
  // RFQ form test data
  rfq: {
    companyName: 'Test Trading Company',
    contactPerson: 'John Doe',
    email: 'john.doe@testcompany.com',
    phone: '+237 699 987 654',
    country: 'Cameroon',
    quantity: '100',
    destinationPort: 'Rotterdam',
    specialRequirements: 'Test requirements for E2E testing.',
  },
  // Locales
  locales: {
    fr: 'fr',
    en: 'en',
  },
} as const;

/**
 * Common selectors used across tests
 */
export const SELECTORS = {
  // Navigation
  nav: {
    megaMenu: '[data-testid="mega-menu"]',
    languageSwitcher: '[data-testid="language-switcher"]',
    stickyQuoteCTA: '[data-testid="sticky-quote-cta"]',
  },
  // Forms
  forms: {
    contact: '[data-testid="contact-form"]',
    rfq: '[data-testid="rfq-form"]',
    newsletter: '[data-testid="newsletter-form"]',
  },
  // Sections
  sections: {
    hero: '[data-testid="hero-section"]',
    products: '[data-testid="products-section"]',
    valueChain: '[data-testid="value-chain-section"]',
    team: '[data-testid="team-section"]',
    blog: '[data-testid="blog-section"]',
    map: '[data-testid="map-section"]',
  },
} as const;

/**
 * Helper function to wait for page to be fully loaded
 */
export async function waitForPageLoad(page: import('@playwright/test').Page) {
  await page.waitForLoadState('networkidle');
}

/**
 * Helper function to check if element is visible and accessible
 */
export async function checkAccessibility(
  page: import('@playwright/test').Page,
  selector: string
) {
  const element = page.locator(selector);
  await expect(element).toBeVisible();
  // Check for basic accessibility attributes
  const role = await element.getAttribute('role');
  const ariaLabel = await element.getAttribute('aria-label');
  return { role, ariaLabel };
}
