# Healthcare Admin - Deployment Guide

## 🚀 Deployment Instructions

### Backend Deployment (Render)

1. **Tạo PostgreSQL Database trên Render:**
   - Vào https://dashboard.render.com
   - Click "New +" → "PostgreSQL"
   - Name: `healthcaredb`
   - Database: `healthcareDB`
   - User: `healthcare_admin`
   - Region: Singapore (gần Việt Nam nhất)
   - Plan: Free
   - Click "Create Database"
   - **Copy `Internal Database URL`** (dạng: postgresql://user:password@host/db)

2. **Deploy Backend:**
   - Click "New +" → "Web Service"
   - Connect to GitHub repository
   - Chọn repo: `be_HealthcareAppPD`
   - Name: `healthcare-backend`
   - Region: Singapore  
   - Branch: `main`
   - **Root Directory: `backend`** ⚠️ QUAN TRỌNG
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Plan: Free
   - Click "Create Web Service"

3. **Thêm Environment Variables:**
   Vào tab "Environment" của service vừa tạo, thêm:
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=<paste Internal Database URL từ bước 1>
   JWT_SECRET=your_super_secret_key_here_change_this
   JWT_EXPIRES_IN=24h
   FRONTEND_URL=https://your-app-name.vercel.app
   ```
   
   Click "Save Changes" → Service sẽ tự động redeploy

4. **Khởi tạo Database Schema:**
   
   **Cách 1: Dùng API (Khuyến nghị)**
   
   Mở trình duyệt, truy cập:
   ```
   https://healthcare-backend.onrender.com/api/database/initialize
   ```
   
   Hoặc dùng cURL:
   ```bash
   curl -X POST https://healthcare-backend.onrender.com/api/database/initialize
   ```
   
   **Cách 2: Dùng Shell**
   
   - Vào service → Tab "Shell"
   - Run:
   ```bash
   curl -X POST http://localhost:10000/api/database/initialize
   ```
   
   **Kiểm tra:**
   ```
   https://healthcare-backend.onrender.com/api/database/status
   ```
   
   Phải thấy: `"schema_complete": true`

### Frontend Deployment (Vercel)

1. **Deploy trên Vercel:**
   - Vào https://vercel.com/new
   - Import GitHub repo: `be_HealthcareAppPD`
   - Project Name: `healthcare-admin` (hoặc tên bạn thích)
   - Framework Preset: **Vite**
   - **Root Directory: `./`** (để trống)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
   - Click "Deploy"

2. **Thêm Environment Variable:**
   - Sau khi deploy xong, vào Settings → Environment Variables
   - Thêm biến:
     - Key: `VITE_API_URL`
     - Value: `https://healthcare-backend.onrender.com/api`
     - Environments: **Production, Preview, Development** (chọn cả 3)
   - Click "Save"

3. **Redeploy với Environment Variable mới:**
   - Vào tab "Deployments"
   - Click vào deployment mới nhất
   - Click nút "..." → "Redeploy"
   - Chọn "Use existing Build Cache" → Redeploy

4. **Cập nhật CORS trên Backend:**
   - Quay lại Render dashboard
   - Vào service `healthcare-backend` → Environment
   - Update biến `FRONTEND_URL` = URL Vercel vừa được tạo
     - Ví dụ: `https://healthcare-admin-abc123.vercel.app`
   - Save → Service tự động restart

### Sau khi deploy

1. **Update CORS trong backend:**
   - Vào Render dashboard → healthcare-backend → Environment
   - Update `FRONTEND_URL` = URL Vercel của bạn (vd: https://healthcare-admin-abc123.vercel.app)
   - Service sẽ tự restart

2. **Test:**
   - Mở frontend URL: https://your-app.vercel.app/admin/login
   - Login với: admin@healthcare.com / Admin123456

## 📝 Notes

- **Free tier limitations:**
  - Render: Database 1GB, auto-sleep sau 15 phút không hoạt động
  - Vercel: Unlimited deployments, bandwidth limits

- **Backend URL sẽ là:** `https://healthcare-backend.onrender.com`
- **Frontend URL sẽ là:** `https://healthcare-admin-[random].vercel.app`

## 🔧 Local Development

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env với thông tin database local
node server.js

# Frontend
npm install
cp .env.example .env
# Edit .env với VITE_API_URL=http://localhost:5000/api
npm run dev
```

## 🛠️ Troubleshooting

**Backend không kết nối được database:**
- Check DATABASE_URL có đúng không
- Check database đã được tạo chưa
- Run migration: vào Shell → `node migrate-external-url.js`

**Frontend không call được API:**
- Check VITE_API_URL đã đúng chưa
- Check CORS settings trong backend
- Check Network tab trong browser console

**Database schema chưa có:**
- Vào Render Shell
- Run: `node -e "const pool = require('./db'); pool.query(require('fs').readFileSync('./config/schema.sql', 'utf8')).then(() => process.exit(0))"`
