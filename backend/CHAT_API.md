# API Chat - Hệ Thống Tin Nhắn

## Tổng Quan

Hệ thống chat cho phép bệnh nhân và bác sĩ giao tiếp trực tiếp:
- **Chỉ hỗ trợ chat 1-1** giữa bệnh nhân và bác sĩ
- Tự động phát hiện vai trò và tạo conversation đúng cấu trúc
- Kiểm tra quyền truy cập trước khi xem/gửi tin nhắn
- Hỗ trợ đánh dấu tin nhắn đã đọc

---

## Endpoints

### 1. Tạo Cuộc Trò Chuyện (Recommended)

**POST** `/api/chat/conversations/start`

Tạo cuộc trò chuyện với bất kỳ người dùng nào. API tự động xác định vai trò và tạo conversation.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "targetUserId": "uuid-of-target-user"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Conversation created or retrieved",
  "data": {
    "id": "conversation-uuid",
    "patientUserId": "patient-uuid",
    "doctorUserId": "doctor-uuid"
  }
}
```

**Errors:**
```json
// 400 - Same role
{
  "success": false,
  "message": "Cannot create conversation with same role"
}

// 400 - Invalid roles
{
  "success": false,
  "message": "Conversations are only allowed between patients and doctors"
}

// 404 - User not found
{
  "success": false,
  "message": "User not found"
}
```

**Lưu ý:**
- Nếu conversation đã tồn tại, API sẽ trả về conversation cũ (không tạo mới)
- Chỉ cho phép tạo conversation giữa patient và doctor
- Tự động xác định ai là patient, ai là doctor dựa trên role

---

### 2. Tạo Cuộc Trò Chuyện (Legacy - Patient Only)

**POST** `/api/chat/conversations`

Endpoint cũ, chỉ dành cho bệnh nhân tạo conversation với bác sĩ.

**Headers:**
```
Authorization: Bearer <patient_token>
Content-Type: application/json
```

**Body:**
```json
{
  "doctorUserId": "doctor-uuid"
}
```

**Response:** Giống endpoint mới

**Lưu ý:** Endpoint này được giữ lại để backward compatible. Khuyến nghị sử dụng `/conversations/start`.

---

### 3. Lấy Danh Sách Cuộc Trò Chuyện

**GET** `/api/chat/conversations`

Lấy tất cả cuộc trò chuyện của người dùng hiện tại.

**Headers:**
```
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "conversation-uuid",
        "patientUserId": "patient-uuid",
        "doctorUserId": "doctor-uuid",
        "patientEmail": "patient@example.com",
        "doctorEmail": "doctor@example.com",
        "patientName": "Nguyễn Văn A",
        "doctorName": "BS. Trần Thị B"
      }
    ],
    "count": 5
  }
}
```

**Lưu ý:**
- Nếu user là patient: hiển thị conversations mà user là bệnh nhân
- Nếu user là doctor: hiển thị conversations mà user là bác sĩ

---

### 4. Lấy Chi Tiết Cuộc Trò Chuyện

**GET** `/api/chat/conversations/:conversationId`

Lấy thông tin chi tiết của một cuộc trò chuyện.

**Headers:**
```
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "id": "conversation-uuid",
    "patientUserId": "patient-uuid",
    "doctorUserId": "doctor-uuid",
    "patientEmail": "patient@example.com",
    "doctorEmail": "doctor@example.com",
    "patientName": "Nguyễn Văn A",
    "doctorName": "BS. Trần Thị B"
  }
}
```

**Errors:**
```json
// 403 - No access
{
  "success": false,
  "message": "Access denied to this conversation"
}

// 404 - Not found
{
  "success": false,
  "message": "Conversation not found"
}
```

---

### 5. Lấy Tin Nhắn

**GET** `/api/chat/conversations/:conversationId/messages?limit=50`

Lấy danh sách tin nhắn trong một cuộc trò chuyện.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional): Số lượng tin nhắn tối đa (mặc định: 50)

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": 1,
        "conversationId": "conversation-uuid",
        "senderUserId": "sender-uuid",
        "messageContent": "Xin chào bác sĩ",
        "sentAt": "2025-11-22T10:30:00.000Z",
        "readAt": null,
        "senderEmail": "patient@example.com",
        "senderRole": "patient"
      },
      {
        "id": 2,
        "conversationId": "conversation-uuid",
        "senderUserId": "doctor-uuid",
        "messageContent": "Xin chào, tôi có thể giúp gì cho bạn?",
        "sentAt": "2025-11-22T10:31:00.000Z",
        "readAt": "2025-11-22T10:32:00.000Z",
        "senderEmail": "doctor@example.com",
        "senderRole": "doctor"
      }
    ],
    "count": 2
  }
}
```

**Lưu ý:**
- Tin nhắn được sắp xếp theo thời gian (cũ nhất trước)
- Chỉ người tham gia conversation mới xem được tin nhắn

**Errors:**
```json
// 403 - No access
{
  "success": false,
  "message": "Access denied to this conversation"
}
```

---

### 6. Gửi Tin Nhắn

**POST** `/api/chat/conversations/:conversationId/messages`

Gửi tin nhắn trong một cuộc trò chuyện.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "messageContent": "Nội dung tin nhắn"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Message sent",
  "data": {
    "id": 3,
    "conversationId": "conversation-uuid",
    "senderUserId": "sender-uuid",
    "messageContent": "Nội dung tin nhắn",
    "sentAt": "2025-11-22T10:35:00.000Z",
    "readAt": null
  }
}
```

**Errors:**
```json
// 400 - Empty message
{
  "success": false,
  "errors": [
    {
      "msg": "Message content required",
      "param": "messageContent"
    }
  ]
}

// 403 - No access
{
  "success": false,
  "message": "Access denied to this conversation"
}
```

---

### 7. Đánh Dấu Tin Nhắn Đã Đọc

**PATCH** `/api/chat/messages/:messageId/read`

Đánh dấu một tin nhắn đã được đọc.

**Headers:**
```
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 3,
    "conversationId": "conversation-uuid",
    "senderUserId": "sender-uuid",
    "messageContent": "Nội dung tin nhắn",
    "sentAt": "2025-11-22T10:35:00.000Z",
    "readAt": "2025-11-22T10:40:00.000Z"
  }
}
```

**Lưu ý:**
- Nếu tin nhắn đã được đánh dấu đọc trước đó, `readAt` sẽ không thay đổi
- Thường được gọi khi người nhận xem tin nhắn

---

## Quy Trình Sử Dụng

### Kịch bản 1: Bệnh nhân bắt đầu chat với bác sĩ

```bash
# Bước 1: Tạo conversation
POST /api/chat/conversations/start
{
  "targetUserId": "doctor-uuid"
}

# Response: { "data": { "id": "conv-123", ... } }

# Bước 2: Gửi tin nhắn đầu tiên
POST /api/chat/conversations/conv-123/messages
{
  "messageContent": "Xin chào bác sĩ, tôi muốn tư vấn..."
}

# Bước 3: Xem tin nhắn
GET /api/chat/conversations/conv-123/messages
```

### Kịch bản 2: Bác sĩ trả lời tin nhắn

```bash
# Bước 1: Xem danh sách conversations
GET /api/chat/conversations

# Bước 2: Xem tin nhắn của một conversation
GET /api/chat/conversations/conv-123/messages

# Bước 3: Đánh dấu đã đọc
PATCH /api/chat/messages/5/read

# Bước 4: Trả lời
POST /api/chat/conversations/conv-123/messages
{
  "messageContent": "Xin chào, tôi có thể giúp gì..."
}
```

### Kịch bản 3: Kiểm tra xem đã có conversation chưa

```bash
# Cách 1: Thử tạo conversation (nếu đã có sẽ trả về conversation cũ)
POST /api/chat/conversations/start
{
  "targetUserId": "doctor-uuid"
}

# Cách 2: Lấy danh sách conversations và tìm
GET /api/chat/conversations
# Tìm trong response xem đã có conversation với doctor-uuid chưa
```

---

## Bảo Mật

### 1. Kiểm Tra Quyền Truy Cập

Mọi thao tác với conversation/message đều kiểm tra:
- User có phải là thành viên của conversation không
- Chỉ patient và doctor trong conversation mới được xem/gửi tin nhắn

### 2. Validation

- `targetUserId`: Phải là UUID hợp lệ
- `messageContent`: Không được rỗng, tự động trim khoảng trắng

### 3. Vai Trò

- Endpoint `/conversations` (legacy): Chỉ patient
- Endpoint `/conversations/start` (new): Tất cả roles (patient/doctor)
- Endpoint khác: Tất cả roles (có kiểm tra access)

---

## Lưu Ý Quan Trọng

1. **Unique Conversation**: Mỗi cặp patient-doctor chỉ có 1 conversation duy nhất. Nếu tạo lại, hệ thống trả về conversation cũ.

2. **Role Validation**: Chỉ cho phép conversation giữa patient và doctor. Không thể tạo conversation:
   - Patient với Patient
   - Doctor với Doctor
   - Admin với bất kỳ ai

3. **Access Control**: Mọi endpoint đều kiểm tra quyền truy cập. User chỉ xem được conversations và messages của mình.

4. **Null Safety**: Nếu patient/doctor chưa có profile, trường `patientName`/`doctorName` có thể là `null`.

5. **Message Order**: Messages được sắp xếp từ cũ đến mới (ascending by `sentAt`). Frontend nên reverse nếu muốn hiển thị tin mới nhất trước.

6. **Read Status**: `readAt = null` nghĩa là tin nhắn chưa đọc. `readAt` có giá trị = đã đọc.

---

## Error Codes

| HTTP Code | Meaning |
|-----------|---------|
| 200 | Success |
| 201 | Created (conversation/message) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (no token) |
| 403 | Forbidden (no access to conversation) |
| 404 | Not Found (user/conversation not found) |
| 500 | Internal Server Error |
