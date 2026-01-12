# LCP Baseline Measurement - STE-SCPB

## Measurement Date

**Date**: January 12, 2026

## How to Measure

### Manual Method (Recommended)

1. Visit https://pagespeed.web.dev
2. Enter URL: `https://www.ste-scpb.com`
3. Click "Analyze"
4. Record Mobile and Desktop LCP values

### Automated Method

```bash
cd ste-scpb-website
npx ts-node scripts/measure-lcp.ts
```

## Target Values (Core Web Vitals)

| Metric | Good    | Needs Improvement | Poor    |
| ------ | ------- | ----------------- | ------- |
| LCP    | < 2.5s  | 2.5s - 4.0s       | > 4.0s  |
| INP    | < 200ms | 200ms - 500ms     | > 500ms |
| CLS    | < 0.1   | 0.1 - 0.25        | > 0.25  |

## Baseline Measurements

> **Note**: Fill in these values after running PageSpeed Insights on the live site.

### Homepage (https://www.ste-scpb.com/)

| Device  | LCP             | FCP | CLS | TBT | Performance Score |
| ------- | --------------- | --- | --- | --- | ----------------- |
| Mobile  | ~4s (estimated) | -   | -   | -   | -                 |
| Desktop | -               | -   | -   | -   | -                 |

### Products Page (/fr/produits)

| Device  | LCP | FCP | CLS | TBT | Performance Score |
| ------- | --- | --- | --- | --- | ----------------- |
| Mobile  | -   | -   | -   | -   | -                 |
| Desktop | -   | -   | -   | -   | -                 |

### About Page (/fr/a-propos)

| Device  | LCP | FCP | CLS | TBT | Performance Score |
| ------- | --- | --- | --- | --- | ----------------- |
| Mobile  | -   | -   | -   | -   | -                 |
| Desktop | -   | -   | -   | -   | -                 |

## Current Status

Based on the task file baseline estimate:

- **Current LCP**: ~4s (estimated)
- **Target J14**: < 3s
- **Target J30**: < 2.5s

## Optimization Opportunities

### Already Implemented

- ✅ 3D scene lazy loaded (ssr: false)
- ✅ next/image for optimized images
- ✅ Static fallback for mobile 3D

### To Verify/Implement

- [ ] Preload critical fonts (Montserrat)
- [ ] Verify priority on above-fold images
- [ ] Check WebP format usage
- [ ] Verify lazy loading on below-fold images
- [ ] Check CLS (no layout shifts)

## Measurement History

| Date       | Page     | Mobile LCP | Desktop LCP | Notes            |
| ---------- | -------- | ---------- | ----------- | ---------------- |
| 2026-01-12 | Homepage | TBD        | TBD         | Initial baseline |

## Next Steps

1. Run PageSpeed Insights on live site
2. Record actual values in this document
3. Identify largest contentful element (usually hero image or 3D scene)
4. Implement optimizations based on findings
5. Re-measure after optimizations

## Resources

- [PageSpeed Insights](https://pagespeed.web.dev)
- [Web Vitals Documentation](https://web.dev/vitals/)
- [Optimize LCP](https://web.dev/optimize-lcp/)
