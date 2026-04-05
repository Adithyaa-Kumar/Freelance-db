# ⚡ Cloudflare Auto-Deployment Setup

FreelanceFlow is now configured for **automatic deployment** to Cloudflare using GitHub Actions.

---

## 🚀 One-Time Setup (2 minutes)

### Step 1: Set GitHub Secrets

Go to: `https://github.com/Adithyaa-Kumar/Freelance-db/settings/secrets/actions`

Add these secrets:

| Secret Name | Value | Where to Get |
|------------|-------|--------------|
| `CLOUDFLARE_API_TOKEN` | Your Cloudflare API Token | [Cloudflare Dashboard → API Tokens](https://dash.cloudflare.com/profile/api-tokens) |
| `CLOUDFLARE_ACCOUNT_ID` | `b75373d33ed51fe68bd4f29032140bb8` | [Already in wrangler.toml](wrangler.toml#L3) |

#### Create Cloudflare API Token:
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token**
3. Use template: **Edit Cloudflare Workers**
4. Permissions needed:
   - ✅ Cloudflare Workers Scripts & Routes (Edit)
   - ✅ Cloudflare Pages (Edit)
5. Copy token and add to GitHub Secrets

### Step 2: Create Pages Project (if not exists)

```bash
# One-time setup
npx wrangler pages project create freelanceflow
```

Or manually:
1. Go to [Cloudflare Dashboard → Pages](https://dash.cloudflare.com/?to=/:account/pages/view)
2. Click **Create a project**
3. Name: `freelanceflow`
4. Deployment type: **Direct upload** (we'll use CI/CD)

### Step 3: Set Production JWT Secret

```bash
wrangler secret put JWT_SECRET --env production
# Enter your secure JWT secret when prompted
```

---

## 🔄 How Auto-Deployment Works

### GitHub Actions Workflows

Two workflows trigger automatically when you push to `main`:

#### 1. **Deploy Workers Backend** (`.github/workflows/deploy-workers.yml`)
- **Triggers on:** Push to `backend/**` or `wrangler.toml`
- **Deploys to:** Cloudflare Workers (`freelanceflow-api-*`)
- **URL:** `https://freelanceflow-api.adithyaa-kumar.workers.dev`
- **Time:** ~1-2 minutes

#### 2. **Deploy Pages Frontend** (`.github/workflows/deploy-pages.yml`)
- **Triggers on:** Push to `frontend/**`
- **Deploys to:** Cloudflare Pages (`freelanceflow`)
- **URL:** `https://freelanceflow.pages.dev`
- **Time:** ~2-3 minutes

### Deployment Flow

```
git push main
    ↓
GitHub detects changes
    ↓
GitHub Actions workflow starts
    ↓
Backend changes? → Deploy to Workers
Frontend changes? → Deploy to Pages
    ↓
Automatic verification
    ↓
✅ Deployed!
```

---

## 📱 Deployment URLs

| Component | URL | Auto-Deploy |
|-----------|-----|------------|
| Frontend | `https://freelanceflow.pages.dev` | ✅ Yes |
| Backend API | `https://freelanceflow-api.adithyaa-kumar.workers.dev` | ✅ Yes |
| API Health Check | `https://freelanceflow-api.adithyaa-kumar.workers.dev/api/health` | ✅ Auto-verified |

---

## 📊 Manual Deployment (if needed)

### Deploy Everything

```bash
bash scripts/deploy.sh
```

### Deploy Only Backend

```bash
npm run build:backend
wrangler deploy --env production
```

### Deploy Only Frontend

```bash
npm run build:frontend
npx wrangler pages deploy frontend/dist --project-name freelanceflow
```

---

## 🔍 Monitor Deployments

### GitHub Actions Dashboard
1. Go to: `https://github.com/Adithyaa-Kumar/Freelance-db/actions`
2. View real-time deployment logs
3. See success/failure status

### Cloudflare Dashboard
- **Workers:** [dash.cloudflare.com → Workers](https://dash.cloudflare.com/?to=/:account/workers)
- **Pages:** [dash.cloudflare.com → Pages](https://dash.cloudflare.com/?to=/:account/pages/view)

### View Logs

```bash
# Backend logs (real-time)
wrangler tail --env production

# See last 100 logs
wrangler tail --env production --lines 100
```

---

## ✅ Verify Deployment Success

### Test Backend API

```bash
curl https://freelanceflow-api.adithyaa-kumar.workers.dev/api/health
# Response: {"status":"ok","timestamp":"..."}
```

### Test Frontend

```bash
curl https://freelanceflow.pages.dev
# Response: HTML content (checks if pages loaded)
```

### Full Integration Test

```bash
# 1. Check backend health
curl https://freelanceflow-api.adithyaa-kumar.workers.dev/api/health

# 2. Check frontend loads
curl -s https://freelanceflow.pages.dev | grep -o "<title>.*</title>"

# 3. Everything working?
echo "✅ Deployment verified!"
```

---

## 🆘 Troubleshooting

### Deployment Failed?

**Check GitHub Actions logs:**
1. Go to Actions tab
2. Click the failed workflow
3. Expand steps to see error messages

**Common Issues:**

| Error | Solution |
|-------|----------|
| `CLOUDFLARE_API_TOKEN not found` | Add secret to GitHub Settings → Secrets |
| `freelanceflow project not found` | Run: `npx wrangler pages project create freelanceflow` |
| `JWT_SECRET not set` | Run: `wrangler secret put JWT_SECRET --env production` |
| `Build failed` | Check `npm run build:frontend` runs locally without errors |

### Rollback to Previous Version

```bash
# Check deployment history in Cloudflare
# Pages: Dashboard → Pages → freelanceflow → Deployments
# Workers: Dashboard → Workers → freelanceflow-api-production → Deployments
```

Click **Rollback** or redeploy a specific commit.

---

## 🎯 Next Steps

1. ✅ Add GitHub Secrets (CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID)
2. ✅ Set JWT_SECRET: `wrangler secret put JWT_SECRET --env production`
3. ✅ Make changes to code
4. ✅ Push to main: `git push origin main`
5. ✅ Watch deployment in GitHub Actions
6. ✅ Verify at deployment URLs

---

## 📝 Environment Variables

### Frontend Environment Variables

Automatically set during build:

```env
VITE_API_BASE_URL=https://freelanceflow-api.adithyaa-kumar.workers.dev
VITE_ENVIRONMENT=production
```

### Backend Environment Variables

Set in `wrangler.toml` or via secrets:

```toml
[env.production.vars]
ENVIRONMENT = "production"
CORS_ORIGIN = "https://freelanceflow.pages.dev"
JWT_EXPIRE = "7d"
```

### Set Production Secrets

```bash
# JWT Secret (required for authentication)
wrangler secret put JWT_SECRET --env production

# Database URL (if using D1 database)
wrangler secret put DATABASE_URL --env production
```

---

## 🔒 Security Best Practices

✅ **Doing right:**
- Secrets stored in GitHub Actions Secrets (encrypted)
- `wrangler.toml` doesn't contain sensitive data
- API tokens scoped to specific permissions
- Production environment separated

✅ **Keep doing:**
- Never commit `.secret` files
- Rotate API tokens regularly
- Use different tokens per environment
- Review GitHub Access logs monthly

---

## 📚 Additional Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

## ✨ Ready to Deploy?

```bash
git add .
git commit -m "Setup auto-deployment"
git push origin main
```

Your deployment will start automatically! 🚀
