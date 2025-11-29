# Luồng Phê Duyệt Đăng Ký Đề Tài

## Tổng Quan

Luồng phê duyệt đăng ký đề tài được thực hiện qua 2 bước:
1. **Giáo viên hướng dẫn phê duyệt** - Bước đầu tiên
2. **Trưởng bộ môn phê duyệt** - Bước cuối cùng

## Sơ Đồ Luồng

```
Sinh viên đăng ký đề tài
         ↓
[Trạng thái: instructorStatus = "Pending", headStatus = "Pending"]
         ↓
Giáo viên hướng dẫn xem và phê duyệt/từ chối
         ↓
    ┌────┴────┐
    │         │
  Phê duyệt  Từ chối
    │         │
    ↓         ↓
[instructorStatus = "Approved"] [instructorStatus = "Rejected"]
    │         │
    │         └──→ Kết thúc (Sinh viên nhận thông báo từ chối)
    │
    ↓
Gửi thông báo cho Trưởng bộ môn
    │
    ↓
[headStatus = "Pending", instructorStatus = "Approved"]
    │
    ↓
Trưởng bộ môn xem và phê duyệt/từ chối
    │
    ┌────┴────┐
    │         │
  Phê duyệt  Từ chối
    │         │
    ↓         ↓
[headStatus = "Approved"] [headStatus = "Rejected"]
    │         │
    │         └──→ Kết thúc (Sinh viên và giáo viên nhận thông báo)
    │
    ↓
Hoàn tất phê duyệt
[instructorStatus = "Approved", headStatus = "Approved"]
```

## Chi Tiết Các Bước

### Bước 1: Sinh Viên Đăng Ký Đề Tài

**Endpoint:** `POST /thesis/register-topic`

**Mô tả:** Sinh viên đăng ký đề tài với giáo viên hướng dẫn.

**Trạng thái ban đầu:**
- `instructorStatus`: `"Pending"`
- `headStatus`: `"Pending"`

**Kết quả:** Đăng ký được tạo và gửi thông báo real-time cho giáo viên hướng dẫn.

---

### Bước 2: Giáo Viên Hướng Dẫn Phê Duyệt

**Endpoint:** `PUT /thesis/approve-registration`

**Quyền:** `TEACHER` (Giáo viên)

**Request Body:**
```json
{
  "registrationId": 1,
  "approved": true,
  "rejectionReason": null  // Chỉ cần khi approved = false
}
```

**Logic xử lý:**

1. **Kiểm tra quyền:** Chỉ giáo viên hướng dẫn của đăng ký mới có thể phê duyệt
2. **Kiểm tra trạng thái:** `instructorStatus` phải là `"Pending"`
3. **Cập nhật trạng thái:**
   - Nếu `approved = true`: 
     - `instructorStatus` = `"Approved"`
     - `instructorApprovalDate` = thời gian hiện tại
   - Nếu `approved = false`:
     - `instructorStatus` = `"Rejected"`
     - `instructorApprovalDate` = thời gian hiện tại
     - `instructorRejectionReason` = lý do từ chối (nếu có)

4. **Gửi thông báo:**
   - **Cho sinh viên:** Thông báo kết quả phê duyệt/từ chối
   - **Cho trưởng bộ môn (nếu approved = true):** Thông báo có đăng ký mới cần phê duyệt

**Trạng thái sau khi giáo viên phê duyệt:**
- `instructorStatus`: `"Approved"`
- `headStatus`: `"Pending"` (vẫn chờ trưởng bộ môn)

**Trạng thái sau khi giáo viên từ chối:**
- `instructorStatus`: `"Rejected"`
- `headStatus`: `"Pending"` (không cần trưởng bộ môn xử lý)

---

### Bước 3: Trưởng Bộ Môn Xem Danh Sách Chờ Phê Duyệt

**Endpoint:** `GET /thesis/head/pending-registrations`

**Quyền:** `HEAD_OF_DEPARTMENT` (Trưởng bộ môn)

**Query Parameters:**
- `thesisRoundId` (optional): Lọc theo đợt luận văn
- `status` (optional): Lọc theo trạng thái (thường là "Pending")
- `page` (optional): Số trang (mặc định: 1)
- `limit` (optional): Số lượng mỗi trang (mặc định: 10)

**Điều kiện lọc:**
- Chỉ hiển thị đăng ký có `instructorStatus = "Approved"`
- Chỉ hiển thị đăng ký có `headStatus = "Pending"`
- Chỉ hiển thị đăng ký thuộc bộ môn của trưởng bộ môn

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "student": {
        "id": 1,
        "studentCode": "SV001",
        "fullName": "Nguyễn Văn A",
        "email": "sv001@example.com",
        "phone": "0123456789",
        "class": {
          "id": 1,
          "className": "Lớp CNTT K1",
          "classCode": "CNTT-K1"
        }
      },
      "thesisRound": {
        "id": 1,
        "roundName": "Đợt 1 - Học kỳ 1 2024",
        "roundCode": "HK1-2024",
        "status": "In Progress"
      },
      "topicTitle": "Hệ thống quản lý luận văn",
      "instructor": {
        "id": 1,
        "instructorCode": "GV001",
        "fullName": "Thầy Nguyễn Văn B",
        "email": "gv001@example.com"
      },
      "instructorStatus": "Approved",
      "headStatus": "Pending",
      "instructorApprovalDate": "2024-01-15T10:30:00Z",
      "registrationDate": "2024-01-10T08:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1,
    "itemsPerPage": 10,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

### Bước 4: Trưởng Bộ Môn Phê Duyệt

**Endpoint:** `PUT /thesis/head/approve-registration`

**Quyền:** `HEAD_OF_DEPARTMENT` (Trưởng bộ môn)

**Request Body:**
```json
{
  "registrationId": 1,
  "approved": true,
  "rejectionReason": null  // Chỉ cần khi approved = false
}
```

**Logic xử lý:**

1. **Kiểm tra quyền:** 
   - Kiểm tra người dùng có phải trưởng bộ môn không
   - Kiểm tra đăng ký có thuộc bộ môn của trưởng bộ môn không

2. **Kiểm tra điều kiện:**
   - `instructorStatus` phải là `"Approved"` (giáo viên đã phê duyệt)
   - `headStatus` phải là `"Pending"` (chưa được xử lý)

3. **Cập nhật trạng thái:**
   - Nếu `approved = true`:
     - `headStatus` = `"Approved"`
     - `headApprovalDate` = thời gian hiện tại
   - Nếu `approved = false`:
     - `headStatus` = `"Rejected"`
     - `headApprovalDate` = thời gian hiện tại
     - `headRejectionReason` = lý do từ chối (nếu có)

4. **Gửi thông báo:**
   - **Cho sinh viên:** Thông báo kết quả phê duyệt cuối cùng
   - **Cho giáo viên hướng dẫn:** Thông báo kết quả phê duyệt của trưởng bộ môn

**Trạng thái sau khi trưởng bộ môn phê duyệt:**
- `instructorStatus`: `"Approved"`
- `headStatus`: `"Approved"`
- **Đăng ký hoàn tất!**

**Trạng thái sau khi trưởng bộ môn từ chối:**
- `instructorStatus`: `"Approved"` (giáo viên đã phê duyệt)
- `headStatus`: `"Rejected"` (trưởng bộ môn từ chối)
- **Đăng ký bị từ chối**

---

## Các Trạng Thái Có Thể

### Trạng Thái Giáo Viên Hướng Dẫn (`instructorStatus`)

| Trạng thái | Mô tả |
|------------|-------|
| `Pending` | Chờ giáo viên hướng dẫn phê duyệt |
| `Approved` | Giáo viên hướng dẫn đã phê duyệt |
| `Rejected` | Giáo viên hướng dẫn đã từ chối |

### Trạng Thái Trưởng Bộ Môn (`headStatus`)

| Trạng thái | Mô tả |
|------------|-------|
| `Pending` | Chờ trưởng bộ môn phê duyệt |
| `Approved` | Trưởng bộ môn đã phê duyệt |
| `Rejected` | Trưởng bộ môn đã từ chối |

### Kết Hợp Trạng Thái

| instructorStatus | headStatus | Ý nghĩa |
|-----------------|------------|----------|
| `Pending` | `Pending` | Mới đăng ký, chờ giáo viên xử lý |
| `Approved` | `Pending` | Giáo viên đã phê duyệt, chờ trưởng bộ môn |
| `Approved` | `Approved` | **Hoàn tất phê duyệt** ✅ |
| `Approved` | `Rejected` | Giáo viên phê duyệt nhưng trưởng bộ môn từ chối |
| `Rejected` | `Pending` | Giáo viên từ chối, không cần trưởng bộ môn xử lý |

---

## Thông Báo Real-Time (WebSocket)

### Sự Kiện Gửi Cho Sinh Viên

**Event:** `topic_registration_updated`

**Khi giáo viên phê duyệt:**
```json
{
  "registrationId": 1,
  "status": "Approved",
  "message": "Đăng ký đề tài của bạn đã được giáo viên hướng dẫn phê duyệt, đang chờ trưởng bộ môn phê duyệt",
  "rejectionReason": null
}
```

**Khi giáo viên từ chối:**
```json
{
  "registrationId": 1,
  "status": "Rejected",
  "message": "Đăng ký đề tài của bạn đã bị từ chối",
  "rejectionReason": "Đề tài không phù hợp với chương trình đào tạo"
}
```

**Khi trưởng bộ môn phê duyệt:**
```json
{
  "registrationId": 1,
  "status": "FullyApproved",
  "message": "Đăng ký đề tài của bạn đã được trưởng bộ môn phê duyệt. Đăng ký đã hoàn tất!",
  "rejectionReason": null
}
```

**Khi trưởng bộ môn từ chối:**
```json
{
  "registrationId": 1,
  "status": "RejectedByHead",
  "message": "Đăng ký đề tài của bạn đã bị trưởng bộ môn từ chối",
  "rejectionReason": "Không đủ điều kiện theo quy định"
}
```

### Sự Kiện Gửi Cho Trưởng Bộ Môn

**Event:** `new_registration_for_approval`

**Khi có đăng ký mới cần phê duyệt:**
```json
{
  "registrationId": 1,
  "studentName": "Nguyễn Văn A",
  "studentCode": "SV001",
  "instructorName": "Thầy Nguyễn Văn B",
  "topicTitle": "Hệ thống quản lý luận văn",
  "registrationDate": "2024-01-10T08:00:00Z",
  "instructorApprovalDate": "2024-01-15T10:30:00Z",
  "message": "Có đăng ký đề tài mới đã được giáo viên hướng dẫn phê duyệt, cần bạn phê duyệt"
}
```

### Sự Kiện Gửi Cho Giáo Viên Hướng Dẫn

**Event:** `registration_head_approval_updated`

**Khi trưởng bộ môn phê duyệt:**
```json
{
  "registrationId": 1,
  "studentName": "Nguyễn Văn A",
  "status": "Approved",
  "message": "Đăng ký đề tài của sinh viên Nguyễn Văn A đã được trưởng bộ môn phê duyệt"
}
```

**Khi trưởng bộ môn từ chối:**
```json
{
  "registrationId": 1,
  "studentName": "Nguyễn Văn A",
  "status": "Rejected",
  "message": "Đăng ký đề tài của sinh viên Nguyễn Văn A đã bị trưởng bộ môn từ chối"
}
```

---

## Lưu Ý Quan Trọng

1. **Thứ tự phê duyệt:** Phải có giáo viên hướng dẫn phê duyệt trước, sau đó mới đến trưởng bộ môn
2. **Quyền truy cập:** 
   - Giáo viên chỉ có thể phê duyệt đăng ký của sinh viên mình hướng dẫn
   - Trưởng bộ môn chỉ có thể phê duyệt đăng ký thuộc bộ môn của mình
3. **Từ chối:** Nếu giáo viên từ chối, đăng ký kết thúc ngay, không cần trưởng bộ môn xử lý
4. **Thông báo:** Tất cả các bước đều có thông báo real-time qua WebSocket
5. **Lịch sử:** Tất cả các thao tác đều được ghi lại với timestamp (`instructorApprovalDate`, `headApprovalDate`)

---

## Ví Dụ Sử Dụng

### Ví dụ 1: Luồng thành công

1. Sinh viên A đăng ký đề tài với giáo viên B
   - `instructorStatus = "Pending"`, `headStatus = "Pending"`

2. Giáo viên B phê duyệt
   - `instructorStatus = "Approved"`, `headStatus = "Pending"`
   - Trưởng bộ môn nhận thông báo

3. Trưởng bộ môn phê duyệt
   - `instructorStatus = "Approved"`, `headStatus = "Approved"`
   - ✅ Hoàn tất

### Ví dụ 2: Giáo viên từ chối

1. Sinh viên A đăng ký đề tài với giáo viên B
   - `instructorStatus = "Pending"`, `headStatus = "Pending"`

2. Giáo viên B từ chối
   - `instructorStatus = "Rejected"`, `headStatus = "Pending"`
   - ❌ Kết thúc, không cần trưởng bộ môn xử lý

### Ví dụ 3: Trưởng bộ môn từ chối

1. Sinh viên A đăng ký đề tài với giáo viên B
   - `instructorStatus = "Pending"`, `headStatus = "Pending"`

2. Giáo viên B phê duyệt
   - `instructorStatus = "Approved"`, `headStatus = "Pending"`

3. Trưởng bộ môn từ chối
   - `instructorStatus = "Approved"`, `headStatus = "Rejected"`
   - ❌ Kết thúc với từ chối

---

## API Endpoints Tóm Tắt

| Endpoint | Method | Quyền | Mô tả |
|----------|--------|-------|-------|
| `/thesis/register-topic` | POST | STUDENT | Sinh viên đăng ký đề tài |
| `/thesis/approve-registration` | PUT | TEACHER | Giáo viên phê duyệt/từ chối |
| `/thesis/head/pending-registrations` | GET | HEAD_OF_DEPARTMENT | Trưởng bộ môn xem danh sách chờ phê duyệt |
| `/thesis/head/approve-registration` | PUT | HEAD_OF_DEPARTMENT | Trưởng bộ môn phê duyệt/từ chối |

---

## Kết Luận

Luồng phê duyệt đăng ký đề tài được thiết kế với 2 cấp độ phê duyệt để đảm bảo chất lượng và tính minh bạch. Tất cả các bước đều có thông báo real-time và ghi lại lịch sử đầy đủ.

