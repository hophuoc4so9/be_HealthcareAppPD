# PD HEALTH - API DOCUMENTATION

## 📡 Base URL
- **Development:** `http://localhost:5000`
- **Production:** `https://be-healthcareapppd.onrender.com`

---

## 📋 MỤC LỤC

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

---

### 1.3 Change Password
**POST** `/api/auth/change-password`  
🔒 **Yêu cầu xác thực**

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

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### 1.4 Get Profile
**GET** `/api/auth/profile`  
🔒 **Yêu cầu xác thực**

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

**Response:**
```json
{
  "success": true,
  "message": "Token is valid",
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
🔒👑 **Tất cả route yêu cầu quyền Admin**

### 2.1 Get All Users
**GET** `/api/users`

Lấy danh sách tất cả users.

**Query Parameters:**
- `page` (optional): Trang hiện tại (default: 1)
- `limit` (optional): Số lượng/trang (default: 20)
- `role` (optional): Lọc theo role (`patient`, `doctor`, `admin`)

**Example:**
```
GET /api/users?page=1&limit=10&role=patient
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
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
    "total_users": 100,
    "total_patients": 80,
    "total_doctors": 15,
    "total_admins": 5,
    "active_users": 90,
    "banned_users": 2
  }
}
```

---

### 2.3 Search Users
**GET** `/api/users/search`

Tìm kiếm users theo email.

**Query Parameters:**
- `q` (required): Từ khóa tìm kiếm (email)
- `role` (optional): Lọc theo role

**Example:**
```
GET /api/users/search?q=john@example.com
```

---

### 2.4 Get User by ID
**GET** `/api/users/:id`

Lấy thông tin user theo ID.

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

---

### 2.6 Delete User
**DELETE** `/api/users/:id`

Xóa user vĩnh viễn.

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
🔒 **Yêu cầu xác thực**

### 3.1 Create Profile
**POST** `/api/patients/profile`  
👤 **Chỉ Patient**

Tạo patient profile (chỉ tạo được 1 lần).

**Request Body:**
```json
{
  "fullName": "Nguyễn Văn A",
  "dateOfBirth": "1990-01-01",
  "sex": "male",
  "phoneNumber": "0901234567",
  "address": "123 Nguyễn Huệ, Quận 1, TP.HCM"
}
```

**Note:** Tất cả fields đều optional khi tạo profile lần đầu. Nếu không có `fullName`, hệ thống sẽ tự động tạo.

---

### 3.2 Get My Profile
**GET** `/api/patients/profile`  
👤 **Chỉ Patient**

Lấy profile của bản thân.

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "full_name": "Nguyễn Văn A",
    "date_of_birth": "1990-01-01",
    "sex": "male",
    "phone_number": "0901234567",
    "address": "123 Nguyễn Huệ, Quận 1, TP.HCM",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "email": "patient@example.com",
    "role": "patient",
    "is_active": true
  }
}
```

---

### 3.3 Update My Profile
**PUT** `/api/patients/profile`  
👤 **Chỉ Patient**

Cập nhật profile.

**Request Body:**
```json
{
  "fullName": "Nguyễn Văn A",
  "dateOfBirth": "1990-01-01",
  "sex": "male",
  "phoneNumber": "0901234567",
  "address": "123 Nguyễn Huệ, Quận 1, TP.HCM"
}
```

**Note:** Tất cả fields đều optional, chỉ gửi những field cần cập nhật.

---

### 3.4 Get Patient Profile by ID
**GET** `/api/patients/:id/profile`  
👨‍⚕️👑 **Doctor hoặc Admin**

Lấy profile của patient theo ID.

---

### 3.5 Add Vitals
**POST** `/api/patients/vitals`  
👤 **Chỉ Patient**

Thêm chỉ số sức khỏe tĩnh.

**Request Body:**
```json
{
  "heightCm": 175,
  "weightKg": 70.5,
  "bloodPressureSystolic": 120,
  "bloodPressureDiastolic": 80,
  "heartRateBpm": 72,
  "temperatureCelsius": 36.5,
  "bloodGlucoseMgDl": 90,
  "oxygenSaturationPercent": 98
}
```

**Required:** Ít nhất phải có `heightCm` và `weightKg` (theo validation trong controller).

---

### 3.6 Get Vitals History
**GET** `/api/patients/vitals`  
👤 **Chỉ Patient**

Lấy lịch sử chỉ số sức khỏe.

**Query Parameters:**
- `limit` (optional): Số lượng records (default: 10)

**Example:**
```
GET /api/patients/vitals?limit=20
```

---

### 3.7 Get Latest Vitals
**GET** `/api/patients/vitals/latest`  
👤 **Chỉ Patient**

Lấy chỉ số sức khỏe mới nhất.

---

### 3.8 Delete Vitals
**DELETE** `/api/patients/vitals/:id`  
👤 **Chỉ Patient**

Xóa 1 record vitals.

---

### 3.9 Add Metrics
**POST** `/api/patients/metrics`  
👤 **Chỉ Patient**

Thêm health metrics từ thiết bị đeo.

**Request Body:**
```json
{
  "metricType": "steps",
  "value": 10000,
  "startTime": "2024-01-01T00:00:00Z",
  "endTime": "2024-01-01T23:59:59Z"
}
```

**Metric Types:**
- `steps`: Số bước chân
- `sleep_duration_minutes`: Thời gian ngủ (phút)
- `distance_meters`: Quãng đường (mét)
- `active_calories`: Calories tiêu hao

---

### 3.10 Get Metrics
**GET** `/api/patients/metrics`  
👤 **Chỉ Patient**

Lấy metrics theo loại và khoảng thời gian.

**Query Parameters:**
- `metricType` (required): Loại metric
- `startDate` (optional): Từ ngày (ISO 8601)
- `endDate` (optional): Đến ngày (ISO 8601)

**Example:**
```
GET /api/patients/metrics?metricType=steps&startDate=2024-01-01&endDate=2024-01-31
```

---

### 3.11 Get Metrics Summary
**GET** `/api/patients/metrics/summary`  
👤 **Chỉ Patient**

Lấy tổng hợp metrics (avg, min, max, total).

**Query Parameters:** Giống Get Metrics

---

### 3.12 Delete Metrics
**DELETE** `/api/patients/metrics/:id`  
👤 **Chỉ Patient**

Xóa 1 record metrics.

---

### 3.13 Get All Patients
**GET** `/api/patients`  
👑 **Chỉ Admin**

Lấy tất cả patient profiles.

**Query Parameters:**
- `page` (optional): Trang hiện tại (default: 1)
- `limit` (optional): Số lượng/trang (default: 20)

---

## 4. DOCTOR PROFILE APIs

**Base:** `/api/doctors`  
🔒 **Yêu cầu xác thực**

### 4.1 Create Profile
**POST** `/api/doctors/profile`  
👨‍⚕️ **Chỉ Doctor**

Tạo doctor profile.

**Request Body:**
```json
{
  "fullName": "Bác sĩ Nguyễn Văn B",
  "specialization": "Nội khoa",
  "medicalLicenseId": "BS12345",
  "clinicAddress": "Bệnh viện ABC, TP.HCM",
  "bio": "Bác sĩ chuyên khoa nội với 10 năm kinh nghiệm"
}
```

**Required:** `fullName` và `specialization`

---

### 4.2 Get My Profile
**GET** `/api/doctors/profile`  
👨‍⚕️ **Chỉ Doctor**

Lấy profile của bản thân.

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "full_name": "Bác sĩ Nguyễn Văn B",
    "specialization": "Nội khoa",
    "medical_license_id": "BS12345",
    "clinic_address": "Bệnh viện ABC, TP.HCM",
    "bio": "Bác sĩ chuyên khoa nội với 10 năm kinh nghiệm",
    "status": "pending",
    "admin_notes": null,
    "created_at": "2024-01-01T00:00:00.000Z",
    "email": "doctor@example.com"
  }
}
```

**Status Values:**
- `pending`: Chờ xác minh
- `approved`: Đã xác minh
- `rejected`: Bị từ chối

---

### 4.3 Update My Profile
**PUT** `/api/doctors/profile`  
👨‍⚕️ **Chỉ Doctor**

Cập nhật profile.

**Request Body:** Giống Create Profile (tất cả fields optional)

---

### 4.4 Get Doctor Profile by ID
**GET** `/api/doctors/:id/profile`

Lấy profile của doctor theo ID (public).

---

### 4.5 Update Verification Status
**PATCH** `/api/doctors/:id/verification`  
👑 **Chỉ Admin**

Cập nhật trạng thái xác minh doctor.

**Request Body:**
```json
{
  "status": "approved",
  "adminNotes": "Đã xác minh thông tin"
}
```

**Required:** `status` (`pending`, `approved`, `rejected`)

---

### 4.6 Get All Doctors
**GET** `/api/doctors`

Lấy danh sách doctors.

**Query Parameters:**
- `page` (optional): Trang hiện tại (default: 1)
- `limit` (optional): Số lượng/trang (default: 20)
- `status` (optional): Lọc theo status

**Example:**
```
GET /api/doctors?page=1&limit=10&status=approved
```

---

### 4.7 Search Doctors by Specialization
**GET** `/api/doctors/search`

Tìm kiếm doctors theo chuyên khoa.

**Query Parameters:**
- `q` (required): Từ khóa tìm kiếm
- `limit` (optional): Số lượng kết quả (default: 20)

**Example:**
```
GET /api/doctors/search?q=Nội khoa&limit=10
```

---

## 5. APPOINTMENTS APIs

**Base:** `/api/appointments`  
🔒 **Yêu cầu xác thực**

### 5.1 Create Availability (Doctor)
**POST** `/api/appointments/availability`  
👨‍⚕️ **Chỉ Doctor**

Tạo khung giờ có sẵn.

**Request Body:**
```json
{
  "startTime": "2024-01-15T09:00:00Z",
  "endTime": "2024-01-15T10:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "doctor_user_id": "uuid",
    "start_time": "2024-01-15T09:00:00Z",
    "end_time": "2024-01-15T10:00:00Z",
    "is_booked": false,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 5.2 Get My Availability (Doctor)
**GET** `/api/appointments/availability`  
👨‍⚕️ **Chỉ Doctor**

Lấy danh sách khung giờ có sẵn của mình.

---

### 5.3 Delete Availability (Doctor)
**DELETE** `/api/appointments/availability/:id`  
👨‍⚕️ **Chỉ Doctor**

Xóa khung giờ có sẵn.

---

### 5.4 Book Appointment (Patient)
**POST** `/api/appointments`  
👤 **Chỉ Patient**

Đặt lịch hẹn.

**Request Body:**
```json
{
  "doctorUserId": "uuid",
  "availabilitySlotId": "uuid",
  "patientNotes": "Tôi bị đau đầu và sốt"
}
```

**Required:** `doctorUserId` và `availabilitySlotId`

---

### 5.5 Get My Appointments
**GET** `/api/appointments`

Lấy danh sách appointments của mình (Patient hoặc Doctor).

**Query Parameters:**
- `status` (optional): Lọc theo status (`scheduled`, `completed`, `cancelled`, `no_show`)

**Example:**
```
GET /api/appointments?status=scheduled
```

---

### 5.6 Get Appointment Details
**GET** `/api/appointments/:id`

Lấy chi tiết appointment.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "patient_user_id": "uuid",
    "doctor_user_id": "uuid",
    "availability_slot_id": "uuid",
    "status": "scheduled",
    "patient_notes": "Tôi bị đau đầu",
    "doctor_notes": null,
    "created_at": "2024-01-01T00:00:00.000Z",
    "patient_name": "Nguyễn Văn A",
    "doctor_name": "Bác sĩ Nguyễn Văn B",
    "specialization": "Nội khoa",
    "start_time": "2024-01-15T09:00:00Z",
    "end_time": "2024-01-15T10:00:00Z"
  }
}
```

---

### 5.7 Update Appointment Status
**PATCH** `/api/appointments/:id/status`

Cập nhật trạng thái appointment.

**Request Body:**
```json
{
  "status": "completed"
}
```

**Status Values:**
- `scheduled`: Đã đặt lịch
- `completed`: Hoàn thành
- `cancelled`: Đã hủy
- `no_show`: Bệnh nhân không đến

---

### 5.8 Cancel Appointment
**PATCH** `/api/appointments/:id/cancel`

Hủy appointment (Patient hoặc Doctor).

---

## 6. HEALTH FACILITIES APIs

**Base:** `/api/facilities`

### 6.1 Get All Facilities
**GET** `/api/facilities`

Lấy danh sách cơ sở y tế.

**Query Parameters:**
- `page` (optional): Trang hiện tại (default: 1)
- `limit` (optional): Số lượng/trang (default: 100)

**Example:**
```
GET /api/facilities?page=1&limit=50
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
      "name_en": "ABC Pharmacy",
      "amenity": "pharmacy",
      "healthcare": "pharmacy",
      "building": null,
      "addr_city": "Bạc Liêu",
      "addr_full": "123 Đường ABC, Bạc Liêu",
      "operator": "Công ty ABC",
      "capacity": null,
      "source": "OpenStreetMap",
      "osm_id": "123456",
      "osm_type": "node",
      "geom": "POINT(105.4020621 10.2360937)"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 1000,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### 6.2 Get Facility by ID
**GET** `/api/facilities/:id`

Lấy thông tin cơ sở y tế theo ID.

---

### 6.3 Find Nearest Facilities
**GET** `/api/facilities/nearest`

Tìm cơ sở y tế gần nhất.

**Query Parameters:**
- `lat` (required): Vĩ độ
- `lng` (required): Kinh độ
- `radius` (optional): Bán kính tìm kiếm (mét, default: 5000)
- `limit` (optional): Số lượng kết quả (default: 10)
- `type` (optional): Loại cơ sở (`hospital`, `clinic`, `pharmacy`, `doctor`)

**Example:**
```
GET /api/facilities/nearest?lat=10.2360937&lng=105.4020621&radius=5000&limit=10&type=pharmacy
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Nhà thuốc ABC",
      "amenity": "pharmacy",
      "healthcare": "pharmacy",
      "addr_city": "Bạc Liêu",
      "addr_full": "123 Đường ABC, Bạc Liêu",
      "geom": "POINT(105.4020621 10.2360937)",
      "distance_meters": 150.5
    }
  ],
  "query_params": {
    "latitude": 10.2360937,
    "longitude": 105.4020621,
    "radius_meters": 5000,
    "type": "pharmacy",
    "limit": 10
  }
}
```

---

### 6.4 Get Facilities by Type
**GET** `/api/facilities/type/:type`

Lấy cơ sở y tế theo loại.

**Path Parameters:**
- `type`: Loại cơ sở (`hospital`, `clinic`, `pharmacy`, `doctor`)

**Query Parameters:**
- `page` (optional): Trang hiện tại (default: 1)
- `limit` (optional): Số lượng/trang (default: 100)
- `city` (optional): Lọc theo thành phố
- `operator` (optional): Lọc theo đơn vị vận hành

**Example:**
```
GET /api/facilities/type/pharmacy?page=1&limit=20&city=Bạc Liêu
```

---

### 6.5 Search Facilities
**GET** `/api/facilities/search`

Tìm kiếm cơ sở y tế.

**Query Parameters:**
- `name` (optional): Tên cơ sở
- `city` (optional): Thành phố
- `type` (optional): Loại cơ sở
- `operator` (optional): Đơn vị vận hành
- `page` (optional): Trang hiện tại (default: 1)
- `limit` (optional): Số lượng/trang (default: 100)

**Example:**
```
GET /api/facilities/search?name=ABC&city=Bạc Liêu&type=pharmacy
```

---

### 6.6 Get Facility Statistics
**GET** `/api/facilities/stats`

Lấy thống kê cơ sở y tế.

**Query Parameters:**
- `city` (optional): Lọc theo thành phố

**Response:**
```json
{
  "success": true,
  "data": {
    "total_facilities": 1000,
    "by_type": {
      "pharmacy": 500,
      "hospital": 200,
      "clinic": 250,
      "doctor": 50
    },
    "by_city": {
      "Bạc Liêu": 150,
      "Cần Thơ": 300,
      "Sóc Trăng": 200
    }
  }
}
```

---

### 6.7 Create Facility
**POST** `/api/facilities`  
👑 **Chỉ Admin**

Tạo cơ sở y tế mới.

**Request Body:**
```json
{
  "name": "Nhà thuốc XYZ",
  "name_vi": "Nhà thuốc XYZ",
  "name_en": "XYZ Pharmacy",
  "amenity": "pharmacy",
  "healthcare": "pharmacy",
  "addr_city": "Bạc Liêu",
  "addr_full": "456 Đường DEF, Bạc Liêu",
  "operator": "Công ty XYZ",
  "geom": "POINT(105.4020621 10.2360937)"
}
```

---

### 6.8 Update Facility
**PUT** `/api/facilities/:id`  
👑 **Chỉ Admin**

Cập nhật thông tin cơ sở y tế.

---

### 6.9 Delete Facility
**DELETE** `/api/facilities/:id`  
👑 **Chỉ Admin**

Xóa cơ sở y tế.

---

## 7. REMINDERS APIs

**Base:** `/api/reminders`  
🔒 **Yêu cầu xác thực**  
👤 **Chỉ Patient**

### 7.1 Create Reminder
**POST** `/api/reminders`

Tạo nhắc nhở.

**Request Body:**
```json
{
  "title": "Uống thuốc",
  "description": "Uống thuốc huyết áp",
  "reminderType": "medication",
  "cronExpression": "0 8 * * *",
  "timezoneName": "Asia/Ho_Chi_Minh"
}
```

**Reminder Types:**
- `medication`: Uống thuốc
- `sleep`: Giấc ngủ
- `appointment`: Lịch hẹn
- `general`: Chung

**Cron Expression Examples:**
- `0 8 * * *`: Mỗi ngày lúc 8:00 AM
- `0 8,20 * * *`: Mỗi ngày lúc 8:00 AM và 8:00 PM
- `0 9 * * 1-5`: Thứ 2 đến Thứ 6 lúc 9:00 AM

**One-time Reminder:**
```json
{
  "title": "Khám bệnh",
  "description": "Khám bệnh tại phòng khám ABC",
  "reminderType": "appointment",
  "oneTimeAt": "2024-01-15T09:00:00Z",
  "timezoneName": "Asia/Ho_Chi_Minh"
}
```

---

### 7.2 Get My Reminders
**GET** `/api/reminders`

Lấy danh sách nhắc nhở của mình.

---

### 7.3 Update Reminder
**PUT** `/api/reminders/:id`

Cập nhật nhắc nhở.

**Request Body:** Giống Create Reminder (tất cả fields optional)

---

### 7.4 Toggle Active
**PATCH** `/api/reminders/:id/toggle`

Bật/tắt nhắc nhở.

**Request Body:**
```json
{
  "isActive": true
}
```

---

### 7.5 Delete Reminder
**DELETE** `/api/reminders/:id`

Xóa nhắc nhở.

---

## 8. CHAT APIs

**Base:** `/api/chat`  
🔒 **Yêu cầu xác thực**

### 8.1 Get My Conversations
**GET** `/api/chat/conversations`

Lấy danh sách cuộc trò chuyện của mình.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "patient_user_id": "uuid",
      "doctor_user_id": "uuid",
      "created_at": "2024-01-01T00:00:00.000Z",
      "patient_email": "patient@example.com",
      "doctor_email": "doctor@example.com",
      "patient_name": "Nguyễn Văn A",
      "doctor_name": "Bác sĩ Nguyễn Văn B"
    }
  ]
}
```

---

### 8.2 Get Messages
**GET** `/api/chat/conversations/:id/messages`

Lấy tin nhắn trong cuộc trò chuyện.

**Query Parameters:**
- `limit` (optional): Số lượng tin nhắn (default: 50)

---

### 8.3 Send Message
**POST** `/api/chat/conversations/:id/messages`

Gửi tin nhắn.

**Request Body:**
```json
{
  "messageContent": "Xin chào bác sĩ"
}
```

---

### 8.4 Mark as Read
**PATCH** `/api/chat/messages/:id/read`

Đánh dấu tin nhắn đã đọc.

---

## 9. ARTICLES APIs

**Base:** `/api/articles`

### 9.1 Get All Articles
**GET** `/api/articles`

Lấy danh sách bài viết.

**Query Parameters:**
- `page` (optional): Trang hiện tại (default: 1)
- `limit` (optional): Số lượng/trang (default: 20)
- `status` (optional): Lọc theo status (`draft`, `published`) - chỉ Admin

**Example:**
```
GET /api/articles?page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "author_admin_id": "uuid",
      "title": "Cách phòng ngừa cảm cúm",
      "slug": "cach-phong-ngua-cam-cum",
      "content": "Nội dung bài viết...",
      "external_url": null,
      "featured_image_url": "https://example.com/image.jpg",
      "status": "published",
      "published_at": "2024-01-01T00:00:00.000Z",
      "created_at": "2024-01-01T00:00:00.000Z",
      "author_email": "admin@example.com"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

---

### 9.2 Get Article by ID
**GET** `/api/articles/:id`

Lấy bài viết theo ID.

---

### 9.3 Get Article by Slug
**GET** `/api/articles/slug/:slug`

Lấy bài viết theo slug (URL-friendly).

---

### 9.4 Create Article
**POST** `/api/articles`  
👑 **Chỉ Admin**

Tạo bài viết mới.

**Request Body:**
```json
{
  "title": "Cách phòng ngừa cảm cúm",
  "slug": "cach-phong-ngua-cam-cum",
  "contentBody": "Nội dung bài viết...",
  "featuredImageUrl": "https://example.com/image.jpg",
  "externalUrl": null
}
```

**Required:** `title`

**Note:** 
- Nếu không có `slug`, hệ thống sẽ tự tạo từ `title`
- Có thể dùng `contentBody` (nội dung trực tiếp) HOẶC `externalUrl` (link bài viết ngoài)

---

### 9.5 Update Article
**PUT** `/api/articles/:id`  
👑 **Chỉ Admin**

Cập nhật bài viết.

**Request Body:** Giống Create Article (tất cả fields optional)

---

### 9.6 Publish Article
**PATCH** `/api/articles/:id/publish`  
👑 **Chỉ Admin**

Xuất bản bài viết (chuyển từ `draft` sang `published`).

---

### 9.7 Delete Article
**DELETE** `/api/articles/:id`  
👑 **Chỉ Admin**

Xóa bài viết.

---

## 10. ADMIN DASHBOARD APIs

**Base:** `/api/admin`  
🔒👑 **Yêu cầu quyền Admin**

### 10.1 Get Dashboard Stats
**GET** `/api/admin/dashboard/stats`

Lấy thống kê tổng quan.

**Response:**
```json
{
  "success": true,
  "data": {
    "total_patients": 1000,
    "total_doctors": 50,
    "total_appointments": 500,
    "pending_appointments": 20,
    "pending_verifications": 5,
    "published_articles": 30
  }
}
```

---

### 10.2 Get Recent Users
**GET** `/api/admin/dashboard/recent-users`

Lấy danh sách users mới đăng ký gần đây.

**Query Parameters:**
- `limit` (optional): Số lượng (default: 10)

---

### 10.3 Get Recent Appointments
**GET** `/api/admin/dashboard/recent-appointments`

Lấy danh sách appointments gần đây.

**Query Parameters:**
- `limit` (optional): Số lượng (default: 10)

---

### 10.4 Get Pending Doctor Verifications
**GET** `/api/admin/dashboard/pending-doctors`

Lấy danh sách doctors chờ xác minh.

---

### 10.5 Get Monthly Stats
**GET** `/api/admin/dashboard/monthly-stats`

Lấy thống kê theo tháng (6 tháng gần nhất).

---

## 📝 LƯU Ý CHUNG

### Authentication
Hầu hết các API đều yêu cầu JWT token trong header:
```
Authorization: Bearer YOUR_TOKEN
```

### Response Format
Tất cả API đều trả về format:
```json
{
  "success": true/false,
  "message": "Message",
  "data": {},
  "error": "Error message (nếu có)"
}
```

### Error Codes
- `400`: Bad Request - Dữ liệu không hợp lệ
- `401`: Unauthorized - Chưa đăng nhập
- `403`: Forbidden - Không có quyền truy cập
- `404`: Not Found - Không tìm thấy
- `500`: Internal Server Error - Lỗi server

### Field Naming Convention
- Request body sử dụng **camelCase**: `fullName`, `dateOfBirth`, `phoneNumber`
- Response data sử dụng **snake_case**: `full_name`, `date_of_birth`, `phone_number`

### Date/Time Format
- Sử dụng ISO 8601: `2024-01-01T00:00:00Z`
- Date only: `YYYY-MM-DD`
- Timezone: UTC hoặc `Asia/Ho_Chi_Minh`

---

**Version:** 1.0.0  
**Last Updated:** November 20, 2025
