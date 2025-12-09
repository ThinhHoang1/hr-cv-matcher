# 🚀 Quick Start - Deployment Guide

## 📋 Prerequisite Checklist

Before deploying, make sure you have:

- [ ] GitHub account
- [ ] Vercel account (sign up with GitHub)
- [ ] Render account (sign up with GitHub)
- [ ] Supabase project đã setup (database + storage + auth)
- [ ] Gemini API key
- [ ] N8N webhooks (optional, có thể skip tạm thời)

---

## ⚡ 5-Minute Deploy (Quickest Path)

### Step 1: Push to GitHub (2 phút)

```bash
# Tại thư mục gốc CV_HR_project
git init
git add .
git commit -m "Initial deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/cv-hr-project.git
git push -u origin main
```

### Step 2: Deploy Backend to Render (2 phút)

1. Vào [render.com](https://render.com) → Login với GitHub
2. **New** → **Web Service**
3. Chọn repo `cv-hr-project`
4. **Root Directory**: `backend`
5. **Build Command**: `npm install && npm run build`
6. **Start Command**: `npm start`
7. Click **Create Web Service**
8. **Environment** tab → Add variables:
   ```
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   GEMINI_API_KEY=your-gemini-key
   PORT=4000
   FRONTEND_URL=https://will-update-later.vercel.app
   ```
9. Copy backend URL (e.g., `https://cv-hr-backend.onrender.com`)

### Step 3: Deploy Frontend to Vercel (1 phút)

1. Vào [vercel.com](https://vercel.com) → Login với GitHub
2. **Add New** → **Project**
3. Import `cv-hr-project`
4. **Root Directory**: `frontend`
5. Click **Deploy**
6. Sau khi deploy xong, vào **Settings** → **Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_BACKEND_URL=https://cv-hr-backend.onrender.com
   ```
7. **Deployments** → Redeploy latest

### Step 4: Update CORS (30 giây)

1. Copy Vercel URL (e.g., `https://cv-hr-hoang.vercel.app`)
2. Mở `backend/src/index.ts`
3. Tìm dòng `'https://cv-hr-project-frontend.vercel.app'`
4. Thay bằng Vercel URL của bạn
5. Commit & push:
   ```bash
   git add backend/src/index.ts
   git commit -m "Update CORS"
   git push
   ```
6. Quay lại Render → Đợi auto-redeploy (~2 phút)

### Step 5: Update Backend URL trong Render (30 giây)

1. Quay lại Render Dashboard
2. Vào Environment tab
3. Update `FRONTEND_URL` với Vercel URL thật
4. Click **Save Changes** → Auto-redeploy

---

## ✅ Verification

### Test 1: Health Check
```bash
curl https://your-backend.onrender.com/
# Expected: "CV HR Backend is running"
```

### Test 2: Frontend Access
1. Mở `https://your-app.vercel.app`
2. Login với Supabase Auth
3. Upload một CV test
4. Search candidates
5. View CV trong modal

### Test 3: Security Check
```bash
# Should return 401 Unauthorized
curl https://your-backend.onrender.com/api/search-candidates
```

---

## 🎯 Production URLs

After deployment, you will have:

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://cv-hr-backend.onrender.com`
- **Supabase**: `https://xxxxx.supabase.co`

Update these in your documentation and share with team!

---

## 🔄 Future Updates

Mỗi khi có code mới:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

→ Vercel & Render sẽ **tự động deploy** trong 2-3 phút!

---

## 🚨 Troubleshooting

### Backend không start được
1. Check Render logs: Dashboard → Your Service → Logs
2. Verify env vars đã set đúng
3. Thử manual redeploy: Dashboard → Manual Deploy

### Frontend build failed
1. Check Vercel logs: Dashboard → Deployments → Click failed deployment
2. Verify env vars đã set (nhớ NEXT_PUBLIC_ prefix)
3. Test build locally: `cd frontend && npm run build`

### CORS error khi call API
1. Verify backend `allowedOrigins` có frontend URL
2. Check frontend `.env.local` có `NEXT_PUBLIC_BACKEND_URL` đúng
3. Clear browser cache

---

## 📚 Full Documentation

Chi tiết hơn xem:
- `DEPLOYMENT.md` - Comprehensive deployment guide
- `SECURITY.md` - Security checklist
- `.github/workflows/` - CI/CD configs

---

Good luck! 🚀
