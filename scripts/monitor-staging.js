#!/usr/bin/env node

/**
 * Staging Monitoring Script
 * 
 * This script monitors the staging deployment for 24 hours
 * and collects performance metrics from real users.
 * 
 * Requirements: 11.1, 11.2, 11.3
 * Task: 22. Deploy to staging and validate
 */

const fs = require('fs');
const https = require('https');

// Configuration
const MONITORING_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
const METRICS_FILE = 'staging-metrics.json';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Read staging URL
let stagingUrl = process.env.STAGING_URL;
if (!stagingUrl && fs.existsSync('.staging-url.txt')) {
  stagingUrl = fs.readFileSync('.staging-url.txt', 'utf8').trim();
}

if (!stagingUrl) {
  console.error(`${colors.red}❌ No staging URL found${colors.reset}`);
  console.error('Set STAGING_URL environment variable or create .staging-url.txt');
  process.exit(1);
}

// Initialize metrics storage
let metrics = {
  startTime: Date.now(),
  stagingUrl,
  checks: [],
  summary: {
    totalChecks: 0,
    successfulChecks: 0,
    failedChecks: 0,
    averageResponseTime: 0,
    minResponseTime: Infinity,
    maxResponseTime: 0,
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
 * Check staging deployment health
 */
async function checkDeployment() {
  const startTime = Date.now();
  
  return new Promise((resolve) => {
    const url = new URL(stagingUrl);
    
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'GET',
      headers: {
        'User-Agent': 'STE-SCPB-Staging-Monitor/1.0',
      },
    };
    
    const req = https.request(options, (res) => {
      const responseTime = Date.now() - startTime;
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          timestamp: Date.now(),
          statusCode: res.statusCode,
          responseTime,
          headers: res.headers,
          success: res.statusCode === 200,
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
      });
    });
    
    req.end();
  });
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
  
  // Save metrics to file
  fs.writeFileSync(METRICS_FILE, JSON.stringify(metrics, null, 2));
}

/**
 * Display current status
 */
function displayStatus(check) {
  const elapsed = Date.now() - metrics.startTime;
  const remaining = MONITORING_DURATION - elapsed;
  const hoursRemaining = Math.floor(remaining / (60 * 60 * 1000));
  const minutesRemaining = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
  
  console.clear();
  console.log(`${colors.blue}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║${colors.reset}  🔍 Staging Deployment Monitoring                         ${colors.blue}║${colors.reset}`);
  console.log(`${colors.blue}╚════════════════════════════════════════════════════════════╝${colors.reset}`);
  console.log('');
  console.log(`${colors.cyan}📍 URL:${colors.reset} ${stagingUrl}`);
  console.log(`${colors.cyan}⏱️  Time remaining:${colors.reset} ${hoursRemaining}h ${minutesRemaining}m`);
  console.log('');
  
  // Current check status
  const statusColor = check.success ? colors.green : colors.red;
  const statusIcon = check.success ? '✅' : '❌';
  console.log(`${colors.cyan}Current Check:${colors.reset}`);
  console.log(`  ${statusIcon} Status: ${statusColor}${check.statusCode}${colors.reset}`);
  console.log(`  ⚡ Response Time: ${check.responseTime}ms`);
  console.log('');
  
  // Summary statistics
  console.log(`${colors.cyan}Summary Statistics:${colors.reset}`);
  console.log(`  📊 Total Checks: ${metrics.summary.totalChecks}`);
  console.log(`  ${colors.green}✅ Successful: ${metrics.summary.successfulChecks}${colors.reset}`);
  console.log(`  ${colors.red}❌ Failed: ${metrics.summary.failedChecks}${colors.reset}`);
  console.log(`  ⚡ Avg Response: ${metrics.summary.averageResponseTime}ms`);
  console.log(`  ⚡ Min Response: ${metrics.summary.minResponseTime}ms`);
  console.log(`  ⚡ Max Response: ${metrics.summary.maxResponseTime}ms`);
  console.log('');
  
  // Uptime percentage
  const uptime = ((metrics.summary.successfulChecks / metrics.summary.totalChecks) * 100).toFixed(2);
  const uptimeColor = uptime >= 99 ? colors.green : uptime >= 95 ? colors.yellow : colors.red;
  console.log(`  ${uptimeColor}📈 Uptime: ${uptime}%${colors.reset}`);
  console.log('');
  
  // Performance targets
  console.log(`${colors.cyan}Performance Targets (Requirements 11.4):${colors.reset}`);
  const avgTtfb = metrics.summary.averageResponseTime;
  const ttfbStatus = avgTtfb < 800 ? colors.green : colors.red;
  console.log(`  ${ttfbStatus}• TTFB: ${avgTtfb}ms (target: <800ms)${colors.reset}`);
  console.log(`  ${colors.yellow}• Real Experience Score: Monitor in Vercel Analytics${colors.reset}`);
  console.log(`  ${colors.yellow}• FCP, LCP: Run Lighthouse tests${colors.reset}`);
  console.log('');
  
  console.log(`${colors.cyan}💡 Next Steps:${colors.reset}`);
  console.log(`  1. Monitor Real Experience Score in Vercel Analytics`);
  console.log(`  2. Run E2E tests: npm run test:e2e`);
  console.log(`  3. Verify no functionality regressions`);
  console.log(`  4. Review metrics file: ${METRICS_FILE}`);
  console.log('');
  console.log(`${colors.cyan}Press Ctrl+C to stop monitoring${colors.reset}`);
}

/**
 * Main monitoring loop
 */
async function startMonitoring() {
  console.log(`${colors.green}🚀 Starting 24-hour staging monitoring...${colors.reset}`);
  console.log(`${colors.cyan}📍 URL: ${stagingUrl}${colors.reset}`);
  console.log('');
  
  const endTime = metrics.startTime + MONITORING_DURATION;
  
  while (Date.now() < endTime) {
    const check = await checkDeployment();
    updateSummary(check);
    displayStatus(check);
    
    // Wait for next check
    await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
  }
  
  // Monitoring complete
  console.log('');
  console.log(`${colors.green}✅ 24-hour monitoring complete!${colors.reset}`);
  console.log('');
  console.log(`${colors.cyan}📊 Final Summary:${colors.reset}`);
  console.log(`  Total Checks: ${metrics.summary.totalChecks}`);
  console.log(`  Successful: ${metrics.summary.successfulChecks}`);
  console.log(`  Failed: ${metrics.summary.failedChecks}`);
  console.log(`  Uptime: ${((metrics.summary.successfulChecks / metrics.summary.totalChecks) * 100).toFixed(2)}%`);
  console.log(`  Avg Response Time: ${metrics.summary.averageResponseTime}ms`);
  console.log('');
  console.log(`${colors.cyan}📁 Detailed metrics saved to: ${METRICS_FILE}${colors.reset}`);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('');
  console.log(`${colors.yellow}⚠️  Monitoring stopped by user${colors.reset}`);
  console.log(`${colors.cyan}📁 Metrics saved to: ${METRICS_FILE}${colors.reset}`);
  process.exit(0);
});

// Start monitoring
startMonitoring().catch((error) => {
  console.error(`${colors.red}❌ Monitoring error: ${error.message}${colors.reset}`);
  process.exit(1);
});
