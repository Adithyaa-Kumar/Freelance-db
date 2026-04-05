# FreelanceFlow Cloudflare Deployment Setup
# PowerShell Script - Windows

Write-Host "🚀 FreelanceFlow Cloudflare Auto-Deployment Setup" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Check if wrangler is installed
Write-Host "✓ Checking prerequisites..." -ForegroundColor Blue
if (-not (Get-Command wrangler -ErrorAction SilentlyContinue)) {
    Write-Host "❌ wrangler not found. Install with:" -ForegroundColor Red
    Write-Host "   npm install -g wrangler" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ wrangler installed" -ForegroundColor Green
Write-Host ""

# Step 1: Verify Cloudflare credentials
Write-Host "STEP 1: Verify Cloudflare Account" -ForegroundColor Blue
Write-Host "-----------------------------------" -ForegroundColor Blue
Write-Host "Account ID: b75373d33ed51fe68bd4f29032140bb8" -ForegroundColor White
Write-Host ""

# Step 2: Create Pages Project
Write-Host "STEP 2: Create Cloudflare Pages Project" -ForegroundColor Blue
Write-Host "---------------------------------------" -ForegroundColor Blue
write-host "Creating Pages project 'freelanceflow'..." -ForegroundColor Yellow

$createPagesResponse = & npx wrangler pages project create freelanceflow 2>&1
if ($LASTEXITCODE -eq 0 -or $createPagesResponse -like "*already exists*") {
    Write-Host "✓ Pages project ready" -ForegroundColor Green
} else {
    Write-Host "Note: Pages project may already exist" -ForegroundColor Yellow
}
Write-Host ""

# Step 3: Set JWT Secret
Write-Host "STEP 3: Set Production JWT Secret" -ForegroundColor Blue
Write-Host "---------------------------------" -ForegroundColor Blue
Write-Host "You need to set the JWT_SECRET for authentication" -ForegroundColor White
Write-Host ""

$setSecret = Read-Host "Do you want to set JWT_SECRET now? (y/n)"
if ($setSecret -eq "y" -or $setSecret -eq "Y") {
    Write-Host "Running: wrangler secret put JWT_SECRET --env production" -ForegroundColor Yellow
    & npx wrangler secret put JWT_SECRET --env production --env production
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ JWT_SECRET set successfully" -ForegroundColor Green
    } else {
        Write-Host "Note: You can set it later with:" -ForegroundColor Yellow
        Write-Host "  wrangler secret put JWT_SECRET --env production" -ForegroundColor Yellow
    }
} else {
    Write-Host "Note: Set JWT_SECRET later with:" -ForegroundColor Yellow
    Write-Host "  wrangler secret put JWT_SECRET --env production" -ForegroundColor Yellow
}
Write-Host ""

# Step 4: Build the project
Write-Host "STEP 4: Build Frontend" -ForegroundColor Blue
Write-Host "----------------------" -ForegroundColor Blue
Write-Host "Building frontend..." -ForegroundColor Yellow
npm run build:frontend
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Frontend built successfully" -ForegroundColor Green
Write-Host ""

# Step 5: Deploy
Write-Host "STEP 5: Initial Deployments" -ForegroundColor Blue
Write-Host "----------------------------" -ForegroundColor Blue

Write-Host "Deploying Backend to Cloudflare Workers..." -ForegroundColor Yellow
& npx wrangler deploy --env production
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend deployment failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Backend deployed" -ForegroundColor Green
Write-Host ""

Write-Host "Deploying Frontend to Cloudflare Pages..." -ForegroundColor Yellow
& npx wrangler pages deploy frontend/dist --project-name freelanceflow
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend deployment failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Frontend deployed" -ForegroundColor Green
Write-Host ""

# Step 6: Summary
Write-Host "✨ Initial Setup Complete!" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Deployment URLs:" -ForegroundColor Cyan
Write-Host "  Frontend:  https://freelanceflow.pages.dev" -ForegroundColor White
Write-Host "  Backend:   https://freelanceflow-api.adithyaa-kumar.workers.dev" -ForegroundColor White
Write-Host "  Health:    https://freelanceflow-api.adithyaa-kumar.workers.dev/api/health" -ForegroundColor White
Write-Host ""
Write-Host "🔄 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Add GitHub Secrets:" -ForegroundColor White
Write-Host "     - CLOUDFLARE_API_TOKEN" -ForegroundColor Yellow
Write-Host "     - CLOUDFLARE_ACCOUNT_ID (b75373d33ed51fe68bd4f29032140bb8)" -ForegroundColor Yellow
Write-Host ""
Write-Host "  2. Push to GitHub to trigger auto-deployment:" -ForegroundColor White
Write-Host "     git add ." -ForegroundColor Yellow
Write-Host "     git commit -m 'Setup auto-deployment'" -ForegroundColor Yellow
Write-Host "     git push origin main" -ForegroundColor Yellow
Write-Host ""
Write-Host "  3. Monitor deployments:" -ForegroundColor White
Write-Host "     - GitHub Actions: https://github.com/Adithyaa-Kumar/Freelance-db/actions" -ForegroundColor Yellow
Write-Host "     - Cloudflare: https://dash.cloudflare.com" -ForegroundColor Yellow
Write-Host ""
Write-Host "  4. View logs:" -ForegroundColor White
Write-Host "     wrangler tail --env production" -ForegroundColor Yellow
Write-Host ""
Write-Host "📚 Full docs: See DEPLOYMENT_SETUP.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 Setup complete! Your auto-deployment is ready." -ForegroundColor Green
