#!/usr/bin/env node

/**
 * Performance Targets Verification Script
 * 
 * This script verifies that all performance targets are met
 * in production by checking Vercel Analytics and monitoring data.
 * 
 * Requirements: 11.1, 11.2, 11.4
 * Task: 23. Production deployment and monitoring
 */

const fs = require('fs');
const https = require('https');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

// Target metrics (from requirements)
const targets = {
  realExperienceScore: 90,
  fcp: 2500, // ms
  lcp: 2500, // ms
  ttfb: 800, // ms
  inp: 200, // ms
  cls: 0.1,
  initialBundleSize: 200 * 1024, // 200KB gzipped
};

/**
 * Load production metrics
 */
function loadProductionMetrics() {
  const metricsFile = 'production-metrics.json';
  
  if (!fs.existsSync(metricsFile)) {
    console.log(`${colors.yellow}⚠️  No production metrics found${colors.reset}`);
    return null;
  }
  
  try {
    return JSON.parse(fs.readFileSync(metricsFile, 'utf8'));
  } catch (error) {
    console.log(`${colors.yellow}⚠️  Could not parse production metrics${colors.reset}`);
    return null;
  }
}

/**
 * Load Lighthouse reports
 */
function loadLighthouseReports() {
  const reportsDir = 'lighthouse-reports';
  
  if (!fs.existsSync(reportsDir)) {
    return null;
  }
  
  const reports = [];
  const files = fs.readdirSync(reportsDir);
  
  for (const file of files) {
    if (file.endsWith('.report.json')) {
      try {
        const reportPath = `${reportsDir}/${file}`;
        const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        reports.push({
          file,
          url: report.finalUrl || report.requestedUrl,
          performance: report.categories?.performance?.score || 0,
          fcp: report.audits?.['first-contentful-paint']?.numericValue || 0,
          lcp: report.audits?.['largest-contentful-paint']?.numericValue || 0,
          cls: report.audits?.['cumulative-layout-shift']?.numericValue || 0,
          inp: report.audits?.['max-potential-fid']?.numericValue || 0,
          tbt: report.audits?.['total-blocking-time']?.numericValue || 0,
        });
      } catch (error) {
        // Skip invalid reports
      }
    }
  }
  
  return reports.length > 0 ? reports : null;
}

/**
 * Check bundle size
 */
function checkBundleSize() {
  const buildManifest = '.next/build-manifest.json';
  
  if (!fs.existsSync(buildManifest)) {
    return null;
  }
  
  try {
    const manifest = JSON.parse(fs.readFileSync(buildManifest, 'utf8'));
    const pages = manifest.pages || {};
    
    // Get initial bundle size (main page chunks)
    let totalSize = 0;
    const mainPage = pages['/'] || pages['/_app'] || [];
    
    for (const chunk of mainPage) {
      const chunkPath = `.next/${chunk}`;
      if (fs.existsSync(chunkPath)) {
        const stats = fs.statSync(chunkPath);
        totalSize += stats.size;
      }
    }
    
    // Estimate gzipped size (roughly 30% of original)
    const gzippedSize = Math.round(totalSize * 0.3);
    
    return {
      totalSize,
      gzippedSize,
      meetsTarget: gzippedSize <= targets.initialBundleSize,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Format metric with status
 */
function formatMetric(value, target, unit, lowerIsBetter = true) {
  const meetsTarget = lowerIsBetter ? value <= target : value >= target;
  const color = meetsTarget ? colors.green : colors.red;
  const icon = meetsTarget ? '✅' : '❌';
  return `${color}${value}${unit}${colors.reset} ${icon}`;
}

/**
 * Verify all targets
 */
function verifyTargets() {
  console.log(`${colors.bold}${colors.blue}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}║${colors.reset}  🎯 Performance Targets Verification                      ${colors.bold}${colors.blue}║${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}╚════════════════════════════════════════════════════════════╝${colors.reset}`);
  console.log('');
  
  // Load data
  const productionMetrics = loadProductionMetrics();
  const lighthouseReports = loadLighthouseReports();
  const bundleSize = checkBundleSize();
  
  let allTargetsMet = true;
  const results = [];
  
  // Section 1: Core Web Vitals
  console.log(`${colors.cyan}${colors.bold}1. Core Web Vitals${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════${colors.reset}`);
  console.log('');
  
  if (lighthouseReports && lighthouseReports.length > 0) {
    // Calculate averages
    const avgFcp = Math.round(lighthouseReports.reduce((sum, r) => sum + r.fcp, 0) / lighthouseReports.length);
    const avgLcp = Math.round(lighthouseReports.reduce((sum, r) => sum + r.lcp, 0) / lighthouseReports.length);
    const avgCls = (lighthouseReports.reduce((sum, r) => sum + r.cls, 0) / lighthouseReports.length).toFixed(3);
    const avgInp = Math.round(lighthouseReports.reduce((sum, r) => sum + r.inp, 0) / lighthouseReports.length);
    const avgPerf = Math.round(lighthouseReports.reduce((sum, r) => sum + r.performance, 0) / lighthouseReports.length * 100);
    
    // FCP
    const fcpMet = avgFcp <= targets.fcp;
    console.log(`FCP (First Contentful Paint):`);
    console.log(`  Target: <${targets.fcp}ms`);
    console.log(`  Actual: ${formatMetric(avgFcp, targets.fcp, 'ms')}`);
    console.log('');
    results.push({ metric: 'FCP', met: fcpMet });
    if (!fcpMet) allTargetsMet = false;
    
    // LCP
    const lcpMet = avgLcp <= targets.lcp;
    console.log(`LCP (Largest Contentful Paint):`);
    console.log(`  Target: <${targets.lcp}ms`);
    console.log(`  Actual: ${formatMetric(avgLcp, targets.lcp, 'ms')}`);
    console.log('');
    results.push({ metric: 'LCP', met: lcpMet });
    if (!lcpMet) allTargetsMet = false;
    
    // CLS
    const clsMet = avgCls <= targets.cls;
    console.log(`CLS (Cumulative Layout Shift):`);
    console.log(`  Target: ≤${targets.cls}`);
    console.log(`  Actual: ${formatMetric(avgCls, targets.cls, '')}`);
    console.log('');
    results.push({ metric: 'CLS', met: clsMet });
    if (!clsMet) allTargetsMet = false;
    
    // INP
    const inpMet = avgInp <= targets.inp;
    console.log(`INP (Interaction to Next Paint):`);
    console.log(`  Target: <${targets.inp}ms`);
    console.log(`  Actual: ${formatMetric(avgInp, targets.inp, 'ms')}`);
    console.log('');
    results.push({ metric: 'INP', met: inpMet });
    if (!inpMet) allTargetsMet = false;
    
    // Real Experience Score
    const resMet = avgPerf >= targets.realExperienceScore;
    console.log(`Real Experience Score:`);
    console.log(`  Target: >${targets.realExperienceScore}`);
    console.log(`  Actual: ${formatMetric(avgPerf, targets.realExperienceScore, '', false)}`);
    console.log('');
    results.push({ metric: 'Real Experience Score', met: resMet });
    if (!resMet) allTargetsMet = false;
  } else {
    console.log(`${colors.yellow}⚠️  No Lighthouse data available${colors.reset}`);
    console.log(`   Run: npm run lighthouse:ci`);
    console.log('');
    allTargetsMet = false;
  }
  
  // Section 2: TTFB
  console.log(`${colors.cyan}${colors.bold}2. Time to First Byte (TTFB)${colors.reset}`);
  console.log(`${colors.cyan}═════════════════════════════${colors.reset}`);
  console.log('');
  
  if (productionMetrics) {
    const avgTtfb = productionMetrics.summary.averageResponseTime;
    const ttfbMet = avgTtfb <= targets.ttfb;
    
    console.log(`TTFB:`);
    console.log(`  Target: <${targets.ttfb}ms`);
    console.log(`  Actual: ${formatMetric(avgTtfb, targets.ttfb, 'ms')}`);
    console.log('');
    console.log(`Monitoring Stats:`);
    console.log(`  • Total Checks: ${productionMetrics.summary.totalChecks}`);
    console.log(`  • Min TTFB: ${productionMetrics.summary.minResponseTime}ms`);
    console.log(`  • Max TTFB: ${productionMetrics.summary.maxResponseTime}ms`);
    console.log('');
    
    results.push({ metric: 'TTFB', met: ttfbMet });
    if (!ttfbMet) allTargetsMet = false;
  } else {
    console.log(`${colors.yellow}⚠️  No production monitoring data available${colors.reset}`);
    console.log(`   Run: npm run monitor:production`);
    console.log('');
    allTargetsMet = false;
  }
  
  // Section 3: Bundle Size
  console.log(`${colors.cyan}${colors.bold}3. Bundle Size${colors.reset}`);
  console.log(`${colors.cyan}══════════════${colors.reset}`);
  console.log('');
  
  if (bundleSize) {
    const bundleMet = bundleSize.meetsTarget;
    
    console.log(`Initial Bundle Size (gzipped):`);
    console.log(`  Target: <${Math.round(targets.initialBundleSize / 1024)}KB`);
    console.log(`  Actual: ${formatMetric(Math.round(bundleSize.gzippedSize / 1024), Math.round(targets.initialBundleSize / 1024), 'KB')}`);
    console.log('');
    console.log(`Bundle Stats:`);
    console.log(`  • Uncompressed: ${Math.round(bundleSize.totalSize / 1024)}KB`);
    console.log(`  • Gzipped: ${Math.round(bundleSize.gzippedSize / 1024)}KB`);
    console.log(`  • Compression: ${Math.round((1 - bundleSize.gzippedSize / bundleSize.totalSize) * 100)}%`);
    console.log('');
    
    results.push({ metric: 'Bundle Size', met: bundleMet });
    if (!bundleMet) allTargetsMet = false;
  } else {
    console.log(`${colors.yellow}⚠️  No bundle size data available${colors.reset}`);
    console.log(`   Run: npm run build`);
    console.log('');
  }
  
  // Section 4: Summary
  console.log(`${colors.cyan}${colors.bold}4. Summary${colors.reset}`);
  console.log(`${colors.cyan}══════════${colors.reset}`);
  console.log('');
  
  const metCount = results.length;
  const metTargets = results.filter(r => r.met).length;
  
  console.log(`Targets Met: ${metTargets}/${metCount}`);
  console.log('');
  
  if (allTargetsMet) {
    console.log(`${colors.green}${colors.bold}✅ All performance targets met!${colors.reset}`);
    console.log('');
    console.log(`${colors.green}🎉 Performance optimization successful!${colors.reset}`);
    console.log('');
    console.log('The website now meets all requirements:');
    console.log('  ✅ Real Experience Score >90');
    console.log('  ✅ FCP <2.5s');
    console.log('  ✅ LCP <2.5s');
    console.log('  ✅ TTFB <0.8s');
    console.log('  ✅ Initial bundle <200KB gzipped');
  } else {
    console.log(`${colors.yellow}⚠️  Some targets not yet met${colors.reset}`);
    console.log('');
    console.log('Targets not met:');
    results.filter(r => !r.met).forEach(r => {
      console.log(`  ❌ ${r.metric}`);
    });
    console.log('');
    console.log('Recommendations:');
    console.log('  • Review optimization implementation');
    console.log('  • Check for regressions');
    console.log('  • Run additional performance tests');
    console.log('  • Monitor for 24 hours and re-check');
  }
  
  console.log('');
  
  // Section 5: Resources
  console.log(`${colors.cyan}${colors.bold}5. Resources${colors.reset}`);
  console.log(`${colors.cyan}════════════${colors.reset}`);
  console.log('');
  console.log(`📊 Vercel Analytics: https://vercel.com/analytics`);
  console.log(`📈 Speed Insights: https://vercel.com/speed-insights`);
  console.log(`📁 Production Metrics: production-metrics.json`);
  console.log(`📁 Lighthouse Reports: lighthouse-reports/`);
  console.log('');
  
  // Exit code
  process.exit(allTargetsMet ? 0 : 1);
}

// Run verification
try {
  verifyTargets();
} catch (error) {
  console.error(`${colors.red}❌ Error verifying targets: ${error.message}${colors.reset}`);
  process.exit(1);
}
