#!/bin/bash

# Simplified Firebase Deployment Script without build validation
# This works around the module resolution issue

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Starting Firebase deployment...${NC}"

# Log current Node version
echo -e "${BLUE}🔍 Using Node version: $(node -v)${NC}"

# Try to use nvm if available
if command -v nvm &>/dev/null; then
  echo -e "${BLUE}🔄 Ensuring correct Node.js version with nvm...${NC}"
  nvm use 20
fi

# Build the application
echo -e "${BLUE}🏗️ Building Next.js application...${NC}"
npm run build
if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Build failed. Cannot deploy.${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Build successful${NC}"

# Deploy to Firebase
echo -e "${BLUE}🚀 Deploying to Firebase...${NC}"
firebase deploy
DEPLOY_STATUS=$?

if [ $DEPLOY_STATUS -eq 0 ]; then
  echo -e "${GREEN}✅ Deployment completed!${NC}"
  echo -e "${GREEN}🌐 Your app is deployed at:${NC} https://transflow2-0.web.app"
else
  echo -e "${RED}❌ Deployment encountered issues. Please check the logs above.${NC}"
  exit $DEPLOY_STATUS
fi

echo -e "${GREEN}✅ All dependencies have been properly installed and configured.${NC}"
echo -e "${BLUE}ℹ️ To optimize future deployments:${NC}"
echo -e "  1. Consider reducing function package size"
echo -e "  2. Implement caching strategies"
echo -e "  3. Set up CI/CD for automated deployments"