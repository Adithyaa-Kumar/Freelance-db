# 🚀 Cloudflare Deployment Guide

Complete guide to deploy FreelanceFlow on Cloudflare Pages (Frontend) and Cloudflare Workers (Backend).

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Frontend Deployment (Pages)](#frontend-deployment-pages)
3. [Backend Deployment (Workers)](#backend-deployment-workers)
4. [Environment Variables](#environment-variables)
5. [Verification](#verification)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- ✅ Cloudflare account (free tier supported)
- ✅ GitHub repository connected: `Adithyaa-Kumar/Freelance-db`
- ✅ Git installed locally
- ✅ Node.js 18+ installed

### Install Required Tools

```bash
# Global installation
npm install -g wrangler
npm install -g cloudflare-cli

# Or local installation in project
npm install -D wrangler
```

---

## Frontend Deployment (Pages)

### Step 1: Connect GitHub to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click **Pages** → **Create project**
3. Select **Connect to Git**
4. Authorize GitHub access
5. Select `Adithyaa-Kumar/Freelance-db`

### Step 2: Configure Build Settings

| Setting | Value |
|---------|-------|
| **Production branch** | `main` |
| **Framework preset** | `None` |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | `frontend` |

### Step 3: Add Environment Variables

In **Settings** → **Environment variables** → **Production**, add:

```
VITE_API_BASE_URL = http://localhost:5000/api        (temp - update after backend deploys)
NODE_VERSION = 18
```

### Step 4: Deploy

Click **Save and deploy**

**Your frontend will be live at:** `https://freelance-db.pages.dev`

---

## Backend Deployment (Workers)

### Step 1: Get Cloudflare Account ID

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Note your **Account ID** (bottom-left)

### Step 2: Update Configuration

Edit `wrangler.toml` in project root:

```toml
name = "freelanceflow-api"
type = "javascript"
account_id = "YOUR_CLOUDFLARE_ACCOUNT_ID"      # ← Paste your Account ID
workers_dev = true
compatibility_date = "2024-01-01"
main = "backend/src/worker.js"

[env.production]
name = "freelanceflow-api-production"

[env.production.vars]
ENVIRONMENT = "production"
CORS_ORIGIN = "https://freelance-db.pages.dev"
JWT_SECRET = "your-secure-production-key"
API_PORT = "8787"

[env.development]
name = "freelanceflow-api-dev"

[env.development.vars]
ENVIRONMENT = "development"
CORS_ORIGIN = "http://localhost:5173"
JWT_SECRET = "dev-key"
API_PORT = "8787"
```

### Step 3: Authenticate with Cloudflare

```bash
npx wrangler login
```

### Step 4: Deploy Backend

```bash
cd backend
npm install
npx wrangler deploy --env production
```

**Output will show:**
```
✓ Deployed to https://freelanceflow-api-production.YOUR_ACCOUNT.workers.dev
```

---

## Environment Variables

### Frontend Variables

**Location:** Cloudflare Pages → Settings → Environment variables

| Variable | Production | Preview |
|----------|------------|---------|
| `VITE_API_BASE_URL` | `https://freelanceflow-api-production.YOUR_ACCOUNT.workers.dev/api` | `http://localhost:5000/api` |
| `NODE_VERSION` | `18` | `18` |

### Backend Variables

**Location:** wrangler.toml or Cloudflare Workers Settings

| Variable | Production | Development |
|----------|------------|-------------|
| `ENVIRONMENT` | `production` | `development` |
| `CORS_ORIGIN` | `https://freelance-db.pages.dev` | `http://localhost:5173` |
| `JWT_SECRET` | Secure key (change this!) | dev-key |
| `API_PORT` | `8787` | `8787` |

---

## Deployment Workflow

### Automated Deployment (Recommended)

1. **Make changes locally**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. **GitHub webhook triggers Cloudflare**
   - Frontend auto-builds and deploys
   - Check Pages dashboard for deployment status

3. **Manual backend deployment**
   ```bash
   cd backend
   npx wrangler deploy --env production
   ```

### Manual Deployment

**Frontend:**
```bash
cd frontend
npm Install
npm run build
# Then manually upload dist/ to Pages via dashboard
```

**Backend:**
```bash
cd backend
npm install
npx wrangler deploy --env production
```

---

## Verification

### Test Frontend

```bash
# Should be accessible
curl https://freelance-db.pages.dev

# Check for 200 status
```

### Test Backend

```bash
# Health check
curl https://freelanceflow-api-production.YOUR_ACCOUNT.workers.dev/api/health

# Expected response
{
  "status": "healthy",
  "environment": "production",
  "services": {
    "api": "operational"
  }
}

# Test login
curl -X POST https://freelanceflow-api-production.YOUR_ACCOUNT.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### View Logs

```bash
# Real-time logs from backend
npx wrangler tail --env production

# Show recent deployments
npx wrangler deployments list --env production
```

---

## Update Frontend Variables After Backend Deploy

Once backend is deployed:

1. Get your Workers URL from deployment output
   - Format: `https://freelanceflow-api-production.YOUR_ACCOUNT.workers.dev`

2. Update Pages environment variables:
   - **VITE_API_BASE_URL** = `https://freelanceflow-api-production.YOUR_ACCOUNT.workers.dev/api`

3. Pages auto-redeploys with new variables

---

## Troubleshooting

### "Root directory not found"

**Frontend:**
- Set Root directory: `frontend`
- Build output directory: `dist`
- NOT: `frontend/dist`

**Backend:**
- Ensure `main = "backend/src/worker.js"` in wrangler.toml
- Run `npx wrangler deploy` from project root

### "Authentication failed"

```bash
# Re-authenticate
npx wrangler logout
npx wrangler login
```

### "CORS errors"

- Update `CORS_ORIGIN` in environment variables
- Match your frontend URL exactly
- Restart deployment

### "Worker not deploying"

```bash
# Clear cache and redeploy
npx wrangler deploy --force --env production

# Check workers are present
npx wrangler list --env production
```

### "Build command fails"

```bash
# Check dependencies are installed
cd frontend
npm install

cd ../backend
npm install

# Try build locally first
npm run build
```

---

## Rollback

### Rollback Frontend

1. Go to Pages → freelance-db → Deployments
2. Find previous successful deployment
3. Click "Rollback to this deployment"

### Rollback Backend

```bash
# View deployment history
npx wrangler deployments list --env production

# Rollback to specific deployment ID
npx wrangler rollback --env production
```

---

## Monitoring

### Performance

- **Pages:** Cloudflare Analytics → Pages
- **Workers:** Cloudflare Analytics → Workers

### Logs

```bash
# Stream logs in real-time
npx wrangler tail --env production --format json

# Export logs
npx wrangler tail --env production > logs.txt
```

### Health Checks

Set up automated health checks:

```bash
# Add to cron job or CI/CD
curl -f https://freelanceflow-api-production.YOUR_ACCOUNT.workers.dev/api/health || exit 1
```

---

## Custom Domain (Optional)

### Connect Custom Domain

1. Add domain to Cloudflare
2. **Pages:** Settings → Custom domains → Add
3. **Workers:** Add route in wrangler.toml:
   ```toml
   [env.production]
   route = "https://api.yourdomain.com/*"
   zone_id = "YOUR_ZONE_ID"
   ```

---

## Security Tips

1. **Never commit secrets**
   - Store JWT_SECRET in environment variables only
   - Use Cloudflare Secret Manager

2. **Enable DDoS protection**
   - Cloudflare Pages: Enabled by default
   - Add WAF rules for Workers

3. **Rate limiting**
   ```toml
   # Add to wrangler.toml
   rate_limit_enabled = true
   ```

4. **HTTPS only**
   - Always redirect HTTP → HTTPS
   - Enabled by default on Cloudflare

---

## Getting Help

- **Cloudflare Docs:** https://developers.cloudflare.com/
- **Pages Docs:** https://developers.cloudflare.com/pages/
- **Workers Docs:** https://developers.cloudflare.com/workers/
- **Discord:** Cloudflare Community

---

## Complete Deployment Checklist

- [ ] GitHub repository connected to Cloudflare Pages
- [ ] Frontend root directory set to `frontend`
- [ ] Frontend build command: `npm run build`
- [ ] Frontend build output: `dist`
- [ ] Backend `wrangler.toml` configured with Account ID
- [ ] Environment variables set (Frontend & Backend)
- [ ] JWT_SECRET changed from default
- [ ] Backend deployed with `npx wrangler deploy`
- [ ] Frontend auto-deployed after backend
- [ ] VITE_API_BASE_URL updated to Workers URL
- [ ] Health check endpoints responding
- [ ] Login functionality working
- [ ] Logs accessible via `wrangler tail`

---

**You're all set! Your FreelanceFlow app is now live on Cloudflare! 🎉**
