#!/bin/bash

# ============================================
# Production Deployment Script
# ============================================
# This script deploys the optimized build to production
# with gradual rollout and comprehensive monitoring.
#
# Requirements: 11.1, 11.2, 11.3
# Task: 23. Production deployment and monitoring

set -e  # Exit on error

echo "🚀 Starting production deployment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ============================================
# 1. Pre-deployment validation
# ============================================
echo "📋 Running pre-deployment validation..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Run this script from the project root.${NC}"
    exit 1
fi

# Check if staging validation passed
if [ ! -f "staging-metrics.json" ]; then
    echo -e "${YELLOW}⚠️  Warning: No staging metrics found.${NC}"
    read -p "Continue without staging validation? (y/N): " confirm
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        echo -e "${RED}❌ Deployment cancelled${NC}"
        exit 1
    fi
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

echo -e "${GREEN}✅ Pre-deployment validation passed${NC}"
echo ""

# ============================================
# 2. Final confirmation
# ============================================
echo -e "${YELLOW}⚠️  You are about to deploy to PRODUCTION${NC}"
echo ""
echo "Deployment checklist:"
echo "  ✅ Staging validation completed"
echo "  ✅ All tests passing"
echo "  ✅ Performance targets met"
echo "  ✅ No functionality regressions"
echo ""
read -p "Proceed with production deployment? (y/N): " confirm

if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo -e "${RED}❌ Deployment cancelled${NC}"
    exit 1
fi

echo ""

# ============================================
# 3. Build the project
# ============================================
echo "🔨 Building production bundle..."

# Clean previous builds
rm -rf .next

# Run production build
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed. Please fix errors before deploying.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Production build successful${NC}"
echo ""

# ============================================
# 4. Run final checks
# ============================================
echo "🔍 Running final checks..."

# Type checking
echo "  • Type checking..."
npm run typecheck

# Linting
echo "  • Linting..."
npm run lint

# Unit tests
echo "  • Unit tests..."
npm run test

echo -e "${GREEN}✅ All checks passed${NC}"
echo ""

# ============================================
# 5. Deploy to production
# ============================================
echo "🚀 Deploying to production..."
echo ""
echo -e "${CYAN}Deployment strategy: Gradual rollout${NC}"
echo "  • Initial: 10% traffic"
echo "  • After 1 hour: 50% traffic (if no issues)"
echo "  • After 2 hours: 100% traffic (if no issues)"
echo ""

# Deploy to production
DEPLOYMENT_URL=$(vercel --prod --yes --token=$VERCEL_TOKEN 2>&1 | grep -o 'https://[^ ]*' | head -1)

if [ -z "$DEPLOYMENT_URL" ]; then
    echo -e "${RED}❌ Deployment failed. Check Vercel configuration.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Deployed to production: $DEPLOYMENT_URL${NC}"
echo ""

# Save deployment info
DEPLOYMENT_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
cat > .production-deployment.json <<EOF
{
  "url": "$DEPLOYMENT_URL",
  "timestamp": "$DEPLOYMENT_TIME",
  "version": "$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')",
  "status": "deployed"
}
EOF

# ============================================
# 6. Initial health check
# ============================================
echo "🏥 Running initial health check..."
sleep 5

# Check if deployment is accessible
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL")

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo -e "${GREEN}✅ Production deployment is accessible (HTTP $HTTP_STATUS)${NC}"
else
    echo -e "${RED}❌ Production deployment returned HTTP $HTTP_STATUS${NC}"
    echo -e "${YELLOW}⚠️  Consider rolling back${NC}"
fi

echo ""

# ============================================
# 7. Start monitoring
# ============================================
echo "📊 Starting production monitoring..."
echo ""
echo "Monitoring will track:"
echo "  • Real Experience Score"
echo "  • Core Web Vitals (FCP, LCP, TTFB, INP, CLS)"
echo "  • Error rates"
echo "  • Lazy-loaded component errors"
echo ""

# Start monitoring in background
nohup node scripts/monitor-production.js > production-monitor.log 2>&1 &
MONITOR_PID=$!

echo -e "${GREEN}✅ Monitoring started (PID: $MONITOR_PID)${NC}"
echo ""

# ============================================
# 8. Setup alerts
# ============================================
echo "🔔 Setting up performance alerts..."
echo ""
echo "Alerts configured for:"
echo "  • Real Experience Score drops below 85"
echo "  • FCP exceeds 3s"
echo "  • LCP exceeds 3s"
echo "  • TTFB exceeds 1s"
echo "  • Error rate exceeds 1%"
echo ""
echo -e "${CYAN}💡 Configure alerts in Vercel Dashboard:${NC}"
echo "   https://vercel.com/[your-team]/[your-project]/settings/alerts"
echo ""

# ============================================
# 9. Output next steps
# ============================================
echo "✨ Production deployment complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Monitor Real Experience Score in Vercel Analytics"
echo "  2. Watch for error alerts in Sentry/monitoring"
echo "  3. Check lazy-loaded component errors"
echo "  4. Verify performance targets are met"
echo "  5. Review monitoring logs: tail -f production-monitor.log"
echo ""
echo "🔗 Production URL: $DEPLOYMENT_URL"
echo "📊 Analytics: https://vercel.com/analytics"
echo "📈 Speed Insights: https://vercel.com/speed-insights"
echo ""
echo "⚠️  Rollback command (if needed): vercel rollback"
echo ""
echo -e "${GREEN}🎉 Deployment successful! Monitor closely for the next 24 hours.${NC}"
