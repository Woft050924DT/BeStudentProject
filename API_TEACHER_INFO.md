# API Lưu Thông Tin Giảng Viên - Actor Teacher

## Base URL
```
http://localhost:3000
```

---

## 1. Lấy Thông Tin Giảng Viên

### Endpoint
```
GET /teacher/info
```

### Authentication
- **Required**: Yes
- **Type**: JWT Bearer Token
- **Role**: TEACHER

### Headers
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request
Không cần request body. Thông tin giảng viên được lấy từ JWT token.

### Response Success (200 OK)

#### Khi đã có thông tin giảng viên:
```json
{
  "success": true,
  "data": {
    "code": "12523021",
    "fullName": "Nguyễn Văn Giáo Viên",
    "email": "giaovien@example.com",
    "phone": "0987654321",
    "position": "Giảng Viên",
    "degree": "Thạc Sĩ",
    "department": "CNTT",
    "joinDate": "2005-11-27"
  }
}
```

#### Khi chưa có thông tin giảng viên:
```json
{
  "success": true,
  "data": {
    "code": null,
    "fullName": "Nguyễn Văn Giáo Viên",
    "email": "giaovien@example.com",
    "phone": "0987654321",
    "position": null,
    "degree": null,
    "department": null,
    "joinDate": null
  },
  "message": "Chưa có thông tin giảng viên. Vui lòng điền và lưu thông tin để tạo hồ sơ giảng viên."
}
```

### Response Error (404 Not Found)
```json
{
  "statusCode": 404,
  "message": "Không tìm thấy thông tin người dùng",
  "error": "Not Found"
}
```

---

## 2. Cập Nhật Thông Tin Giảng Viên

### Endpoint
```
PUT /teacher/info
```

### Authentication
- **Required**: Yes
- **Type**: JWT Bearer Token
- **Role**: TEACHER

### Headers
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request Body

Tất cả các trường đều **optional** (chỉ gửi các trường cần cập nhật), **trừ khi tạo mới** thì `code` và `department` là **bắt buộc**.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `code` | string | Yes* | Mã giảng viên (bắt buộc khi tạo mới, tối đa 20 ký tự) |
| `fullName` | string | No | Họ và tên (tối đa 255 ký tự) |
| `email` | string | No | Email (phải đúng định dạng email) |
| `phone` | string | No | Số điện thoại (tối đa 15 ký tự) |
| `position` | string | No | Chức vụ (tối đa 50 ký tự, ví dụ: "Giảng Viên", "Phó Giáo sư", "Giáo sư") |
| `degree` | string | No | Học vị (tối đa 50 ký tự, ví dụ: "Thạc Sĩ", "Tiến Sĩ") |
| `department` | string | Yes* | Khoa/Bộ môn (bắt buộc khi tạo mới, có thể là ID số hoặc mã bộ môn như "CNTT") |
| `joinDate` | string | No | Ngày vào làm (định dạng: "yyyy-mm-dd" hoặc "dd/mm/yyyy") |

**Lưu ý**: 
- `*` = Bắt buộc khi tạo mới (khi chưa có hồ sơ giảng viên)
- `department` có thể là:
  - ID số (ví dụ: `"1"` hoặc `1`)
  - Mã bộ môn (ví dụ: `"CNTT"`)
- `joinDate` sẽ được dùng để tự động tính `yearsOfExperience`

### Request Example

#### Tạo mới thông tin giảng viên:
```json
{
  "code": "12523021",
  "fullName": "Nguyễn Văn Giáo Viên",
  "email": "giaovien@example.com",
  "phone": "0987654321",
  "position": "Giảng Viên",
  "degree": "Thạc Sĩ",
  "department": "CNTT",
  "joinDate": "2005-11-27"
}
```

#### Cập nhật thông tin giảng viên:
```json
{
  "fullName": "Nguyễn Văn Giáo Viên",
  "email": "giaovien@example.com",
  "phone": "0987654321",
  "position": "Phó Giáo sư",
  "degree": "Tiến Sĩ"
}
```

### Response Success (200 OK)

#### Khi tạo mới:
```json
{
  "success": true,
  "message": "Tạo và cập nhật thông tin giảng viên thành công",
  "data": {
    "code": "12523021",
    "fullName": "Nguyễn Văn Giáo Viên",
    "email": "giaovien@example.com",
    "phone": "0987654321",
    "position": "Giảng Viên",
    "degree": "Thạc Sĩ",
    "department": "CNTT",
    "joinDate": "2005-11-27"
  }
}
```

#### Khi cập nhật:
```json
{
  "success": true,
  "message": "Cập nhật thông tin giảng viên thành công",
  "data": {
    "code": "12523021",
    "fullName": "Nguyễn Văn Giáo Viên",
    "email": "giaovien@example.com",
    "phone": "0987654321",
    "position": "Phó Giáo sư",
    "degree": "Tiến Sĩ",
    "department": "CNTT",
    "joinDate": "2005-11-27"
  }
}
```

### Response Error

#### 400 Bad Request - Thiếu trường bắt buộc khi tạo mới
```json
{
  "statusCode": 400,
  "message": "Mã giảng viên là bắt buộc khi tạo mới",
  "error": "Bad Request"
}
```

```json
{
  "statusCode": 400,
  "message": "Bộ môn là bắt buộc khi tạo mới",
  "error": "Bad Request"
}
```

#### 400 Bad Request - Dữ liệu không hợp lệ
```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "code must be a string"
  ],
  "error": "Bad Request"
}
```

#### 404 Not Found - Bộ môn không tồn tại
```json
{
  "statusCode": 404,
  "message": "Bộ môn không tồn tại",
  "error": "Not Found"
}
```

#### 409 Conflict - Mã giảng viên đã tồn tại
```json
{
  "statusCode": 409,
  "message": "Mã giảng viên đã tồn tại",
  "error": "Conflict"
}
```

#### 409 Conflict - Email đã được sử dụng
```json
{
  "statusCode": 409,
  "message": "Email đã được sử dụng",
  "error": "Conflict"
}
```

---

## Các Trường Dữ Liệu

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Trạng thái thành công |
| `message` | string | Thông báo kết quả (chỉ có khi tạo mới hoặc cập nhật) |
| `data` | object | Dữ liệu thông tin giảng viên |
| `data.code` | string\|null | Mã giảng viên |
| `data.fullName` | string\|null | Họ và tên |
| `data.email` | string\|null | Email |
| `data.phone` | string\|null | Số điện thoại |
| `data.position` | string\|null | Chức vụ (Giảng Viên, Phó Giáo sư, Giáo sư, ...) |
| `data.degree` | string\|null | Học vị (Thạc Sĩ, Tiến Sĩ, ...) |
| `data.department` | string\|null | Mã khoa/bộ môn (ví dụ: "CNTT") |
| `data.joinDate` | string\|null | Ngày vào làm (định dạng: "yyyy-mm-dd") |

---

## Frontend Integration

### TypeScript Interfaces

```typescript
// Request Interface
interface UpdateTeacherInfoRequest {
  code?: string;           // Mã giảng viên (bắt buộc khi tạo mới)
  fullName?: string;       // Họ và tên
  email?: string;          // Email
  phone?: string;          // Số điện thoại
  position?: string;       // Chức vụ
  degree?: string;         // Học vị
  department?: string;     // Khoa/Bộ môn (bắt buộc khi tạo mới, có thể là ID hoặc mã)
  joinDate?: string;       // Ngày vào làm (yyyy-mm-dd hoặc dd/mm/yyyy)
}

// Response Interface
interface TeacherInfoResponse {
  success: boolean;
  message?: string;
  data: {
    code: string | null;
    fullName: string | null;
    email: string | null;
    phone: string | null;
    position: string | null;
    degree: string | null;
    department: string | null;
    joinDate: string | null;
  };
}
```

### API Call Functions

```typescript
// Lấy thông tin giảng viên
async function getTeacherInfo(): Promise<TeacherInfoResponse> {
  const response = await fetch('/api/teacher/info', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch teacher info');
  }
  
  return response.json();
}

// Cập nhật thông tin giảng viên
async function updateTeacherInfo(
  data: UpdateTeacherInfoRequest
): Promise<TeacherInfoResponse> {
  const response = await fetch('/api/teacher/info', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update teacher info');
  }
  
  return response.json();
}
```

### Usage Example

```typescript
// Lấy thông tin giảng viên
try {
  const result = await getTeacherInfo();
  
  if (result.success) {
    console.log('Teacher Info:', result.data);
    
    // Kiểm tra xem đã có thông tin chưa
    if (result.message) {
      console.log('Message:', result.message);
      // Hiển thị form để tạo mới
    } else {
      // Hiển thị form để cập nhật với dữ liệu hiện có
      setFormData(result.data);
    }
  }
} catch (error) {
  console.error('Error:', error);
  showNotification('Không thể tải thông tin giảng viên', 'error');
}

// Cập nhật thông tin giảng viên
try {
  const formData = {
    code: '12523021',
    fullName: 'Nguyễn Văn Giáo Viên',
    email: 'giaovien@example.com',
    phone: '0987654321',
    position: 'Giảng Viên',
    degree: 'Thạc Sĩ',
    department: 'CNTT',
    joinDate: '2005-11-27'
  };
  
  const result = await updateTeacherInfo(formData);
  
  if (result.success) {
    console.log('Success:', result.message);
    showNotification(result.message || 'Cập nhật thành công', 'success');
    
    // Cập nhật lại form với dữ liệu mới
    setFormData(result.data);
  }
} catch (error) {
  console.error('Error:', error);
  showNotification(error.message || 'Cập nhật thất bại', 'error');
}
```

### Form Validation

```typescript
// Validation rules
const validationRules = {
  code: {
    required: true, // Bắt buộc khi tạo mới
    maxLength: 20,
    pattern: /^[A-Z0-9]+$/ // Chỉ chữ in hoa và số
  },
  fullName: {
    required: false,
    maxLength: 255
  },
  email: {
    required: false,
    type: 'email'
  },
  phone: {
    required: false,
    maxLength: 15,
    pattern: /^[0-9]+$/
  },
  position: {
    required: false,
    maxLength: 50
  },
  degree: {
    required: false,
    maxLength: 50
  },
  department: {
    required: true, // Bắt buộc khi tạo mới
    // Có thể là ID hoặc mã bộ môn
  },
  joinDate: {
    required: false,
    format: 'date' // yyyy-mm-dd hoặc dd/mm/yyyy
  }
};
```

---

## Lưu ý

1. **Khi tạo mới**: Phải gửi `code` và `department` (bắt buộc)
2. **Khi cập nhật**: Tất cả các trường đều optional, chỉ gửi các trường cần cập nhật
3. **Department**: Có thể gửi ID số hoặc mã bộ môn (ví dụ: `"1"` hoặc `"CNTT"`)
4. **JoinDate**: Sẽ được dùng để tự động tính số năm kinh nghiệm
5. **Email**: Phải đúng định dạng email và không được trùng với email khác
6. **Code**: Phải unique, không được trùng với mã giảng viên khác

---

**Tài liệu này được cập nhật lần cuối:** 2024-01-15

