# 🔒 Security Checklist - Production Deployment

## ✅ Đã Hoàn Thành

### 1. **Authentication & Authorization**
- ✅ Tất cả API endpoints quan trọng đã được bảo vệ bằng `requireAuth` middleware
- ✅ Middleware xác thực token từ Supabase trước khi cho phép truy cập
- ✅ Frontend gửi `Authorization: Bearer <token>` trong mọi request tới backend

### 2. **API Keys & Secrets**
- ✅ **Không có hardcoded secrets** - Tất cả API keys được lưu trong biến môi trường:
  - `GEMINI_API_KEY` (Backend)
  - `SUPABASE_SERVICE_ROLE_KEY` (Backend - QUAN TRỌNG)
  - `SUPABASE_URL` (Backend)
  - `NEXT_PUBLIC_SUPABASE_URL` (Frontend - Public)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Frontend - Public)
  - `NEXT_PUBLIC_BACKEND_URL` (Frontend)

### 3. **CORS Protection**
- ✅ Chỉ cho phép requests từ Frontend (localhost hoặc production domain)
- ✅ Đã cấu hình `allowedOrigins` trong `backend/src/index.ts`
- ⚠️ **LƯU Ý**: Sau khi deploy, cập nhật `FRONTEND_URL` trong `.env` và thêm vào `allowedOrigins`

### 4. **Rate Limiting**
- ✅ Giới hạn 100 requests/15 phút mỗi IP
- ✅ Ngăn chặn spam và DDoS attacks
- ✅ Bảo vệ quota API của Gemini

### 5. **Security Headers (Helmet)**
- ✅ Tự động thêm các HTTP headers bảo mật tiêu chuẩn
- ✅ Chống XSS, clickjacking, và các lỗ hổng phổ biến

### 6. **Secure CV Download**
- ✅ CV files không còn expose trực tiếp Supabase Storage URL
- ✅ Proxy qua `/api/secure-cv/:id` với authentication required
- ✅ Backend tải file và chuyển về client một cách an toàn

---

## ⚠️ Trước Khi Deploy

### Backend (Render/Railway/etc.)

1. **Thiết lập Environment Variables:**
   ```bash
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJxxx... (QUAN TRỌNG - GIỮ BÍ MẬT)
   GEMINI_API_KEY=AIzaSyxxx...
   N8N_WEBHOOK_UPLOAD=https://your-n8n.com/webhook/cv-upload
   N8N_WEBHOOK_SEND_MAIL=https://your-n8n.com/webhook/send-invite
   PORT=4000
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   ```

2. **Cập nhật CORS:**
   - Mở `backend/src/index.ts`
   - Thay `'https://cv-hr-project-frontend.vercel.app'` bằng domain thật của bạn

3. **Kiểm tra `.gitignore`:**
   - Đảm bảo `.env` **KHÔNG được** commit lên Git

### Frontend (Vercel)

1. **Thiết lập Environment Variables:**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx... (Public - OK)
   NEXT_PUBLIC_BACKEND_URL=https://your-backend-domain.onrender.com
   ```

2. **Kiểm tra `.gitignore`:**
   - Đảm bảo `.env.local` **KHÔNG được** commit lên Git

---

## 🔐 Best Practices Đã Áp Dụng

1. ✅ **Principle of Least Privilege**: Mỗi service chỉ có quyền truy cập những gì cần thiết
2. ✅ **Defense in Depth**: Nhiều lớp bảo mật (Auth + CORS + Rate Limiting + Headers)
3. ✅ **Secure by Default**: Tất cả endpoints mặc định yêu cầu authentication
4. ✅ **No Hardcoded Secrets**: Mọi thông tin nhạy cảm đều trong env vars
5. ✅ **Secure File Access**: File downloads qua proxy với auth check

---

## 🚨 QUAN TRỌNG

### KHÔNG BAO GIỜ:
- ❌ Commit file `.env` hoặc `.env.local` lên GitHub
- ❌ Share `SUPABASE_SERVICE_ROLE_KEY` - Key này có toàn quyền trên database
- ❌ Share `GEMINI_API_KEY` - Người khác có thể dùng hết quota của bạn
- ❌ Để CORS `return callback(null, true);` ở mode production (hiện tại đang tạm allow all cho dev)

### NÊN:
- ✅ Xoay (rotate) keys định kỳ
- ✅ Monitor logs để phát hiện truy cập bất thường
- ✅ Set up alerts cho rate limit violations
- ✅ Backup database định kỳ

---

## 📋 Testing Checklist

Trước khi deploy production:

- [ ] Test upload CV với authenticated user
- [ ] Test search candidates với authenticated user
- [ ] Test xem CV qua modal (không lộ Supabase URL trực tiếp)
- [ ] Test send invitations
- [ ] Test generate questions
- [ ] Verify rate limiting: Thử spam requests
- [ ] Verify CORS: Thử gọi API từ domain khác
- [ ] Verify auth: Thử gọi API không có token → Phải bị 401

---

Created: 2025-12-06
Last Updated: 2025-12-06
