# API Documentation - Instructor (Giảng viên)

Tài liệu này mô tả các API endpoints dành cho **Actor: Instructor (Giảng viên)** trong hệ thống quản lý đồ án tốt nghiệp.

## Mục lục
1. [Lấy danh sách đăng ký đề tài của sinh viên](#1-lấy-danh-sách-đăng-ký-đề-tài-của-sinh-viên)
2. [Phê duyệt/Từ chối đăng ký đề tài](#2-phê-duyệttừ-chối-đăng-ký-đề-tài)
3. [Tạo đề tài đề xuất](#3-tạo-đề-tài-đề-xuất)
4. [Cập nhật đề tài đề xuất](#4-cập-nhật-đề-tài-đề-xuất)

---

## 1. Lấy danh sách đăng ký đề tài của sinh viên

### Endpoint
```
GET /thesis/student-registrations
```

### Mô tả
Lấy danh sách tất cả đăng ký đề tài của sinh viên thuộc quyền quản lý của giảng viên hiện tại. Giảng viên có thể xem, lọc và quản lý các đăng ký đề tài của sinh viên.

### Authentication
- **Required**: Yes
- **Role**: `TEACHER` (Giảng viên)

### Headers
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `thesisRoundId` | number | No | Lọc theo ID đợt luận văn |
| `status` | string | No | Lọc theo trạng thái: `Pending`, `Approved`, `Rejected` |

### Request Example

```bash
# Lấy tất cả đăng ký
GET /thesis/student-registrations
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Lọc theo đợt luận văn
GET /thesis/student-registrations?thesisRoundId=1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Lọc theo trạng thái
GET /thesis/student-registrations?status=Pending
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Kết hợp nhiều filter
GET /thesis/student-registrations?thesisRoundId=1&status=Pending
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response Format

#### Success Response (200 OK)

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
        "email": "nguyenvana@example.com",
        "phone": "0123456789",
        "class": {
          "id": 1,
          "className": "Lớp Công nghệ thông tin K19",
          "classCode": "HTTT_K19"
        }
      },
      "thesisRound": {
        "id": 1,
        "roundName": "Đợt luận văn 2024-2025",
        "roundCode": "LV2024"
      },
      "proposedTopic": {
        "id": 1,
        "topicTitle": "Hệ thống quản lý thư viện",
        "topicCode": "DT001"
      },
      "selfProposedTitle": null,
      "selfProposedDescription": null,
      "selectionReason": "Tôi quan tâm đến lĩnh vực này",
      "instructorStatus": "Pending",
      "headStatus": "Pending",
      "instructorRejectionReason": null,
      "headRejectionReason": null,
      "registrationDate": "2024-01-15T10:30:00.000Z",
      "instructorApprovalDate": null,
      "headApprovalDate": null
    },
    {
      "id": 2,
      "student": {
        "id": 2,
        "studentCode": "SV002",
        "fullName": "Trần Thị B",
        "email": "tranthib@example.com",
        "phone": "0987654321",
        "class": {
          "id": 1,
          "className": "Lớp Công nghệ thông tin K19",
          "classCode": "HTTT_K19"
        }
      },
      "thesisRound": {
        "id": 1,
        "roundName": "Đợt luận văn 2024-2025",
        "roundCode": "LV2024"
      },
      "proposedTopic": null,
      "selfProposedTitle": "Hệ thống quản lý bán hàng online",
      "selfProposedDescription": "Xây dựng hệ thống quản lý bán hàng online với các tính năng...",
      "selectionReason": "Tôi muốn tự đề xuất đề tài",
      "instructorStatus": "Approved",
      "headStatus": "Pending",
      "instructorRejectionReason": null,
      "headRejectionReason": null,
      "registrationDate": "2024-01-14T09:00:00.000Z",
      "instructorApprovalDate": "2024-01-15T14:20:00.000Z",
      "headApprovalDate": null
    }
  ]
}
```

#### Error Responses

**401 Unauthorized** - Chưa đăng nhập hoặc token không hợp lệ
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**403 Forbidden** - Không có quyền truy cập (không phải giảng viên)
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

**500 Internal Server Error** - Lỗi server
```json
{
  "statusCode": 500,
  "message": "Instructor ID not found"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Trạng thái thành công |
| `data` | array | Danh sách đăng ký đề tài |
| `data[].id` | number | ID đăng ký |
| `data[].student` | object | Thông tin sinh viên |
| `data[].student.id` | number | ID sinh viên |
| `data[].student.studentCode` | string | Mã sinh viên |
| `data[].student.fullName` | string | Họ và tên |
| `data[].student.email` | string | Email |
| `data[].student.phone` | string | Số điện thoại |
| `data[].student.class` | object | Thông tin lớp |
| `data[].thesisRound` | object | Thông tin đợt luận văn |
| `data[].proposedTopic` | object\|null | Đề tài đề xuất (nếu chọn từ danh sách) |
| `data[].selfProposedTitle` | string\|null | Tiêu đề đề tài tự đề xuất |
| `data[].selfProposedDescription` | string\|null | Mô tả đề tài tự đề xuất |
| `data[].selectionReason` | string\|null | Lý do chọn đề tài |
| `data[].instructorStatus` | string | Trạng thái phê duyệt của giảng viên: `Pending`, `Approved`, `Rejected` |
| `data[].headStatus` | string | Trạng thái phê duyệt của trưởng bộ môn: `Pending`, `Approved`, `Rejected` |
| `data[].instructorRejectionReason` | string\|null | Lý do từ chối của giảng viên |
| `data[].registrationDate` | string | Ngày đăng ký (ISO 8601) |
| `data[].instructorApprovalDate` | string\|null | Ngày giảng viên phê duyệt |
| `data[].headApprovalDate` | string\|null | Ngày trưởng bộ môn phê duyệt |

### Frontend Integration

```typescript
// TypeScript Interface
interface StudentRegistration {
  id: number;
  student: {
    id: number;
    studentCode: string;
    fullName: string;
    email: string;
    phone: string;
    class: {
      id: number;
      className: string;
      classCode: string;
    };
  };
  thesisRound: {
    id: number;
    roundName: string;
    roundCode: string;
  };
  proposedTopic: {
    id: number;
    topicTitle: string;
    topicCode: string;
  } | null;
  selfProposedTitle: string | null;
  selfProposedDescription: string | null;
  selectionReason: string | null;
  instructorStatus: 'Pending' | 'Approved' | 'Rejected';
  headStatus: 'Pending' | 'Approved' | 'Rejected';
  instructorRejectionReason: string | null;
  headRejectionReason: string | null;
  registrationDate: string;
  instructorApprovalDate: string | null;
  headApprovalDate: string | null;
}

interface GetStudentRegistrationsResponse {
  success: boolean;
  data: StudentRegistration[];
}

// API Call Function
async function getStudentRegistrations(
  filters?: {
    thesisRoundId?: number;
    status?: 'Pending' | 'Approved' | 'Rejected';
  }
): Promise<GetStudentRegistrationsResponse> {
  const params = new URLSearchParams();
  
  if (filters?.thesisRoundId) {
    params.append('thesisRoundId', filters.thesisRoundId.toString());
  }
  
  if (filters?.status) {
    params.append('status', filters.status);
  }
  
  const response = await fetch(
    `/api/thesis/student-registrations?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch student registrations');
  }
  
  return response.json();
}

// Usage Example
try {
  const result = await getStudentRegistrations({
    thesisRoundId: 1,
    status: 'Pending'
  });
  
  console.log('Total registrations:', result.data.length);
  result.data.forEach(registration => {
    console.log(`Student: ${registration.student.fullName}`);
    console.log(`Status: ${registration.instructorStatus}`);
  });
} catch (error) {
  console.error('Error:', error);
}
```

### Notes
- Danh sách được sắp xếp theo ngày đăng ký giảm dần (mới nhất trước)
- Chỉ hiển thị các đăng ký thuộc quyền quản lý của giảng viên hiện tại
- `proposedTopic` sẽ là `null` nếu sinh viên tự đề xuất đề tài
- `instructorStatus` và `headStatus` có thể khác nhau (giảng viên đã duyệt nhưng trưởng bộ môn chưa duyệt)

---

## 2. Phê duyệt/Từ chối đăng ký đề tài

### Endpoint
```
PUT /thesis/approve-registration
```

### Mô tả
Giảng viên phê duyệt hoặc từ chối đăng ký đề tài của sinh viên. Khi phê duyệt, đăng ký sẽ chuyển sang trạng thái `Approved` và chờ trưởng bộ môn phê duyệt. Khi từ chối, đăng ký sẽ chuyển sang trạng thái `Rejected` và sinh viên sẽ nhận được thông báo.

### Authentication
- **Required**: Yes
- **Role**: `TEACHER` (Giảng viên)

### Headers
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `registrationId` | number | Yes | ID của đăng ký đề tài |
| `approved` | boolean | Yes | `true` để phê duyệt, `false` để từ chối |
| `rejectionReason` | string | No | Lý do từ chối (bắt buộc nếu `approved = false`) |

### Request Example

#### Phê duyệt đăng ký
```json
{
  "registrationId": 1,
  "approved": true
}
```

#### Từ chối đăng ký
```json
{
  "registrationId": 1,
  "approved": false,
  "rejectionReason": "Đề tài không phù hợp với chuyên ngành"
}
```

### Response Format

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Phê duyệt đăng ký thành công",
  "data": {
    "registrationId": 1,
    "status": "Approved"
  }
}
```

Hoặc khi từ chối:
```json
{
  "success": true,
  "message": "Từ chối đăng ký thành công",
  "data": {
    "registrationId": 1,
    "status": "Rejected"
  }
}
```

#### Error Responses

**400 Bad Request** - Đăng ký đã được xử lý rồi
```json
{
  "statusCode": 400,
  "message": "Đăng ký đề tài đã được xử lý rồi"
}
```

**404 Not Found** - Đăng ký không tồn tại hoặc không thuộc quyền quản lý
```json
{
  "statusCode": 404,
  "message": "Đăng ký đề tài không tồn tại hoặc không thuộc quyền quản lý của bạn"
}
```

**401 Unauthorized** - Chưa đăng nhập hoặc token không hợp lệ
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**403 Forbidden** - Không có quyền truy cập
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Trạng thái thành công |
| `message` | string | Thông báo kết quả |
| `data` | object | Dữ liệu kết quả |
| `data.registrationId` | number | ID đăng ký đã xử lý |
| `data.status` | string | Trạng thái mới: `Approved` hoặc `Rejected` |

### Frontend Integration

```typescript
// TypeScript Interface
interface ApproveTopicRegistrationRequest {
  registrationId: number;
  approved: boolean;
  rejectionReason?: string;
}

interface ApproveTopicRegistrationResponse {
  success: boolean;
  message: string;
  data: {
    registrationId: number;
    status: 'Approved' | 'Rejected';
  };
}

// API Call Function
async function approveTopicRegistration(
  request: ApproveTopicRegistrationRequest
): Promise<ApproveTopicRegistrationResponse> {
  const response = await fetch('/api/thesis/approve-registration', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to approve registration');
  }
  
  return response.json();
}

// Usage Example - Phê duyệt
try {
  const result = await approveTopicRegistration({
    registrationId: 1,
    approved: true
  });
  
  console.log('Success:', result.message);
  // Hiển thị thông báo thành công cho người dùng
  showNotification(result.message, 'success');
  
  // Refresh danh sách đăng ký
  await refreshRegistrationsList();
} catch (error) {
  console.error('Error:', error);
  showNotification(error.message, 'error');
}

// Usage Example - Từ chối
try {
  const result = await approveTopicRegistration({
    registrationId: 1,
    approved: false,
    rejectionReason: 'Đề tài không phù hợp với chuyên ngành'
  });
  
  console.log('Success:', result.message);
  showNotification(result.message, 'success');
  await refreshRegistrationsList();
} catch (error) {
  console.error('Error:', error);
  showNotification(error.message, 'error');
}
```

### Notes
- Chỉ có thể phê duyệt/từ chối các đăng ký có trạng thái `Pending`
- Khi từ chối, nên cung cấp `rejectionReason` để sinh viên biết lý do
- Sinh viên sẽ nhận được thông báo real-time qua WebSocket khi đăng ký được xử lý
- Sau khi giảng viên phê duyệt, đăng ký sẽ chờ trưởng bộ môn phê duyệt

---

## 3. Tạo đề tài đề xuất

### Endpoint
```
POST /thesis/proposed-topics
```

### Mô tả
Giảng viên tạo một đề tài đề xuất mới để sinh viên có thể đăng ký. Đề tài sẽ được hiển thị trong danh sách đề tài có sẵn cho sinh viên.

### Authentication
- **Required**: Yes
- **Role**: `TEACHER` (Giảng viên)

### Headers
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `topicCode` | string | Yes | Mã đề tài (tối đa 50 ký tự, phải unique trong đợt) |
| `topicTitle` | string | Yes | Tiêu đề đề tài (tối đa 500 ký tự) |
| `thesisRoundId` | number | Yes | ID đợt luận văn |
| `topicDescription` | string | No | Mô tả chi tiết đề tài |
| `objectives` | string | No | Mục tiêu của đề tài |
| `studentRequirements` | string | No | Yêu cầu đối với sinh viên |
| `technologiesUsed` | string | No | Công nghệ sử dụng |
| `topicReferences` | string | No | Tài liệu tham khảo |

**Lưu ý**: `instructorId` sẽ được tự động lấy từ JWT token, không cần gửi trong request body.

### Request Example

```json
{
  "topicCode": "DT001",
  "topicTitle": "Hệ thống quản lý thư viện số",
  "thesisRoundId": 1,
  "topicDescription": "Xây dựng hệ thống quản lý thư viện số với các tính năng quản lý sách, mượn trả, tìm kiếm...",
  "objectives": "1. Nắm vững quy trình quản lý thư viện\n2. Áp dụng công nghệ web hiện đại\n3. Xây dựng hệ thống thân thiện với người dùng",
  "studentRequirements": "Sinh viên cần có kiến thức về:\n- Lập trình web (React, Node.js)\n- Cơ sở dữ liệu (PostgreSQL)\n- UI/UX Design",
  "technologiesUsed": "React, Node.js, Express, PostgreSQL, Redis",
  "topicReferences": "1. Tài liệu về quản lý thư viện\n2. Best practices trong phát triển web"
}
```

### Response Format

#### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Tạo đề tài đề xuất thành công",
  "data": {
    "id": 1,
    "topicCode": "DT001",
    "topicTitle": "Hệ thống quản lý thư viện số",
    "topicDescription": "Xây dựng hệ thống quản lý thư viện số...",
    "objectives": "1. Nắm vững quy trình...",
    "studentRequirements": "Sinh viên cần có kiến thức...",
    "technologiesUsed": "React, Node.js, Express...",
    "topicReferences": "1. Tài liệu về quản lý thư viện...",
    "instructorId": 1,
    "thesisRoundId": 1,
    "isTaken": false,
    "status": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Error Responses

**400 Bad Request** - Dữ liệu không hợp lệ
```json
{
  "statusCode": 400,
  "message": [
    "topicCode should not be empty",
    "topicTitle should not be empty"
  ]
}
```

**404 Not Found** - Đợt luận văn không tồn tại
```json
{
  "statusCode": 404,
  "message": "Đợt luận văn không tồn tại"
}
```

**409 Conflict** - Mã đề tài đã tồn tại
```json
{
  "statusCode": 409,
  "message": "Mã đề tài đã tồn tại trong đợt này"
}
```

**401 Unauthorized** - Chưa đăng nhập hoặc token không hợp lệ
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**403 Forbidden** - Không có quyền truy cập
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Trạng thái thành công |
| `message` | string | Thông báo kết quả |
| `data` | object | Dữ liệu đề tài đã tạo |
| `data.id` | number | ID đề tài |
| `data.topicCode` | string | Mã đề tài |
| `data.topicTitle` | string | Tiêu đề đề tài |
| `data.topicDescription` | string\|null | Mô tả đề tài |
| `data.objectives` | string\|null | Mục tiêu |
| `data.studentRequirements` | string\|null | Yêu cầu sinh viên |
| `data.technologiesUsed` | string\|null | Công nghệ sử dụng |
| `data.topicReferences` | string\|null | Tài liệu tham khảo |
| `data.instructorId` | number | ID giảng viên |
| `data.thesisRoundId` | number | ID đợt luận văn |
| `data.isTaken` | boolean | Đã được chọn chưa (mặc định: `false`) |
| `data.status` | boolean | Trạng thái active (mặc định: `true`) |
| `data.createdAt` | string | Ngày tạo (ISO 8601) |
| `data.updatedAt` | string | Ngày cập nhật (ISO 8601) |

### Frontend Integration

```typescript
// TypeScript Interface
interface CreateProposedTopicRequest {
  topicCode: string;
  topicTitle: string;
  thesisRoundId: number;
  topicDescription?: string;
  objectives?: string;
  studentRequirements?: string;
  technologiesUsed?: string;
  topicReferences?: string;
}

interface CreateProposedTopicResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    topicCode: string;
    topicTitle: string;
    topicDescription: string | null;
    objectives: string | null;
    studentRequirements: string | null;
    technologiesUsed: string | null;
    topicReferences: string | null;
    instructorId: number;
    thesisRoundId: number;
    isTaken: boolean;
    status: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

// API Call Function
async function createProposedTopic(
  request: CreateProposedTopicRequest
): Promise<CreateProposedTopicResponse> {
  const response = await fetch('/api/thesis/proposed-topics', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create proposed topic');
  }
  
  return response.json();
}

// Usage Example
try {
  const result = await createProposedTopic({
    topicCode: 'DT001',
    topicTitle: 'Hệ thống quản lý thư viện số',
    thesisRoundId: 1,
    topicDescription: 'Xây dựng hệ thống quản lý thư viện số...',
    objectives: '1. Nắm vững quy trình...',
    studentRequirements: 'Sinh viên cần có kiến thức...',
    technologiesUsed: 'React, Node.js, Express...',
    topicReferences: '1. Tài liệu về quản lý thư viện...'
  });
  
  console.log('Success:', result.message);
  console.log('Created topic ID:', result.data.id);
  
  // Hiển thị thông báo thành công
  showNotification(result.message, 'success');
  
  // Chuyển hướng hoặc refresh danh sách đề tài
  router.push('/instructor/proposed-topics');
} catch (error) {
  console.error('Error:', error);
  showNotification(error.message, 'error');
}
```

### Notes
- `topicCode` phải unique trong cùng một đợt luận văn (`thesisRoundId`)
- `instructorId` được tự động lấy từ JWT token, không cần gửi trong request
- Đề tài mới tạo sẽ có `isTaken = false` và `status = true` mặc định
- Sinh viên có thể xem và đăng ký đề tài này ngay sau khi được tạo

---

## 4. Cập nhật đề tài đề xuất

### Endpoint
```
PUT /thesis/proposed-topics/:id
```

### Mô tả
Giảng viên cập nhật thông tin của một đề tài đề xuất đã tạo. Chỉ có thể cập nhật các đề tài thuộc quyền quản lý của giảng viên hiện tại.

### Authentication
- **Required**: Yes
- **Role**: `TEACHER` (Giảng viên)

### Headers
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | ID của đề tài đề xuất cần cập nhật |

### Request Body

Tất cả các trường đều **optional** (chỉ gửi các trường cần cập nhật):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `topicTitle` | string | No | Tiêu đề đề tài (tối đa 500 ký tự) |
| `topicDescription` | string | No | Mô tả chi tiết đề tài |
| `objectives` | string | No | Mục tiêu của đề tài |
| `studentRequirements` | string | No | Yêu cầu đối với sinh viên |
| `technologiesUsed` | string | No | Công nghệ sử dụng |
| `topicReferences` | string | No | Tài liệu tham khảo |
| `status` | boolean | No | Trạng thái active (`true` = hiển thị, `false` = ẩn) |

**Lưu ý**: Không thể cập nhật `topicCode`, `instructorId`, `thesisRoundId` sau khi tạo.

### Request Example

```json
{
  "topicTitle": "Hệ thống quản lý thư viện số (Cập nhật)",
  "topicDescription": "Xây dựng hệ thống quản lý thư viện số với các tính năng nâng cao...",
  "objectives": "1. Nắm vững quy trình quản lý thư viện\n2. Áp dụng công nghệ web hiện đại\n3. Xây dựng hệ thống thân thiện với người dùng\n4. Tích hợp AI để gợi ý sách",
  "status": true
}
```

### Response Format

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Cập nhật đề tài đề xuất thành công"
}
```

#### Error Responses

**400 Bad Request** - Dữ liệu không hợp lệ
```json
{
  "statusCode": 400,
  "message": [
    "topicTitle must be a string",
    "status must be a boolean value"
  ]
}
```

**404 Not Found** - Đề tài không tồn tại hoặc không thuộc quyền quản lý
```json
{
  "statusCode": 404,
  "message": "Đề tài đề xuất không tồn tại hoặc không thuộc quyền quản lý của bạn"
}
```

**401 Unauthorized** - Chưa đăng nhập hoặc token không hợp lệ
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**403 Forbidden** - Không có quyền truy cập
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Trạng thái thành công |
| `message` | string | Thông báo kết quả |

### Frontend Integration

```typescript
// TypeScript Interface
interface UpdateProposedTopicRequest {
  topicTitle?: string;
  topicDescription?: string;
  objectives?: string;
  studentRequirements?: string;
  technologiesUsed?: string;
  topicReferences?: string;
  status?: boolean;
}

interface UpdateProposedTopicResponse {
  success: boolean;
  message: string;
}

// API Call Function
async function updateProposedTopic(
  topicId: number,
  request: UpdateProposedTopicRequest
): Promise<UpdateProposedTopicResponse> {
  const response = await fetch(`/api/thesis/proposed-topics/${topicId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update proposed topic');
  }
  
  return response.json();
}

// Usage Example
try {
  const result = await updateProposedTopic(1, {
    topicTitle: 'Hệ thống quản lý thư viện số (Cập nhật)',
    topicDescription: 'Xây dựng hệ thống quản lý thư viện số với các tính năng nâng cao...',
    objectives: '1. Nắm vững quy trình...\n2. Áp dụng công nghệ...',
    status: true
  });
  
  console.log('Success:', result.message);
  
  // Hiển thị thông báo thành công
  showNotification(result.message, 'success');
  
  // Refresh danh sách đề tài
  await refreshProposedTopicsList();
} catch (error) {
  console.error('Error:', error);
  showNotification(error.message, 'error');
}
```

### Notes
- Chỉ có thể cập nhật các đề tài thuộc quyền quản lý của giảng viên hiện tại
- Không thể cập nhật `topicCode`, `instructorId`, `thesisRoundId` sau khi tạo
- Có thể cập nhật một hoặc nhiều trường cùng lúc
- Khi đặt `status = false`, đề tài sẽ bị ẩn khỏi danh sách đề tài có sẵn cho sinh viên
- Nếu đề tài đã được sinh viên đăng ký (`isTaken = true`), nên cẩn thận khi cập nhật

---

## Tổng kết

### Các API endpoints cho Giảng viên:

1. **GET** `/thesis/student-registrations` - Lấy danh sách đăng ký đề tài của sinh viên
2. **PUT** `/thesis/approve-registration` - Phê duyệt/Từ chối đăng ký đề tài
3. **POST** `/thesis/proposed-topics` - Tạo đề tài đề xuất
4. **PUT** `/thesis/proposed-topics/:id` - Cập nhật đề tài đề xuất

### Lưu ý chung:

- Tất cả các API đều yêu cầu **JWT Authentication**
- Tất cả các API đều yêu cầu **Role: TEACHER**
- `instructorId` được tự động lấy từ JWT token, không cần gửi trong request
- Tất cả các API đều trả về format chuẩn với `success` và `message`
- Các lỗi được trả về với HTTP status code phù hợp và message rõ ràng
- Sinh viên sẽ nhận được thông báo real-time qua WebSocket khi có thay đổi

### Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

### Error Handling

Tất cả các API đều có thể trả về các lỗi sau:

- **401 Unauthorized**: Chưa đăng nhập hoặc token không hợp lệ
- **403 Forbidden**: Không có quyền truy cập (không phải giảng viên)
- **404 Not Found**: Tài nguyên không tồn tại hoặc không thuộc quyền quản lý
- **400 Bad Request**: Dữ liệu không hợp lệ
- **409 Conflict**: Xung đột dữ liệu (ví dụ: mã đề tài đã tồn tại)
- **500 Internal Server Error**: Lỗi server

### Best Practices

1. **Luôn kiểm tra response status** trước khi xử lý dữ liệu
2. **Xử lý lỗi một cách graceful** và hiển thị thông báo rõ ràng cho người dùng
3. **Sử dụng TypeScript interfaces** để đảm bảo type safety
4. **Cache token** và tự động refresh khi hết hạn
5. **Hiển thị loading state** khi gọi API
6. **Validate dữ liệu** ở frontend trước khi gửi request
7. **Refresh danh sách** sau khi thực hiện các thao tác create/update/delete

---

**Tài liệu này được cập nhật lần cuối:** 2024-01-15

