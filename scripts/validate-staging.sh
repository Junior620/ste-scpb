#!/bin/bash

# ============================================
# Staging Validation Script
# ============================================
# This script validates the staging deployment
# by running Lighthouse tests and checking metrics.
#
# Requirements: 11.1, 11.2, 11.3
# Task: 22. Deploy to staging and validate

set -e  # Exit on error

echo "🔍 Starting staging validation..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================
# 1. Get staging URL
# ============================================
if [ -f ".staging-url.txt" ]; then
    STAGING_URL=$(cat .staging-url.txt)
    echo -e "${BLUE}📍 Staging URL: $STAGING_URL${NC}"
else
    echo -e "${YELLOW}⚠️  No staging URL found. Please provide it:${NC}"
    read -p "Enter staging URL: " STAGING_URL
    echo "$STAGING_URL" > .staging-url.txt
fi

echo ""

# ============================================
# 2. Check deployment accessibility
# ============================================
echo "🌐 Checking deployment accessibility..."

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$STAGING_URL")

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo -e "${GREEN}✅ Deployment is accessible (HTTP $HTTP_STATUS)${NC}"
else
    echo -e "${RED}❌ Deployment returned HTTP $HTTP_STATUS${NC}"
    exit 1
fi

echo ""

# ============================================
# 3. Run Lighthouse tests on key pages
# ============================================
echo "🔦 Running Lighthouse tests..."

# Create reports directory
mkdir -p lighthouse-reports

# Test pages
PAGES=(
    "/"
    "/fr"
    "/en"
    "/fr/produits"
    "/fr/actualites"
    "/fr/contact"
    "/fr/a-propos"
)

TOTAL_PAGES=${#PAGES[@]}
PASSED_PAGES=0

for PAGE in "${PAGES[@]}"; do
    PAGE_URL="${STAGING_URL}${PAGE}"
    REPORT_NAME=$(echo "$PAGE" | sed 's/\//-/g' | sed 's/^-//')
    
    if [ -z "$REPORT_NAME" ]; then
        REPORT_NAME="home"
    fi
    
    echo -e "${BLUE}Testing: $PAGE_URL${NC}"
    
    # Run Lighthouse
    npx lighthouse "$PAGE_URL" \
        --output=json \
        --output=html \
        --output-path="./lighthouse-reports/staging-${REPORT_NAME}" \
        --chrome-flags="--headless --no-sandbox" \
        --quiet \
        --only-categories=performance,accessibility,best-practices,seo \
        2>&1 | grep -v "Lighthouse"
    
    # Parse results
    PERF_SCORE=$(cat "./lighthouse-reports/staging-${REPORT_NAME}.report.json" | grep -o '"performance":[0-9.]*' | grep -o '[0-9.]*$')
    FCP=$(cat "./lighthouse-reports/staging-${REPORT_NAME}.report.json" | grep -o '"first-contentful-paint".*numericValue":[0-9.]*' | grep -o '[0-9.]*$')
    LCP=$(cat "./lighthouse-reports/staging-${REPORT_NAME}.report.json" | grep -o '"largest-contentful-paint".*numericValue":[0-9.]*' | grep -o '[0-9.]*$')
    
    # Convert to seconds
    FCP_SEC=$(echo "scale=2; $FCP / 1000" | bc)
    LCP_SEC=$(echo "scale=2; $LCP / 1000" | bc)
    PERF_PERCENT=$(echo "scale=0; $PERF_SCORE * 100" | bc)
    
    echo -e "  Performance: ${PERF_PERCENT}%"
    echo -e "  FCP: ${FCP_SEC}s"
    echo -e "  LCP: ${LCP_SEC}s"
    
    # Check if targets are met
    if (( $(echo "$PERF_SCORE >= 0.80" | bc -l) )); then
        echo -e "${GREEN}  ✅ Performance target met${NC}"
        PASSED_PAGES=$((PASSED_PAGES + 1))
    else
        echo -e "${RED}  ❌ Performance below target (need 80%)${NC}"
    fi
    
    echo ""
done

# ============================================
# 4. Summary
# ============================================
echo "📊 Validation Summary"
echo "===================="
echo -e "Pages tested: $TOTAL_PAGES"
echo -e "Pages passed: $PASSED_PAGES"
echo ""

if [ $PASSED_PAGES -eq $TOTAL_PAGES ]; then
    echo -e "${GREEN}✅ All pages meet performance targets!${NC}"
else
    echo -e "${YELLOW}⚠️  Some pages need optimization${NC}"
fi

echo ""
echo "📁 Detailed reports saved to: ./lighthouse-reports/"
echo ""

# ============================================
# 5. Check Core Web Vitals targets
# ============================================
echo "🎯 Core Web Vitals Targets"
echo "=========================="
echo "Target metrics (Requirements 11.4):"
echo "  • Real Experience Score: >90"
echo "  • FCP: <2.5s"
echo "  • LCP: <2.5s"
echo "  • TTFB: <0.8s"
echo "  • Initial bundle: <200KB gzipped"
echo ""
echo "💡 Monitor Real Experience Score in Vercel Analytics"
echo "   Dashboard: https://vercel.com/analytics"
echo ""

# ============================================
# 6. Next steps
# ============================================
echo "📝 Next Steps"
echo "============="
echo "1. ✅ Lighthouse tests completed"
echo "2. ⏳ Monitor Real Experience Score for 24 hours"
echo "3. ⏳ Run E2E tests: npm run test:e2e"
echo "4. ⏳ Verify no functionality regressions"
echo "5. ⏳ Collect performance metrics from real users"
echo ""
echo "🔗 Staging URL: $STAGING_URL"
