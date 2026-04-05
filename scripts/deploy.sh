#!/bin/bash

# Production Deployment Script for FreelanceFlow
# Deploys to Cloudflare Workers (Backend) and Pages (Frontend)
# Triggered automatically via GitHub Actions on push to main

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

# Stage 1: Install Dependencies
echo -e "${BLUE}1️⃣ Installing dependencies...${NC}"
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Stage 2: Build
echo -e "${BLUE}2️⃣ Building application...${NC}"
npm run build:frontend
echo -e "${GREEN}✓ Frontend built${NC}"
echo ""

# Stage 3: Deploy Backend Workers
echo -e "${BLUE}3️⃣ Deploying Backend to Cloudflare Workers...${NC}"
wrangler deploy --env production
echo -e "${GREEN}✓ Backend deployed to Cloudflare Workers${NC}"
echo ""

# Stage 4: Deploy Frontend Pages
echo -e "${BLUE}4️⃣ Deploying Frontend to Cloudflare Pages...${NC}"
npx wrangler pages deploy frontend/dist --project-name freelanceflow
echo -e "${GREEN}✓ Frontend deployed to Cloudflare Pages${NC}"
echo ""

# Stage 5: Verify
echo -e "${BLUE}5️⃣ Verifying deployment...${NC}"
sleep 5

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✨ Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📊 Deployment URLs:"
echo "  Frontend:  https://freelanceflow.pages.dev"
echo "  Backend:   https://freelanceflow-api.adithyaa-kumar.workers.dev"
echo "  Dashboard: https://dash.cloudflare.com/"
echo ""
echo "🔍 Next steps:"
echo "  1. Monitor logs: wrangler tail --env production"
echo "  2. Check frontend: https://freelanceflow.pages.dev"
echo "  3. Test API: curl https://freelanceflow-api.adithyaa-kumar.workers.dev/api/health"
echo "  4. View deployment logs in GitHub Actions"
echo ""
