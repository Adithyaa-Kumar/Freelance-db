# FreelanceFlow Setup Guide

## Node.js Version Management

This project requires **Node 20.11.0** LTS for optimal compatibility.

### Using Node Version Manager (nvm)

**For Windows (nvm-windows)**:
```bash
# Install nvm from: https://github.com/coreybutler/nvm-windows/releases
# Then navigate to project root and run:
nvm install 20.11.0
nvm use 20.11.0
```

**For macOS/Linux (nvm)**:
```bash
# Install nvm if not already installed: https://github.com/nvm-sh/nvm
nvm install 20.11.0
nvm use 20.11.0
```

### Verify Node, npm, and npx Installation

```bash
node --version      # Should show v20.11.0
npm --version       # Should show 10.x.x or higher
npx --version       # Should show 10.x.x or higher
```

## Initial Setup

### 1. Install All Dependencies

```bash
# From project root
npm run install:all
```

This runs:
- `npm install` in the frontend/ directory
- `npm install` in the backend/ directory

### 2. Database Setup (Optional - if using local database)

```bash
# Reset Prisma database
npm run db:migrate

# Seed sample data
npm run db:seed
```

## Running on Localhost

### Option 1: Run Both Frontend & Backend Separately (Recommended for Development)

**Terminal 1 - Start Backend (port 5000)**:
```bash
npm run dev:backend
```

**Terminal 2 - Start Frontend (port 5173)**:
```bash
npm run dev:frontend
```

Then open: **http://localhost:5173**

### Option 2: Run as Concurrent Development Servers

If you want to run both simultaneously, you can use `concurrently` (optional setup):

```bash
# Optional: Install concurrently globally or locally
npm install --save-dev concurrently

# Add this script to root package.json:
"dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\""

# Then run:
npm run dev
```

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Database
DATABASE_URL="your_database_url_here"

# JWT
JWT_SECRET="your_secret_key_here"
JWT_EXPIRE="7d"

# Server
PORT=5000
NODE_ENV="development"

# CORS
CORS_ORIGIN="http://localhost:5173"
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `npm: command not found` | Install Node.js 20.11.0 and ensure PATH is set |
| `port 5000 already in use` | Change PORT env var: `PORT=5001 npm run dev:backend` |
| `port 5173 already in use` | Vite will automatically use next available port |
| `database connection error` | Ensure DATABASE_URL is correct in `.env` file |
| `prisma: command not found` | Run `npm run install:all` to install all dependencies |

## Success Indicators

✅ Backend running: `http://localhost:5000` (check GET /health)
✅ Frontend running: `http://localhost:5173`
✅ Console shows no errors
✅ Frontend connects to backend successfully
