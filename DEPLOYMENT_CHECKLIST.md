# 🚀 Deployment Checklist - FreelanceFlow

## Pre-Deployment (One-Time Setup)

### Infrastructure Setup
- [ ] Create Cloudflare Pages project named `freelanceflow`
  - Command: `npx wrangler pages project create freelanceflow`
- [ ] Verify Cloudflare account ID: `b75373d33ed51fe68bd4f29032140bb8`
- [ ] Create Cloudflare API Token with Zones Edit + Workers Edit permissions

### GitHub Setup
- [ ] Go to: `https://github.com/Adithyaa-Kumar/Freelance-db/settings/secrets/actions`
- [ ] Add secret: `CLOUDFLARE_API_TOKEN` = (your API token)
- [ ] Add secret: `CLOUDFLARE_ACCOUNT_ID` = `b75373d33ed51fe68bd4f29032140bb8`

### Backend Configuration
- [ ] Set production JWT secret:
  ```bash
  wrangler secret put JWT_SECRET --env production
  ```
  - When prompted, enter a strong random string (min 32 chars)
  - Example: `your-super-secret-jwt-key-at-least-32-characters-long`

- [ ] (Optional) Set database URL if using D1:
  ```bash
  wrangler secret put DATABASE_URL --env production
  ```

### Deployment Files
- [ ] ✅ `.github/workflows/deploy-workers.yml` - Backend auto-deploy
- [ ] ✅ `.github/workflows/deploy-pages.yml` - Frontend auto-deploy
- [ ] ✅ `scripts/deploy.sh` - Manual deployment script
- [ ] ✅ `scripts/setup-deployment.sh` - Setup helper (Linux/macOS)
- [ ] ✅ `scripts/setup-deployment.ps1` - Setup helper (Windows)
- [ ] ✅ `DEPLOYMENT_SETUP.md` - Detailed deployment guide
- [ ] ✅ `wrangler.toml` - Cloudflare configuration

---

## Initial Deployment (First Time)

### Option A: Automated Setup (Recommended)

**Windows (PowerShell):**
```powershell
cd c:\FreelanceFlow
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\scripts\setup-deployment.ps1
```

**macOS/Linux (Bash):**
```bash
cd ~/FreelanceFlow
bash scripts/setup-deployment.sh
```

### Option B: Manual Deployment

```bash
# Build frontend
npm run build:frontend

# Deploy backend
wrangler deploy --env production

# Deploy frontend
npx wrangler pages deploy frontend/dist --project-name freelanceflow
```

---

## Ongoing Deployment (Automatic)

### How It Works

Every time you push to `main` branch:

1. ✅ GitHub Actions detects changes
2. ✅ Runs `deploy-workers.yml` for backend changes (if `backend/**` modified)
3. ✅ Runs `deploy-pages.yml` for frontend changes (if `frontend/**` modified)
4. ✅ Automatically deploys to Cloudflare
5. ✅ Verifies deployment success

### To Deploy Changes

```bash
# Make your changes
# ... edit files ...

# Commit and push
git add .
git commit -m "Your change description"
git push origin main
```

Then watch it deploy automatically!

---

## Deployment Verification

### Test URLs

- **Frontend:** https://freelanceflow.pages.dev
- **Backend:** https://freelanceflow-api.adithyaa-kumar.workers.dev
- **Health Check:** https://freelanceflow-api.adithyaa-kumar.workers.dev/api/health

### Manual Verification

```bash
# Test backend is responding
curl https://freelanceflow-api.adithyaa-kumar.workers.dev/api/health

# View real-time logs
wrangler tail --env production

# Check deployment status
# GitHub Actions: https://github.com/Adithyaa-Kumar/Freelance-db/actions
# Cloudflare: https://dash.cloudflare.com
```

---

## Monitoring & Logs

### GitHub Actions Dashboard
- URL: `https://github.com/Adithyaa-Kumar/Freelance-db/actions`
- Shows: Real-time deployment logs, success/failure status, error details

### Cloudflare Dashboard
- **Workers:** `https://dash.cloudflare.com/?to=/:account/workers`
  - View: Active workers, recent deployments, usage analytics
  - Action: View logs, rollback deployments

- **Pages:** `https://dash.cloudflare.com/?to=/:account/pages/view`
  - View: Active deployments, build history, analytics
  - Action: View build logs, rollback to previous version

### Realtime Logs
```bash
# Show last 100 logs
wrangler tail --env production

# Stream logs in real-time
wrangler tail --env production

# Filter specific routes
wrangler tail --env production --format json | grep "api/health"
```

---

## Troubleshooting

### Deployment Failed in GitHub Actions

**Steps to debug:**
1. Go to: `https://github.com/Adithyaa-Kumar/Freelance-db/actions`
2. Click the failed workflow
3. Expand failed step
4. Read error message

**Common Fixes:**

| Error | Solution |
|-------|----------|
| `CLOUDFLARE_API_TOKEN not found` | Add GitHub Secret: `CLOUDFLARE_API_TOKEN` |
| `CLOUDFLARE_ACCOUNT_ID not found` | Add GitHub Secret: `CLOUDFLARE_ACCOUNT_ID` |
| `Pages project not found` | Run: `npx wrangler pages project create freelanceflow` |
| `JWT_SECRET not configured` | Run: `wrangler secret put JWT_SECRET --env production` |
| `Build failed` | Check if `npm run build:frontend` works locally |

### API Not Responding

```bash
# Check if worker is deployed
wrangler list --env production

# View logs for errors
wrangler tail --env production

# Redeploy if issues persist
wrangler deploy --env production
```

### Frontend Not Loading

1. Check Cloudflare Pages deployment:
   - Go to: `https://dash.cloudflare.com/?to=/:account/pages/view`
   - Click project `freelanceflow`
   - Check if latest deployment shows "Success"

2. If failed, check build logs:
   - Click the failed deployment
   - Expand "Build" section
   - Read error details

---

## Rollback (Revert to Previous Version)

### Workers (Backend)
```bash
# View deployment history
wrangler deployments list --env production

# Rollback in dashboard:
# 1. Go: https://dash.cloudflare.com/?to=/:account/workers
# 2. Click: freelanceflow-api-production
# 3. Click: Deployments
# 4. Click desired deployment
# 5. Click: Rollback
```

### Pages (Frontend)
```bash
# Rollback in dashboard:
# 1. Go: https://dash.cloudflare.com/?to=/:account/pages/view
# 2. Click: freelanceflow
# 3. Click: Deployments
# 4. Click desired deployment
# 5. Click: Rollback
```

---

## Environment Status

### Current Configuration

| Setting | Value | Status |
|---------|-------|--------|
| **Frontend Project** | `freelanceflow` | ✅ Created |
| **Backend Worker** | `freelanceflow-api-production` | ✅ Configured |
| **Account ID** | `b75373d33ed51fe68bd4f29032140bb8` | ✅ Set |
| **Pages URL** | `https://freelanceflow.pages.dev` | ✅ Active |
| **Workers URL** | `https://freelanceflow-api.adithyaa-kumar.workers.dev` | ✅ Active |
| **GitHub Secrets** | CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID | ⏳ Pending |
| **JWT_SECRET** | (Production) | ⏳ Pending |

### Required GitHub Secrets

```yaml
CLOUDFLARE_API_TOKEN: <your-api-token>
CLOUDFLARE_ACCOUNT_ID: b75373d33ed51fe68bd4f29032140bb8
```

---

## Quick Reference Commands

```bash
# Setup (one-time)
wrangler secret put JWT_SECRET --env production

# Build
npm run build:frontend
npm run build:backend

# Deploy
npm run deploy                                          # Deploy both
wrangler deploy --env production                        # Backend only
npx wrangler pages deploy frontend/dist --project-name freelanceflow  # Frontend only

# Monitor
wrangler tail --env production                          # View logs

# Verify
curl https://freelanceflow-api.adithyaa-kumar.workers.dev/api/health

# List deployments
wrangler deployments list --env production
```

---

## Support

For detailed information, see:
- `DEPLOYMENT_SETUP.md` - Complete deployment guide
- `.github/workflows/` - GitHub Actions workflows
- `wrangler.toml` - Cloudflare configuration

---

✅ **Go Live Checklist:**
1. ✅ GitHub Secrets configured
2. ✅ JWT_SECRET set
3. ✅ Initial deployment done
4. ✅ Health check passing
5. ✅ Frontend loading
6. ✅ Ready for auto-deployment!

🎉 **New deployments will happen automatically when you push to `main`!**
