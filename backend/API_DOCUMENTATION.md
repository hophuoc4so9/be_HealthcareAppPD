# Healthcare Facilities API Documentation

## Base URL
```
https://be-healthcareapppd.onrender.com/api/facilities
```

## Endpoints

### 1. Tìm cơ sở y tế gần nhất
**GET** `/nearest`

Tìm cơ sở y tế gần nhất dựa trên vị trí GPS.

**Parameters:**
- `lat` (required): Vĩ độ (latitude)
- `lng` (required): Kinh độ (longitude) 
- `radius` (optional): Bán kính tìm kiếm (mét), mặc định 5000m
- `limit` (optional): Số lượng kết quả tối đa, mặc định 10
- `type` (optional): Loại cơ sở y tế (pharmacy, hospital, clinic, dentist, doctor)

**Example:**
```
GET /api/facilities/nearest?lat=10.2360937&lng=105.4020621&radius=3000&limit=5&type=pharmacy
```

**Response:**
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
    "radius_meters": 3000,
    "type": "pharmacy",
    "limit": 5
  }
}
```

### 2. Lọc cơ sở y tế theo loại
**GET** `/type/:type`

Lấy danh sách cơ sở y tế theo loại cụ thể.

**Path Parameters:**
- `type`: Loại cơ sở y tế (pharmacy, hospital, clinic, dentist, doctor)

**Query Parameters:**
- `page` (optional): Trang hiện tại, mặc định 1
- `limit` (optional): Số lượng mỗi trang, mặc định 100
- `city` (optional): Lọc theo thành phố
- `operator` (optional): Lọc theo đơn vị vận hành

**Example:**
```
GET /api/facilities/type/pharmacy?city=Hồ Chí Minh&page=1&limit=20
```

**Response:**
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
      "operator": "Công ty ABC"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  },
  "filter": {
    "type": "pharmacy",
    "city": "Hồ Chí Minh",
    "operator": null
  }
}
```

### 3. Tìm cơ sở y tế trong khu vực
**POST** `/in-area`

Tìm cơ sở y tế trong một vùng địa lý được định nghĩa bởi polygon.

**Request Body:**
```json
{
  "polygon": [
    [105.4020621, 10.2360937],
    [105.4024751, 10.236516],
    [105.402856, 10.2362626],
    [105.4025342, 10.23593]
  ],
  "type": "pharmacy",
  "limit": 50
}
```

**Response:**
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
      "operator": "Công ty ABC"
    }
  ],
  "query_params": {
    "polygon_area": [[105.4020621, 10.2360937], [105.4024751, 10.236516]],
    "type": "pharmacy",
    "limit": 50,
    "total_found": 5
  }
}
```

### 4. Thống kê cơ sở y tế
**GET** `/stats`

Lấy thống kê tổng quan về các cơ sở y tế.

**Query Parameters:**
- `city` (optional): Lọc theo thành phố

**Example:**
```
GET /api/facilities/stats?city=Hồ Chí Minh
```

**Response:**
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
    "detailed": [
      {
        "amenity": "pharmacy",
        "healthcare": "pharmacy",
        "count": "450",
        "cities": ["Hồ Chí Minh", "Hà Nội"]
      }
    ],
    "cities": ["Hà Nội", "Hồ Chí Minh", "Đà Nẵng"]
  },
  "filter": {
    "city": "Hồ Chí Minh"
  }
}
```

## Loại cơ sở y tế được hỗ trợ

- **pharmacy**: Nhà thuốc, tiệm thuốc
- **hospital**: Bệnh viện
- **clinic**: Phòng khám, trạm y tế
- **dentist**: Nha khoa
- **doctor**: Phòng khám bác sĩ

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Missing required parameters",
  "message": "Latitude (lat) and longitude (lng) are required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Facility not found",
  "message": "No facility found with ID: 123"
}
```

### 500 Server Error
```json
{
  "success": false,
  "error": "Server Error",
  "message": "Database connection failed"
}
```

## Notes

- Tất cả khoảng cách được tính bằng mét
- Hệ tọa độ sử dụng: WGS84 (EPSG:4326)
- Để tính toán khoảng cách chính xác, dữ liệu được chuyển đổi sang Web Mercator (EPSG:3857)
- PostGIS được sử dụng để xử lý dữ liệu không gian địa lý