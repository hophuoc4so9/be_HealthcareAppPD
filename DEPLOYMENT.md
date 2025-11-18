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
   - **Lưu lại `Internal Database URL`**

2. **Deploy Backend:**
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Chọn repo: `be_HealthcareAppPD`
   - Name: `healthcare-backend`
   - Region: Singapore
   - Branch: `main`
   - Root Directory: `backend`
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Plan: Free

3. **Thêm Environment Variables:**
   ```
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=<paste Internal Database URL từ bước 1>
   JWT_SECRET=<tạo random string dài, ví dụ: aB3$xYz9@mK2#pL8qR5>
   JWT_EXPIRES_IN=24h
   FRONTEND_URL=https://your-app.vercel.app
   ```

4. **Initialize Database:**
   - Sau khi deploy xong, vào Shell của service
   - Run: `node -e "require('./config/database').initializeDatabase()"`

### Frontend Deployment (Vercel)

1. **Push code lên GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/hophuoc4so9/be_HealthcareAppPD.git
   git push -u origin main
   ```

2. **Deploy trên Vercel:**
   - Vào https://vercel.com
   - Click "Add New" → "Project"
   - Import GitHub repo: `be_HealthcareAppPD`
   - Framework Preset: Vite
   - Root Directory: `./` (leave empty)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Thêm Environment Variable:**
   - Settings → Environment Variables
   - Thêm: `VITE_API_URL` = `https://healthcare-backend.onrender.com/api`
   - Apply to: Production, Preview, Development

4. **Redeploy:**
   - Deployments → Latest → Redeploy

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
