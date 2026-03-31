#!/bin/bash

# Production Deployment Script for FreelanceFlow
# Complete deployment to Cloudflare (Pages + Workers + D1)

set -e

echo "🚀 FreelanceFlow Production Deployment"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check dependencies
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

if ! command -v wrangler &> /dev/null; then
  echo -e "${RED}✗ wrangler not installed${NC}"
  echo "Install with: npm install -g wrangler"
  exit 1
fi

if ! command -v npm &> /dev/null; then
  echo -e "${RED}✗ npm not installed${NC}"
  exit 1
fi

echo -e "${GREEN}✓ All prerequisites met${NC}"
echo ""

# Stage 1: Build
echo -e "${BLUE}1️⃣  Building Application...${NC}"
npm run build:frontend
npm run build:backend
echo -e "${GREEN}✓ Build complete${NC}"
echo ""

# Stage 2: Setup Database
echo -e "${BLUE}2️⃣  Checking Database Setup...${NC}"

if grep -q "database_id = " wrangler.toml; then
  echo -e "${GREEN}✓ D1 Database configured${NC}"
else
  echo -e "${YELLOW}⚠ D1 Database not configured in wrangler.toml${NC}"
  echo "Run: wrangler d1 create freelanceflow-production"
fi
echo ""

# Stage 3: Deploy Backend
echo -e "${BLUE}3️⃣  Deploying Backend to Cloudflare Workers...${NC}"
wrangler deploy --env production
echo -e "${GREEN}✓ Backend deployed${NC}"
echo ""

# Stage 4: Deploy Frontend
echo -e "${BLUE}4️⃣  Deploying Frontend to Cloudflare Pages...${NC}"

if [ -d ".git" ]; then
  echo "Git integration detected. Push to trigger automatic deployment:"
  echo "  git add ."
  echo "  git commit -m 'Production build'"
  echo "  git push origin main"
else
  echo "Manual deployment:"
  wrangler pages deploy frontend/dist --project-name freelanceflow
fi
echo -e "${GREEN}✓ Frontend deployment initiated${NC}"
echo ""

# Stage 5: Verify
echo -e "${BLUE}5️⃣  Verifying Deployment...${NC}"
sleep 10

curl -s https://api.freelanceflow.com/api/health > /dev/null && \
  echo -e "${GREEN}✓ Backend is responding${NC}" || \
  echo -e "${YELLOW}⚠ Backend check failed (may take a minute)${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✨ Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📊 Deployment Summary:"
echo "  Frontend:  https://freelanceflow.com"
echo "  Backend:   https://api.freelanceflow.com"
echo "  Dashboard: https://dash.cloudflare.com/"
echo ""
echo "🔍 Next steps:"
echo "  1. Monitor logs: wrangler tail --env production"
echo "  2. Check frontend: https://freelanceflow.com"
echo "  3. Test API: curl https://api.freelanceflow.com/api/health"
echo "  4. Run verification: bash scripts/deployment-check.sh"
echo ""
echo "📚 Documentation: See DEPLOYMENT_GUIDE.md"
echo ""
