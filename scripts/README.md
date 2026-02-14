# Deployment and Validation Scripts

This directory contains scripts for deploying to staging/production and validating performance optimizations.

## Scripts Overview

### Production Deployment Scripts

#### 1. deploy-production.sh

Deploys the optimized build to production with gradual rollout.

**Usage:**
```bash
npm run deploy:production
```

**What it does:**
- Runs pre-deployment validation
- Builds production bundle
- Runs final checks (tests, linting, type checking)
- Deploys to Vercel production
- Performs initial health check
- Starts production monitoring
- Implements gradual rollout (10% → 50% → 100%)

**Requirements:** 
- Vercel CLI installed and authenticated
- Staging validation completed
- All tests passing

#### 2. monitor-production.js

Continuous production monitoring with alerts.

**Usage:**
```bash
npm run monitor:production
# or
node scripts/monitor-production.js
```

**What it does:**
- Checks deployment health every 5 minutes
- Tracks HTTP status codes and response times
- Monitors error rates and component errors
- Displays real-time dashboard
- Triggers alerts on performance degradation
- Saves metrics to `production-metrics.json`

**Alerts when:**
- TTFB exceeds 1s
- Uptime drops below 99.5%
- Error rate exceeds 1%
- Lazy-loaded component errors detected

#### 3. verify-performance-targets.js

Verifies all performance targets are met.

**Usage:**
```bash
npm run verify:performance
# or
node scripts/verify-performance-targets.js
```

**What it does:**
- Checks Real Experience Score >90
- Validates FCP <2.5s
- Validates LCP <2.5s
- Validates TTFB <0.8s
- Validates INP <200ms
- Validates CLS ≤0.1
- Checks bundle size <200KB gzipped
- Generates pass/fail report

#### 4. rollback-production.sh

Rolls back production deployment if issues detected.

**Usage:**
```bash
npm run rollback:production
# or
bash scripts/rollback-production.sh "Reason for rollback"
```

**What it does:**
- Stops production monitoring
- Reverts to previous deployment
- Creates rollback report
- Verifies rollback success
- Provides next steps

### Staging Deployment Scripts

#### 5. deploy-staging.sh

Deploys the optimized build to Vercel staging environment.

**Usage:**
```bash
npm run deploy:staging
```

**What it does:**
- Runs pre-deployment checks
- Builds the project locally
- Analyzes bundle size
- Deploys to Vercel staging
- Saves staging URL to `.staging-url.txt`

**Requirements:** Vercel CLI installed and authenticated

### 2. validate-staging.sh

Runs Lighthouse tests on all key pages of the staging deployment.

**Usage:**
```bash
npm run validate:staging
```

**What it does:**
- Checks deployment accessibility
- Runs Lighthouse tests on 7+ pages
- Generates HTML and JSON reports
- Compares results against targets
- Saves reports to `./lighthouse-reports/`

**Requirements:** Staging URL in `.staging-url.txt` or `STAGING_URL` env var

### 3. monitor-staging.js

Monitors the staging deployment for 24 hours, tracking uptime and response times.

**Usage:**
```bash
npm run monitor:staging
```

**What it does:**
- Checks deployment health every 5 minutes
- Tracks HTTP status codes
- Measures response times (TTFB proxy)
- Displays real-time dashboard
- Saves metrics to `staging-metrics.json`

**Features:**
- Real-time monitoring dashboard
- Uptime percentage calculation
- Response time statistics (min, max, avg)
- Graceful shutdown (Ctrl+C)
- Resume from previous session

### 4. generate-performance-report.js

Generates a comprehensive performance comparison report.

**Usage:**
```bash
npm run report:performance
```

**What it does:**
- Loads Lighthouse reports
- Loads monitoring metrics
- Calculates improvements vs baseline
- Displays formatted comparison table
- Shows per-page results
- Provides recommendations

**Output:**
- Core Web Vitals comparison
- TTFB analysis
- Per-page performance breakdown
- Validation checklist
- Recommendations

## Workflow

### Production Deployment Workflow

```bash
# 1. Ensure staging validation is complete
npm run validate:staging
npm run report:performance

# 2. Deploy to production
npm run deploy:production

# 3. Monitor production (runs automatically, or manually)
npm run monitor:production

# 4. Verify performance targets
npm run verify:performance

# 5. If issues detected, rollback
npm run rollback:production
```

### Complete Staging Validation Workflow

```bash
# 1. Deploy to staging
npm run deploy:staging

# 2. Run Lighthouse tests
npm run validate:staging

# 3. Start 24-hour monitoring (in background)
npm run monitor:staging &

# 4. Run E2E tests
npm run test:e2e:staging

# 5. Generate performance report
npm run report:performance
```

### Quick Validation (No Monitoring)

```bash
# Deploy and validate immediately
npm run deploy:staging && npm run validate:staging

# Generate report
npm run report:performance
```

## Environment Variables

### Required

- `VERCEL_TOKEN` - Vercel authentication token (for automated deployment)

### Optional

- `STAGING_URL` - Override staging URL (otherwise read from `.staging-url.txt`)
- `PRODUCTION_URL` - Override production URL (otherwise read from `.production-deployment.json`)

## Files Generated

### Production Files

#### .production-deployment.json

Contains production deployment information. Created by `deploy-production.sh`.

**Structure:**
```json
{
  "url": "https://ste-scpb.com",
  "timestamp": "2024-02-14T10:30:00Z",
  "version": "abc123",
  "status": "deployed"
}
```

#### production-metrics.json

Contains continuous production monitoring data. Created by `monitor-production.js`.

**Structure:**
```json
{
  "startTime": 1707908400000,
  "productionUrl": "https://...",
  "checks": [...],
  "alerts": [...],
  "summary": {
    "totalChecks": 1440,
    "successfulChecks": 1438,
    "failedChecks": 2,
    "errorCount": 2,
    "averageResponseTime": 245,
    "minResponseTime": 180,
    "maxResponseTime": 890
  },
  "performance": {
    "realExperienceScore": 92,
    "fcp": 2100,
    "lcp": 2300,
    "ttfb": 650,
    "inp": 120,
    "cls": 0.02
  }
}
```

#### .rollback-report.json

Contains rollback information. Created by `rollback-production.sh`.

**Structure:**
```json
{
  "timestamp": "2024-02-14T12:00:00Z",
  "reason": "High error rate detected",
  "previousDeployment": {...},
  "metrics": {...}
}
```

### Staging Files

#### .staging-url.txt

Contains the staging deployment URL. Created by `deploy-staging.sh`.

**Example:**
```
https://ste-scpb-website-abc123.vercel.app
```

### staging-metrics.json

Contains 24-hour monitoring data. Created by `monitor-staging.js`.

**Structure:**
```json
{
  "startTime": 1707955200000,
  "stagingUrl": "https://...",
  "checks": [...],
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

### lighthouse-reports/

Directory containing Lighthouse test results.

**Files:**
- `staging-home.report.html` - HTML report for homepage
- `staging-home.report.json` - JSON data for homepage
- `staging-fr.report.html` - HTML report for French homepage
- etc.

## Troubleshooting

### Production Issues

#### High error rate in production

**Solution:**
1. Check production-metrics.json for error details
2. Review Vercel logs: `vercel logs`
3. Check Sentry for error reports (if configured)
4. Consider rollback: `npm run rollback:production`

#### Performance targets not met in production

**Solution:**
1. Run verification: `npm run verify:performance`
2. Check Vercel Analytics for real user data
3. Run Lighthouse tests on production URLs
4. Review bundle size: `npm run analyze`
5. Check CDN cache hit rate

#### Monitoring stopped unexpectedly

**Solution:**
1. Check logs: `cat production-monitor.log`
2. Restart monitoring: `npm run monitor:production`
3. Run in background: `nohup npm run monitor:production > production-monitor.log 2>&1 &`

### Staging Issues

#### "No staging URL found"

**Solution:** Run `deploy-staging.sh` first or set `STAGING_URL` environment variable:
```bash
export STAGING_URL=https://your-staging-url.vercel.app
npm run validate:staging
```

### "Vercel CLI not found"

**Solution:** Install Vercel CLI globally:
```bash
npm install -g vercel
```

### "Permission denied" on shell scripts

**Solution:** Make scripts executable:
```bash
chmod +x scripts/*.sh
```

### Monitoring script stops unexpectedly

**Solution:** Run in background with nohup:
```bash
nohup npm run monitor:staging > monitoring.log 2>&1 &
```

### Lighthouse tests timeout

**Solution:** Increase timeout in `lighthouserc.staging.js`:
```javascript
settings: {
  maxWaitForLoad: 60000, // 60 seconds
}
```

## Performance Targets

From Requirements 11.4:

| Metric | Target |
|--------|--------|
| Real Experience Score | >90 |
| First Contentful Paint | <2.5s |
| Largest Contentful Paint | <2.5s |
| Time to First Byte | <0.8s |
| Cumulative Layout Shift | ≤0.1 |
| Initial Bundle Size | <200KB gzipped |

## Related Documentation

- [Deployment Guide](../DEPLOYMENT.md) - Complete production deployment guide
- [Staging Deployment Guide](../docs/STAGING-DEPLOYMENT.md)
- [Performance Optimization Tasks](../.kiro/specs/performance-optimization/tasks.md)
- [Performance Requirements](../.kiro/specs/performance-optimization/requirements.md)
- [Performance Design](../.kiro/specs/performance-optimization/design.md)

## Support

For issues or questions:

1. Check script output for error messages
2. Review related documentation
3. Check Vercel deployment logs
4. Contact the development team
