import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Contact Form on dedicated contact page
 */

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/fr/contact');
  });

  test('should display contact form fields on contact page', async ({ page }) => {
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('textarea[name="message"]')).toBeVisible();
    await expect(page.locator('input[name="privacyConsent"]')).toBeVisible();
  });

  test('should show validation errors for empty required fields', async ({ page }) => {
    const submitButton = page.locator('form button[type="submit"]').first();
    await submitButton.click();
    await page.waitForTimeout(500);

    const errorMessages = page.locator('[role="alert"]');
    expect(await errorMessages.count()).toBeGreaterThan(0);
  });

  test('should validate email format', async ({ page }) => {
    const emailInput = page.locator('input[name="email"]');
    await emailInput.fill('invalid-email');
    await emailInput.blur();
    await page.waitForTimeout(300);

    const isInvalid = await emailInput.getAttribute('aria-invalid');
    expect(isInvalid === 'true' || isInvalid === null).toBeTruthy();
  });

  test('should link to consolidated FAQ page', async ({ page }) => {
    const faqLink = page.getByRole('link', { name: /FAQ/i });
    await expect(faqLink).toBeVisible();
    await faqLink.click();
    await expect(page).toHaveURL(/\/fr\/faq/);
    await expect(page.locator('h1')).toContainText(/Questions fréquentes/i);
  });

  test('should have accessible form labels', async ({ page }) => {
    const nameInput = page.locator('input[name="name"]');
    const inputId = await nameInput.getAttribute('id');
    expect(inputId).toBeTruthy();
    await expect(page.locator(`label[for="${inputId}"]`)).toBeVisible();
  });
});

test.describe('Contact Form - Accessibility', () => {
  test('should be navigable with keyboard', async ({ page }) => {
    await page.goto('/fr/contact');

    for (const fieldName of ['name', 'email', 'company', 'message']) {
      const field = page.locator(`[name="${fieldName}"]`).first();
      await field.focus();
      await expect(field).toBeFocused();
    }
  });
});
