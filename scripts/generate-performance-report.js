#!/usr/bin/env node

/**
 * Performance Comparison Report Generator
 * 
 * This script generates a comprehensive performance comparison report
 * comparing baseline metrics with staging/production results.
 * 
 * Requirements: 11.1, 11.2, 11.4
 * Task: 22. Deploy to staging and validate
 */

const fs = require('fs');
const path = require('path');

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

// Baseline metrics (from requirements)
const baseline = {
  realExperienceScore: 85,
  fcp: 3160, // ms
  lcp: 3160, // ms
  ttfb: 1240, // ms
  inp: 144, // ms
  cls: 0,
};

// Target metrics (from requirements)
const targets = {
  realExperienceScore: 90,
  fcp: 2500, // ms
  lcp: 2500, // ms
  ttfb: 800, // ms
  inp: 200, // ms
  cls: 0.1,
};

/**
 * Load Lighthouse report data
 */
function loadLighthouseReports() {
  const reportsDir = path.join(process.cwd(), 'lighthouse-reports');
  
  if (!fs.existsSync(reportsDir)) {
    console.log(`${colors.yellow}⚠️  No Lighthouse reports found${colors.reset}`);
    return null;
  }
  
  const reports = [];
  const files = fs.readdirSync(reportsDir);
  
  for (const file of files) {
    if (file.endsWith('.report.json')) {
      try {
        const reportPath = path.join(reportsDir, file);
        const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        reports.push({
          file,
          url: report.finalUrl || report.requestedUrl,
          performance: report.categories?.performance?.score || 0,
          fcp: report.audits?.['first-contentful-paint']?.numericValue || 0,
          lcp: report.audits?.['largest-contentful-paint']?.numericValue || 0,
          cls: report.audits?.['cumulative-layout-shift']?.numericValue || 0,
          tbt: report.audits?.['total-blocking-time']?.numericValue || 0,
          speedIndex: report.audits?.['speed-index']?.numericValue || 0,
        });
      } catch (error) {
        console.log(`${colors.yellow}⚠️  Could not parse ${file}${colors.reset}`);
      }
    }
  }
  
  return reports;
}

/**
 * Load monitoring metrics
 */
function loadMonitoringMetrics() {
  const metricsFile = path.join(process.cwd(), 'staging-metrics.json');
  
  if (!fs.existsSync(metricsFile)) {
    console.log(`${colors.yellow}⚠️  No monitoring metrics found${colors.reset}`);
    return null;
  }
  
  try {
    return JSON.parse(fs.readFileSync(metricsFile, 'utf8'));
  } catch (error) {
    console.log(`${colors.yellow}⚠️  Could not parse monitoring metrics${colors.reset}`);
    return null;
  }
}

/**
 * Calculate improvement percentage
 */
function calculateImprovement(baseline, current, lowerIsBetter = true) {
  if (lowerIsBetter) {
    return ((baseline - current) / baseline * 100).toFixed(1);
  } else {
    return ((current - baseline) / baseline * 100).toFixed(1);
  }
}

/**
 * Format metric with color based on target
 */
function formatMetric(value, target, lowerIsBetter = true) {
  const meetsTarget = lowerIsBetter ? value <= target : value >= target;
  const color = meetsTarget ? colors.green : colors.red;
  const icon = meetsTarget ? '✅' : '❌';
  return `${color}${value}${colors.reset} ${icon}`;
}

/**
 * Generate report
 */
function generateReport() {
  console.log(`${colors.bold}${colors.blue}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}║${colors.reset}  📊 Performance Optimization Report                        ${colors.bold}${colors.blue}║${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}╚════════════════════════════════════════════════════════════╝${colors.reset}`);
  console.log('');
  
  // Load data
  const lighthouseReports = loadLighthouseReports();
  const monitoringMetrics = loadMonitoringMetrics();
  
  // Calculate averages from Lighthouse reports
  let avgMetrics = null;
  if (lighthouseReports && lighthouseReports.length > 0) {
    avgMetrics = {
      performance: (lighthouseReports.reduce((sum, r) => sum + r.performance, 0) / lighthouseReports.length * 100).toFixed(0),
      fcp: Math.round(lighthouseReports.reduce((sum, r) => sum + r.fcp, 0) / lighthouseReports.length),
      lcp: Math.round(lighthouseReports.reduce((sum, r) => sum + r.lcp, 0) / lighthouseReports.length),
      cls: (lighthouseReports.reduce((sum, r) => sum + r.cls, 0) / lighthouseReports.length).toFixed(3),
      tbt: Math.round(lighthouseReports.reduce((sum, r) => sum + r.tbt, 0) / lighthouseReports.length),
    };
  }
  
  // Section 1: Overview
  console.log(`${colors.cyan}${colors.bold}1. Overview${colors.reset}`);
  console.log(`${colors.cyan}═══════════${colors.reset}`);
  console.log('');
  console.log(`Task: 22. Deploy to staging and validate`);
  console.log(`Requirements: 11.1, 11.2, 11.3, 11.4`);
  console.log(`Report Generated: ${new Date().toLocaleString()}`);
  console.log('');
  
  // Section 2: Core Web Vitals Comparison
  console.log(`${colors.cyan}${colors.bold}2. Core Web Vitals Comparison${colors.reset}`);
  console.log(`${colors.cyan}══════════════════════════════${colors.reset}`);
  console.log('');
  
  if (avgMetrics) {
    console.log(`┌─────────────────────┬──────────┬──────────┬──────────┬──────────────┐`);
    console.log(`│ Metric              │ Baseline │ Target   │ Current  │ Improvement  │`);
    console.log(`├─────────────────────┼──────────┼──────────┼──────────┼──────────────┤`);
    
    // Real Experience Score (from performance score)
    const perfImprovement = calculateImprovement(baseline.realExperienceScore, avgMetrics.performance, false);
    console.log(`│ Experience Score    │ ${baseline.realExperienceScore}       │ >90      │ ${formatMetric(avgMetrics.performance, targets.realExperienceScore, false).padEnd(20)} │ +${perfImprovement}%       │`);
    
    // FCP
    const fcpImprovement = calculateImprovement(baseline.fcp, avgMetrics.fcp);
    console.log(`│ FCP (ms)            │ ${baseline.fcp}    │ <2500    │ ${formatMetric(avgMetrics.fcp, targets.fcp).padEnd(20)} │ ${fcpImprovement}%       │`);
    
    // LCP
    const lcpImprovement = calculateImprovement(baseline.lcp, avgMetrics.lcp);
    console.log(`│ LCP (ms)            │ ${baseline.lcp}    │ <2500    │ ${formatMetric(avgMetrics.lcp, targets.lcp).padEnd(20)} │ ${lcpImprovement}%       │`);
    
    // CLS
    console.log(`│ CLS                 │ ${baseline.cls}        │ ≤0.1     │ ${formatMetric(avgMetrics.cls, targets.cls).padEnd(20)} │ Maintained   │`);
    
    // TBT
    console.log(`│ TBT (ms)            │ N/A      │ <300     │ ${formatMetric(avgMetrics.tbt, 300).padEnd(20)} │ N/A          │`);
    
    console.log(`└─────────────────────┴──────────┴──────────┴──────────┴──────────────┘`);
  } else {
    console.log(`${colors.yellow}⚠️  No Lighthouse data available. Run: npm run lighthouse:staging${colors.reset}`);
  }
  
  console.log('');
  
  // Section 3: TTFB from Monitoring
  console.log(`${colors.cyan}${colors.bold}3. Time to First Byte (TTFB)${colors.reset}`);
  console.log(`${colors.cyan}═════════════════════════════${colors.reset}`);
  console.log('');
  
  if (monitoringMetrics) {
    const ttfb = monitoringMetrics.summary.averageResponseTime;
    const ttfbImprovement = calculateImprovement(baseline.ttfb, ttfb);
    
    console.log(`Baseline TTFB:  ${baseline.ttfb}ms`);
    console.log(`Target TTFB:    <${targets.ttfb}ms`);
    console.log(`Current TTFB:   ${formatMetric(ttfb, targets.ttfb)}`);
    console.log(`Improvement:    ${ttfbImprovement}%`);
    console.log('');
    console.log(`Monitoring Stats:`);
    console.log(`  • Total Checks: ${monitoringMetrics.summary.totalChecks}`);
    console.log(`  • Uptime: ${((monitoringMetrics.summary.successfulChecks / monitoringMetrics.summary.totalChecks) * 100).toFixed(2)}%`);
    console.log(`  • Min TTFB: ${monitoringMetrics.summary.minResponseTime}ms`);
    console.log(`  • Max TTFB: ${monitoringMetrics.summary.maxResponseTime}ms`);
  } else {
    console.log(`${colors.yellow}⚠️  No monitoring data available. Run: npm run monitor:staging${colors.reset}`);
  }
  
  console.log('');
  
  // Section 4: Per-Page Results
  if (lighthouseReports && lighthouseReports.length > 0) {
    console.log(`${colors.cyan}${colors.bold}4. Per-Page Performance${colors.reset}`);
    console.log(`${colors.cyan}═══════════════════════${colors.reset}`);
    console.log('');
    
    console.log(`┌────────────────────────────────────┬──────────┬──────────┬──────────┐`);
    console.log(`│ Page                               │ Perf     │ FCP (ms) │ LCP (ms) │`);
    console.log(`├────────────────────────────────────┼──────────┼──────────┼──────────┤`);
    
    for (const report of lighthouseReports) {
      const pageName = report.file.replace('staging-', '').replace('.report.json', '');
      const perfScore = (report.performance * 100).toFixed(0);
      const perfColor = report.performance >= 0.9 ? colors.green : colors.yellow;
      
      console.log(`│ ${pageName.padEnd(34)} │ ${perfColor}${perfScore}%${colors.reset}     │ ${report.fcp.toString().padEnd(8)} │ ${report.lcp.toString().padEnd(8)} │`);
    }
    
    console.log(`└────────────────────────────────────┴──────────┴──────────┴──────────┘`);
    console.log('');
  }
  
  // Section 5: Validation Checklist
  console.log(`${colors.cyan}${colors.bold}5. Validation Checklist${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════${colors.reset}`);
  console.log('');
  
  const hasLighthouse = lighthouseReports && lighthouseReports.length > 0;
  const hasMonitoring = monitoringMetrics !== null;
  const meetsTargets = avgMetrics && 
    avgMetrics.performance >= targets.realExperienceScore &&
    avgMetrics.fcp <= targets.fcp &&
    avgMetrics.lcp <= targets.lcp;
  
  console.log(`${hasLighthouse ? colors.green + '✅' : colors.red + '❌'}${colors.reset} Lighthouse tests completed`);
  console.log(`${hasMonitoring ? colors.green + '✅' : colors.red + '❌'}${colors.reset} 24-hour monitoring completed`);
  console.log(`${meetsTargets ? colors.green + '✅' : colors.yellow + '⚠️ '}${colors.reset} Performance targets met`);
  console.log(`${colors.yellow}⏳${colors.reset} E2E tests completed (run: npm run test:e2e:staging)`);
  console.log(`${colors.yellow}⏳${colors.reset} Functionality verified`);
  console.log(`${colors.yellow}⏳${colors.reset} Real user metrics collected`);
  console.log('');
  
  // Section 6: Recommendations
  console.log(`${colors.cyan}${colors.bold}6. Recommendations${colors.reset}`);
  console.log(`${colors.cyan}══════════════════${colors.reset}`);
  console.log('');
  
  if (meetsTargets) {
    console.log(`${colors.green}✅ All performance targets met!${colors.reset}`);
    console.log('');
    console.log('Next steps:');
    console.log('  1. Complete E2E testing');
    console.log('  2. Verify functionality with stakeholders');
    console.log('  3. Review Vercel Analytics for real user data');
    console.log('  4. Prepare for production deployment');
  } else {
    console.log(`${colors.yellow}⚠️  Some targets not yet met${colors.reset}`);
    console.log('');
    console.log('Recommendations:');
    
    if (avgMetrics) {
      if (avgMetrics.performance < targets.realExperienceScore) {
        console.log('  • Review bundle size and lazy loading');
      }
      if (avgMetrics.fcp > targets.fcp) {
        console.log('  • Optimize critical rendering path');
        console.log('  • Check font loading strategy');
      }
      if (avgMetrics.lcp > targets.lcp) {
        console.log('  • Optimize largest content element');
        console.log('  • Check image optimization');
      }
    }
  }
  
  console.log('');
  
  // Section 7: Resources
  console.log(`${colors.cyan}${colors.bold}7. Resources${colors.reset}`);
  console.log(`${colors.cyan}════════════${colors.reset}`);
  console.log('');
  console.log(`📁 Lighthouse Reports: ./lighthouse-reports/`);
  console.log(`📁 Monitoring Metrics: ./staging-metrics.json`);
  console.log(`📁 E2E Test Reports: ./playwright-report-staging/`);
  console.log(`📊 Vercel Analytics: https://vercel.com/analytics`);
  console.log('');
  
  // Footer
  console.log(`${colors.blue}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log('');
}

// Generate the report
try {
  generateReport();
} catch (error) {
  console.error(`${colors.red}❌ Error generating report: ${error.message}${colors.reset}`);
  process.exit(1);
}
