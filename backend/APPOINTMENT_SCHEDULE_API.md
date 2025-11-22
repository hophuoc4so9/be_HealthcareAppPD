# API Quản lý Lịch Hẹn - Hệ Thống Tự Động

## Tổng Quan

Hệ thống mới cho phép bác sĩ quản lý lịch hẹn một cách tự động với các khung giờ mặc định:
- **Khung giờ mặc định**: 8h, 9h, 10h, 11h, 13h, 14h, 15h, 16h, 19h, 20h (mỗi slot 1 tiếng)
- Bác sĩ có thể **bật/tắt** lịch theo ngày
- Xem tổng quan lịch theo khoảng thời gian

---

## Endpoints Mới

## A. Endpoints Cho Bác Sĩ (Doctor Only)

### 1. Tạo Lịch Tự Động Cho Một Ngày

**POST** `/api/appointments/availability/generate-daily`

Tự động tạo 10 khung giờ mặc định cho một ngày cụ thể.

**Headers:**
```
Authorization: Bearer <doctor_token>
Content-Type: application/json
```

**Body:**
```json
{
  "date": "2025-11-25"
}
```

**Response Success (200):**
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
      },
      // ... 9 slots khác
    ],
    "count": 10
  }
}
```

---

### 2. Xem Lịch Theo Ngày

**GET** `/api/appointments/availability/by-date?date=2025-11-25`

Xem tất cả các slot trong một ngày cụ thể.

**Headers:**
```
Authorization: Bearer <doctor_token>
```

**Query Parameters:**
- `date` (required): Ngày cần xem (format: YYYY-MM-DD)

**Response Success (200):**
```json
{
  "success": true,
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

### 3. Bật/Tắt Lịch Theo Ngày

**POST** `/api/appointments/availability/toggle-date`

Bật hoặc tắt lịch cho một ngày cụ thể:
- **Bật** (`enable: true`): Tạo tất cả các slot mặc định
- **Tắt** (`enable: false`): Xóa tất cả các slot chưa được đặt

**Headers:**
```
Authorization: Bearer <doctor_token>
Content-Type: application/json
```

**Body - Bật lịch:**
```json
{
  "date": "2025-11-25",
  "enable": true
}
```

**Body - Tắt lịch:**
```json
{
  "date": "2025-11-25",
  "enable": false
}
```

**Response Success - Bật lịch (200):**
```json
{
  "success": true,
  "message": "Availability enabled for this date",
  "data": {
    "slots": [...],
    "count": 10
  }
}
```

**Response Success - Tắt lịch (200):**
```json
{
  "success": true,
  "message": "Availability disabled for this date",
  "data": {
    "deletedSlots": 8
  }
}
```

**Lưu ý:** Khi tắt lịch, chỉ xóa các slot chưa được đặt. Các slot đã có lịch hẹn sẽ được giữ lại.

---

### 4. Xem Tổng Quan Lịch (Calendar Overview)

**GET** `/api/appointments/availability/calendar?startDate=2025-11-01&endDate=2025-11-30`

Xem tổng quan lịch theo khoảng thời gian (thống kê theo ngày).

**Headers:**
```
Authorization: Bearer <doctor_token>
```

**Query Parameters:**
- `startDate` (required): Ngày bắt đầu (format: YYYY-MM-DD)
- `endDate` (required): Ngày kết thúc (format: YYYY-MM-DD)

**Response Success (200):**
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
      },
      {
        "date": "2025-11-26",
        "totalSlots": 10,
        "availableSlots": 10,
        "bookedSlots": 0
      }
    ],
    "count": 2
  }
}
```

---

## B. Endpoints Cho Bệnh Nhân (Patient)

### 5. Xem Lịch Trống Của Bác Sĩ

**GET** `/api/appointments/doctors/:doctorUserId/available-slots?date=2025-11-25`

Bệnh nhân xem các khung giờ trống của bác sĩ để đặt lịch.

**Headers:**
```
Authorization: Bearer <patient_token>
```

**URL Parameters:**
- `doctorUserId` (required): ID của bác sĩ

**Query Parameters:**
- `date` (optional): Ngày cụ thể (format: YYYY-MM-DD). Nếu không truyền, sẽ trả về tất cả slot trống sắp tới.

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "doctorUserId": "doctor-uuid",
    "date": "2025-11-25",
    "slots": [
      {
        "id": "slot-uuid",
        "doctorUserId": "doctor-uuid",
        "startTime": "2025-11-25T08:00:00.000Z",
        "endTime": "2025-11-25T09:00:00.000Z",
        "isBooked": false
      },
      {
        "id": "slot-uuid-2",
        "doctorUserId": "doctor-uuid",
        "startTime": "2025-11-25T09:00:00.000Z",
        "endTime": "2025-11-25T10:00:00.000Z",
        "isBooked": false
      }
    ],
    "count": 2
  }
}
```

**Ví dụ sử dụng:**
```bash
# Xem slot trống của ngày cụ thể
GET /api/appointments/doctors/abc-123/available-slots?date=2025-11-25

# Xem tất cả slot trống sắp tới
GET /api/appointments/doctors/abc-123/available-slots
```

---

### 6. Xem Lịch Trống Theo Khoảng Thời Gian

**GET** `/api/appointments/doctors/:doctorUserId/available-slots/range?startDate=2025-11-25&endDate=2025-11-30`

Xem tất cả slot trống của bác sĩ trong một khoảng thời gian.

**Headers:**
```
Authorization: Bearer <patient_token>
```

**URL Parameters:**
- `doctorUserId` (required): ID của bác sĩ

**Query Parameters:**
- `startDate` (required): Ngày bắt đầu (format: YYYY-MM-DD)
- `endDate` (required): Ngày kết thúc (format: YYYY-MM-DD)

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "doctorUserId": "doctor-uuid",
    "startDate": "2025-11-25",
    "endDate": "2025-11-30",
    "slots": [
      {
        "id": "slot-uuid",
        "doctorUserId": "doctor-uuid",
        "startTime": "2025-11-25T08:00:00.000Z",
        "endTime": "2025-11-25T09:00:00.000Z",
        "isBooked": false
      },
      {
        "id": "slot-uuid-2",
        "doctorUserId": "doctor-uuid",
        "startTime": "2025-11-25T09:00:00.000Z",
        "endTime": "2025-11-25T10:00:00.000Z",
        "isBooked": false
      }
    ],
    "count": 20
  }
}
```

**Lưu ý:**
- Chỉ hiển thị slot `isBooked = false` (chưa được đặt)
- Chỉ hiển thị slot trong tương lai (`startTime > NOW()`)
- Slots được sắp xếp theo thời gian tăng dần

---

## Quy Trình Sử Dụng

### Kịch bản 1: Bác sĩ thiết lập lịch cho tuần mới

1. Tạo lịch cho từng ngày:
```bash
# Thứ 2
POST /api/appointments/availability/generate-daily
{ "date": "2025-11-25" }

# Thứ 3
POST /api/appointments/availability/generate-daily
{ "date": "2025-11-26" }

# ... tiếp tục cho các ngày khác
```

2. Xem tổng quan tuần:
```bash
GET /api/appointments/availability/calendar?startDate=2025-11-25&endDate=2025-12-01
```

### Kịch bản 2: Bác sĩ nghỉ đột xuất

```bash
# Tắt lịch ngày 26/11
POST /api/appointments/availability/toggle-date
{
  "date": "2025-11-26",
  "enable": false
}
```

### Kịch bản 3: Bác sĩ bật lại lịch

```bash
# Bật lại lịch ngày 26/11
POST /api/appointments/availability/toggle-date
{
  "date": "2025-11-26",
  "enable": true
}
```

### Kịch bản 4: Bệnh nhân đặt lịch khám

```bash
# Bước 1: Xem danh sách bác sĩ (từ API doctors)
GET /api/doctors?specialization=cardiology

# Bước 2: Xem lịch trống của bác sĩ trong tuần
GET /api/appointments/doctors/abc-123/available-slots/range?startDate=2025-11-25&endDate=2025-12-01

# Bước 3: Chọn một slot và đặt lịch
POST /api/appointments
{
  "doctorUserId": "abc-123",
  "availabilitySlotId": "slot-uuid",
  "patientNotes": "Tôi bị đau ngực..."
}
```

### Kịch bản 5: Bệnh nhân xem lịch trống ngày mai

```bash
# Xem slot trống ngày 26/11
GET /api/appointments/doctors/abc-123/available-slots?date=2025-11-26
```

---

## Khung Giờ Mặc Định

Mỗi ngày sẽ có **10 khung giờ**:

| Khung giờ | Thời gian |
|-----------|-----------|
| 1 | 08:00 - 09:00 |
| 2 | 09:00 - 10:00 |
| 3 | 10:00 - 11:00 |
| 4 | 11:00 - 12:00 |
| 5 | 13:00 - 14:00 |
| 6 | 14:00 - 15:00 |
| 7 | 15:00 - 16:00 |
| 8 | 16:00 - 17:00 |
| 9 | 19:00 - 20:00 |
| 10 | 20:00 - 21:00 |

---

## Error Responses

**400 Bad Request - Thiếu tham số:**
```json
{
  "success": false,
  "message": "Date is required"
}
```

**401 Unauthorized - Không có token:**
```json
{
  "success": false,
  "message": "No token provided"
}
```

**403 Forbidden - Không phải bác sĩ:**
```json
{
  "success": false,
  "message": "Access denied. Doctor role required."
}
```

---

## Lưu Ý Quan Trọng

1. **Tự động tạo lịch**: API `generate-daily` sử dụng `ON CONFLICT DO NOTHING` để tránh tạo trùng slot.

2. **Xóa an toàn**: Khi tắt lịch (`enable: false`), chỉ xóa các slot `is_booked = false`. Các lịch hẹn đã đặt được bảo vệ.

3. **Múi giờ**: Tất cả thời gian được lưu theo UTC trong database. Frontend cần convert sang múi giờ local.

4. **Validation**: Date phải có format `YYYY-MM-DD` hoặc ISO 8601.

5. **Quyền truy cập**: Tất cả các endpoint này chỉ dành cho role `doctor`.
