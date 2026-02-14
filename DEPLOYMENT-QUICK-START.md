# Staging Deployment Quick Start

Quick reference for deploying and validating the performance-optimized build.

## Prerequisites

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login
```

## 1. Deploy to Staging (5 minutes)

```bash
cd ste-scpb-website
npm run deploy:staging
```

**Output:** Staging URL saved to `.staging-url.txt`

## 2. Run Lighthouse Tests (10 minutes)

```bash
npm run validate:staging
```

**Output:** Reports in `./lighthouse-reports/`

## 3. Start Monitoring (24 hours)

```bash
# Run in background
npm run monitor:staging &

# Or with nohup
nohup npm run monitor:staging > monitoring.log 2>&1 &
```

**Output:** Real-time dashboard + `staging-metrics.json`

## 4. Run E2E Tests (15 minutes)

```bash
npm run test:e2e:staging
```

**Output:** Report in `./playwright-report-staging/`

## 5. Generate Report

```bash
npm run report:performance
```

**Output:** Console report with comparison tables

## Performance Targets

| Metric | Target | Baseline |
|--------|--------|----------|
| Real Experience Score | >90 | 85 |
| FCP | <2.5s | 3.16s |
| LCP | <2.5s | 3.16s |
| TTFB | <0.8s | 1.24s |

## Validation Checklist

- [ ] Deployed to staging
- [ ] Lighthouse tests pass (score ≥90%)
- [ ] 24-hour monitoring complete
- [ ] E2E tests pass
- [ ] Performance report generated
- [ ] Real Experience Score >90 in Vercel Analytics

## Promote to Production

```bash
vercel --prod
```

## Troubleshooting

**No staging URL found:**
```bash
export STAGING_URL=https://your-url.vercel.app
```

**Permission denied:**
```bash
chmod +x scripts/*.sh
```

**Vercel CLI not found:**
```bash
npm install -g vercel
```

## Resources

- Full Guide: [docs/STAGING-DEPLOYMENT.md](docs/STAGING-DEPLOYMENT.md)
- Scripts: [scripts/README.md](scripts/README.md)
- Tasks: [.kiro/specs/performance-optimization/tasks.md](.kiro/specs/performance-optimization/tasks.md)
