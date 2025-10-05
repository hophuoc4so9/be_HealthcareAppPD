# Healthcare Facilities Geographic APIs

Hệ thống API mới để tìm kiếm và lọc cơ sở y tế dựa trên dữ liệu địa lý với PostGIS. 

## 🏗️ Kiến trúc code đã được tối ưu hóa

### Cấu trúc thư mục backend:
```
backend/
├── controllers/
│   └── facilityController.js    # Xử lý HTTP requests (ngắn gọn)
├── services/
│   └── facilityService.js       # Business logic & validation
├── repositories/
│   └── facilityRepository.js    # Database queries & PostGIS
├── routes/
│   └── facilities.js            # API routes
└── middleware/
    ├── errorHandler.js          # Error handling
    └── logger.js                # Logging
```

### Lợi ích của kiến trúc mới:
- ✅ **Controller ngắn gọn**: Chỉ xử lý HTTP requests/responses
- ✅ **Service layer**: Validation và business logic tách biệt  
- ✅ **Repository pattern**: Database queries tập trung
- ✅ **Error handling**: Thống nhất và dễ maintain
- ✅ **Code reusability**: Dễ tái sử dụng và test

## 🚀 Tính năng mới đã thêm

### 1. Tìm cơ sở y tế gần nhất (`/api/facilities/nearest`)
- Tìm cơ sở y tế gần nhất dựa trên GPS
- Hỗ trợ bán kính tìm kiếm tùy chỉnh
- Lọc theo loại cơ sở y tế
- Tính toán khoảng cách chính xác

### 2. Lọc theo loại cơ sở y tế (`/api/facilities/type/:type`)
- Pharmacy (Nhà thuốc) 
- Hospital (Bệnh viện)
- Clinic (Phòng khám)
- Dentist (Nha khoa)
- Doctor (Bác sĩ)

### 3. Tìm trong khu vực (`/api/facilities/in-area`)
- Tìm cơ sở y tế trong vùng địa lý polygon
- Hỗ trợ vẽ vùng tùy chỉnh trên bản đồ

### 4. Thống kê cơ sở y tế (`/api/facilities/stats`)
- Thống kê tổng quan theo loại
- Thống kê theo thành phố
- Báo cáo chi tiết

## 📦 Cài đặt và chạy

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
npm install
npm run dev
```

## 🔧 Cấu hình Database

Đảm bảo PostgreSQL với PostGIS extension đã được cài đặt:

```sql
-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Check if geometry column has spatial index
CREATE INDEX IF NOT EXISTS idx_health_facilities_geom 
ON health_facilities_points USING GIST (geom);
```

## 📱 Sử dụng trong Frontend

### Import services
```typescript
import { apiService } from './services/apiService';
import { getCurrentLocation, formatDistance } from './utils/geoUtils';
```

### Tìm nhà thuốc gần nhất
```typescript
const findNearestPharmacies = async () => {
  try {
    const location = await getCurrentLocation();
    const response = await apiService.getNearestFacilities({
      lat: location.lat,
      lng: location.lng,
      radius: 2000, // 2km
      type: 'pharmacy',
      limit: 5
    });
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Lọc theo loại
```typescript
const getHospitals = async () => {
  try {
    const response = await apiService.getFacilitiesByType('hospital', {
      city: 'Hồ Chí Minh',
      page: 1,
      limit: 20
    });
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Tìm trong khu vực
```typescript
const findInArea = async () => {
  try {
    const polygon = [
      [105.4020621, 10.2360937],
      [105.4024751, 10.236516],
      [105.402856, 10.2362626],
      [105.4025342, 10.23593]
    ];
    
    const response = await apiService.getFacilitiesInArea({
      polygon,
      type: 'pharmacy',
      limit: 50
    });
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## 🗺️ Component sử dụng

Đã tạo component `NearbyFacilities` để demo các tính năng:

```typescript
import NearbyFacilities from './components/NearbyFacilities';

// Sử dụng trong App
<NearbyFacilities />
```

## 📊 API Response Examples

### Nearest Facilities Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Nhà thuốc ABC",
      "name_vi": "Nhà thuốc ABC",
      "amenity": "pharmacy",
      "healthcare": "pharmacy",
      "addr_city": "Hồ Chí Minh",
      "addr_full": "123 Nguyễn Văn Cừ, Q5",
      "operator": "Công ty ABC",
      "distance_meters": 150
    }
  ],
  "query_params": {
    "latitude": 10.2360937,
    "longitude": 105.4020621,
    "radius_meters": 2000,
    "type": "pharmacy",
    "limit": 5
  }
}
```

### Statistics Response
```json
{
  "success": true,
  "data": {
    "total": 1250,
    "by_type": {
      "pharmacy": 450,
      "hospital": 85,
      "clinic": 320,
      "dentist": 180,
      "doctor": 150,
      "other": 65
    },
    "cities": ["Hà Nội", "Hồ Chí Minh", "Đà Nẵng"]
  }
}
```

## 🔍 Utility Functions

### Geographic Utils
```typescript
import { 
  calculateDistance, 
  formatDistance, 
  getFacilityTypeVi,
  getFacilityIcon 
} from './utils/geoUtils';

// Tính khoảng cách
const distance = calculateDistance(point1, point2);

// Format khoảng cách
const formatted = formatDistance(1500); // "1.5km"

// Lấy tên tiếng Việt
const typeName = getFacilityTypeVi('pharmacy'); // "Nhà thuốc"

// Lấy icon
const icon = getFacilityIcon('pharmacy'); // "💊"
```

## 🚀 Triển khai Production

### Environment Variables
```env
# Backend
DATABASE_URL=postgresql://user:password@localhost:5432/healthcare_db
PORT=5000

# Frontend  
VITE_API_URL=http://localhost:5000/api
```

### Docker Setup
```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgis/postgis:14-3.2
    environment:
      POSTGRES_DB: healthcare_db
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgresql://user:password@postgres:5432/healthcare_db

  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      VITE_API_URL: http://localhost:5000/api

volumes:
  postgres_data:
```

## 📝 Notes

- Sử dụng PostGIS cho tính toán địa lý chính xác
- Dữ liệu geom ở định dạng MULTIPOLYGON
- Hệ tọa độ: WGS84 (EPSG:4326)
- Khoảng cách tính bằng Web Mercator (EPSG:3857) để chính xác hơn
- Có thể mở rộng thêm các loại cơ sở y tế khác
- API hỗ trợ pagination cho performance tốt

## 🤝 Contributing

1. Fork project
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## 📄 License

MIT License

---

## 🔧 Code Optimization Summary

### Kiến trúc mới đã được tối ưu:

#### Before (Code cũ):
- Controller lớn với nhiều logic (~350 lines)
- Database queries trực tiếp trong controller  
- Error handling lặp lại nhiều lần
- Validation logic rải rác

#### After (Code mới):
- **Controller**: Chỉ 150 lines, tập trung vào HTTP handling
- **Service Layer**: Business logic tách biệt với validation
- **Repository**: Database operations tập trung
- **Error Handling**: Centralized và consistent

### Files Structure:
```
backend/
├── controllers/facilityController.js  (150 lines - 50% ít hơn)
├── services/facilityService.js        (200 lines - business logic)  
├── repositories/facilityRepository.js (350 lines - database ops)
└── routes/facilities.js               (minimal routing)
```

### Benefits:
- ✅ **Maintainability**: Dễ maintain và debug
- ✅ **Testability**: Mỗi layer có thể test riêng
- ✅ **Scalability**: Dễ mở rộng thêm features
- ✅ **Code Quality**: Clean architecture pattern
- ✅ **Developer Experience**: Code ngắn gọn, dễ đọc

Kiến trúc này giúp team phát triển dễ dàng hơn và code chất lượng cao hơn! 🚀