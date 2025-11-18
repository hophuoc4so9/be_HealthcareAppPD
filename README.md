# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
### ALL API:


# PD HEALTH - COMPLETE API DOCUMENTATION

## 📡 Base URL
**Development:** `http://localhost:5000`  
**Production:** `https://be-healthcareapppd.onrender.com`

---

## 📋 TABLE OF CONTENTS
1. [Authentication APIs](#1-authentication-apis)
2. [Users Management APIs](#2-users-management-apis)
3. [Patient Profile APIs](#3-patient-profile-apis)
4. [Doctor Profile APIs](#4-doctor-profile-apis)
5. [Appointments APIs](#5-appointments-apis)
6. [Health Facilities APIs](#6-health-facilities-apis)
7. [Reminders APIs](#7-reminders-apis)
8. [Chat APIs](#8-chat-apis)
9. [Articles APIs](#9-articles-apis)
10. [Admin Dashboard APIs](#10-admin-dashboard-apis)

---

## 1. AUTHENTICATION APIs
**Base:** `/api/auth`

### 1.1 Register
**POST** `/api/auth/register`

Đăng ký tài khoản mới.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "role": "patient"
}
```

**Parameters:**
- `email` (required, string): Email hợp lệ
- `password` (required, string): Mật khẩu (min 6 ký tự)
- `role` (required, string): Vai trò (`patient`, `doctor`, `admin`)

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "patient",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

### 1.2 Login
**POST** `/api/auth/login`

Đăng nhập vào hệ thống.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Parameters:**
- `email` (required, string): Email
- `password` (required, string): Mật khẩu

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "patient",
      "is_active": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Note:** Token có hiệu lực 24 giờ

---

### 1.3 Change Password
**POST** `/api/auth/change-password`  
🔒 **Requires Authentication**

Đổi mật khẩu.

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Request Body:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword123"
}
```

**Parameters:**
- `currentPassword` (required, string): Mật khẩu hiện tại
- `newPassword` (required, string): Mật khẩu mới (min 6 ký tự)

---

### 1.4 Get Profile
**GET** `/api/auth/profile`  
🔒 **Requires Authentication**

Lấy thông tin profile của user đang đăng nhập.

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "patient",
    "is_active": true,
    "is_banned": false,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 1.5 Verify Token
**POST** `/api/auth/verify-token`

Kiểm tra tính hợp lệ của JWT token.

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Parameters:**
- `token` (required, string): JWT token cần verify

**Response:**
```json
{
  "success": true,
  "valid": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "patient"
  }
}
```

---

## 2. USERS MANAGEMENT APIs
**Base:** `/api/users`  
🔒👑 **All routes require Admin authentication**

### 2.1 Get All Users
**GET** `/api/users`

Lấy danh sách tất cả users.

**Query Parameters:**
- `page` (optional, number): Trang hiện tại (default: 1)
- `limit` (optional, number): Số lượng/trang (default: 20)
- `role` (optional, string): Lọc theo role (`patient`, `doctor`, `admin`)
- `is_active` (optional, boolean): Lọc theo trạng thái active

**Example:**
```
GET /api/users?page=1&limit=10&role=patient&is_active=true
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "patient1@example.com",
      "role": "patient",
      "is_active": true,
      "is_banned": false,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

### 2.2 Get User Stats
**GET** `/api/users/stats`

Lấy thống kê users.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 1250,
    "by_role": {
      "patient": 1000,
      "doctor": 200,
      "admin": 50
    },
    "active": 1100,
    "inactive": 100,
    "banned": 50
  }
}
```

---

### 2.3 Search Users
**GET** `/api/users/search`

Tìm kiếm users theo email.

**Query Parameters:**
- `q` (required, string): Từ khóa tìm kiếm (email)
- `role` (optional, string): Lọc theo role

**Example:**
```
GET /api/users/search?q=john@example.com&role=patient
```

---

### 2.4 Get User by ID
**GET** `/api/users/:id`

Lấy thông tin user theo ID.

**Path Parameters:**
- `id` (required, uuid): User ID

---

### 2.5 Update User
**PUT** `/api/users/:id`

Cập nhật thông tin user.

**Request Body:**
```json
{
  "email": "newemail@example.com",
  "role": "doctor"
}
```

**Parameters:**
- `email` (optional, string): Email mới
- `role` (optional, string): Role mới

---

### 2.6 Delete User
**DELETE** `/api/users/:id`

Xóa user vĩnh viễn.

**Path Parameters:**
- `id` (required, uuid): User ID

---

### 2.7 Activate User
**PATCH** `/api/users/:id/activate`

Kích hoạt user.

---

### 2.8 Deactivate User
**PATCH** `/api/users/:id/deactivate`

Vô hiệu hóa user.

---

### 2.9 Ban User
**PATCH** `/api/users/:id/ban`

Cấm user.

---

### 2.10 Unban User
**PATCH** `/api/users/:id/unban`

Bỏ cấm user.

---

## 3. PATIENT PROFILE APIs
**Base:** `/api/patients`  
🔒 **Requires Authentication**

### 3.1 Create Profile
**POST** `/api/patients/profile`  
👤 **Patient only**

Tạo patient profile (chỉ tạo được 1 lần).

**Request Body:**
```json
{
  "full_name": "Nguyễn Văn A",
  "date_of_birth": "1990-01-01",
  "sex": "male",
  "phone": "0901234567",
  "address": "123 Nguyễn Huệ, Quận 1, TP.HCM",
  "emergency_contact_name": "Nguyễn Thị B",
  "emergency_contact_phone": "0907654321"
}
```

**Parameters:**
- `full_name` (required, string): Họ và tên
- `date_of_birth` (required, date): Ngày sinh (YYYY-MM-DD)
- `sex` (required, enum): Giới tính (`male`, `female`, `other`, `prefer_not_to_say`)
- `phone` (optional, string): Số điện thoại
- `address` (optional, string): Địa chỉ
- `emergency_contact_name` (optional, string): Tên người liên hệ khẩn cấp
- `emergency_contact_phone` (optional, string): SĐT người liên hệ khẩn cấp

---

### 3.2 Get My Profile
**GET** `/api/patients/profile`  
👤 **Patient only**

Lấy profile của bản thân.

**Response:**
```json
{
  "success": true,
  "data": {
    "patient_user_id": "uuid",
    "full_name": "Nguyễn Văn A",
    "date_of_birth": "1990-01-01",
    "sex": "male",
    "phone": "0901234567",
    "address": "123 Nguyễn Huệ, Quận 1, TP.HCM",
    "emergency_contact_name": "Nguyễn Thị B",
    "emergency_contact_phone": "0907654321",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 3.3 Update My Profile
**PUT** `/api/patients/profile`  
👤 **Patient only**

Cập nhật profile.

**Request Body:** Giống Create Profile

---

### 3.4 Add Vitals
**POST** `/api/patients/vitals`  
👤 **Patient only**

Thêm chỉ số sức khỏe (huyết áp, nhịp tim, ...).

**Request Body:**
```json
{
  "heart_rate_bpm": 72,
  "blood_pressure_systolic": 120,
  "blood_pressure_diastolic": 80,
  "temperature_celsius": 36.5,
  "weight_kg": 70.5,
  "height_cm": 175,
  "blood_glucose_mg_dl": 90,
  "oxygen_saturation_percent": 98
}
```

**Parameters:** (Tất cả optional, nhưng phải có ít nhất 1 giá trị)
- `heart_rate_bpm` (optional, number): Nhịp tim (bpm)
- `blood_pressure_systolic` (optional, number): Huyết áp tâm thu (mmHg)
- `blood_pressure_diastolic` (optional, number): Huyết áp tâm trương (mmHg)
- `temperature_celsius` (optional, number): Nhiệt độ cơ thể (°C)
- `weight_kg` (optional, number): Cân nặng (kg)
- `height_cm` (optional, number): Chiều cao (cm)
- `blood_glucose_mg_dl` (optional, number): Đường huyết (mg/dL)
- `oxygen_saturation_percent` (optional, number): SpO2 (%)

---

### 3.5 Get Vitals History
**GET** `/api/patients/vitals`  
👤 **Patient only**

Lấy lịch sử chỉ số sức khỏe.

**Query Parameters:**
- `limit` (optional, number): Số lượng records (default: 30)
- `from_date` (optional, date): Từ ngày (YYYY-MM-DD)
- `to_date` (optional, date): Đến ngày (YYYY-MM-DD)

**Example:**
```
GET /api/patients/vitals?limit=10&from_date=2024-01-01&to_date=2024-01-31
```

---

### 3.6 Get Latest Vitals
**GET** `/api/patients/vitals/latest`  
👤 **Patient only**

Lấy chỉ số sức khỏe mới nhất.

---

### 3.7 Delete Vitals
**DELETE** `/api/patients/vitals/:id`  
👤 **Patient only**

Xóa 1 record vitals.

**Path Parameters:**
- `id` (required, bigint): Vitals ID

---

### 3.8 Add Metrics
**POST** `/api/patients/metrics`  
👤 **Patient only**

Thêm health metrics từ thiết bị đeo (bước chân, giấc ngủ, ...).

**Request Body:**
```json
{
  "metric_type": "steps",
  "value": 10000,
  "start_time": "2024-01-01T00:00:00Z",
  "end_time": "2024-01-01T23:59:59Z"
}
```

**Parameters:**
- `metric_type` (required, enum): Loại metric
  - `steps`: Số bước chân
  - `sleep_duration_minutes`: Thời gian ngủ (phút)
  - `distance_meters`: Quãng đường (mét)
  - `active_calories`: Calories tiêu hao
- `value` (required, number): Giá trị
- `start_time` (required, datetime): Thời gian bắt đầu
- `end_time` (required, datetime): Thời gian kết thúc

---

### 3.9 Get Metrics
**GET** `/api/patients/metrics`  
👤 **Patient only**

Lấy danh sách metrics.

**Query Parameters:**
- `metric_type` (optional, enum): Lọc theo loại
- `from_date` (optional, date): Từ ngày
- `to_date` (optional, date): Đến ngày
- `limit` (optional, number): Số lượng (default: 30)

**Example:**
```
GET /api/patients/metrics?metric_type=steps&from_date=2024-01-01&limit=7
```

---

### 3.10 Get Metrics Summary
**GET** `/api/patients/metrics/summary`  
👤 **Patient only**

Lấy tổng kết metrics (tổng số bước, tổng quãng đường, ...).

**Query Parameters:**
- `metric_type` (required, enum): Loại metric
- `from_date` (optional, date): Từ ngày
- `to_date` (optional, date): Đến ngày

**Response:**
```json
{
  "success": true,
  "data": {
    "metric_type": "steps",
    "total_value": 70000,
    "average_value": 10000,
    "records_count": 7,
    "period": {
      "from": "2024-01-01",
      "to": "2024-01-07"
    }
  }
}
```

---

### 3.11 Delete Metrics
**DELETE** `/api/patients/metrics/:id`  
👤 **Patient only**

Xóa 1 metric record.

**Path Parameters:**
- `id` (required, bigint): Metric ID

---

### 3.12 Get All Profiles (Admin)
**GET** `/api/patients`  
👑 **Admin only**

Lấy tất cả patient profiles.

**Query Parameters:**
- `page` (optional, number): Trang
- `limit` (optional, number): Số lượng/trang

---

### 3.13 Get Profile by ID
**GET** `/api/patients/:id/profile`  
👑🩺 **Admin/Doctor only**

Lấy patient profile theo ID.

**Path Parameters:**
- `id` (required, uuid): Patient User ID

---

## 4. DOCTOR PROFILE APIs
**Base:** `/api/doctors`

### 4.1 Create Profile
**POST** `/api/doctors/profile`  
🔒🩺 **Doctor only**

Tạo doctor profile.

**Request Body:**
```json
{
  "full_name": "BS. Nguyễn Văn B",
  "specialization": "Nội khoa",
  "license_number": "LIC123456",
  "years_of_experience": 10,
  "hospital_affiliation": "Bệnh viện Chợ Rẫy",
  "phone": "0901234567",
  "address": "123 Nguyễn Huệ, Q1, TP.HCM"
}
```

**Parameters:**
- `full_name` (required, string): Họ và tên
- `specialization` (required, string): Chuyên khoa (Nội khoa, Ngoại khoa, Tim mạch, ...)
- `license_number` (required, string): Số giấy phép hành nghề
- `years_of_experience` (optional, number): Số năm kinh nghiệm
- `hospital_affiliation` (optional, string): Bệnh viện/Phòng khám đang công tác
- `phone` (optional, string): Số điện thoại
- `address` (optional, string): Địa chỉ phòng khám

---

### 4.2 Get My Profile
**GET** `/api/doctors/profile`  
🔒🩺 **Doctor only**

Lấy profile của bản thân.

---

### 4.3 Update My Profile
**PUT** `/api/doctors/profile`  
🔒🩺 **Doctor only**

Cập nhật profile.

**Request Body:** Giống Create Profile

---

### 4.4 Get All Doctors
**GET** `/api/doctors`

Lấy danh sách tất cả bác sĩ (public).

**Query Parameters:**
- `page` (optional, number): Trang (default: 1)
- `limit` (optional, number): Số lượng/trang (default: 20)
- `specialization` (optional, string): Lọc theo chuyên khoa
- `verification_status` (optional, enum): Lọc theo trạng thái xác thực (`pending`, `approved`, `rejected`)

**Example:**
```
GET /api/doctors?specialization=Nội khoa&verification_status=approved&page=1&limit=10
```

---

### 4.5 Search by Specialization
**GET** `/api/doctors/search`

Tìm bác sĩ theo chuyên khoa.

**Query Parameters:**
- `specialization` (required, string): Chuyên khoa

**Example:**
```
GET /api/doctors/search?specialization=Tim mạch
```

---

### 4.6 Get Doctor by ID
**GET** `/api/doctors/:id/profile`

Lấy thông tin bác sĩ theo ID (public).

**Path Parameters:**
- `id` (required, uuid): Doctor User ID

---

### 4.7 Update Verification Status
**PATCH** `/api/doctors/:id/verification`  
🔒👑 **Admin only**

Cập nhật trạng thái xác thực bác sĩ.

**Request Body:**
```json
{
  "verification_status": "approved",
  "verification_notes": "Đã xác thực giấy phép hành nghề thành công"
}
```

**Parameters:**
- `verification_status` (required, enum): Trạng thái (`pending`, `approved`, `rejected`)
- `verification_notes` (optional, string): Ghi chú xác thực

---

## 5. APPOINTMENTS APIs
**Base:** `/api/appointments`  
🔒 **Requires Authentication**

### 5.1 Create Availability Slot
**POST** `/api/appointments/availability`  
🩺 **Doctor only**

Tạo khung giờ khám bệnh.

**Request Body:**
```json
{
  "start_time": "2024-01-15T09:00:00Z",
  "end_time": "2024-01-15T09:30:00Z"
}
```

**Parameters:**
- `start_time` (required, datetime): Thời gian bắt đầu
- `end_time` (required, datetime): Thời gian kết thúc

**Note:** Không được trùng với các slot đã tồn tại

---

### 5.2 Get My Availability
**GET** `/api/appointments/availability`  
🩺 **Doctor only**

Lấy danh sách khung giờ khám của mình.

**Query Parameters:**
- `from_date` (optional, date): Từ ngày
- `to_date` (optional, date): Đến ngày
- `is_booked` (optional, boolean): Lọc theo trạng thái đã đặt

**Example:**
```
GET /api/appointments/availability?from_date=2024-01-15&is_booked=false
```

---

### 5.3 Delete Availability
**DELETE** `/api/appointments/availability/:id`  
🩺 **Doctor only**

Xóa khung giờ khám (chỉ xóa được nếu chưa được đặt).

**Path Parameters:**
- `id` (required, uuid): Availability Slot ID

---

### 5.4 Book Appointment
**POST** `/api/appointments`  
👤 **Patient only**

Đặt lịch khám bệnh.

**Request Body:**
```json
{
  "doctor_user_id": "doctor-uuid",
  "availability_slot_id": "slot-uuid",
  "patient_notes": "Đau đầu kéo dài 3 ngày, có kèm sốt nhẹ"
}
```

**Parameters:**
- `doctor_user_id` (required, uuid): ID bác sĩ
- `availability_slot_id` (required, uuid): ID khung giờ khám
- `patient_notes` (optional, string): Ghi chú/triệu chứng của bệnh nhân

---

### 5.5 Get My Appointments
**GET** `/api/appointments`

Lấy danh sách lịch hẹn của mình.
- **Patient:** Lấy lịch hẹn đã đặt
- **Doctor:** Lấy lịch hẹn được đặt

**Query Parameters:**
- `status` (optional, enum): Lọc theo trạng thái
- `from_date` (optional, date): Từ ngày
- `to_date` (optional, date): Đến ngày

**Status values:**
- `scheduled`: Đã đặt lịch
- `completed`: Đã hoàn thành
- `cancelled_by_patient`: Bệnh nhân hủy
- `cancelled_by_doctor`: Bác sĩ hủy

---

### 5.6 Get Appointment Details
**GET** `/api/appointments/:id`

Lấy chi tiết 1 lịch hẹn.

**Path Parameters:**
- `id` (required, uuid): Appointment ID

---

### 5.7 Update Status
**PATCH** `/api/appointments/:id/status`  
🩺 **Doctor only**

Cập nhật trạng thái lịch hẹn.

**Request Body:**
```json
{
  "status": "completed",
  "doctor_notes": "Đã khám xong. Chẩn đoán: Cảm cúm. Đã kê đơn thuốc."
}
```

**Parameters:**
- `status` (required, enum): Trạng thái mới
- `doctor_notes` (optional, string): Ghi chú của bác sĩ

---

### 5.8 Cancel Appointment
**PATCH** `/api/appointments/:id/cancel`

Hủy lịch hẹn.
- **Patient:** Trạng thái → `cancelled_by_patient`
- **Doctor:** Trạng thái → `cancelled_by_doctor`

**Path Parameters:**
- `id` (required, uuid): Appointment ID

---

## 6. HEALTH FACILITIES APIs
**Base:** `/api/facilities`

### 6.1 Get All Facilities
**GET** `/api/facilities`

Lấy danh sách cơ sở y tế (có phân trang).

**Query Parameters:**
- `page` (optional, number): Trang (default: 1)
- `limit` (optional, number): Số lượng/trang (default: 100)

---

### 6.2 Search Facilities
**GET** `/api/facilities/search`

Tìm kiếm cơ sở y tế với bộ lọc nâng cao.

**Query Parameters:**
- `name` (optional, string): Tìm theo tên
- `type` (optional, string): Loại (pharmacy, hospital, clinic, dentist, doctor)
- `city` (optional, string): Thành phố
- `limit` (optional, number): Số lượng kết quả

**Example:**
```
GET /api/facilities/search?name=Chợ Rẫy&type=hospital&city=Hồ Chí Minh
```

---

### 6.3 Find Nearest Facilities
**GET** `/api/facilities/nearest`

Tìm cơ sở y tế gần nhất dựa trên vị trí GPS.

**Query Parameters:**
- `lat` (required, number): Vĩ độ (latitude)
- `lng` (required, number): Kinh độ (longitude)
- `radius` (optional, number): Bán kính tìm kiếm (mét, default: 5000)
- `limit` (optional, number): Số lượng kết quả (default: 10)
- `type` (optional, string): Loại cơ sở y tế

**Example:**
```
GET /api/facilities/nearest?lat=10.7769&lng=106.7009&radius=3000&limit=5&type=pharmacy
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "ogc_fid": 1,
      "osm_id": 123456789,
      "name": "Nhà thuốc ABC",
      "name_vi": "Nhà thuốc ABC",
      "amenity": "pharmacy",
      "healthcare": "pharmacy",
      "addr_city": "Hồ Chí Minh",
      "addr_full": "123 Nguyễn Văn Cừ, Quận 5",
      "operator_t": "Công ty TNHH ABC",
      "distance_meters": 150.5,
      "lng": 106.70091,
      "lat": 10.77691
    }
  ],
  "query_params": {
    "latitude": 10.7769,
    "longitude": 106.7009,
    "radius_meters": 3000,
    "type": "pharmacy",
    "limit": 5
  }
}
```

---

### 6.4 Get Facilities Stats
**GET** `/api/facilities/stats`

Lấy thống kê cơ sở y tế.

**Query Parameters:**
- `city` (optional, string): Lọc theo thành phố

**Example:**
```
GET /api/facilities/stats?city=Hồ Chí Minh
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 3309,
    "by_type": {
      "pharmacy": 1500,
      "hospital": 200,
      "clinic": 800,
      "dentist": 400,
      "doctor": 300,
      "other": 109
    },
    "cities": ["Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "..."]
  }
}
```

---

### 6.5 Get Facilities by Type
**GET** `/api/facilities/type/:type`

Lấy danh sách cơ sở y tế theo loại.

**Path Parameters:**
- `type` (required, string): Loại cơ sở y tế
  - `pharmacy`: Nhà thuốc
  - `hospital`: Bệnh viện
  - `clinic`: Phòng khám, trạm y tế
  - `dentist`: Nha khoa
  - `doctor`: Phòng khám bác sĩ

**Query Parameters:**
- `page` (optional, number): Trang
- `limit` (optional, number): Số lượng/trang
- `city` (optional, string): Lọc theo thành phố

**Example:**
```
GET /api/facilities/type/pharmacy?city=Hồ Chí Minh&page=1&limit=20
```

---

### 6.6 Get Facilities in Area
**POST** `/api/facilities/in-area`

Tìm cơ sở y tế trong vùng địa lý (polygon).

**Request Body:**
```json
{
  "polygon": [
    [106.7009, 10.7769],
    [106.7024, 10.7765],
    [106.7028, 10.7762],
    [106.7025, 10.7759]
  ],
  "type": "pharmacy",
  "limit": 50
}
```

**Parameters:**
- `polygon` (required, array): Mảng tọa độ [lng, lat] tạo thành polygon
- `type` (optional, string): Loại cơ sở y tế
- `limit` (optional, number): Số lượng kết quả (default: 100)

---

### 6.7 Get Facility by ID
**GET** `/api/facilities/:id`

Lấy thông tin chi tiết 1 cơ sở y tế.

**Path Parameters:**
- `id` (required, number): Facility ID (ogc_fid)

---

## 7. REMINDERS APIs
**Base:** `/api/reminders`  
🔒👤 **Patient only**

### 7.1 Create Reminder
**POST** `/api/reminders`

Tạo lời nhắc mới.

**Request Body:**
```json
{
  "reminder_type": "medication",
  "title": "Uống thuốc huyết áp",
  "description": "Uống 1 viên sau bữa sáng",
  "reminder_time": "08:00:00",
  "is_recurring": true,
  "recurrence_pattern": "daily"
}
```

**Parameters:**
- `reminder_type` (required, enum): Loại nhắc nhở
  - `medication`: Uống thuốc
  - `sleep`: Giấc ngủ
  - `appointment`: Lịch hẹn
  - `general`: Chung
- `title` (required, string): Tiêu đề
- `description` (optional, string): Mô tả chi tiết
- `reminder_time` (required, time): Thời gian nhắc (HH:MM:SS)
- `is_recurring` (optional, boolean): Có lặp lại không (default: false)
- `recurrence_pattern` (optional, string): Mẫu lặp lại (daily, weekly, monthly)

---

### 7.2 Get My Reminders
**GET** `/api/reminders`

Lấy danh sách lời nhắc của mình.

**Query Parameters:**
- `reminder_type` (optional, enum): Lọc theo loại
- `is_active` (optional, boolean): Lọc theo trạng thái active

**Example:**
```
GET /api/reminders?reminder_type=medication&is_active=true
```

---

### 7.3 Update Reminder
**PUT** `/api/reminders/:id`

Cập nhật lời nhắc.

**Path Parameters:**
- `id` (required, uuid): Reminder ID

**Request Body:** Giống Create Reminder

---

### 7.4 Toggle Active
**PATCH** `/api/reminders/:id/toggle`

Bật/tắt lời nhắc.

**Path Parameters:**
- `id` (required, uuid): Reminder ID

---

### 7.5 Delete Reminder
**DELETE** `/api/reminders/:id`

Xóa lời nhắc.

**Path Parameters:**
- `id` (required, uuid): Reminder ID

---

## 8. CHAT APIs
**Base:** `/api/chat`  
🔒 **Requires Authentication**

### 8.1 Create Conversation
**POST** `/api/chat/conversations`  
👤 **Patient only**

Tạo cuộc hội thoại mới với bác sĩ.

**Request Body:**
```json
{
  "doctor_user_id": "doctor-uuid"
}
```

**Parameters:**
- `doctor_user_id` (required, uuid): ID bác sĩ

---

### 8.2 Get My Conversations
**GET** `/api/chat/conversations`

Lấy danh sách cuộc hội thoại của mình.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "conversation-uuid",
      "patient_user_id": "patient-uuid",
      "doctor_user_id": "doctor-uuid",
      "patient_name": "Nguyễn Văn A",
      "doctor_name": "BS. Nguyễn Văn B",
      "last_message": "Cảm ơn bác sĩ",
      "last_message_time": "2024-01-15T10:30:00Z",
      "unread_count": 2
    }
  ]
}
```

---

### 8.3 Get Messages
**GET** `/api/chat/conversations/:conversationId/messages`

Lấy danh sách tin nhắn trong cuộc hội thoại.

**Path Parameters:**
- `conversationId` (required, uuid): Conversation ID

**Query Parameters:**
- `limit` (optional, number): Số lượng tin nhắn (default: 50)
- `before_id` (optional, bigint): Lấy tin nhắn trước message ID này (pagination)

---

### 8.4 Send Message
**POST** `/api/chat/conversations/:conversationId/messages`

Gửi tin nhắn.

**Path Parameters:**
- `conversationId` (required, uuid): Conversation ID

**Request Body:**
```json
{
  "message_content": "Chào bác sĩ, em muốn hỏi về kết quả xét nghiệm"
}
```

**Parameters:**
- `message_content` (required, string): Nội dung tin nhắn

---

### 8.5 Mark as Read
**PATCH** `/api/chat/messages/:messageId/read`

Đánh dấu tin nhắn đã đọc.

**Path Parameters:**
- `messageId` (required, bigint): Message ID

---

## 9. ARTICLES APIs
**Base:** `/api/articles`

### 9.1 Get All Articles (Public)
**GET** `/api/articles`

Lấy danh sách bài viết đã publish.

**Query Parameters:**
- `page` (optional, number): Trang (default: 1)
- `limit` (optional, number): Số lượng/trang (default: 10)
- `status` (optional, enum): Lọc theo trạng thái (chỉ admin mới dùng được)

**Example:**
```
GET /api/articles?page=1&limit=10
```

---

### 9.2 Get Article by Slug (Public)
**GET** `/api/articles/slug/:slug`

Lấy bài viết theo slug.

**Path Parameters:**
- `slug` (required, string): Article slug (URL-friendly)

**Example:**
```
GET /api/articles/slug/cach-phong-benh-cum
```

---

### 9.3 Get Article by ID (Public)
**GET** `/api/articles/:id`

Lấy bài viết theo ID.

**Path Parameters:**
- `id` (required, uuid): Article ID

---

### 9.4 Create Article
**POST** `/api/articles`  
🔒👑 **Admin only**

Tạo bài viết mới.

**Request Body:**
```json
{
  "title": "10 cách phòng bệnh cúm hiệu quả",
  "slug": "cach-phong-benh-cum",
  "content_body": "# Nội dung bài viết\n\n...",
  "external_url": "https://vnexpress.net/...",
  "featured_image_url": "https://example.com/image.jpg",
  "status": "draft"
}
```

**Parameters:**
- `title` (required, string): Tiêu đề
- `slug` (required, string): Slug (unique, URL-friendly)
- `content_body` (optional, string): Nội dung bài viết (Markdown)
- `external_url` (optional, string): Link bài viết gốc (nếu là bài từ nguồn khác)
- `featured_image_url` (optional, string): Ảnh đại diện
- `status` (optional, enum): Trạng thái (`draft`, `published`, `archived`, default: `draft`)

**Note:** Nếu có `external_url`, Android app sẽ mở link gốc thay vì hiển thị `content_body`

---

### 9.5 Update Article
**PUT** `/api/articles/:id`  
🔒👑 **Admin only**

Cập nhật bài viết.

**Request Body:** Giống Create Article

---

### 9.6 Publish Article
**PATCH** `/api/articles/:id/publish`  
🔒👑 **Admin only**

Publish bài viết (status → published, set published_at).

**Path Parameters:**
- `id` (required, uuid): Article ID

---

### 9.7 Delete Article
**DELETE** `/api/articles/:id`  
🔒👑 **Admin only**

Xóa bài viết.

**Path Parameters:**
- `id` (required, uuid): Article ID

---

## 10. ADMIN DASHBOARD APIs
**Base:** `/api/admin`  
🔒👑 **Admin only**

### 10.1 Get Dashboard
**GET** `/api/admin/dashboard`

Lấy tổng quan dashboard (thống kê tổng thể).

**Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 1250,
      "patients": 1000,
      "doctors": 200,
      "admins": 50
    },
    "appointments": {
      "total": 5000,
      "scheduled": 150,
      "completed": 4500,
      "cancelled": 350
    },
    "articles": {
      "total": 100,
      "published": 80,
      "draft": 15,
      "archived": 5
    },
    "facilities": {
      "total": 3309
    }
  }
}
```

---

### 10.2 Get Recent Appointments
**GET** `/api/admin/recent-appointments`

Lấy danh sách lịch hẹn gần đây.

**Query Parameters:**
- `limit` (optional, number): Số lượng (default: 10)
- `status` (optional, enum): Lọc theo trạng thái

---

## 🔐 AUTHENTICATION

### Header Format
Tất cả API có dấu 🔒 yêu cầu gửi JWT token trong header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Token Expiration
- Access Token: **24 giờ**
- Sau khi token hết hạn, cần login lại để lấy token mới

---

## 📝 RESPONSE FORMAT

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}
```

### Common HTTP Status Codes
- `200 OK`: Thành công
- `201 Created`: Tạo mới thành công
- `400 Bad Request`: Dữ liệu không hợp lệ
- `401 Unauthorized`: Chưa đăng nhập hoặc token không hợp lệ
- `403 Forbidden`: Không có quyền truy cập
- `404 Not Found`: Không tìm thấy resource
- `500 Internal Server Error`: Lỗi server

---

## 🌍 COORDINATE SYSTEM

### Facilities API
- **Hệ tọa độ:** WGS84 (EPSG:4326)
- **Format:** `[longitude, latitude]` hoặc `lng, lat`
- **Khoảng cách:** Tính bằng **mét**
- **PostGIS:** Sử dụng để tính toán không gian địa lý

### Example Coordinates
- **Hồ Chí Minh:** `lng: 106.7009, lat: 10.7769`
- **Hà Nội:** `lng: 105.8342, lat: 21.0285`

---

## 📱 ANDROID APP INTEGRATION

### Step 1: Login
```kotlin
POST /api/auth/login
Body: { "email": "patient@example.com", "password": "123456" }
Save: token from response.data.token
```

### Step 2: Get Profile
```kotlin
GET /api/auth/profile
Header: Authorization: Bearer {token}
```

### Step 3: Find Nearest Pharmacies
```kotlin
GET /api/facilities/nearest?lat=10.7769&lng=106.7009&type=pharmacy&limit=10
```

### Step 4: Book Appointment
```kotlin
// Get available slots
GET /api/appointments/availability?doctor_user_id={doctorId}

// Book appointment
POST /api/appointments
Body: {
  "doctor_user_id": "{doctorId}",
  "availability_slot_id": "{slotId}",
  "patient_notes": "Đau đầu"
}
```

---

## 🚀 DEPLOYMENT

### Production URL
```
https://be-healthcareapppd.onrender.com
```

### Environment Variables (Render)
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
NODE_ENV=production
PORT=5000
```

### Database
- **PostgreSQL 14+** with **PostGIS** extension
- **3,309 health facilities** (OpenStreetMap data)
- Auto-created tables via `/api/database/initialize`

---

**📅 Last Updated:** November 18, 2025  
**📧 Contact:** hophuoc4so9 (GitHub)

