# Hướng dẫn Migration Facilities từ Local lên Render

## 📋 Tổng quan
Tài liệu này hướng dẫn cách upload **3,308 facilities** từ database local lên production database trên Render.

## ✅ Đã hoàn thành
- [x] Fix server startup error (PathError with app.options)
- [x] Export facilities từ local database → `facilities_export.json` (3,308 records)
- [x] Update seed controller để tự động tạo bảng `health_facilities_points`
- [x] Update seed controller để match với cấu trúc data từ OSM

## 📝 Các bước thực hiện

### Bước 1: Deploy Backend lên Render

1. **Push code lên GitHub:**
```bash
cd d:\Android\Project\Backend_HealthcareAppPDAdmin\Backend_HealthcareAppPDAdmin
git add .
git commit -m "Add facilities migration support"
git push origin main
```

2. **Trên Render Dashboard:**
   - Vào Web Service của bạn
   - Click **"Manual Deploy"** → **"Deploy latest commit"**
   - Đợi deployment hoàn tất (~2-3 phút)

3. **Kiểm tra Environment Variables có đủ:**
   - `DATABASE_URL` - PostgreSQL connection string
   - `JWT_SECRET` - Secret key cho JWT
   - `NODE_ENV` - Set thành `production`
   - `PORT` - Set thành `5000`

### Bước 2: Khởi tạo Production Database

Gọi API để tạo schema:
```bash
curl -X POST https://be-healthcareapppd.onrender.com/api/database/initialize
```

**Expected response:**
```json
{
  "success": true,
  "message": "Database initialized successfully"
}
```

### Bước 3: Login Admin để lấy Token

```bash
curl -X POST https://be-healthcareapppd.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@pdhealth.com",
    "password": "your-admin-password"
  }'
```

**Lưu lại** `accessToken` từ response để dùng cho bước tiếp theo.

### Bước 4: Upload Facilities Data

File `facilities_export.json` đã được tạo trong thư mục `backend/` với 3,308 facilities.

**Option 1: Sử dụng cURL (Windows PowerShell):**
```powershell
cd backend
$token = "YOUR_ACCESS_TOKEN_HERE"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}
$body = Get-Content -Path "facilities_export.json" -Raw
Invoke-RestMethod -Uri "https://be-healthcareapppd.onrender.com/api/seed/facilities" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

**Option 2: Sử dụng Postman:**
1. Method: `POST`
2. URL: `https://be-healthcareapppd.onrender.com/api/seed/facilities`
3. Headers:
   - `Authorization`: `Bearer YOUR_ACCESS_TOKEN`
   - `Content-Type`: `application/json`
4. Body → raw → JSON → Paste nội dung file `facilities_export.json`
5. Click Send

**Expected response:**
```json
{
  "success": true,
  "message": "Successfully seeded 3308 facilities (0 skipped)",
  "data": {
    "inserted": 3308,
    "skipped": 0,
    "total": 3308
  }
}
```

### Bước 5: Verify Data

Kiểm tra số lượng facilities đã upload:
```bash
curl -X GET https://be-healthcareapppd.onrender.com/api/seed/count \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "count": 3308,
    "message": "Database has 3308 facilities"
  }
}
```

## 🔍 Troubleshooting

### Lỗi: "Token expired"
- Login lại để lấy token mới (JWT token hết hạn sau 24h)

### Lỗi: "Request Entity Too Large"
- File JSON quá lớn (>10MB)
- Giải pháp: Split file thành nhiều batch nhỏ hơn
```javascript
// Trong export-facilities.js, thêm LIMIT
const result = await pool.query(`...LIMIT 1000`);
```
- Upload từng batch (1000 records/lần)

### Lỗi: "Connection timeout"
- Render free tier có thể ngủ sau 15 phút không dùng
- Gọi GET / endpoint trước để "đánh thức" server:
```bash
curl https://be-healthcareapppd.onrender.com/
```

## 📊 Cấu trúc Bảng health_facilities_points

Bảng sẽ được tự động tạo khi chạy seed API:

| Column      | Type            | Description                    |
|-------------|-----------------|--------------------------------|
| ogc_fid     | SERIAL          | Primary key                    |
| geom        | GEOMETRY        | PostGIS Point (lng, lat)       |
| name        | TEXT            | Tên cơ sở y tế                 |
| name_en     | TEXT            | Tên tiếng Anh                  |
| name_vi     | TEXT            | Tên tiếng Việt                 |
| amenity     | TEXT            | Loại tiện ích (hospital, etc)  |
| building    | TEXT            | Loại tòa nhà                   |
| healthcare  | TEXT            | Loại dịch vụ y tế              |
| healthca_1  | TEXT            | Healthcare sub-category        |
| operator_t  | TEXT            | Đơn vị vận hành                |
| capacity_p  | TEXT            | Số giường/sức chứa             |
| addr_full   | TEXT            | Địa chỉ đầy đủ                 |
| addr_city   | TEXT            | Thành phố                      |
| source      | TEXT            | Nguồn data (OSM)               |
| osm_id      | BIGINT          | OpenStreetMap ID (unique)      |
| osm_type    | TEXT            | OSM type (node/way)            |
| created_at  | TIMESTAMPTZ     | Thời gian tạo                  |
| updated_at  | TIMESTAMPTZ     | Thời gian cập nhật             |

## 🎯 Next Steps

Sau khi migration thành công:

1. **Test Android App:**
   - Kiểm tra app Android có gọi được API facilities không
   - Test nearby facilities search

2. **Update Frontend:**
   - Deploy frontend lên Vercel với `VITE_API_URL` trỏ đến Render backend
   - Test admin panel có thể quản lý facilities không

3. **Performance Optimization:**
   - Monitor query performance trên Render dashboard
   - Nếu cần, add thêm indexes cho các trường thường search (name, healthcare, addr_city)

## 📞 Support

Nếu gặp vấn đề:
1. Check Render logs: Dashboard → Service → Logs
2. Check database connection: Verify `DATABASE_URL` env var
3. Test API health: `curl https://be-healthcareapppd.onrender.com/`
