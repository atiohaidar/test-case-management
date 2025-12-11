# Railway Deployment Guide

This guide explains how to deploy the Test Case Management System to Railway.

## Overview

This application consists of four services:
1. **Frontend** - React + Vite (served via Nginx)
2. **Backend** - NestJS + Prisma
3. **AI Service** - Python FastAPI
4. **Database** - MySQL

## Prerequisites

- Railway account (sign up at [railway.app](https://railway.app))
- GitHub repository connected to Railway
- Gemini API key (get from [Google AI Studio](https://aistudio.google.com/app/apikey))

## Deployment Steps

### Option 1: Deploy All Services (Recommended)

Railway supports monorepo deployments, so you can deploy all services from a single repository.

#### Step 1: Create a New Project on Railway

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose this repository

#### Step 2: Add MySQL Database

1. In your Railway project, click "New"
2. Select "Database" → "Add MySQL"
3. Railway will create a MySQL instance and provide a `DATABASE_URL` environment variable

#### Step 3: Deploy AI Service

1. Click "New" → "GitHub Repo" → select this repository
2. Configure the service:
   - **Name**: `ai-service`
   - **Root Directory**: `/ai`
   - **Build Command**: (uses nixpacks.toml automatically)
   - **Start Command**: (uses nixpacks.toml automatically)
3. Add environment variables:
   - `GEMINI_API_KEY`: Your Gemini API key
   - `DB_HOST`: Reference MySQL service (use Railway's internal URL)
   - `DB_PORT`: `3306`
   - `DB_USERNAME`: Reference MySQL username
   - `DB_PASSWORD`: Reference MySQL password
   - `DB_DATABASE`: Reference MySQL database name
   - `HOST`: `0.0.0.0`
   
   **Note**: Railway can automatically reference environment variables from other services using the syntax: `${{MySQL.MYSQL_URL}}` or similar.

#### Step 4: Deploy Backend

1. Click "New" → "GitHub Repo" → select this repository
2. Configure the service:
   - **Name**: `backend`
   - **Root Directory**: `/backend`
   - **Build Command**: (uses nixpacks.toml automatically)
   - **Start Command**: (uses nixpacks.toml automatically)
3. Add environment variables:
   - `DATABASE_URL`: Reference MySQL connection string (e.g., `${{MySQL.DATABASE_URL}}`)
   - `AI_SERVICE_URL`: Reference AI service internal URL (e.g., `http://ai-service.railway.internal:8000`)
   - `NODE_ENV`: `production`
   - `PORT`: Railway will set this automatically

#### Step 5: Deploy Frontend

1. Click "New" → "GitHub Repo" → select this repository
2. Configure the service:
   - **Name**: `frontend`
   - **Root Directory**: `/frontend`
   - **Build Command**: (uses nixpacks.toml automatically)
   - **Start Command**: (uses nixpacks.toml automatically)
3. Update frontend environment/configuration to point to backend:
   - You may need to set the backend API URL in the frontend code
   - Railway will provide a public URL for the backend service

#### Step 6: Configure Service Relationships

Railway services can communicate with each other using internal URLs:
- Format: `<service-name>.railway.internal:<port>`
- Example: `http://backend.railway.internal:3000`

Update environment variables to use these internal URLs:
- Backend → AI Service: `AI_SERVICE_URL=http://ai-service.railway.internal:8000`
- Frontend → Backend: Update your frontend config to use the backend's public URL

#### Step 7: Enable Public Networking

For services that need to be accessed publicly:
1. Go to service settings
2. Click "Networking" tab
3. Click "Generate Domain" to get a public URL

Enable for:
- ✅ Frontend (users access this)
- ✅ Backend (if frontend needs to access it directly)
- ❌ AI Service (only accessed by backend, can stay internal)
- ❌ MySQL (should never be public)

### Option 2: Deploy Using Railway CLI

1. Install Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Create a new project:
   ```bash
   railway init
   ```

4. Link to existing project (if you created one in the dashboard):
   ```bash
   railway link
   ```

5. Deploy individual services:
   ```bash
   # Deploy backend
   cd backend
   railway up
   
   # Deploy ai service
   cd ../ai
   railway up
   
   # Deploy frontend
   cd ../frontend
   railway up
   ```

## Environment Variables Reference

### Backend Service
```
DATABASE_URL=mysql://user:password@host:3306/database
AI_SERVICE_URL=http://ai-service.railway.internal:8000
NODE_ENV=production
PORT=3000  # Railway sets this automatically
```

### AI Service
```
GEMINI_API_KEY=your_gemini_api_key_here
DB_HOST=mysql.railway.internal
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=railway
HOST=0.0.0.0
PORT=8000  # Railway sets this automatically
```

### Frontend Service
```
# Usually set during build time or in vite.config.ts
VITE_API_URL=https://your-backend.railway.app
```

## Configuration Files

The following configuration files have been added to support Railway deployment:

1. **`backend/nixpacks.toml`** - Build and deployment config for NestJS backend
2. **`ai/nixpacks.toml`** - Build and deployment config for Python AI service
3. **`frontend/nixpacks.toml`** - Build and deployment config for React frontend
4. **`railway.toml`** - Root-level Railway configuration (optional)

## Health Checks

Each service exposes health check endpoints:
- **Backend**: `GET /health` or `GET /monitoring/health`
- **AI Service**: `GET /health`
- **Frontend**: Root path `/` (served by Nginx)

Railway will automatically monitor these endpoints.

## Monitoring and Logs

1. View logs in Railway dashboard:
   - Go to your service
   - Click "Deployments" tab
   - Select a deployment to view logs

2. View metrics:
   - Railway provides basic metrics for CPU, memory, and network usage
   - Backend also exposes Prometheus metrics at `/monitoring/metrics`

## Database Migrations

The backend automatically runs Prisma migrations on startup:
- Command: `npx prisma db push --accept-data-loss`
- This is configured in the `nixpacks.toml` start command

**Note**: For production, you may want to run migrations separately before deployment.

## Troubleshooting

### Service Won't Start
- Check logs in Railway dashboard
- Verify all environment variables are set correctly
- Ensure services are deployed in order: MySQL → AI → Backend → Frontend

### Database Connection Issues
- Verify `DATABASE_URL` is correctly formatted
- Check that MySQL service is running
- Ensure backend has access to MySQL (should be automatic in Railway)

### AI Service Connection Issues
- Verify `AI_SERVICE_URL` in backend points to correct internal URL
- Check that AI service is running and healthy
- Verify `GEMINI_API_KEY` is set in AI service

### Frontend Can't Connect to Backend
- Verify backend API URL is correctly configured in frontend
- Check that backend has public networking enabled
- Verify CORS is enabled in backend (already configured)

## Cost Optimization

Railway offers:
- **Hobby Plan**: $5/month with $5 usage included
- **Pro Plan**: $20/month with $20 usage included

Tips to reduce costs:
1. Use Railway's sleep feature for non-production environments
2. Optimize resource usage (Railway charges based on usage)
3. Use internal networking between services (no egress charges)
4. Monitor usage in Railway dashboard

## Auto-Deploy

Railway automatically deploys your application when you push to your GitHub repository:

1. **Automatic**: Push to your connected branch (e.g., `main`)
2. **Manual**: Click "Deploy" in Railway dashboard

Configure auto-deploy settings:
- Go to service settings → "Deploy" tab
- Enable/disable auto-deploy
- Configure branch and deploy conditions

## Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Railway Templates](https://railway.app/templates)
- [Railway Discord Community](https://discord.gg/railway)
- [Nixpacks Documentation](https://nixpacks.com/)

## Support

If you encounter issues:
1. Check Railway logs first
2. Review this guide
3. Check Railway documentation
4. Ask in Railway Discord community
5. Open an issue in this repository
