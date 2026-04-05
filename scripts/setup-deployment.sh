#!/bin/bash

# FreelanceFlow Cloudflare Deployment Setup
# Bash Script - macOS/Linux

echo "🚀 FreelanceFlow Cloudflare Auto-Deployment Setup"
echo "=================================================="
echo ""

# Check if wrangler is installed
echo "✓ Checking prerequisites..."
if ! command -v wrangler &> /dev/null; then
    echo "❌ wrangler not found. Install with:"
    echo "   npm install -g wrangler"
    exit 1
fi

echo "✓ wrangler installed"
echo ""

# Step 1: Verify Cloudflare credentials
echo "STEP 1: Verify Cloudflare Account"
echo "-----------------------------------"
echo "Account ID: b75373d33ed51fe68bd4f29032140bb8"
echo ""

# Step 2: Create Pages Project
echo "STEP 2: Create Cloudflare Pages Project"
echo "---------------------------------------"
echo "Creating Pages project 'freelanceflow'..."

if npx wrangler pages project create freelanceflow 2>&1 | grep -q "already exists"; then
    echo "✓ Pages project already exists"
else
    npx wrangler pages project create freelanceflow
fi
echo ""

# Step 3: Set JWT Secret
echo "STEP 3: Set Production JWT Secret"
echo "---------------------------------"
echo "You need to set the JWT_SECRET for authentication"
echo ""

read -p "Do you want to set JWT_SECRET now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Running: wrangler secret put JWT_SECRET --env production"
    npx wrangler secret put JWT_SECRET --env production
    if [ $? -eq 0 ]; then
        echo "✓ JWT_SECRET set successfully"
    else
        echo "Note: You can set it later with:"
        echo "  wrangler secret put JWT_SECRET --env production"
    fi
else
    echo "Note: Set JWT_SECRET later with:"
    echo "  wrangler secret put JWT_SECRET --env production"
fi
echo ""

# Step 4: Build the project
echo "STEP 4: Build Frontend"
echo "----------------------"
echo "Building frontend..."
npm run build:frontend
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi
echo "✓ Frontend built successfully"
echo ""

# Step 5: Deploy
echo "STEP 5: Initial Deployments"
echo "----------------------------"

echo "Deploying Backend to Cloudflare Workers..."
npx wrangler deploy --env production
if [ $? -ne 0 ]; then
    echo "❌ Backend deployment failed"
    exit 1
fi
echo "✓ Backend deployed"
echo ""

echo "Deploying Frontend to Cloudflare Pages..."
npx wrangler pages deploy frontend/dist --project-name freelanceflow
if [ $? -ne 0 ]; then
    echo "❌ Frontend deployment failed"
    exit 1
fi
echo "✓ Frontend deployed"
echo ""

# Step 6: Summary
echo "✨ Initial Setup Complete!"
echo "=========================="
echo ""
echo "📊 Deployment URLs:"
echo "  Frontend:  https://freelanceflow.pages.dev"
echo "  Backend:   https://freelanceflow-api.adithyaa-kumar.workers.dev"
echo "  Health:    https://freelanceflow-api.adithyaa-kumar.workers.dev/api/health"
echo ""
echo "🔄 Next Steps:"
echo "  1. Add GitHub Secrets:"
echo "     - CLOUDFLARE_API_TOKEN"
echo "     - CLOUDFLARE_ACCOUNT_ID (b75373d33ed51fe68bd4f29032140bb8)"
echo ""
echo "  2. Push to GitHub to trigger auto-deployment:"
echo "     git add ."
echo "     git commit -m 'Setup auto-deployment'"
echo "     git push origin main"
echo ""
echo "  3. Monitor deployments:"
echo "     - GitHub Actions: https://github.com/Adithyaa-Kumar/Freelance-db/actions"
echo "     - Cloudflare: https://dash.cloudflare.com"
echo ""
echo "  4. View logs:"
echo "     wrangler tail --env production"
echo ""
echo "📚 Full docs: See DEPLOYMENT_SETUP.md"
echo ""
echo "🎉 Setup complete! Your auto-deployment is ready."
