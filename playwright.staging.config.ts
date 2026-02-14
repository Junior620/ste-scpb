import { defineConfig, devices } from '@playwright/test';
import fs from 'fs';

/**
 * Playwright Configuration for Staging
 * 
 * This configuration runs E2E tests against the staging deployment
 * to verify no functionality regressions after performance optimizations.
 * 
 * Requirements: 11.3 (Verify no regressions in functionality)
 * Task: 22. Deploy to staging and validate
 */

// Read staging URL
let stagingUrl = process.env.STAGING_URL;
if (!stagingUrl && fs.existsSync('.staging-url.txt')) {
  stagingUrl = fs.readFileSync('.staging-url.txt', 'utf8').trim();
}

if (!stagingUrl) {
  throw new Error('No staging URL found. Set STAGING_URL environment variable or create .staging-url.txt');
}

console.log(`🎭 Running E2E tests against staging: ${stagingUrl}`);

export default defineConfig({
  testDir: './e2e',
  
  // Run tests in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'playwright-report-staging' }],
    ['json', { outputFile: 'playwright-report-staging/results.json' }],
    ['list'],
  ],
  
  // Shared settings for all the projects below
  use: {
    // Base URL for staging
    baseURL: stagingUrl,
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
    
    // Timeout for each action
    actionTimeout: 10000,
    
    // Navigation timeout
    navigationTimeout: 30000,
  },
  
  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // Mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  
  // Global timeout for each test
  timeout: 60000,
  
  // Expect timeout
  expect: {
    timeout: 10000,
  },
});
