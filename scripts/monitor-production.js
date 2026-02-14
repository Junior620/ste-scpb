#!/usr/bin/env node

/**
 * Production Monitoring Script
 * 
 * This script monitors the production deployment continuously
 * and tracks performance metrics, error rates, and alerts.
 * 
 * Requirements: 11.1, 11.2, 11.3
 * Task: 23. Production deployment and monitoring
 */

const fs = require('fs');
const https = require('https');

// Configuration
const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
const METRICS_FILE = 'production-metrics.json';
const ALERT_THRESHOLDS = {
  realExperienceScore: 85, // Alert if below 85
  fcp: 3000, // Alert if above 3s
  lcp: 3000, // Alert if above 3s
  ttfb: 1000, // Alert if above 1s
  errorRate: 0.01, // Alert if above 1%
  uptimePercent: 99.5, // Alert if below 99.5%
};

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

// Read production URL
let productionUrl = process.env.PRODUCTION_URL;
if (!productionUrl && fs.existsSync('.production-deployment.json')) {
  const deployment = JSON.parse(fs.readFileSync('.production-deployment.json', 'utf8'));
  productionUrl = deployment.url;
}

if (!productionUrl) {
  console.error(`${colors.red}❌ No production URL found${colors.reset}`);
  console.error('Set PRODUCTION_URL environment variable or deploy first');
  process.exit(1);
}

// Initialize metrics storage
let metrics = {
  startTime: Date.now(),
  productionUrl,
  checks: [],
  alerts: [],
  summary: {
    totalChecks: 0,
    successfulChecks: 0,
    failedChecks: 0,
    averageResponseTime: 0,
    minResponseTime: Infinity,
    maxResponseTime: 0,
    errorCount: 0,
  },
  performance: {
    realExperienceScore: null,
    fcp: null,
    lcp: null,
    ttfb: null,
    inp: null,
    cls: null,
  },
};

// Load existing metrics if available
if (fs.existsSync(METRICS_FILE)) {
  try {
    metrics = JSON.parse(fs.readFileSync(METRICS_FILE, 'utf8'));
    console.log(`${colors.cyan}📊 Resuming monitoring from previous session${colors.reset}`);
  } catch (error) {
    console.log(`${colors.yellow}⚠️  Could not load previous metrics, starting fresh${colors.reset}`);
  }
}

/**
 * Check production deployment health
 */
async function checkDeployment() {
  const startTime = Date.now();
  
  return new Promise((resolve) => {
    const url = new URL(productionUrl);
    
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'GET',
      headers: {
        'User-Agent': 'STE-SCPB-Production-Monitor/1.0',
      },
    };
    
    const req = https.request(options, (res) => {
      const responseTime = Date.now() - startTime;
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        // Check for lazy-loaded component errors in HTML
        const hasComponentError = data.includes('ChunkLoadError') || 
                                  data.includes('Loading chunk') ||
                                  data.includes('Failed to fetch');
        
        resolve({
          timestamp: Date.now(),
          statusCode: res.statusCode,
          responseTime,
          headers: res.headers,
          success: res.statusCode === 200,
          hasComponentError,
          serverTiming: res.headers['server-timing'],
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({
        timestamp: Date.now(),
        statusCode: 0,
        responseTime: Date.now() - startTime,
        error: error.message,
        success: false,
        hasComponentError: false,
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        timestamp: Date.now(),
        statusCode: 0,
        responseTime: Date.now() - startTime,
        error: 'Timeout',
        success: false,
        hasComponentError: false,
      });
    });
    
    req.end();
  });
}

/**
 * Parse Server-Timing header for TTFB
 */
function parseServerTiming(serverTiming) {
  if (!serverTiming) return null;
  
  // Parse server-timing header
  // Example: "edge;dur=10, origin;dur=50"
  const timings = {};
  serverTiming.split(',').forEach(timing => {
    const match = timing.match(/([^;]+);dur=([0-9.]+)/);
    if (match) {
      timings[match[1].trim()] = parseFloat(match[2]);
    }
  });
  
  return timings;
}

/**
 * Check for performance degradation and send alerts
 */
function checkAlerts(check) {
  const alerts = [];
  
  // TTFB alert
  if (check.responseTime > ALERT_THRESHOLDS.ttfb) {
    alerts.push({
      type: 'ttfb',
      severity: 'warning',
      message: `TTFB exceeded threshold: ${check.responseTime}ms > ${ALERT_THRESHOLDS.ttfb}ms`,
      timestamp: Date.now(),
    });
  }
  
  // Uptime alert
  const uptimePercent = (metrics.summary.successfulChecks / metrics.summary.totalChecks) * 100;
  if (uptimePercent < ALERT_THRESHOLDS.uptimePercent) {
    alerts.push({
      type: 'uptime',
      severity: 'critical',
      message: `Uptime dropped below threshold: ${uptimePercent.toFixed(2)}% < ${ALERT_THRESHOLDS.uptimePercent}%`,
      timestamp: Date.now(),
    });
  }
  
  // Component error alert
  if (check.hasComponentError) {
    alerts.push({
      type: 'component_error',
      severity: 'error',
      message: 'Lazy-loaded component error detected in response',
      timestamp: Date.now(),
    });
  }
  
  // Error rate alert
  const errorRate = metrics.summary.errorCount / metrics.summary.totalChecks;
  if (errorRate > ALERT_THRESHOLDS.errorRate) {
    alerts.push({
      type: 'error_rate',
      severity: 'critical',
      message: `Error rate exceeded threshold: ${(errorRate * 100).toFixed(2)}% > ${(ALERT_THRESHOLDS.errorRate * 100).toFixed(2)}%`,
      timestamp: Date.now(),
    });
  }
  
  // Log alerts
  alerts.forEach(alert => {
    const severityColor = alert.severity === 'critical' ? colors.red : 
                          alert.severity === 'error' ? colors.red :
                          colors.yellow;
    console.log(`${severityColor}🚨 ALERT [${alert.severity.toUpperCase()}]: ${alert.message}${colors.reset}`);
    metrics.alerts.push(alert);
  });
  
  return alerts;
}

/**
 * Update metrics summary
 */
function updateSummary(check) {
  metrics.checks.push(check);
  metrics.summary.totalChecks++;
  
  if (check.success) {
    metrics.summary.successfulChecks++;
  } else {
    metrics.summary.failedChecks++;
    metrics.summary.errorCount++;
  }
  
  if (check.hasComponentError) {
    metrics.summary.errorCount++;
  }
  
  if (check.responseTime < metrics.summary.minResponseTime) {
    metrics.summary.minResponseTime = check.responseTime;
  }
  
  if (check.responseTime > metrics.summary.maxResponseTime) {
    metrics.summary.maxResponseTime = check.responseTime;
  }
  
  // Calculate average response time
  const totalResponseTime = metrics.checks.reduce((sum, c) => sum + c.responseTime, 0);
  metrics.summary.averageResponseTime = Math.round(totalResponseTime / metrics.checks.length);
  
  // Parse TTFB from server-timing if available
  if (check.serverTiming) {
    const timings = parseServerTiming(check.serverTiming);
    if (timings && timings.total) {
      metrics.performance.ttfb = timings.total;
    }
  }
  
  // Save metrics to file
  fs.writeFileSync(METRICS_FILE, JSON.stringify(metrics, null, 2));
}

/**
 * Display current status
 */
function displayStatus(check) {
  const elapsed = Date.now() - metrics.startTime;
  const hours = Math.floor(elapsed / (60 * 60 * 1000));
  const minutes = Math.floor((elapsed % (60 * 60 * 1000)) / (60 * 1000));
  
  console.clear();
  console.log(`${colors.bold}${colors.blue}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}║${colors.reset}  📊 Production Deployment Monitoring                      ${colors.bold}${colors.blue}║${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}╚════════════════════════════════════════════════════════════╝${colors.reset}`);
  console.log('');
  console.log(`${colors.cyan}📍 URL:${colors.reset} ${productionUrl}`);
  console.log(`${colors.cyan}⏱️  Monitoring duration:${colors.reset} ${hours}h ${minutes}m`);
  console.log(`${colors.cyan}📅 Started:${colors.reset} ${new Date(metrics.startTime).toLocaleString()}`);
  console.log('');
  
  // Current check status
  const statusColor = check.success ? colors.green : colors.red;
  const statusIcon = check.success ? '✅' : '❌';
  console.log(`${colors.cyan}${colors.bold}Current Check:${colors.reset}`);
  console.log(`  ${statusIcon} Status: ${statusColor}${check.statusCode}${colors.reset}`);
  console.log(`  ⚡ Response Time: ${check.responseTime}ms`);
  if (check.hasComponentError) {
    console.log(`  ${colors.red}⚠️  Component Error Detected${colors.reset}`);
  }
  console.log('');
  
  // Summary statistics
  console.log(`${colors.cyan}${colors.bold}Summary Statistics:${colors.reset}`);
  console.log(`  📊 Total Checks: ${metrics.summary.totalChecks}`);
  console.log(`  ${colors.green}✅ Successful: ${metrics.summary.successfulChecks}${colors.reset}`);
  console.log(`  ${colors.red}❌ Failed: ${metrics.summary.failedChecks}${colors.reset}`);
  console.log(`  ${colors.red}🐛 Errors: ${metrics.summary.errorCount}${colors.reset}`);
  console.log(`  ⚡ Avg Response: ${metrics.summary.averageResponseTime}ms`);
  console.log(`  ⚡ Min Response: ${metrics.summary.minResponseTime}ms`);
  console.log(`  ⚡ Max Response: ${metrics.summary.maxResponseTime}ms`);
  console.log('');
  
  // Uptime percentage
  const uptime = ((metrics.summary.successfulChecks / metrics.summary.totalChecks) * 100).toFixed(2);
  const uptimeColor = uptime >= 99.5 ? colors.green : uptime >= 99 ? colors.yellow : colors.red;
  console.log(`  ${uptimeColor}📈 Uptime: ${uptime}%${colors.reset}`);
  
  // Error rate
  const errorRate = ((metrics.summary.errorCount / metrics.summary.totalChecks) * 100).toFixed(2);
  const errorRateColor = errorRate < 1 ? colors.green : errorRate < 5 ? colors.yellow : colors.red;
  console.log(`  ${errorRateColor}🐛 Error Rate: ${errorRate}%${colors.reset}`);
  console.log('');
  
  // Performance targets
  console.log(`${colors.cyan}${colors.bold}Performance Targets (Requirements 11.4):${colors.reset}`);
  
  // TTFB
  const avgTtfb = metrics.summary.averageResponseTime;
  const ttfbStatus = avgTtfb < 800 ? colors.green : avgTtfb < 1000 ? colors.yellow : colors.red;
  const ttfbIcon = avgTtfb < 800 ? '✅' : '⚠️';
  console.log(`  ${ttfbIcon} ${ttfbStatus}TTFB: ${avgTtfb}ms (target: <800ms)${colors.reset}`);
  
  // Real Experience Score (from Vercel Analytics)
  if (metrics.performance.realExperienceScore) {
    const resStatus = metrics.performance.realExperienceScore >= 90 ? colors.green : colors.yellow;
    const resIcon = metrics.performance.realExperienceScore >= 90 ? '✅' : '⚠️';
    console.log(`  ${resIcon} ${resStatus}Real Experience Score: ${metrics.performance.realExperienceScore} (target: >90)${colors.reset}`);
  } else {
    console.log(`  ${colors.yellow}⏳ Real Experience Score: Check Vercel Analytics${colors.reset}`);
  }
  
  // Other metrics
  if (metrics.performance.fcp) {
    const fcpStatus = metrics.performance.fcp < 2500 ? colors.green : colors.yellow;
    const fcpIcon = metrics.performance.fcp < 2500 ? '✅' : '⚠️';
    console.log(`  ${fcpIcon} ${fcpStatus}FCP: ${metrics.performance.fcp}ms (target: <2500ms)${colors.reset}`);
  }
  
  if (metrics.performance.lcp) {
    const lcpStatus = metrics.performance.lcp < 2500 ? colors.green : colors.yellow;
    const lcpIcon = metrics.performance.lcp < 2500 ? '✅' : '⚠️';
    console.log(`  ${lcpIcon} ${lcpStatus}LCP: ${metrics.performance.lcp}ms (target: <2500ms)${colors.reset}`);
  }
  
  console.log('');
  
  // Recent alerts
  if (metrics.alerts.length > 0) {
    const recentAlerts = metrics.alerts.slice(-5);
    console.log(`${colors.cyan}${colors.bold}Recent Alerts (${metrics.alerts.length} total):${colors.reset}`);
    recentAlerts.forEach(alert => {
      const severityColor = alert.severity === 'critical' ? colors.red : 
                            alert.severity === 'error' ? colors.red :
                            colors.yellow;
      const time = new Date(alert.timestamp).toLocaleTimeString();
      console.log(`  ${severityColor}[${time}] ${alert.type}: ${alert.message}${colors.reset}`);
    });
    console.log('');
  }
  
  // Next steps
  console.log(`${colors.cyan}${colors.bold}💡 Monitoring Resources:${colors.reset}`);
  console.log(`  📊 Vercel Analytics: https://vercel.com/analytics`);
  console.log(`  📈 Speed Insights: https://vercel.com/speed-insights`);
  console.log(`  📁 Metrics file: ${METRICS_FILE}`);
  console.log(`  📋 Logs: production-monitor.log`);
  console.log('');
  console.log(`${colors.cyan}Press Ctrl+C to stop monitoring${colors.reset}`);
}

/**
 * Main monitoring loop
 */
async function startMonitoring() {
  console.log(`${colors.green}🚀 Starting production monitoring...${colors.reset}`);
  console.log(`${colors.cyan}📍 URL: ${productionUrl}${colors.reset}`);
  console.log('');
  
  // Run continuously
  while (true) {
    const check = await checkDeployment();
    updateSummary(check);
    checkAlerts(check);
    displayStatus(check);
    
    // Wait for next check
    await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('');
  console.log(`${colors.yellow}⚠️  Monitoring stopped by user${colors.reset}`);
  console.log(`${colors.cyan}📁 Metrics saved to: ${METRICS_FILE}${colors.reset}`);
  console.log('');
  console.log(`${colors.cyan}${colors.bold}Final Summary:${colors.reset}`);
  console.log(`  Total Checks: ${metrics.summary.totalChecks}`);
  console.log(`  Successful: ${metrics.summary.successfulChecks}`);
  console.log(`  Failed: ${metrics.summary.failedChecks}`);
  console.log(`  Errors: ${metrics.summary.errorCount}`);
  console.log(`  Uptime: ${((metrics.summary.successfulChecks / metrics.summary.totalChecks) * 100).toFixed(2)}%`);
  console.log(`  Avg Response Time: ${metrics.summary.averageResponseTime}ms`);
  console.log(`  Total Alerts: ${metrics.alerts.length}`);
  console.log('');
  process.exit(0);
});

// Handle errors
process.on('uncaughtException', (error) => {
  console.error(`${colors.red}❌ Uncaught exception: ${error.message}${colors.reset}`);
  fs.writeFileSync(METRICS_FILE, JSON.stringify(metrics, null, 2));
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error(`${colors.red}❌ Unhandled rejection: ${error}${colors.reset}`);
  fs.writeFileSync(METRICS_FILE, JSON.stringify(metrics, null, 2));
  process.exit(1);
});

// Start monitoring
startMonitoring().catch((error) => {
  console.error(`${colors.red}❌ Monitoring error: ${error.message}${colors.reset}`);
  process.exit(1);
});
