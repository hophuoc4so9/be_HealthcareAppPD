# Database Management API Documentation

API để quản lý database schema cho ứng dụng PD Health.

## 🔧 Base URL

```
http://localhost:5000/api/database
```

## 📋 API Endpoints

### 1. Kiểm tra kết nối Database

**GET** `/api/database/connection`

Kiểm tra xem server có kết nối được với database hay không.

**Response:**
```json
{
  "success": true,
  "data": {
    "connected": true,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "version": "PostgreSQL 14.5 on x86_64-pc-linux-gnu..."
  },
  "message": "Database connection successful"
}
```

---

### 2. Kiểm tra trạng thái Schema

**GET** `/api/database/status`

Kiểm tra xem database đã có đầy đủ bảng, extensions, và enums chưa.

**Response:**
```json
{
  "success": true,
  "data": {
    "tables": {
      "total": 12,
      "expected": 12,
      "existing": ["users", "patient_profiles", "doctor_profiles", ...],
      "missing": [],
      "complete": true
    },
    "extensions": {
      "total": 2,
      "expected": 2,
      "existing": ["uuid-ossp", "postgis"],
      "missing": [],
      "complete": true
    },
    "enums": {
      "total": 7,
      "expected": 7,
      "existing": ["user_role", "user_sex", ...],
      "missing": [],
      "complete": true
    },
    "schema_complete": true
  },
  "message": "Database schema is complete and ready"
}
```

**Khi schema chưa đầy đủ:**
```json
{
  "success": true,
  "data": {
    "tables": {
      "total": 5,
      "expected": 12,
      "existing": ["users", "patient_profiles", ...],
      "missing": ["appointments", "chat_conversations", ...],
      "complete": false
    },
    "schema_complete": false
  },
  "message": "Database schema is incomplete"
}
```

---

### 3. Khởi tạo Database Schema

**POST** `/api/database/initialize`

Tạo tất cả bảng, extensions, và enums theo schema đã định nghĩa.

**Query Parameters:**
- `force` (optional): `true` | `false` - Xóa tất cả bảng cũ trước khi tạo mới

**Examples:**

```bash
# Tạo schema (chỉ tạo những gì chưa có)
POST /api/database/initialize

# Force tạo mới (xóa tất cả trước)
POST /api/database/initialize?force=true
```

**Response:**
```json
{
  "success": true,
  "message": "Database schema initialized successfully",
  "data": {
    "before": {
      "tables": { "total": 5, "missing": [...] }
    },
    "after": {
      "tables": { "total": 12, "missing": [] },
      "schema_complete": true
    },
    "created": {
      "tables": ["appointments", "chat_conversations", ...],
      "extensions": ["postgis"],
      "enums": ["appointment_status", ...]
    }
  }
}
```

---

### 4. Lấy danh sách tất cả bảng

**GET** `/api/database/tables`

Lấy danh sách tất cả các bảng trong database.

**Response:**
```json
{
  "success": true,
  "data": {
    "total_tables": 12,
    "tables": [
      {
        "table_name": "users",
        "column_count": "8"
      },
      {
        "table_name": "patient_profiles",
        "column_count": "6"
      },
      ...
    ]
  }
}
```

---

### 5. Lấy thông tin chi tiết về một bảng

**GET** `/api/database/tables/:tableName`

Lấy thông tin chi tiết về cấu trúc bảng (columns, constraints, indexes).

**Example:**
```bash
GET /api/database/tables/users
```

**Response:**
```json
{
  "success": true,
  "data": {
    "table_name": "users",
    "columns": [
      {
        "column_name": "id",
        "data_type": "uuid",
        "is_nullable": "NO",
        "column_default": "gen_random_uuid()",
        "character_maximum_length": null
      },
      {
        "column_name": "email",
        "data_type": "text",
        "is_nullable": "NO",
        "column_default": null,
        "character_maximum_length": null
      },
      ...
    ],
    "constraints": [
      {
        "constraint_name": "users_pkey",
        "constraint_type": "PRIMARY KEY",
        "column_name": "id"
      },
      {
        "constraint_name": "users_email_key",
        "constraint_type": "UNIQUE",
        "column_name": "email"
      }
    ],
    "indexes": [
      {
        "index_name": "users_pkey",
        "index_definition": "CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id)"
      },
      {
        "index_name": "idx_users_email",
        "index_definition": "CREATE INDEX idx_users_email ON public.users USING btree (email)"
      }
    ]
  }
}
```

**Khi bảng không tồn tại:**
```json
{
  "success": false,
  "message": "Table 'xyz' does not exist",
  "data": null
}
```

---

### 6. Lấy danh sách ENUM Types

**GET** `/api/database/enums`

Lấy tất cả các ENUM types đã được định nghĩa.

**Response:**
```json
{
  "success": true,
  "data": {
    "total_enums": 7,
    "enums": [
      {
        "enum_name": "user_role",
        "enum_values": ["patient", "doctor", "admin"]
      },
      {
        "enum_name": "user_sex",
        "enum_values": ["male", "female", "other", "prefer_not_to_say"]
      },
      {
        "enum_name": "verification_status",
        "enum_values": ["pending", "approved", "rejected"]
      },
      ...
    ]
  }
}
```

---

### 7. Lấy danh sách Extensions

**GET** `/api/database/extensions`

Lấy tất cả các PostgreSQL extensions đã được cài đặt.

**Response:**
```json
{
  "success": true,
  "data": {
    "total_extensions": 3,
    "extensions": [
      {
        "extension_name": "plpgsql",
        "version": "1.0"
      },
      {
        "extension_name": "uuid-ossp",
        "version": "1.1"
      },
      {
        "extension_name": "postgis",
        "version": "3.2.0"
      }
    ]
  }
}
```

---

### 8. Lấy thống kê Database

**GET** `/api/database/stats`

Lấy thống kê tổng quan về database.

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "database_name": "healthcare_db",
      "database_size": "8192 kB",
      "table_count": "12",
      "enum_count": "7",
      "extension_count": "3"
    },
    "extensions": [...],
    "enums": [...],
    "tables": [...]
  }
}
```

---

### 9. Reset Database (Development Only)

**POST** `/api/database/reset`

⚠️ **NGUY HIỂM**: Xóa tất cả bảng và tạo lại schema từ đầu.

**Chỉ hoạt động khi `NODE_ENV !== 'production'`**

**Request Body:**
```json
{
  "confirm": "RESET_DATABASE"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Database reset successfully",
  "data": {
    "before": {...},
    "after": {...},
    "created": {...}
  }
}
```

**Khi không confirm:**
```json
{
  "success": false,
  "message": "Please confirm database reset by sending { \"confirm\": \"RESET_DATABASE\" }"
}
```

**Khi ở môi trường production:**
```json
{
  "success": false,
  "message": "Database reset is not allowed in production environment"
}
```

---

## 🚀 Workflow sử dụng

### 1. Kiểm tra kết nối lần đầu
```bash
GET /api/database/connection
```

### 2. Kiểm tra trạng thái schema
```bash
GET /api/database/status
```

### 3. Nếu schema chưa đầy đủ, khởi tạo
```bash
POST /api/database/initialize
```

### 4. Xác nhận lại trạng thái
```bash
GET /api/database/status
```

---

## 📊 Error Handling

Tất cả errors đều được xử lý thống nhất:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message",
  "stack": "..." // Chỉ hiện trong development
}
```

---

## 🔐 Security Notes

1. **Reset endpoint** chỉ hoạt động trong môi trường development
2. **Force initialize** cần cẩn thận vì sẽ xóa dữ liệu
3. Nên có authentication/authorization cho các endpoints này trong production
4. Log tất cả các thao tác quan trọng

---

## 📝 Testing với cURL

```bash
# Kiểm tra kết nối
curl http://localhost:5000/api/database/connection

# Kiểm tra trạng thái
curl http://localhost:5000/api/database/status

# Khởi tạo schema
curl -X POST http://localhost:5000/api/database/initialize

# Khởi tạo với force
curl -X POST "http://localhost:5000/api/database/initialize?force=true"

# Lấy danh sách bảng
curl http://localhost:5000/api/database/tables

# Lấy thông tin bảng users
curl http://localhost:5000/api/database/tables/users

# Lấy ENUM types
curl http://localhost:5000/api/database/enums

# Lấy thống kê
curl http://localhost:5000/api/database/stats

# Reset database (dev only)
curl -X POST http://localhost:5000/api/database/reset \
  -H "Content-Type: application/json" \
  -d '{"confirm": "RESET_DATABASE"}'
```

---

## 🎯 Use Cases

### Use Case 1: Setup database lần đầu
```
1. GET /api/database/connection (kiểm tra kết nối)
2. GET /api/database/status (xem thiếu gì)
3. POST /api/database/initialize (tạo schema)
4. GET /api/database/stats (xem tổng quan)
```

### Use Case 2: Debug schema issues
```
1. GET /api/database/tables (xem danh sách bảng)
2. GET /api/database/tables/users (xem chi tiết bảng cụ thể)
3. GET /api/database/enums (kiểm tra ENUM types)
```

### Use Case 3: Development testing
```
1. POST /api/database/reset (reset toàn bộ)
2. POST /api/database/initialize (tạo lại)
3. Seed data...
```

---

## 📦 Dependencies

- `pg` - PostgreSQL client
- `express` - Web framework
- PostgreSQL 12+ với extensions:
  - `uuid-ossp`
  - `postgis`

---

## 🔄 Updates & Migrations

Khi cần update schema:

1. Cập nhật file `config/schema.sql`
2. Chạy `POST /api/database/initialize` (tự động detect changes)
3. Hoặc force reset trong dev: `POST /api/database/initialize?force=true`

---

**Version:** 2.0.0  
**Last Updated:** 2024-01-15
