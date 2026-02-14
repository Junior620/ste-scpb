# Production Deployment Guide

This guide covers the production deployment process for the STE-SCPB website after performance optimizations.

**Requirements:** 11.1, 11.2, 11.3  
**Task:** 23. Production deployment and monitoring

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Deployment Process](#deployment-process)
3. [Monitoring](#monitoring)
4. [Performance Targets](#performance-targets)
5. [Alerts and Notifications](#alerts-and-notifications)
6. [Rollback Procedure](#rollback-procedure)
7. [Troubleshooting](#troubleshooting)

## Pre-Deployment Checklist

Before deploying to production, ensure all of the following are complete:

### Staging Validation

- [ ] Staging deployment successful
- [ ] Lighthouse CI tests passing on staging
- [ ] 24-hour monitoring completed on staging
- [ ] Real Experience Score >90 on staging
- [ ] All E2E tests passing on staging
- [ ] No functionality regressions detected

### Code Quality

- [ ] All unit tests passing (`npm run test`)
- [ ] All E2E tests passing (`npm run test:e2e`)
- [ ] Type checking passing (`npm run typecheck`)
- [ ] Linting passing (`npm run lint`)
- [ ] Code reviewed and approved

### Performance Validation

- [ ] FCP <2.5s
- [ ] LCP <2.5s
- [ ] TTFB <0.8s
- [ ] Initial bundle <200KB gzipped
- [ ] All Lighthouse CI checks passing

### Documentation

- [ ] CHANGELOG updated
- [ ] Performance improvements documented
- [ ] Breaking changes documented (if any)
- [ ] Deployment notes prepared

## Deployment Process

### Step 1: Deploy to Production

Run the production deployment script:

```bash
npm run deploy:production
```

Or manually:

```bash
bash scripts/deploy-production.sh
```

This script will:
1. Run pre-deployment validation
2. Build the production bundle
3. Run final checks (tests, linting, type checking)
4. Deploy to Vercel production
5. Perform initial health check
6. Start monitoring

### Step 2: Gradual Rollout

The deployment follows a gradual rollout strategy:

- **Initial:** 10% traffic to new version
- **After 1 hour:** 50% traffic (if no issues detected)
- **After 2 hours:** 100% traffic (if no issues detected)

Monitor the deployment closely during this period.

### Step 3: Verify Deployment

After deployment, verify:

```bash
# Check deployment is accessible
curl -I https://your-production-url.com

# Verify performance targets
npm run verify:performance

# Check monitoring status
tail -f production-monitor.log
```

## Monitoring

### Continuous Monitoring

Production monitoring runs automatically after deployment and tracks:

- **Health Checks:** Every 5 minutes
- **Response Time:** TTFB for each request
- **Error Rate:** Failed requests and component errors
- **Uptime:** Availability percentage

### Monitoring Dashboard

View real-time monitoring:

```bash
# View monitoring logs
tail -f production-monitor.log

# View metrics file
cat production-metrics.json | jq
```

### Vercel Analytics

Access detailed analytics:

- **Analytics Dashboard:** https://vercel.com/analytics
- **Speed Insights:** https://vercel.com/speed-insights

Monitor:
- Real Experience Score
- Core Web Vitals (FCP, LCP, TTFB, INP, CLS)
- Geographic distribution
- Device types
- Browser types

### Stop Monitoring

To stop monitoring:

```bash
# Find monitoring process
ps aux | grep monitor-production

# Stop monitoring (Ctrl+C or kill PID)
kill <PID>
```

## Performance Targets

All deployments must meet these targets:

| Metric | Target | Baseline | Improvement |
|--------|--------|----------|-------------|
| Real Experience Score | >90 | 85 | +5 points |
| First Contentful Paint (FCP) | <2.5s | 3.16s | -0.66s |
| Largest Contentful Paint (LCP) | <2.5s | 3.16s | -0.66s |
| Time to First Byte (TTFB) | <0.8s | 1.24s | -0.44s |
| Interaction to Next Paint (INP) | <200ms | 144ms | Maintain |
| Cumulative Layout Shift (CLS) | ≤0.1 | 0 | Maintain |
| Initial Bundle Size | <200KB | N/A | New target |

### Verify Targets

Run the verification script:

```bash
npm run verify:performance
```

This will check all metrics and report which targets are met.

## Alerts and Notifications

### Alert Thresholds

Alerts are triggered when:

- Real Experience Score drops below 85
- FCP exceeds 3s
- LCP exceeds 3s
- TTFB exceeds 1s
- Error rate exceeds 1%
- Uptime drops below 99.5%
- Lazy-loaded component errors detected

### Alert Configuration

Configure alerts in Vercel Dashboard:

1. Go to: https://vercel.com/[your-team]/[your-project]/settings/alerts
2. Set up alerts for:
   - Performance degradation
   - Error rate spikes
   - Deployment failures
   - Build failures

### Alert Channels

Configure notification channels:
- Email
- Slack
- Discord
- Webhook

## Rollback Procedure

If issues are detected, rollback immediately:

### Automatic Rollback

If monitoring detects critical issues:

```bash
npm run rollback:production
```

Or manually:

```bash
bash scripts/rollback-production.sh
```

### Manual Rollback via Vercel

```bash
# List recent deployments
vercel ls

# Rollback to previous deployment
vercel rollback
```

### Post-Rollback

After rollback:

1. **Investigate:** Review logs and metrics to identify the issue
2. **Fix:** Address the problem in the codebase
3. **Test:** Thoroughly test in staging
4. **Document:** Update rollback report with findings
5. **Re-deploy:** When ready, follow deployment process again

### Rollback Report

A rollback report is automatically created at `.rollback-report.json` containing:
- Timestamp
- Reason for rollback
- Previous deployment info
- Metrics at time of rollback

## Troubleshooting

### Deployment Fails

**Issue:** Deployment fails during build

**Solution:**
1. Check build logs: `vercel logs`
2. Verify all dependencies are installed
3. Run local build: `npm run build`
4. Fix any build errors
5. Re-deploy

### Performance Targets Not Met

**Issue:** Performance targets not met after deployment

**Solution:**
1. Run Lighthouse tests: `npm run lighthouse:ci`
2. Check bundle size: `npm run analyze`
3. Review lazy loading implementation
4. Check cache headers
5. Verify CDN configuration

### High Error Rate

**Issue:** Error rate exceeds threshold

**Solution:**
1. Check error logs in Vercel Dashboard
2. Review Sentry error reports (if configured)
3. Check for lazy-loaded component errors
4. Verify API endpoints are accessible
5. Check third-party service status

### Monitoring Not Working

**Issue:** Monitoring script not running

**Solution:**
1. Check if process is running: `ps aux | grep monitor-production`
2. Check logs: `cat production-monitor.log`
3. Verify production URL is accessible
4. Restart monitoring: `node scripts/monitor-production.js`

### TTFB Too High

**Issue:** TTFB exceeds target

**Solution:**
1. Check server response time in Vercel Analytics
2. Verify ISR configuration
3. Check CMS response time
4. Review cache headers
5. Check CDN cache hit rate

### Lazy-Loaded Components Failing

**Issue:** Lazy-loaded components not loading

**Solution:**
1. Check browser console for chunk load errors
2. Verify chunk files are deployed
3. Check CDN cache
4. Review dynamic import configuration
5. Test with different browsers/devices

## Scripts Reference

### Deployment Scripts

```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production

# Rollback production
npm run rollback:production
```

### Validation Scripts

```bash
# Validate staging
npm run validate:staging

# Verify performance targets
npm run verify:performance

# Generate performance report
npm run report:performance
```

### Monitoring Scripts

```bash
# Monitor staging (24 hours)
npm run monitor:staging

# Monitor production (continuous)
node scripts/monitor-production.js

# Stop monitoring
# Press Ctrl+C or kill process
```

### Testing Scripts

```bash
# Run Lighthouse CI
npm run lighthouse:ci

# Run Lighthouse on staging
npm run lighthouse:staging

# Run E2E tests on staging
npm run test:e2e:staging
```

## Best Practices

### Before Deployment

1. Always deploy to staging first
2. Run full test suite
3. Monitor staging for at least 24 hours
4. Verify all performance targets are met
5. Get stakeholder approval

### During Deployment

1. Deploy during low-traffic hours
2. Monitor closely for first 2 hours
3. Watch for error spikes
4. Check performance metrics
5. Be ready to rollback if needed

### After Deployment

1. Monitor for 24 hours
2. Review Real Experience Score daily
3. Check error rates
4. Verify lazy-loaded components work
5. Collect user feedback

### Continuous Monitoring

1. Set up alerts for performance degradation
2. Review analytics weekly
3. Track performance trends
4. Monitor bundle size changes
5. Keep performance budgets updated

## Support

For issues or questions:

- **Documentation:** See README.md and other docs in `/docs`
- **Performance Issues:** Review Lighthouse reports and Vercel Analytics
- **Deployment Issues:** Check Vercel Dashboard and logs
- **Code Issues:** Review GitHub issues and pull requests

## Related Documentation

- [Performance Optimization Requirements](../.kiro/specs/performance-optimization/requirements.md)
- [Performance Optimization Design](../.kiro/specs/performance-optimization/design.md)
- [Performance Optimization Tasks](../.kiro/specs/performance-optimization/tasks.md)
- [Lighthouse CI Configuration](./lighthouserc.js)
- [Vercel Configuration](./vercel.json)
