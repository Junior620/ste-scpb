# Staging Deployment and Validation Guide

This guide covers the complete process for deploying the optimized build to staging and validating performance improvements.

**Requirements:** 11.1, 11.2, 11.3  
**Task:** 22. Deploy to staging and validate

## Overview

The staging deployment process includes:

1. **Pre-deployment checks** - Verify build and bundle size
2. **Deployment** - Deploy to Vercel staging environment
3. **Lighthouse testing** - Run performance tests on all pages
4. **24-hour monitoring** - Track Real Experience Score and uptime
5. **Functionality verification** - Run E2E tests to ensure no regressions
6. **Metrics collection** - Gather performance data from real users

## Prerequisites

### Required Tools

- Node.js 18+ and npm
- Vercel CLI: `npm install -g vercel`
- Vercel account with project configured

### Environment Variables

Ensure all required environment variables are set in Vercel:

```bash
# CMS
CMS_PROVIDER=sanity
SANITY_PROJECT_ID=your_project_id
SANITY_DATASET=production
SANITY_API_TOKEN=your_token

# Email
RESEND_API_KEY=your_key
EMAIL_FROM=noreply@contact.ste-scpb.com

# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key
RECAPTCHA_SECRET_KEY=your_secret_key

# Rate Limiting
UPSTASH_REDIS_REST_URL=your_url
UPSTASH_REDIS_REST_TOKEN=your_token

# Maps
NEXT_PUBLIC_MAPBOX_TOKEN=your_token

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=your_dsn
SENTRY_AUTH_TOKEN=your_token
```

## Step 1: Pre-Deployment Checks

Before deploying, verify the build is successful and meets performance budgets:

```bash
# Navigate to project directory
cd ste-scpb-website

# Clean previous builds
rm -rf .next

# Run production build
npm run build

# Analyze bundle size
npm run analyze
```

**Expected Results:**
- Build completes without errors
- Initial JavaScript bundle < 200KB gzipped
- No critical warnings in build output

## Step 2: Deploy to Staging

### Option A: Automated Deployment (Recommended)

Use the deployment script:

```bash
npm run deploy:staging
```

This script will:
- Run pre-deployment checks
- Build the project locally
- Analyze bundle size
- Deploy to Vercel staging
- Save the staging URL to `.staging-url.txt`

### Option B: Manual Deployment

```bash
# Login to Vercel (if not already logged in)
vercel login

# Deploy to staging (creates preview deployment)
vercel

# Note the deployment URL for later use
```

**Expected Output:**
```
✅ Deployed to staging: https://ste-scpb-website-abc123.vercel.app
```

## Step 3: Run Lighthouse Tests

Run comprehensive Lighthouse tests on all key pages:

```bash
# Using the validation script (recommended)
npm run validate:staging

# Or using Lighthouse CI directly
npm run lighthouse:staging
```

**Pages Tested:**
- Homepage (/, /fr, /en, /ru)
- Products page (/fr/produits)
- Articles page (/fr/actualites)
- Contact page (/fr/contact)
- About page (/fr/a-propos)
- Team page (/fr/equipe)
- RFQ page (/fr/devis)

**Performance Targets (Requirements 11.4):**

| Metric | Target | Current Baseline |
|--------|--------|------------------|
| Real Experience Score | >90 | 85 |
| First Contentful Paint | <2.5s | 3.16s |
| Largest Contentful Paint | <2.5s | 3.16s |
| Time to First Byte | <0.8s | 1.24s |
| Cumulative Layout Shift | ≤0.1 | 0 |
| Total Blocking Time | <300ms | - |
| Initial Bundle Size | <200KB gzipped | - |

**Expected Results:**
- All pages achieve Performance score ≥90%
- FCP and LCP under 2.5s
- No accessibility violations
- Bundle size within budget

## Step 4: Monitor for 24 Hours

Start the monitoring script to track Real Experience Score and uptime:

```bash
npm run monitor:staging
```

**What it monitors:**
- Deployment uptime (checks every 5 minutes)
- Response times (TTFB proxy)
- HTTP status codes
- Error rates

**Monitoring Dashboard:**

The script displays real-time metrics:
```
╔════════════════════════════════════════════════════════════╗
║  🔍 Staging Deployment Monitoring                         ║
╚════════════════════════════════════════════════════════════╝

📍 URL: https://ste-scpb-website-abc123.vercel.app
⏱️  Time remaining: 23h 45m

Current Check:
  ✅ Status: 200
  ⚡ Response Time: 245ms

Summary Statistics:
  📊 Total Checks: 48
  ✅ Successful: 48
  ❌ Failed: 0
  ⚡ Avg Response: 267ms
  ⚡ Min Response: 198ms
  ⚡ Max Response: 412ms
  📈 Uptime: 100.00%

Performance Targets (Requirements 11.4):
  • TTFB: 267ms (target: <800ms) ✅
  • Real Experience Score: Monitor in Vercel Analytics
  • FCP, LCP: Run Lighthouse tests
```

**Metrics File:**

All metrics are saved to `staging-metrics.json` for later analysis.

### Monitor Real Experience Score

In parallel, monitor the Real Experience Score in Vercel Analytics:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Navigate to **Analytics** → **Speed Insights**
4. Filter by the staging deployment URL
5. Monitor Core Web Vitals from real users

**Target Metrics:**
- Real Experience Score: >90
- P75 FCP: <2.5s
- P75 LCP: <2.5s
- P75 INP: <200ms
- CLS: ≤0.1

## Step 5: Verify Functionality

Run E2E tests to ensure no regressions:

```bash
# Run all E2E tests against staging
npm run test:e2e:staging

# Or run specific browser tests
npx playwright test --config=playwright.staging.config.ts --project=chromium
```

**Test Coverage:**
- Navigation and routing
- Language switching
- Form submissions (Contact, RFQ, Newsletter)
- Product browsing
- Article reading
- Responsive layouts
- Accessibility features

**Expected Results:**
- All tests pass
- No functionality regressions
- Forms submit successfully
- Navigation works correctly
- No console errors

## Step 6: Collect Performance Metrics

### Vercel Analytics

Monitor real user metrics in Vercel Analytics:

1. **Real Experience Score** - Overall performance score from real users
2. **Core Web Vitals** - FCP, LCP, TTFB, INP, CLS
3. **Page Load Times** - Distribution of load times
4. **Geographic Distribution** - Performance by region
5. **Device Types** - Performance on mobile vs desktop

### Lighthouse CI Reports

Review detailed Lighthouse reports:

```bash
# Reports are saved to ./lighthouse-reports/
ls -la lighthouse-reports/

# Open HTML reports in browser
open lighthouse-reports/staging-home.report.html
```

### Custom Metrics

The monitoring script saves detailed metrics to `staging-metrics.json`:

```json
{
  "startTime": 1707955200000,
  "stagingUrl": "https://ste-scpb-website-abc123.vercel.app",
  "checks": [
    {
      "timestamp": 1707955200000,
      "statusCode": 200,
      "responseTime": 245,
      "success": true
    }
  ],
  "summary": {
    "totalChecks": 288,
    "successfulChecks": 288,
    "failedChecks": 0,
    "averageResponseTime": 267,
    "minResponseTime": 198,
    "maxResponseTime": 412
  }
}
```

## Validation Checklist

Use this checklist to ensure all validation steps are complete:

### Pre-Deployment
- [ ] Build completes successfully
- [ ] Bundle size within budget (<200KB gzipped)
- [ ] No critical build warnings
- [ ] All environment variables configured

### Deployment
- [ ] Deployed to Vercel staging
- [ ] Staging URL accessible
- [ ] All pages load correctly
- [ ] No 404 or 500 errors

### Performance Testing
- [ ] Lighthouse tests run on all pages
- [ ] Performance score ≥90% on all pages
- [ ] FCP <2.5s on all pages
- [ ] LCP <2.5s on all pages
- [ ] CLS ≤0.1 on all pages
- [ ] Bundle size within budget

### Monitoring (24 hours)
- [ ] Monitoring script running
- [ ] Uptime ≥99%
- [ ] Average TTFB <800ms
- [ ] Real Experience Score >90 in Vercel Analytics
- [ ] No error spikes

### Functionality Testing
- [ ] All E2E tests pass
- [ ] Forms submit successfully
- [ ] Navigation works correctly
- [ ] Language switching works
- [ ] No console errors
- [ ] Responsive layouts work

### Metrics Collection
- [ ] Vercel Analytics data collected
- [ ] Lighthouse reports generated
- [ ] Monitoring metrics saved
- [ ] Performance comparison documented

## Troubleshooting

### Build Fails

**Issue:** Build fails with errors

**Solution:**
1. Check error messages in build output
2. Verify all dependencies are installed: `npm ci`
3. Clear cache: `rm -rf .next node_modules && npm install`
4. Check TypeScript errors: `npm run typecheck`

### Deployment Fails

**Issue:** Vercel deployment fails

**Solution:**
1. Check Vercel CLI is installed: `vercel --version`
2. Login to Vercel: `vercel login`
3. Verify project is linked: `vercel link`
4. Check environment variables in Vercel dashboard

### Lighthouse Tests Fail

**Issue:** Performance score below target

**Solution:**
1. Check which metrics are failing
2. Review bundle size: `npm run analyze`
3. Verify lazy loading is working
4. Check cache headers in Network tab
5. Review Lighthouse recommendations

### Monitoring Shows High Response Times

**Issue:** Average TTFB >800ms

**Solution:**
1. Check Vercel function logs for errors
2. Verify CMS response times
3. Check database query performance
4. Review ISR cache hit rates
5. Consider increasing cache TTL

### E2E Tests Fail

**Issue:** Playwright tests fail

**Solution:**
1. Check test output for specific failures
2. Run tests in headed mode: `npm run test:e2e:headed`
3. Review screenshots and videos in `playwright-report-staging/`
4. Verify staging URL is accessible
5. Check for console errors in browser

## Next Steps

After successful staging validation:

1. **Review Results** - Analyze all metrics and test results
2. **Document Improvements** - Compare against baseline metrics
3. **Get Approval** - Present results to stakeholders
4. **Promote to Production** - Deploy to production environment
5. **Continue Monitoring** - Track production metrics

### Promote to Production

Once staging validation is complete and approved:

```bash
# Promote staging deployment to production
vercel --prod

# Or deploy fresh to production
vercel --prod --yes
```

### Post-Production

After production deployment:

1. Monitor Real Experience Score in production
2. Set up alerts for performance degradation
3. Continue tracking Core Web Vitals
4. Review user feedback
5. Plan next optimization iteration

## Performance Comparison

Document the improvements achieved:

| Metric | Baseline | Target | Staging | Production |
|--------|----------|--------|---------|------------|
| Real Experience Score | 85 | >90 | _TBD_ | _TBD_ |
| FCP | 3.16s | <2.5s | _TBD_ | _TBD_ |
| LCP | 3.16s | <2.5s | _TBD_ | _TBD_ |
| TTFB | 1.24s | <0.8s | _TBD_ | _TBD_ |
| Bundle Size | _TBD_ | <200KB | _TBD_ | _TBD_ |

Fill in the "Staging" and "Production" columns after validation.

## Resources

- [Vercel Analytics Documentation](https://vercel.com/docs/analytics)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [Playwright Documentation](https://playwright.dev/)
- [Core Web Vitals Guide](https://web.dev/vitals/)
- [Next.js Performance Documentation](https://nextjs.org/docs/app/building-your-application/optimizing)

## Support

For issues or questions:

1. Check this documentation
2. Review Vercel deployment logs
3. Check Lighthouse reports
4. Review monitoring metrics
5. Contact the development team
