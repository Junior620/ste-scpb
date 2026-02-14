#!/bin/bash

# ============================================
# Production Rollback Script
# ============================================
# This script rolls back the production deployment
# to the previous version if issues are detected.
#
# Requirements: 11.3
# Task: 23. Production deployment and monitoring

set -e  # Exit on error

echo "⚠️  Production Rollback"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ============================================
# 1. Confirmation
# ============================================
echo -e "${RED}${BOLD}WARNING: You are about to rollback production!${NC}"
echo ""
echo "This will:"
echo "  • Revert to the previous deployment"
echo "  • Stop current monitoring"
echo "  • Create a rollback report"
echo ""
read -p "Are you sure you want to rollback? (yes/NO): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${GREEN}Rollback cancelled${NC}"
    exit 0
fi

echo ""

# ============================================
# 2. Check Vercel CLI
# ============================================
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found${NC}"
    echo "Install with: npm install -g vercel"
    exit 1
fi

# ============================================
# 3. Get current deployment info
# ============================================
echo "📋 Getting current deployment info..."

if [ -f ".production-deployment.json" ]; then
    CURRENT_DEPLOYMENT=$(cat .production-deployment.json)
    echo -e "${CYAN}Current deployment:${NC}"
    echo "$CURRENT_DEPLOYMENT" | grep -E "(url|timestamp|version)"
else
    echo -e "${YELLOW}⚠️  No deployment info found${NC}"
fi

echo ""

# ============================================
# 4. Stop monitoring
# ============================================
echo "🛑 Stopping production monitoring..."

# Find and kill monitoring process
MONITOR_PID=$(ps aux | grep "monitor-production.js" | grep -v grep | awk '{print $2}')

if [ ! -z "$MONITOR_PID" ]; then
    kill $MONITOR_PID
    echo -e "${GREEN}✅ Monitoring stopped (PID: $MONITOR_PID)${NC}"
else
    echo -e "${YELLOW}⚠️  No monitoring process found${NC}"
fi

echo ""

# ============================================
# 5. Perform rollback
# ============================================
echo "🔄 Rolling back production deployment..."

# Use Vercel rollback command
vercel rollback --yes --token=$VERCEL_TOKEN

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Rollback successful${NC}"
else
    echo -e "${RED}❌ Rollback failed${NC}"
    exit 1
fi

echo ""

# ============================================
# 6. Create rollback report
# ============================================
echo "📝 Creating rollback report..."

ROLLBACK_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
ROLLBACK_REASON=${1:-"Manual rollback - no reason specified"}

cat > .rollback-report.json <<EOF
{
  "timestamp": "$ROLLBACK_TIME",
  "reason": "$ROLLBACK_REASON",
  "previousDeployment": $(cat .production-deployment.json 2>/dev/null || echo '{}'),
  "metrics": $(cat production-metrics.json 2>/dev/null || echo '{}')
}
EOF

echo -e "${GREEN}✅ Rollback report created: .rollback-report.json${NC}"
echo ""

# ============================================
# 7. Verify rollback
# ============================================
echo "🔍 Verifying rollback..."
sleep 5

# Get production URL
PROD_URL=$(vercel ls --prod --token=$VERCEL_TOKEN 2>&1 | grep -o 'https://[^ ]*' | head -1)

if [ ! -z "$PROD_URL" ]; then
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL")
    
    if [ "$HTTP_STATUS" -eq 200 ]; then
        echo -e "${GREEN}✅ Production is accessible (HTTP $HTTP_STATUS)${NC}"
    else
        echo -e "${RED}❌ Production returned HTTP $HTTP_STATUS${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Could not verify production URL${NC}"
fi

echo ""

# ============================================
# 8. Summary
# ============================================
echo "📊 Rollback Summary"
echo "==================="
echo ""
echo "Rollback Time: $ROLLBACK_TIME"
echo "Reason: $ROLLBACK_REASON"
echo ""
echo "Next steps:"
echo "  1. Investigate the issue that caused the rollback"
echo "  2. Fix the problem in the codebase"
echo "  3. Test thoroughly in staging"
echo "  4. Re-deploy when ready"
echo ""
echo "📁 Reports:"
echo "  • Rollback report: .rollback-report.json"
echo "  • Production metrics: production-metrics.json"
echo "  • Monitoring logs: production-monitor.log"
echo ""
echo -e "${GREEN}✅ Rollback complete${NC}"
