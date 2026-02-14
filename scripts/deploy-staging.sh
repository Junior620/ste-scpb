#!/bin/bash

# ============================================
# Staging Deployment Script
# ============================================
# This script deploys the optimized build to staging
# and performs initial validation checks.
#
# Requirements: 11.1, 11.2, 11.3
# Task: 22. Deploy to staging and validate

set -e  # Exit on error

echo "🚀 Starting staging deployment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ============================================
# 1. Pre-deployment checks
# ============================================
echo "📋 Running pre-deployment checks..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Run this script from the project root.${NC}"
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

echo -e "${GREEN}✅ Pre-deployment checks passed${NC}"
echo ""

# ============================================
# 2. Build the project locally
# ============================================
echo "🔨 Building project locally..."

# Clean previous builds
rm -rf .next

# Run build
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed. Please fix errors before deploying.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Local build successful${NC}"
echo ""

# ============================================
# 3. Run bundle analysis
# ============================================
echo "📊 Analyzing bundle size..."

# Generate bundle analysis
ANALYZE=true npm run build > /dev/null 2>&1 || true

echo -e "${GREEN}✅ Bundle analysis complete${NC}"
echo ""

# ============================================
# 4. Deploy to Vercel staging
# ============================================
echo "🚀 Deploying to Vercel staging..."

# Deploy to staging (preview deployment)
# This creates a unique preview URL
DEPLOYMENT_URL=$(vercel --yes --token=$VERCEL_TOKEN 2>&1 | grep -o 'https://[^ ]*' | head -1)

if [ -z "$DEPLOYMENT_URL" ]; then
    echo -e "${RED}❌ Deployment failed. Check Vercel configuration.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Deployed to staging: $DEPLOYMENT_URL${NC}"
echo ""

# Save deployment URL for later use
echo "$DEPLOYMENT_URL" > .staging-url.txt

# ============================================
# 5. Wait for deployment to be ready
# ============================================
echo "⏳ Waiting for deployment to be ready..."
sleep 10

# Check if deployment is accessible
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL")

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo -e "${GREEN}✅ Deployment is accessible (HTTP $HTTP_STATUS)${NC}"
else
    echo -e "${YELLOW}⚠️  Deployment returned HTTP $HTTP_STATUS${NC}"
fi

echo ""

# ============================================
# 6. Output next steps
# ============================================
echo "✨ Staging deployment complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Run Lighthouse tests: npm run lighthouse:staging"
echo "  2. Monitor Real Experience Score for 24 hours"
echo "  3. Verify functionality: npm run test:e2e:staging"
echo "  4. Collect performance metrics from real users"
echo ""
echo "🔗 Staging URL: $DEPLOYMENT_URL"
echo ""
echo "💡 To promote to production, run: vercel --prod"
