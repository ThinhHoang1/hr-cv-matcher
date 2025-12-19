# 🚀 CI/CD & Deployment Plan

## 📋 Overview

### Unified Architecture (Next.js Serverless)

The architecture has evolved to a **Unified Serverless Architecture**. The separate Express backend has been migrated to **Next.js API Routes / Server Actions**. This simplifies deployment and maintenance.

### Tech Stack & Deployment Platforms

| Component | Technology | Deploy To | Cost |
|-----------|-----------|-----------|------|
| **Full Stack App** | Next.js 14 (App + API) | **Vercel** _(or Docker)_ | Free (Hobby) |
| **Database** | Supabase (PostgreSQL + Storage) | Supabase Cloud | Free (Starter) |
| **AI Workflows** | n8n (Webhooks) | Self-hosted / Cloud | Various |
| **CI/CD** | GitHub Actions | GitHub | Free |

---

## 🎯 Deployment Strategy

### 1. **Vercel (Full Stack)**
- ✅ Serves Frontend UI
- ✅ Handles API Routes (`/api/process-cv`, etc.)
- ✅ Runs Server-Side Logic (CV Parsing, AI interactions)
- ✅ Zero-config deployment
- ✅ Automatic HTTPS & Global CDN

### 2. **Supabase (Backend as a Service)**
- ✅ PostgreSQL Database with Vector extension
- ✅ Authentication & Authorization
- ✅ File Storage (CVs)

### 3. **N8N (Automation)**
- ✅ Handles heavy background workflows (optional offloading)
- ✅ Integrates with external services

---

## 📝 Step-by-Step Deployment Guide

### Phase 1: Preparation (5 mins)

#### 1.1. Push Code to GitHub
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

#### 1.2. Verify Environment Variables
Ensure you have all necessary keys. Note that because Next.js handles the backend logic, **Server-Side keys (like Service Role)** will be set in Vercel but **NOT** prefixed with `NEXT_PUBLIC_`.

---

### Phase 2: Deploy to Vercel (5-10 mins)

#### 2.1. Create Vercel Account
1. Go to [https://vercel.com](https://vercel.com)
2. Sign up/Login with GitHub.

#### 2.2. Import Project
1. Dashboard → **Add New** → **Project**
2. Import Repository: `hr-cv-matcher` (or your repo name)
3. **Framework Preset**: Next.js
4. **Root Directory**: `frontend` (Important! Select the `frontend` folder)
5. **Build Command**: `next build` (default)

#### 2.3. Configure Environment Variables
In the Vercel Project Settings, add the following.

**Client-Side (Public):**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh... (Your Anon Key)
```

**Server-Side (Private - for API Routes):**
These are safe in Next.js API Routes but MUST NOT be exposed to the browser.
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJh... (Your Service Role Key)
GEMINI_API_KEY=AIza... (Your Google Gemini Key)
N8N_WEBHOOK_UPLOAD=https://your-n8n.com/webhook/...
N8N_WEBHOOK_SEARCH=https://your-n8n.com/webhook/...
N8N_WEBHOOK_SEND_MAIL=https://your-n8n.com/webhook/...
```

#### 2.4. Deploy
- Click **Deploy**.
- Wait for the build to complete.
- Visit your new URL (e.g., `https://hr-cv-matcher.vercel.app`).

---

### Phase 3: Docker Deployment (Alternative - Self Hosted)

If you prefer to host on a VPS or your own server using Docker.

#### 3.1. Build & Run
Ensure you are in the root directory.

```bash
docker-compose up -d --build
```

This uses the `docker-compose.yml` which builds the `frontend` directory (containing the full app + api).

#### 3.2. Env File for Docker
Create a `.env` file in `frontend/` (or map it in docker-compose) with **ALL** the variables listed in Phase 2.3.

---

## 🧪 Testing Production

### Checklist
- [ ] **Access**: Navigate to the deployed URL.
- [ ] **Auth**: Sign up / Log in via Supabase.
- [ ] **Upload**: Upload a CV. This hits `/api/process-cv`. Check logs in Vercel Dashboard if it fails.
- [ ] **Search**: Run a candidate search. This hits `/api/search-candidates`.
- [ ] **Email**: Try sending an invite.

---

## 💰 Cost Estimation

### Free Tier (MVP)
- **Vercel**: Free (Serverless function limits apply).
- **Supabase**: Free (500MB DB).
- **N8N**: Self-hosted (Free on own server) or Cloud Trial.
- **Total**: $0 - $5/month (depending on N8N hosting)

### Scaled
- **Vercel Pro**: $20/month.
- **Supabase Pro**: $25/month.
- **Total**: ~$45/month.

---

## 🚨 Common Issues

### 1. API Route Timeouts (Vercel)
**Issue:** "Task timed out" on `/api/process-cv`.
**Reason:** Parsing large PDFs or AI processing takes > 10s (Vercel Hobby limit).
**Solution:**
- Use `export const maxDuration = 60;` in your route (requires Pro).
- Or offload heavy processing to N8N (asynchronously).

### 2. Missing Environment Variables
**Issue:** 500 Error referencing `process.env.GEMINI_API_KEY` being undefined.
**Solution:** Check Vercel Project Settings > Environment Variables. Ensure you added the **Server-Side** keys properly.

### 3. PDF Parsing Errors
**Issue:** `pdf-parse` fails availability in Vercel/Lambda environment.
**Solution:** Ensure `runtime = 'nodejs'` is set in the route segment config (we have added this).
