# 🚀 CI/CD & Deployment Plan

## 📋 Tổng Quan

### Tech Stack & Deployment Platforms

| Component | Technology | Deploy To | Cost |
|-----------|-----------|-----------|------|
| **Frontend** | Next.js 14 | **Vercel** | Free (Hobby) |
| **Backend** | Express.js + TypeScript | **Render** | Free (Starter) |
| **Database** | Supabase (PostgreSQL + Storage) | Supabase Cloud | Free (Starter) |
| **N8N** | Self-hosted or Cloud | Railway/Render | $5-10/month |
| **CI/CD** | GitHub Actions | GitHub | Free |

---

## 🎯 Deployment Strategy

### 1. **Vercel (Frontend)**
- ✅ Zero-config deployment
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Preview deployments for PRs
- ✅ Environment variables management

### 2. **Render (Backend)**
- ✅ Free tier available
- ✅ Auto-deploy from GitHub
- ✅ Persistent storage
- ✅ Custom domains
- ✅ Environment variables

### 3. **GitHub Actions (CI/CD)**
- ✅ Build & Test on every push
- ✅ Auto-deploy to staging on `develop` branch
- ✅ Auto-deploy to production on `main` branch merge
- ✅ Security scanning (optional)

---

## 📝 Step-by-Step Deployment Guide

### Phase 1: Chuẩn Bị Repository (5 phút)

#### 1.1. Push Code lên GitHub
```bash
# Tại thư mục gốc dự án
git init
git add .
git commit -m "Initial commit - CV HR Project with security features"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/cv-hr-project.git
git push -u origin main

# Tạo branch develop cho staging
git checkout -b develop
git push -u origin develop
```

#### 1.2. Verify `.gitignore`
- Đảm bảo `.env` và `.env.local` **KHÔNG được** commit
- Check bằng: `git status` - không thấy env files

---

### Phase 2: Deploy Backend lên Render (10 phút)

#### 2.1. Tạo Render Account
1. Truy cập [https://render.com](https://render.com)
2. Sign up với GitHub account

#### 2.2. Deploy Backend Service
1. Dashboard → **New** → **Web Service**
2. Connect GitHub repository: `cv-hr-project`
3. **Settings:**
   ```
   Name: cv-hr-backend
   Region: Singapore (gần Việt Nam nhất)
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   Instance Type: Free
   ```

#### 2.3. Environment Variables (Render Dashboard)
Vào **Environment** tab và thêm:
```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
GEMINI_API_KEY=AIzaSyxxx...
N8N_WEBHOOK_UPLOAD=https://your-n8n.com/webhook/cv-upload
N8N_WEBHOOK_SEND_MAIL=https://your-n8n.com/webhook/send-invite
PORT=4000
FRONTEND_URL=https://your-app.vercel.app
NODE_ENV=production
```

#### 2.4. Copy Backend URL
- Sau khi deploy xong, copy URL (ví dụ: `https://cv-hr-backend.onrender.com`)
- Lưu lại để dùng cho Frontend

⚠️ **LƯU Ý**: Free tier Render sẽ sleep sau 15 phút không dùng. Request đầu tiên sẽ mất ~30s để wake up.

---

### Phase 3: Deploy Frontend lên Vercel (5 phút)

#### 3.1. Tạo Vercel Account
1. Truy cập [https://vercel.com](https://vercel.com)
2. Sign up với GitHub account

#### 3.2. Import Project
1. Dashboard → **Add New** → **Project**
2. Import Git Repository: `cv-hr-project`
3. **Framework Preset**: Next.js (tự detect)
4. **Root Directory**: `frontend`
5. Click **Deploy** (đừng lo về env vars, sẽ thêm sau)

#### 3.3. Environment Variables (Vercel Dashboard)
Vào **Settings** → **Environment Variables** và thêm:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx... (ANON KEY - không phải SERVICE ROLE KEY)
NEXT_PUBLIC_BACKEND_URL=https://cv-hr-backend.onrender.com
```

**Apply to:** Production, Preview, Development (check all)

#### 3.4. Redeploy
Sau khi thêm env vars:
- Vào **Deployments** tab
- Chọn deployment mới nhất → **...** → **Redeploy**

---

### Phase 4: Cập Nhật CORS Backend (2 phút)

#### 4.1. Update Code
Mở `backend/src/index.ts`, tìm dòng:
```typescript
const allowedOrigins = [
    'http://localhost:3000',
    process.env.FRONTEND_URL || '',
    'https://cv-hr-project-frontend.vercel.app' // ← Thay bằng domain thật
].filter(Boolean);
```

Thay thế bằng domain Vercel thật của bạn (ví dụ: `https://cv-hr-hoang.vercel.app`)

#### 4.2. Commit & Push
```bash
git add backend/src/index.ts
git commit -m "Update CORS with production frontend URL"
git push origin main
```

Render sẽ tự động redeploy trong ~2 phút.

---

### Phase 5: Setup CI/CD với GitHub Actions (10 phút)

Tôi sẽ tạo workflows cho bạn ở bước tiếp theo...

---

## 🧪 Testing Production

### Frontend Testing Checklist
- [ ] Truy cập `https://your-app.vercel.app`
- [ ] Login với Supabase Auth
- [ ] Upload CV → Kiểm tra file lên Supabase Storage
- [ ] Search candidates → Kiểm tra AI search hoạt động
- [ ] View CV → Kiểm tra modal hiển thị (không lộ Supabase URL)
- [ ] Send invitations → Kiểm tra N8N webhook
- [ ] Generate questions → Kiểm tra Gemini API

### Backend Testing Checklist
- [ ] Health check: `curl https://your-backend.onrender.com/`
- [ ] API protected by auth: `curl https://your-backend.onrender.com/api/search-candidates` → Expect 401
- [ ] Rate limiting: Spam requests → Expect 429

---

## 📊 Monitoring & Logs

### Vercel
- **Logs**: Dashboard → Your Project → Deployments → Click deployment → Logs
- **Analytics**: Dashboard → Your Project → Analytics (nâng cấp lên Pro nếu cần chi tiết)

### Render
- **Logs**: Dashboard → Your Service → Logs tab (live streaming)
- **Metrics**: Dashboard → Your Service → Metrics (CPU, Memory, Request count)

### Supabase
- **Database**: Dashboard → Database → API logs
- **Storage**: Dashboard → Storage → Usage
- **Auth**: Dashboard → Authentication → Users

---

## 🔄 Update Workflow

### Khi có code mới:

```bash
# Development
git checkout develop
git add .
git commit -m "Add new feature"
git push origin develop
# → GitHub Actions sẽ chạy tests
# → Auto deploy lên staging environment (nếu có)

# Production
git checkout main
git merge develop
git push origin main
# → GitHub Actions sẽ chạy tests
# → Auto deploy lên production (Vercel & Render)
```

---

## 💰 Cost Estimation

### Free Tier (Đủ cho MVP/Demo)
- Vercel: Free
- Render: Free (sleep after 15min inactivity)
- Supabase: Free (500MB database, 1GB storage)
- GitHub: Free
- **Total: $0/month**

### Production Ready
- Vercel Pro: $20/month (unlimited bandwidth, better analytics)
- Render Starter: $7/month (no sleep, 512MB RAM)
- Supabase Pro: $25/month (8GB database, 100GB storage)
- **Total: ~$52/month**

---

## 🚨 Common Issues & Solutions

### Issue 1: Backend 500 Error sau deploy
**Solution:**
- Check Render logs
- Verify tất cả env vars đã set đúng
- Kiểm tra `SUPABASE_SERVICE_ROLE_KEY` chính xác

### Issue 2: Frontend không gọi được Backend
**Solution:**
- Verify `NEXT_PUBLIC_BACKEND_URL` không có trailing slash
- Check CORS settings trong `backend/src/index.ts`
- Kiểm tra backend có wake up chưa (free tier Render)

### Issue 3: CV Upload failed
**Solution:**
- Verify Supabase Storage bucket policy (public/private)
- Check `SUPABASE_SERVICE_ROLE_KEY` có quyền upload
- Xem Supabase logs

### Issue 4: Rate limit quá strict
**Solution:**
- Tăng limit trong `backend/src/index.ts`:
```typescript
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200, // Tăng từ 100 lên 200
    // ...
});
```

---

## 📚 Next Steps

1. [ ] Deploy Backend lên Render
2. [ ] Deploy Frontend lên Vercel  
3. [ ] Setup GitHub Actions (sẽ tạo ở bước tiếp theo)
4. [ ] Test toàn bộ flow trên production
5. [ ] Setup custom domain (optional)
6. [ ] Setup monitoring alerts (optional)

---

Created: 2025-12-06
Last Updated: 2025-12-06
