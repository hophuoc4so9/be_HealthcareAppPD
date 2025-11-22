# PD HEALTH - COMPLETE API DOCUMENTATION

## 📡 Base URL
- **Development:** `http://localhost:5000`
- **Production:** `https://be-healthcareapppd.onrender.com`

**Version:** 2.0.0  
**Last Updated:** November 22, 2025

---

## 📋 TABLE OF CONTENTS

1. [Authentication APIs](#1-authentication-apis)
2. [Users Management APIs](#2-users-management-apis)
3. [Patient Profile & Health Data APIs](#3-patient-profile--health-data-apis)
4. [Doctor Profile APIs](#4-doctor-profile-apis)
5. [Appointments & Scheduling APIs](#5-appointments--scheduling-apis)
6. [Health Facilities APIs](#6-health-facilities-apis)
7. [Reminders APIs](#7-reminders-apis)
8. [Chat/Messaging APIs](#8-chatmessaging-apis)
9. [Articles APIs](#9-articles-apis)
10. [Admin Dashboard APIs](#10-admin-dashboard-apis)
11. [Database Management APIs](#11-database-management-apis)

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

**Roles:**
- `patient`: Bệnh nhân
- `doctor`: Bác sĩ
- `admin`: Quản trị viên

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "patient",
      "isActive": true,
      "createdAt": "2025-11-22T00:00:00.000Z"
    }
  }
}
```

---

### 1.2 Login
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "patient"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 1.3 Change Password
**POST** `/api/auth/change-password`  
🔒 **Yêu cầu xác thực**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword123"
}
```

---

### 1.4 Get Profile
**GET** `/api/auth/profile`  
🔒 **Yêu cầu xác thực**

Lấy thông tin user đang đăng nhập.

---

### 1.5 Verify Token
**POST** `/api/auth/verify-token`

Kiểm tra tính hợp lệ của JWT token.

---

## 2. USERS MANAGEMENT APIs

**Base:** `/api/users`  
🔒👑 **Tất cả route yêu cầu quyền Admin**

### 2.1 Get All Users
**GET** `/api/users?page=1&limit=20&role=patient`

**Query Parameters:**
- `page`: Trang (default: 1)
- `limit`: Số lượng/trang (default: 20)
- `role`: Lọc (`patient`, `doctor`, `admin`)

---

### 2.2 Get User Stats
**GET** `/api/users/stats`

Thống kê tổng quan users.

---

### 2.3 Search Users
**GET** `/api/users/search?q=john@example.com`

---

### 2.4 Get User by ID
**GET** `/api/users/:id`

---

### 2.5 Update User
**PUT** `/api/users/:id`

---

### 2.6 Delete User
**DELETE** `/api/users/:id`

---

### 2.7-2.10 User Status Management
- `PATCH /api/users/:id/activate` - Kích hoạt
- `PATCH /api/users/:id/deactivate` - Vô hiệu hóa
- `PATCH /api/users/:id/ban` - Cấm
- `PATCH /api/users/:id/unban` - Bỏ cấm

---

## 3. PATIENT PROFILE & HEALTH DATA APIs

**Base:** `/api/patients`

### A. Profile Management

#### 3.1 Create Profile
**POST** `/api/patients/profile`  
🔒👤 **Patient only**

**Request Body:**
```json
{
  "fullName": "Nguyễn Văn A",
  "dateOfBirth": "1990-01-01",
  "sex": "male",
  "phoneNumber": "0901234567",
  "address": "123 Nguyễn Huệ, Q1, TP.HCM"
}
```

**Sex options:** `male`, `female`, `other`, `prefer_not_to_say`

---

#### 3.2 Get My Profile
**GET** `/api/patients/profile`  
🔒👤 **Patient only**

Lấy profile của bản thân.

---

#### 3.3 Update My Profile
**PUT** `/api/patients/profile`  
🔒👤 **Patient only**

---

#### 3.4 Get Patient Profile by ID
**GET** `/api/patients/:id/profile`  
🔒👨‍⚕️👑 **Doctor or Admin**

Bác sĩ/Admin xem profile bệnh nhân.

---

### B. Vitals (Chỉ Số Tĩnh)

#### 3.5 Add Vitals
**POST** `/api/patients/vitals`  
🔒👤 **Patient only**

**Request Body:**
```json
{
  "heightCm": 175,
  "weightKg": 70.5
}
```

**Note:** BMI tự động tính toán

---

#### 3.6 Get Vitals History
**GET** `/api/patients/vitals?limit=10`  
🔒👤 **Patient only**

---

#### 3.7 Get Latest Vitals
**GET** `/api/patients/vitals/latest`  
🔒👤 **Patient only**

---

#### 3.8 Delete Vitals
**DELETE** `/api/patients/vitals/:id`  
🔒👤 **Patient only**

---

### C. Metrics (Chỉ Số Động)

#### 3.9 Add Metrics
**POST** `/api/patients/metrics`  
🔒👤 **Patient only**

**Request Body:**
```json
{
  "metricType": "steps",
  "value": 10000,
  "startTime": "2025-11-22T00:00:00Z",
  "endTime": "2025-11-22T23:59:59Z",
  "source": "Google Fit"
}
```

**Metric Types:**
- `steps` - Số bước chân
- `sleep_duration_minutes` - Thời gian ngủ (phút)
- `distance_meters` - Quãng đường (mét)
- `active_calories` - Calories tiêu hao

---

#### 3.10 Get Metrics
**GET** `/api/patients/metrics?metricType=steps&startDate=2025-11-01&endDate=2025-11-30`  
🔒👤 **Patient only**

---

#### 3.11 Get Metrics Summary
**GET** `/api/patients/metrics/summary?metricType=steps&startDate=2025-11-01&endDate=2025-11-30`  
🔒👤 **Patient only**

Lấy tổng hợp (avg, min, max, total).

---

#### 3.12 Delete Metrics
**DELETE** `/api/patients/metrics/:id`  
🔒👤 **Patient only**

---

### D. Doctor Access (Bác Sĩ Xem Chỉ Số Bệnh Nhân)

#### 3.13 Get Patient Vitals (Doctor)
**GET** `/api/patients/:id/vitals?limit=10`  
🔒👨‍⚕️👑 **Doctor or Admin**

Bác sĩ xem lịch sử chỉ số tĩnh của bệnh nhân.

**Response:**
```json
{
  "success": true,
  "data": {
    "patientUserId": "patient-uuid",
    "history": [
      {
        "id": 1,
        "patientUserId": "patient-uuid",
        "heightCm": 175,
        "weightKg": 70.5,
        "bmi": 23.02,
        "recordedAt": "2025-11-22T10:00:00.000Z"
      }
    ],
    "count": 1
  }
}
```

---

#### 3.14 Get Patient Latest Vitals (Doctor)
**GET** `/api/patients/:id/vitals/latest`  
🔒👨‍⚕️👑 **Doctor or Admin**

Bác sĩ xem chỉ số tĩnh mới nhất của bệnh nhân.

---

#### 3.15 Get Patient Metrics (Doctor)
**GET** `/api/patients/:id/metrics?metricType=steps&startDate=2025-11-01&endDate=2025-11-30`  
🔒👨‍⚕️👑 **Doctor or Admin**

Bác sĩ xem chỉ số động của bệnh nhân.

**Response:**
```json
{
  "success": true,
  "data": {
    "patientUserId": "patient-uuid",
    "metricType": "steps",
    "metrics": [
      {
        "id": 1,
        "metricType": "steps",
        "value": 10000,
        "startTime": "2025-11-22T00:00:00.000Z",
        "endTime": "2025-11-22T23:59:59.000Z",
        "source": "Google Fit"
      }
    ],
    "count": 1
  }
}
```

---

#### 3.16 Get Patient Metrics Summary (Doctor)
**GET** `/api/patients/:id/metrics/summary?metricType=steps&startDate=2025-11-01&endDate=2025-11-30`  
🔒👨‍⚕️👑 **Doctor or Admin**

Bác sĩ xem tổng hợp chỉ số của bệnh nhân.

---

### E. Admin Access

#### 3.17 Get All Patients
**GET** `/api/patients?page=1&limit=20`  
🔒👑 **Admin only**

---

## 4. DOCTOR PROFILE APIs

**Base:** `/api/doctors`

### 4.1 Create Profile
**POST** `/api/doctors/profile`  
🔒👨‍⚕️ **Doctor only**

**Request Body:**
```json
{
  "fullName": "Bác sĩ Nguyễn Văn B",
  "specialization": "Nội khoa",
  "medicalLicenseId": "BS12345",
  "clinicAddress": "Bệnh viện ABC, TP.HCM",
  "bio": "10 năm kinh nghiệm"
}
```

---

### 4.2 Get My Profile
**GET** `/api/doctors/profile`  
🔒👨‍⚕️ **Doctor only**

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "fullName": "Bác sĩ Nguyễn Văn B",
    "specialization": "Nội khoa",
    "status": "pending",
    "email": "doctor@example.com"
  }
}
```

**Status:** `pending`, `approved`, `rejected`

---

### 4.3 Update My Profile
**PUT** `/api/doctors/profile`  
🔒👨‍⚕️ **Doctor only**

---

### 4.4 Get Doctor by ID
**GET** `/api/doctors/:id/profile`

Public - Xem profile bác sĩ.

---

### 4.5 Update Verification Status
**PATCH** `/api/doctors/:id/verification`  
🔒👑 **Admin only**

**Request Body:**
```json
{
  "status": "approved",
  "adminNotes": "Đã xác minh"
}
```

---

### 4.6 Get All Doctors
**GET** `/api/doctors?page=1&limit=20&status=approved`

---

### 4.7 Search Doctors
**GET** `/api/doctors/search?q=Nội khoa&limit=10`

---

## 5. APPOINTMENTS & SCHEDULING APIs

**Base:** `/api/appointments`

### A. Doctor - Quản Lý Lịch Trống

#### 5.1 Generate Daily Slots
**POST** `/api/appointments/availability/generate-daily`  
🔒👨‍⚕️ **Doctor only**

Tự động tạo 10 khung giờ mặc định (8h, 9h, 10h, 11h, 13h, 14h, 15h, 16h, 19h, 20h).

**Request Body:**
```json
{
  "date": "2025-11-25"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Generated 10 time slots",
  "data": {
    "slots": [
      {
        "id": "uuid",
        "doctorUserId": "uuid",
        "startTime": "2025-11-25T08:00:00.000Z",
        "endTime": "2025-11-25T09:00:00.000Z",
        "isBooked": false
      }
    ],
    "count": 10
  }
}
```

---

#### 5.2 Get Availability By Date
**GET** `/api/appointments/availability/by-date?date=2025-11-25`  
🔒👨‍⚕️ **Doctor only**

Xem lịch của mình theo ngày.

---

#### 5.3 Toggle Date Availability
**POST** `/api/appointments/availability/toggle-date`  
🔒👨‍⚕️ **Doctor only**

Bật/tắt lịch theo ngày.

**Request Body (Bật):**
```json
{
  "date": "2025-11-25",
  "enable": true
}
```

**Request Body (Tắt):**
```json
{
  "date": "2025-11-25",
  "enable": false
}
```

**Note:** Khi tắt, chỉ xóa slot chưa được đặt.

---

#### 5.4 Get Calendar Overview
**GET** `/api/appointments/availability/calendar?startDate=2025-11-01&endDate=2025-11-30`  
🔒👨‍⚕️ **Doctor only**

Xem tổng quan lịch (thống kê theo ngày).

**Response:**
```json
{
  "success": true,
  "data": {
    "dates": [
      {
        "date": "2025-11-25",
        "totalSlots": 10,
        "availableSlots": 7,
        "bookedSlots": 3
      }
    ],
    "count": 1
  }
}
```

---

#### 5.5 Create Custom Availability
**POST** `/api/appointments/availability`  
🔒👨‍⚕️ **Doctor only**

Tạo khung giờ tùy chỉnh.

**Request Body:**
```json
{
  "startTime": "2025-11-25T14:30:00Z",
  "endTime": "2025-11-25T15:30:00Z"
}
```

---

#### 5.6 Get My Availability
**GET** `/api/appointments/availability`  
🔒👨‍⚕️ **Doctor only**

---

#### 5.7 Delete Availability
**DELETE** `/api/appointments/availability/:id`  
🔒👨‍⚕️ **Doctor only**

---

### B. Patient - Xem Lịch & Đặt Hẹn

#### 5.8 View Doctor Available Slots
**GET** `/api/appointments/doctors/:doctorUserId/available-slots?date=2025-11-25`  
🔒 **Authenticated**

Bệnh nhân xem lịch trống của bác sĩ.

**Query Parameters:**
- `date` (optional): Ngày cụ thể. Không truyền = tất cả slot sắp tới.

**Response:**
```json
{
  "success": true,
  "data": {
    "doctorUserId": "doctor-uuid",
    "date": "2025-11-25",
    "slots": [
      {
        "id": "slot-uuid",
        "startTime": "2025-11-25T08:00:00.000Z",
        "endTime": "2025-11-25T09:00:00.000Z",
        "isBooked": false
      }
    ],
    "count": 5
  }
}
```

---

#### 5.9 View Doctor Available Slots Range
**GET** `/api/appointments/doctors/:doctorUserId/available-slots/range?startDate=2025-11-25&endDate=2025-11-30`  
🔒 **Authenticated**

Xem lịch trống theo khoảng thời gian.

---

#### 5.10 Book Appointment
**POST** `/api/appointments`  
🔒👤 **Patient only**

**Request Body:**
```json
{
  "doctorUserId": "doctor-uuid",
  "availabilitySlotId": "slot-uuid",
  "patientNotes": "Tôi bị đau đầu..."
}
```

---

### C. Quản Lý Appointments

#### 5.11 Get My Appointments
**GET** `/api/appointments?status=scheduled`  
🔒 **Authenticated**

Patient/Doctor xem appointments của mình.

**Status:** `scheduled`, `completed`, `cancelled_by_patient`, `cancelled_by_doctor`

---

#### 5.12 Get Appointment Details
**GET** `/api/appointments/:id`  
🔒 **Authenticated**

---

#### 5.13 Update Status
**PATCH** `/api/appointments/:id/status`  
🔒👨‍⚕️ **Doctor only**

**Request Body:**
```json
{
  "status": "completed"
}
```

---

#### 5.14 Cancel Appointment
**PATCH** `/api/appointments/:id/cancel`  
🔒 **Authenticated**

Patient hoặc Doctor có thể hủy.

---

## 6. HEALTH FACILITIES APIs

**Base:** `/api/facilities`

### 6.1 Get All Facilities
**GET** `/api/facilities?page=1&limit=100`

---

### 6.2 Get Facility by ID
**GET** `/api/facilities/:id`

---

### 6.3 Find Nearest Facilities
**GET** `/api/facilities/nearest?lat=10.2360937&lng=105.4020621&radius=5000&type=pharmacy&limit=10`

**Query Parameters:**
- `lat` (required): Vĩ độ
- `lng` (required): Kinh độ
- `radius` (optional): Bán kính (mét, default: 5000)
- `limit` (optional): Số lượng (default: 10)
- `type` (optional): `hospital`, `clinic`, `pharmacy`, `doctor`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Nhà thuốc ABC",
      "amenity": "pharmacy",
      "addr_city": "Bạc Liêu",
      "addr_full": "123 Đường ABC",
      "geom": "POINT(105.4020621 10.2360937)",
      "distance_meters": 150
    }
  ]
}
```

---

### 6.4 Get by Type
**GET** `/api/facilities/type/pharmacy?page=1&limit=20&city=Bạc Liêu`

---

### 6.5 Search Facilities
**GET** `/api/facilities/search?name=ABC&city=Bạc Liêu&type=pharmacy`

---

### 6.6 Get Statistics
**GET** `/api/facilities/stats?city=Bạc Liêu`

---

### 6.7 Create Facility
**POST** `/api/facilities`  
🔒👑 **Admin only**

---

### 6.8 Update Facility
**PUT** `/api/facilities/:id`  
🔒👑 **Admin only**

---

### 6.9 Delete Facility
**DELETE** `/api/facilities/:id`  
🔒👑 **Admin only**

---

## 7. REMINDERS APIs

**Base:** `/api/reminders`  
🔒👤 **Patient only**

### 7.1 Create Reminder
**POST** `/api/reminders`

**Recurring Reminder:**
```json
{
  "title": "Uống thuốc",
  "description": "Thuốc huyết áp",
  "reminderType": "medication",
  "cronExpression": "0 8 * * *",
  "timezoneName": "Asia/Ho_Chi_Minh"
}
```

**One-time Reminder:**
```json
{
  "title": "Khám bệnh",
  "reminderType": "appointment",
  "oneTimeAt": "2025-11-25T09:00:00Z",
  "timezoneName": "Asia/Ho_Chi_Minh"
}
```

**Types:** `medication`, `sleep`, `appointment`, `general`

**Cron Examples:**
- `0 8 * * *` - Mỗi ngày 8:00 AM
- `0 8,20 * * *` - Mỗi ngày 8:00 AM và 8:00 PM
- `0 9 * * 1-5` - Thứ 2-6 lúc 9:00 AM

---

### 7.2 Get My Reminders
**GET** `/api/reminders`

---

### 7.3 Update Reminder
**PUT** `/api/reminders/:id`

---

### 7.4 Toggle Active
**PATCH** `/api/reminders/:id/toggle`

```json
{
  "isActive": false
}
```

---

### 7.5 Delete Reminder
**DELETE** `/api/reminders/:id`

---

## 8. CHAT/MESSAGING APIs

**Base:** `/api/chat`  
🔒 **Authenticated**

### 8.1 Create Conversation
**POST** `/api/chat/conversations/start`

**Request Body:**
```json
{
  "targetUserId": "user-uuid"
}
```

**Features:**
- Tự động phát hiện role (patient/doctor)
- Trả về conversation cũ nếu đã tồn tại
- Chỉ cho phép chat giữa patient và doctor

**Response:**
```json
{
  "success": true,
  "message": "Conversation created or retrieved",
  "data": {
    "id": "conv-uuid",
    "patientUserId": "patient-uuid",
    "doctorUserId": "doctor-uuid"
  }
}
```

---

### 8.2 Get My Conversations
**GET** `/api/chat/conversations`

**Response:**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "conv-uuid",
        "patientUserId": "patient-uuid",
        "doctorUserId": "doctor-uuid",
        "patientName": "Nguyễn Văn A",
        "doctorName": "BS. Trần Thị B",
        "patientEmail": "patient@example.com",
        "doctorEmail": "doctor@example.com"
      }
    ],
    "count": 1
  }
}
```

---

### 8.3 Get Conversation Details
**GET** `/api/chat/conversations/:conversationId`

Lấy thông tin chi tiết cuộc trò chuyện.

---

### 8.4 Get Messages
**GET** `/api/chat/conversations/:conversationId/messages?limit=50`

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": 1,
        "conversationId": "conv-uuid",
        "senderUserId": "user-uuid",
        "messageContent": "Xin chào",
        "sentAt": "2025-11-22T10:00:00.000Z",
        "readAt": null,
        "senderEmail": "user@example.com",
        "senderRole": "patient"
      }
    ],
    "count": 1
  }
}
```

---

### 8.5 Send Message
**POST** `/api/chat/conversations/:conversationId/messages`

**Request Body:**
```json
{
  "messageContent": "Xin chào bác sĩ"
}
```

---

### 8.6 Mark as Read
**PATCH** `/api/chat/messages/:messageId/read`

---

## 9. ARTICLES APIs

**Base:** `/api/articles`

### 9.1 Get All Articles
**GET** `/api/articles?page=1&limit=20&status=published`

**Query:**
- `status` (optional): `draft`, `published` - Chỉ Admin

---

### 9.2 Get by ID
**GET** `/api/articles/:id`

---

### 9.3 Get by Slug
**GET** `/api/articles/slug/:slug`

---

### 9.4 Create Article
**POST** `/api/articles`  
🔒👑 **Admin only**

**Request Body:**
```json
{
  "title": "Phòng ngừa cảm cúm",
  "slug": "phong-ngua-cam-cum",
  "contentBody": "Nội dung...",
  "featuredImageUrl": "https://example.com/image.jpg",
  "externalUrl": null
}
```

**Note:** Có thể dùng `contentBody` HOẶC `externalUrl`

---

### 9.5 Update Article
**PUT** `/api/articles/:id`  
🔒👑 **Admin only**

---

### 9.6 Publish Article
**PATCH** `/api/articles/:id/publish`  
🔒👑 **Admin only**

Chuyển từ `draft` sang `published`.

---

### 9.7 Delete Article
**DELETE** `/api/articles/:id`  
🔒👑 **Admin only**

---

## 10. ADMIN DASHBOARD APIs

**Base:** `/api/admin`  
🔒👑 **Admin only**

### 10.1 Get Dashboard Stats
**GET** `/api/admin/dashboard/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalPatients": 1000,
    "totalDoctors": 50,
    "totalAppointments": 500,
    "pendingAppointments": 20,
    "pendingVerifications": 5,
    "publishedArticles": 30
  }
}
```

---

### 10.2 Get Recent Users
**GET** `/api/admin/dashboard/recent-users?limit=10`

---

### 10.3 Get Recent Appointments
**GET** `/api/admin/dashboard/recent-appointments?limit=10`

---

### 10.4 Get Pending Doctors
**GET** `/api/admin/dashboard/pending-doctors`

Danh sách bác sĩ chờ xác minh.

---

### 10.5 Get Monthly Stats
**GET** `/api/admin/dashboard/monthly-stats`

Thống kê 6 tháng gần nhất.

---

## 11. DATABASE MANAGEMENT APIs

**Base:** `/api/database`  
🔒👑 **Admin only**

### 11.1 Get Schema Status
**GET** `/api/database/status`

Kiểm tra trạng thái database schema.

---

### 11.2 Initialize Schema
**POST** `/api/database/initialize`

Chạy schema.sql để tạo tất cả bảng.

---

### 11.3 Get All Tables
**GET** `/api/database/tables`

Danh sách tất cả bảng.

---

### 11.4 Get Table Info
**GET** `/api/database/tables/:tableName`

Chi tiết cấu trúc bảng.

---

### 11.5 Check Connection
**GET** `/api/database/check`

Kiểm tra kết nối database.

---

## 📝 GENERAL NOTES

### Authentication
Hầu hết API yêu cầu JWT token:
```
Authorization: Bearer <token>
```

### Response Format
```json
{
  "success": true/false,
  "message": "Message",
  "data": {},
  "error": "Error message (nếu có)"
}
```

### Error Codes
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

### Field Naming
- **Request:** camelCase (`fullName`, `dateOfBirth`)
- **Response:** snake_case (`full_name`, `date_of_birth`)

### Date/Time Format
- ISO 8601: `2025-11-22T00:00:00Z`
- Date only: `YYYY-MM-DD`

### Pagination
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## 🔗 Related Documentation

- [Appointment Schedule API](./APPOINTMENT_SCHEDULE_API.md) - Chi tiết về hệ thống lịch hẹn
- [Chat API](./CHAT_API.md) - Chi tiết về hệ thống chat
- [Database Schema](./config/schema.sql) - Cấu trúc database
- [Database Overview](./database_overview.csv) - Tổng quan các bảng

---

**Developed by:** PD Health Team  
**Support:** support@pdhealth.com
