# API Quản Lý Giảng Viên - Actor Giáo Vụ (Academic Staff)

Tài liệu này mô tả các API endpoints dành cho **Actor: Giáo Vụ (ACADEMIC_STAFF)** trong việc quản lý giảng viên trong hệ thống quản lý đồ án tốt nghiệp.

## Mục lục

### Quản lý Giảng viên
1. [Tạo thông tin giảng viên](#1-tạo-thông-tin-giảng-viên)
2. [Lấy danh sách giảng viên](#2-lấy-danh-sách-giảng-viên)
3. [Lấy chi tiết giảng viên](#3-lấy-chi-tiết-giảng-viên)
4. [Cập nhật thông tin giảng viên](#4-cập-nhật-thông-tin-giảng-viên)
5. [Xóa giảng viên](#5-xóa-giảng-viên)
6. [Lấy giảng viên theo bộ môn](#6-lấy-giảng-viên-theo-bộ-môn)

### Quản lý Lớp học
7. [Tạo lớp học mới](#7-tạo-lớp-học-mới)
8. [Lấy danh sách lớp học](#8-lấy-danh-sách-lớp-học)
9. [Lấy chi tiết lớp học](#9-lấy-chi-tiết-lớp-học)
10. [Cập nhật thông tin lớp học](#10-cập-nhật-thông-tin-lớp-học)
11. [Xóa lớp học](#11-xóa-lớp-học)
12. [Lấy lớp học theo chuyên ngành](#12-lấy-lớp-học-theo-chuyên-ngành)

### Quản lý Học sinh
13. [Tạo thông tin học sinh](#13-tạo-thông-tin-học-sinh)
14. [Lấy danh sách học sinh](#14-lấy-danh-sách-học-sinh)
15. [Lấy chi tiết học sinh](#15-lấy-chi-tiết-học-sinh)
16. [Cập nhật thông tin học sinh](#16-cập-nhật-thông-tin-học-sinh)
17. [Xóa học sinh](#17-xóa-học-sinh)
18. [Lấy học sinh theo lớp](#18-lấy-học-sinh-theo-lớp)

---

## Base URL
```
Development: http://localhost:3000
Production: https://your-domain.com
```

---

## 1. Tạo thông tin giảng viên

### Endpoint
```
POST /academic-staff/instructors
```

### Mô tả
Tạo thông tin giảng viên mới trong hệ thống. Giáo vụ có thể tạo thông tin giảng viên cho người dùng đã có tài khoản.

### Authentication
- **Required**: Yes
- **Type**: JWT Bearer Token
- **Role**: `ACADEMIC_STAFF`

### Headers
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | number | Yes | ID người dùng (phải tồn tại trong hệ thống) |
| `instructorCode` | string | Yes | Mã giảng viên (2-20 ký tự, unique) |
| `departmentId` | number | Yes | ID bộ môn |
| `degree` | string | No | Học vị (tối đa 50 ký tự, ví dụ: "Thạc sĩ", "Tiến sĩ") |
| `academicTitle` | string | No | Chức danh (tối đa 50 ký tự, ví dụ: "Giáo sư", "Phó Giáo sư") |
| `specialization` | string | No | Chuyên ngành |
| `yearsOfExperience` | number | No | Số năm kinh nghiệm (mặc định: 0) |

### Request Example

```json
{
  "userId": 1,
  "instructorCode": "GV001",
  "departmentId": 1,
  "degree": "Tiến sĩ",
  "academicTitle": "Phó Giáo sư",
  "specialization": "Công nghệ thông tin, Trí tuệ nhân tạo",
  "yearsOfExperience": 15
}
```

### Response Format

#### Success Response (201 Created)

```json
{
  "message": "Tạo thông tin giảng viên thành công",
  "instructor": {
    "id": 1,
    "userId": 1,
    "instructorCode": "GV001",
    "departmentId": 1,
    "degree": "Tiến sĩ",
    "academicTitle": "Phó Giáo sư",
    "specialization": "Công nghệ thông tin, Trí tuệ nhân tạo",
    "yearsOfExperience": 15,
    "status": true
  }
}
```

#### Error Responses

**400 Bad Request** - Dữ liệu không hợp lệ
```json
{
  "statusCode": 400,
  "message": [
    "instructorCode should not be empty",
    "userId must be a number"
  ]
}
```

**404 Not Found** - Người dùng hoặc bộ môn không tồn tại
```json
{
  "statusCode": 404,
  "message": "Không tìm thấy người dùng"
}
```

```json
{
  "statusCode": 404,
  "message": "Không tìm thấy bộ môn"
}
```

**409 Conflict** - Mã giảng viên đã tồn tại hoặc người dùng đã có thông tin giảng viên
```json
{
  "statusCode": 409,
  "message": "Mã giảng viên đã tồn tại"
}
```

```json
{
  "statusCode": 409,
  "message": "Người dùng đã có thông tin giảng viên"
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

---

## 2. Lấy danh sách giảng viên

### Endpoint
```
GET /academic-staff/instructors
```

### Mô tả
Lấy danh sách tất cả giảng viên trong hệ thống với khả năng tìm kiếm, lọc và phân trang.

### Authentication
- **Required**: Yes
- **Type**: JWT Bearer Token
- **Role**: `ACADEMIC_STAFF`

### Headers
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Số trang (mặc định: 1, tối thiểu: 1) |
| `limit` | number | No | Số lượng mỗi trang (mặc định: 10, tối đa: 100) |
| `departmentId` | number | No | Lọc theo ID bộ môn |
| `facultyId` | number | No | Lọc theo ID khoa |
| `search` | string | No | Tìm kiếm theo mã giảng viên, tên, email |
| `degree` | string | No | Lọc theo học vị |
| `academicTitle` | string | No | Lọc theo chức danh |
| `status` | boolean | No | Lọc theo trạng thái (true/false) |
| `sortBy` | string | No | Sắp xếp theo: `instructorCode`, `fullName`, `createdAt`, `yearsOfExperience` (mặc định: `instructorCode`) |
| `sortOrder` | string | No | Thứ tự sắp xếp: `ASC` hoặc `DESC` (mặc định: `ASC`) |

### Request Example

```bash
# Lấy tất cả giảng viên
GET /academic-staff/instructors
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Lấy với phân trang
GET /academic-staff/instructors?page=1&limit=20
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Tìm kiếm và lọc
GET /academic-staff/instructors?search=Nguyễn&departmentId=1&status=true&page=1&limit=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Lọc theo khoa và học vị
GET /academic-staff/instructors?facultyId=1&degree=Tiến sĩ&sortBy=fullName&sortOrder=ASC
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response Format

#### Success Response (200 OK)

**Khi có query params (filters, pagination):**
```json
{
  "message": "Lấy danh sách giảng viên thành công",
  "data": [
    {
      "id": 1,
      "userId": 1,
      "instructorCode": "GV001",
      "user": {
        "id": 1,
        "username": "nguyenvana",
        "email": "nguyenvana@example.com",
        "fullName": "Nguyễn Văn A",
        "phone": "0912345678"
      },
      "department": {
        "id": 1,
        "departmentCode": "CNTT",
        "departmentName": "Công nghệ thông tin",
        "faculty": {
          "id": 1,
          "facultyCode": "KHCN",
          "facultyName": "Khoa Khoa học và Công nghệ"
        }
      },
      "degree": "Tiến sĩ",
      "academicTitle": "Phó Giáo sư",
      "specialization": "Công nghệ thông tin, Trí tuệ nhân tạo",
      "yearsOfExperience": 15,
      "status": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

**Khi không có query params (lấy tất cả):**
```json
{
  "message": "Lấy danh sách giảng viên thành công",
  "data": [
    {
      "id": 1,
      "userId": 1,
      "instructorCode": "GV001",
      "user": {
        "id": 1,
        "username": "nguyenvana",
        "email": "nguyenvana@example.com",
        "fullName": "Nguyễn Văn A",
        "phone": "0912345678"
      },
      "department": {
        "id": 1,
        "departmentCode": "CNTT",
        "departmentName": "Công nghệ thông tin",
        "faculty": {
          "id": 1,
          "facultyCode": "KHCN",
          "facultyName": "Khoa Khoa học và Công nghệ"
        }
      },
      "degree": "Tiến sĩ",
      "academicTitle": "Phó Giáo sư",
      "specialization": "Công nghệ thông tin, Trí tuệ nhân tạo",
      "yearsOfExperience": 15,
      "status": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 50,
    "totalPages": 1
  }
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

**403 Forbidden** - Không có quyền truy cập
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

---

## 3. Lấy chi tiết giảng viên

### Endpoint
```
GET /academic-staff/instructors/:id
```

### Mô tả
Lấy thông tin chi tiết của một giảng viên theo ID.

### Authentication
- **Required**: Yes
- **Type**: JWT Bearer Token
- **Role**: `ACADEMIC_STAFF`

### Headers
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | ID của giảng viên |

### Request Example

```bash
GET /academic-staff/instructors/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response Format

#### Success Response (200 OK)

```json
{
  "message": "Lấy thông tin giảng viên thành công",
  "instructor": {
    "id": 1,
    "userId": 1,
    "instructorCode": "GV001",
    "user": {
      "id": 1,
      "username": "nguyenvana",
      "email": "nguyenvana@example.com",
      "fullName": "Nguyễn Văn A",
      "phone": "0912345678",
      "gender": "Male",
      "dateOfBirth": "1975-05-15",
      "address": "123 Đường ABC, Quận XYZ",
      "avatar": "/uploads/avatar/gv001.jpg",
      "status": true
    },
    "department": {
      "id": 1,
      "departmentCode": "CNTT",
      "departmentName": "Công nghệ thông tin",
      "faculty": {
        "id": 1,
        "facultyCode": "KHCN",
        "facultyName": "Khoa Khoa học và Công nghệ"
      }
    },
    "degree": "Tiến sĩ",
    "academicTitle": "Phó Giáo sư",
    "specialization": "Công nghệ thông tin, Trí tuệ nhân tạo",
    "yearsOfExperience": 15,
    "status": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-20T14:20:00.000Z"
  }
}
```

#### Error Responses

**404 Not Found** - Giảng viên không tồn tại
```json
{
  "statusCode": 404,
  "message": "Không tìm thấy giảng viên"
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

---

## 4. Cập nhật thông tin giảng viên

### Endpoint
```
PUT /academic-staff/instructors/:id
```

### Mô tả
Cập nhật thông tin của một giảng viên. Tất cả các trường đều optional, chỉ cập nhật các trường được gửi.

### Authentication
- **Required**: Yes
- **Type**: JWT Bearer Token
- **Role**: `ACADEMIC_STAFF`

### Headers
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | ID của giảng viên cần cập nhật |

### Request Body

Tất cả các trường đều **optional**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `departmentId` | number | No | ID bộ môn mới |
| `degree` | string | No | Học vị (tối đa 50 ký tự) |
| `academicTitle` | string | No | Chức danh (tối đa 50 ký tự) |
| `specialization` | string | No | Chuyên ngành |
| `yearsOfExperience` | number | No | Số năm kinh nghiệm |
| `status` | boolean | No | Trạng thái hoạt động (true/false) |

### Request Example

```json
{
  "degree": "Tiến sĩ",
  "academicTitle": "Giáo sư",
  "specialization": "Công nghệ thông tin, Trí tuệ nhân tạo, Machine Learning",
  "yearsOfExperience": 20,
  "status": true
}
```

### Response Format

#### Success Response (200 OK)

```json
{
  "message": "Cập nhật thông tin giảng viên thành công",
  "instructor": {
    "id": 1,
    "userId": 1,
    "instructorCode": "GV001",
    "departmentId": 1,
    "degree": "Tiến sĩ",
    "academicTitle": "Giáo sư",
    "specialization": "Công nghệ thông tin, Trí tuệ nhân tạo, Machine Learning",
    "yearsOfExperience": 20,
    "status": true,
    "updatedAt": "2024-01-20T14:20:00.000Z"
  }
}
```

#### Error Responses

**400 Bad Request** - Dữ liệu không hợp lệ
```json
{
  "statusCode": 400,
  "message": [
    "degree must be a string",
    "yearsOfExperience must be a number"
  ]
}
```

**404 Not Found** - Giảng viên hoặc bộ môn không tồn tại
```json
{
  "statusCode": 404,
  "message": "Không tìm thấy giảng viên"
}
```

```json
{
  "statusCode": 404,
  "message": "Không tìm thấy bộ môn"
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

---

## 5. Xóa giảng viên

### Endpoint
```
DELETE /academic-staff/instructors/:id
```

### Mô tả
Xóa thông tin giảng viên khỏi hệ thống. Không thể xóa giảng viên nếu:
- Đang có đề tài hướng dẫn
- Đang là trưởng khoa
- Đang là trưởng bộ môn
- Đang là cố vấn học tập

### Authentication
- **Required**: Yes
- **Type**: JWT Bearer Token
- **Role**: `ACADEMIC_STAFF`

### Headers
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | ID của giảng viên cần xóa |

### Request Example

```bash
DELETE /academic-staff/instructors/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response Format

#### Success Response (200 OK)

```json
{
  "message": "Xóa giảng viên thành công"
}
```

#### Error Responses

**400 Bad Request** - Không thể xóa do ràng buộc
```json
{
  "statusCode": 400,
  "message": "Không thể xóa giảng viên đang có đề tài hướng dẫn"
}
```

```json
{
  "statusCode": 400,
  "message": "Không thể xóa giảng viên đang là trưởng khoa"
}
```

```json
{
  "statusCode": 400,
  "message": "Không thể xóa giảng viên đang là trưởng bộ môn"
}
```

```json
{
  "statusCode": 400,
  "message": "Không thể xóa giảng viên đang là cố vấn học tập"
}
```

**404 Not Found** - Giảng viên không tồn tại
```json
{
  "statusCode": 404,
  "message": "Không tìm thấy giảng viên"
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

---

## 6. Lấy giảng viên theo bộ môn

### Endpoint
```
GET /academic-staff/departments/:departmentId/instructors
```

### Mô tả
Lấy danh sách tất cả giảng viên thuộc một bộ môn cụ thể.

### Authentication
- **Required**: Yes
- **Type**: JWT Bearer Token
- **Role**: `ACADEMIC_STAFF`

### Headers
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | number | Yes | ID của bộ môn |

### Request Example

```bash
GET /academic-staff/departments/1/instructors
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response Format

#### Success Response (200 OK)

```json
{
  "message": "Lấy danh sách giảng viên theo bộ môn thành công",
  "instructors": [
    {
      "id": 1,
      "instructorCode": "GV001",
      "user": {
        "id": 1,
        "fullName": "Nguyễn Văn A",
        "email": "nguyenvana@example.com"
      },
      "degree": "Tiến sĩ",
      "academicTitle": "Phó Giáo sư",
      "specialization": "Công nghệ thông tin, Trí tuệ nhân tạo",
      "yearsOfExperience": 15,
      "status": true
    },
    {
      "id": 2,
      "instructorCode": "GV002",
      "user": {
        "id": 2,
        "fullName": "Trần Thị B",
        "email": "tranthib@example.com"
      },
      "degree": "Thạc sĩ",
      "academicTitle": "Giảng viên",
      "specialization": "Công nghệ phần mềm",
      "yearsOfExperience": 8,
      "status": true
    }
  ]
}
```

#### Error Responses

**404 Not Found** - Bộ môn không tồn tại
```json
{
  "statusCode": 404,
  "message": "Không tìm thấy bộ môn"
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

---

## Frontend Integration

### TypeScript Interfaces

```typescript
// Request Interfaces
interface CreateInstructorRequest {
  userId: number;
  instructorCode: string;
  departmentId: number;
  degree?: string;
  academicTitle?: string;
  specialization?: string;
  yearsOfExperience?: number;
}

interface UpdateInstructorRequest {
  departmentId?: number;
  degree?: string;
  academicTitle?: string;
  specialization?: string;
  yearsOfExperience?: number;
  status?: boolean;
}

interface GetInstructorsQuery {
  page?: number;
  limit?: number;
  departmentId?: number;
  facultyId?: number;
  search?: string;
  degree?: string;
  academicTitle?: string;
  status?: boolean;
  sortBy?: 'instructorCode' | 'fullName' | 'createdAt' | 'yearsOfExperience';
  sortOrder?: 'ASC' | 'DESC';
}

// Response Interfaces
interface Instructor {
  id: number;
  userId: number;
  instructorCode: string;
  user: {
    id: number;
    username: string;
    email: string;
    fullName: string;
    phone?: string;
    gender?: string;
    dateOfBirth?: string;
    address?: string;
    avatar?: string;
    status: boolean;
  };
  department: {
    id: number;
    departmentCode: string;
    departmentName: string;
    faculty?: {
      id: number;
      facultyCode: string;
      facultyName: string;
    };
  };
  degree?: string;
  academicTitle?: string;
  specialization?: string;
  yearsOfExperience: number;
  status: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface GetInstructorsResponse {
  message: string;
  data: Instructor[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface InstructorDetailResponse {
  message: string;
  instructor: Instructor;
}

interface CreateInstructorResponse {
  message: string;
  instructor: {
    id: number;
    userId: number;
    instructorCode: string;
    departmentId: number;
    degree?: string;
    academicTitle?: string;
    specialization?: string;
    yearsOfExperience: number;
    status: boolean;
  };
}

interface UpdateInstructorResponse {
  message: string;
  instructor: {
    id: number;
    userId: number;
    instructorCode: string;
    departmentId: number;
    degree?: string;
    academicTitle?: string;
    specialization?: string;
    yearsOfExperience: number;
    status: boolean;
    updatedAt: string;
  };
}

interface DeleteInstructorResponse {
  message: string;
}
```

### API Call Functions

```typescript
// Helper function để lấy token
function getToken(): string {
  return localStorage.getItem('access_token') || '';
}

// Helper function để build query string
function buildQueryString(params: Record<string, any>): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });
  return query.toString();
}

// 1. Tạo giảng viên
async function createInstructor(
  data: CreateInstructorRequest
): Promise<CreateInstructorResponse> {
  const response = await fetch('/academic-staff/instructors', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create instructor');
  }

  return response.json();
}

// 2. Lấy danh sách giảng viên
async function getInstructors(
  query?: GetInstructorsQuery
): Promise<GetInstructorsResponse> {
  const queryString = query ? `?${buildQueryString(query)}` : '';
  const response = await fetch(`/academic-staff/instructors${queryString}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch instructors');
  }

  return response.json();
}

// 3. Lấy chi tiết giảng viên
async function getInstructorById(
  id: number
): Promise<InstructorDetailResponse> {
  const response = await fetch(`/academic-staff/instructors/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch instructor');
  }

  return response.json();
}

// 4. Cập nhật giảng viên
async function updateInstructor(
  id: number,
  data: UpdateInstructorRequest
): Promise<UpdateInstructorResponse> {
  const response = await fetch(`/academic-staff/instructors/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update instructor');
  }

  return response.json();
}

// 5. Xóa giảng viên
async function deleteInstructor(
  id: number
): Promise<DeleteInstructorResponse> {
  const response = await fetch(`/academic-staff/instructors/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete instructor');
  }

  return response.json();
}

// 6. Lấy giảng viên theo bộ môn
async function getInstructorsByDepartment(
  departmentId: number
): Promise<{ message: string; instructors: Instructor[] }> {
  const response = await fetch(
    `/academic-staff/departments/${departmentId}/instructors`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch instructors');
  }

  return response.json();
}
```

### Usage Examples

```typescript
// Ví dụ 1: Tạo giảng viên mới
try {
  const result = await createInstructor({
    userId: 1,
    instructorCode: 'GV001',
    departmentId: 1,
    degree: 'Tiến sĩ',
    academicTitle: 'Phó Giáo sư',
    specialization: 'Công nghệ thông tin',
    yearsOfExperience: 15
  });
  
  console.log('Success:', result.message);
  console.log('Created instructor ID:', result.instructor.id);
  showNotification(result.message, 'success');
} catch (error) {
  console.error('Error:', error);
  showNotification(error.message, 'error');
}

// Ví dụ 2: Lấy danh sách với filters và pagination
try {
  const result = await getInstructors({
    page: 1,
    limit: 20,
    departmentId: 1,
    search: 'Nguyễn',
    status: true,
    sortBy: 'fullName',
    sortOrder: 'ASC'
  });
  
  console.log('Total:', result.pagination.total);
  console.log('Instructors:', result.data);
  
  // Hiển thị danh sách
  displayInstructorsList(result.data);
  displayPagination(result.pagination);
} catch (error) {
  console.error('Error:', error);
  showNotification('Không thể tải danh sách giảng viên', 'error');
}

// Ví dụ 3: Cập nhật giảng viên
try {
  const result = await updateInstructor(1, {
    degree: 'Tiến sĩ',
    academicTitle: 'Giáo sư',
    yearsOfExperience: 20,
    status: true
  });
  
  console.log('Success:', result.message);
  showNotification(result.message, 'success');
  
  // Refresh danh sách
  await refreshInstructorsList();
} catch (error) {
  console.error('Error:', error);
  showNotification(error.message, 'error');
}

// Ví dụ 4: Xóa giảng viên
try {
  const confirmed = await confirmDialog(
    'Bạn có chắc chắn muốn xóa giảng viên này?'
  );
  
  if (confirmed) {
    const result = await deleteInstructor(1);
    console.log('Success:', result.message);
    showNotification(result.message, 'success');
    
    // Refresh danh sách
    await refreshInstructorsList();
  }
} catch (error) {
  console.error('Error:', error);
  showNotification(error.message, 'error');
}
```

### React Hook Example

```typescript
import { useState, useEffect } from 'react';

interface UseInstructorsOptions {
  page?: number;
  limit?: number;
  departmentId?: number;
  facultyId?: number;
  search?: string;
  status?: boolean;
}

export function useInstructors(options: UseInstructorsOptions = {}) {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInstructors = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getInstructors(options);
      setInstructors(result.data);
      setPagination(result.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, [JSON.stringify(options)]);

  return {
    instructors,
    pagination,
    loading,
    error,
    refetch: fetchInstructors
  };
}

// Usage trong component
function InstructorsList() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    departmentId: undefined as number | undefined
  });

  const { instructors, pagination, loading, error, refetch } = useInstructors(filters);

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;

  return (
    <div>
      <input
        type="text"
        placeholder="Tìm kiếm..."
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
      />
      
      <table>
        <thead>
          <tr>
            <th>Mã GV</th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Bộ môn</th>
            <th>Học vị</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {instructors.map((instructor) => (
            <tr key={instructor.id}>
              <td>{instructor.instructorCode}</td>
              <td>{instructor.user.fullName}</td>
              <td>{instructor.user.email}</td>
              <td>{instructor.department.departmentName}</td>
              <td>{instructor.degree || '-'}</td>
              <td>
                <button onClick={() => handleEdit(instructor.id)}>Sửa</button>
                <button onClick={() => handleDelete(instructor.id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <Pagination
        current={pagination.page}
        total={pagination.totalPages}
        onChange={(page) => setFilters({ ...filters, page })}
      />
    </div>
  );
}
```

---

## 7. Tạo lớp học mới

### Endpoint
```
POST /academic-staff/classes
```

### Mô tả
Tạo lớp học mới trong hệ thống. Giáo vụ có thể tạo lớp học cho một chuyên ngành cụ thể.

### Authentication
- **Required**: Yes
- **Type**: JWT Bearer Token
- **Role**: `ACADEMIC_STAFF`

### Headers
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `classCode` | string | Yes | Mã lớp học (2-20 ký tự, unique) |
| `className` | string | Yes | Tên lớp học (1-255 ký tự) |
| `majorId` | number | Yes | ID chuyên ngành |
| `academicYear` | string | No | Khóa học (tối đa 10 ký tự, ví dụ: "K19", "K20") |
| `studentCount` | number | No | Số lượng sinh viên (mặc định: 0) |
| `advisorId` | number | No | ID giảng viên cố vấn học tập |
| `status` | boolean | No | Trạng thái hoạt động (mặc định: true) |

### Request Example

```json
{
  "classCode": "CNTT19A",
  "className": "Công nghệ thông tin K19 - Lớp A",
  "majorId": 1,
  "academicYear": "K19",
  "advisorId": 1,
  "status": true
}
```

### Response Format

#### Success Response (201 Created)

```json
{
  "message": "Tạo lớp học thành công",
  "class": {
    "id": 1,
    "classCode": "CNTT19A",
    "className": "Công nghệ thông tin K19 - Lớp A",
    "majorId": 1,
    "academicYear": "K19",
    "studentCount": 0,
    "advisorId": 1,
    "status": true
  }
}
```

#### Error Responses

**400 Bad Request** - Dữ liệu không hợp lệ
```json
{
  "statusCode": 400,
  "message": [
    "classCode should not be empty",
    "majorId must be a number"
  ]
}
```

**404 Not Found** - Chuyên ngành hoặc giảng viên cố vấn không tồn tại
```json
{
  "statusCode": 404,
  "message": "Không tìm thấy chuyên ngành"
}
```

```json
{
  "statusCode": 404,
  "message": "Không tìm thấy giảng viên cố vấn"
}
```

**409 Conflict** - Mã lớp học đã tồn tại
```json
{
  "statusCode": 409,
  "message": "Mã lớp đã tồn tại"
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

---

## 8. Lấy danh sách lớp học

### Endpoint
```
GET /academic-staff/classes
```

### Mô tả
Lấy danh sách tất cả lớp học trong hệ thống với khả năng tìm kiếm, lọc và phân trang.

### Authentication
- **Required**: Yes
- **Type**: JWT Bearer Token
- **Role**: `ACADEMIC_STAFF`

### Headers
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Số trang (mặc định: 1, tối thiểu: 1) |
| `limit` | number | No | Số lượng mỗi trang (mặc định: 10, tối đa: 100) |
| `majorId` | number | No | Lọc theo ID chuyên ngành |
| `departmentId` | number | No | Lọc theo ID bộ môn |
| `facultyId` | number | No | Lọc theo ID khoa |
| `search` | string | No | Tìm kiếm theo mã lớp, tên lớp |
| `academicYear` | string | No | Lọc theo khóa học (K19, K20...) |
| `advisorId` | number | No | Lọc theo ID cố vấn học tập |
| `status` | boolean | No | Lọc theo trạng thái (true/false) |
| `sortBy` | string | No | Sắp xếp theo: `classCode`, `className`, `createdAt`, `studentCount` (mặc định: `classCode`) |
| `sortOrder` | string | No | Thứ tự sắp xếp: `ASC` hoặc `DESC` (mặc định: `ASC`) |

### Request Example

```bash
# Lấy tất cả lớp học
GET /academic-staff/classes
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Lấy với phân trang
GET /academic-staff/classes?page=1&limit=20
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Tìm kiếm và lọc
GET /academic-staff/classes?search=CNTT&majorId=1&status=true&page=1&limit=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Lọc theo khoa và khóa học
GET /academic-staff/classes?facultyId=1&academicYear=K19&sortBy=className&sortOrder=ASC
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response Format

#### Success Response (200 OK)

**Khi có query params (filters, pagination):**
```json
{
  "message": "Lấy danh sách lớp học thành công",
  "data": [
    {
      "id": 1,
      "classCode": "CNTT19A",
      "className": "Công nghệ thông tin K19 - Lớp A",
      "major": {
        "id": 1,
        "majorCode": "CNTT",
        "majorName": "Công nghệ thông tin",
        "department": {
          "id": 1,
          "departmentCode": "CNTT",
          "departmentName": "Công nghệ thông tin",
          "faculty": {
            "id": 1,
            "facultyCode": "KHCN",
            "facultyName": "Khoa Khoa học và Công nghệ"
          }
        }
      },
      "academicYear": "K19",
      "studentCount": 45,
      "advisor": {
        "id": 1,
        "instructorCode": "GV001",
        "user": {
          "id": 1,
          "fullName": "Nguyễn Văn A",
          "email": "nguyenvana@example.com"
        }
      },
      "status": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

**Khi không có query params (lấy tất cả):**
```json
{
  "message": "Lấy danh sách lớp học thành công",
  "data": [
    {
      "id": 1,
      "classCode": "CNTT19A",
      "className": "Công nghệ thông tin K19 - Lớp A",
      "major": {
        "id": 1,
        "majorCode": "CNTT",
        "majorName": "Công nghệ thông tin",
        "department": {
          "id": 1,
          "departmentCode": "CNTT",
          "departmentName": "Công nghệ thông tin",
          "faculty": {
            "id": 1,
            "facultyCode": "KHCN",
            "facultyName": "Khoa Khoa học và Công nghệ"
          }
        }
      },
      "academicYear": "K19",
      "studentCount": 45,
      "advisor": {
        "id": 1,
        "instructorCode": "GV001",
        "user": {
          "id": 1,
          "fullName": "Nguyễn Văn A",
          "email": "nguyenvana@example.com"
        }
      },
      "status": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 50,
    "totalPages": 1
  }
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

**403 Forbidden** - Không có quyền truy cập
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

---

## 9. Lấy chi tiết lớp học

### Endpoint
```
GET /academic-staff/classes/:id
```

### Mô tả
Lấy thông tin chi tiết của một lớp học theo ID, bao gồm danh sách sinh viên trong lớp.

### Authentication
- **Required**: Yes
- **Type**: JWT Bearer Token
- **Role**: `ACADEMIC_STAFF`

### Headers
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | ID của lớp học |

### Request Example

```bash
GET /academic-staff/classes/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response Format

#### Success Response (200 OK)

```json
{
  "message": "Lấy thông tin lớp học thành công",
  "class": {
    "id": 1,
    "classCode": "CNTT19A",
    "className": "Công nghệ thông tin K19 - Lớp A",
    "major": {
      "id": 1,
      "majorCode": "CNTT",
      "majorName": "Công nghệ thông tin",
      "department": {
        "id": 1,
        "departmentCode": "CNTT",
        "departmentName": "Công nghệ thông tin",
        "faculty": {
          "id": 1,
          "facultyCode": "KHCN",
          "facultyName": "Khoa Khoa học và Công nghệ"
        }
      }
    },
    "academicYear": "K19",
    "studentCount": 45,
    "advisor": {
      "id": 1,
      "instructorCode": "GV001",
      "user": {
        "id": 1,
        "fullName": "Nguyễn Văn A",
        "email": "nguyenvana@example.com",
        "phone": "0912345678"
      }
    },
    "status": true,
    "students": [
      {
        "id": 1,
        "studentCode": "SV001",
        "user": {
          "id": 10,
          "fullName": "Trần Văn B",
          "email": "tranvanb@example.com"
        },
        "gpa": 3.5,
        "academicStatus": "Active"
      }
    ],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-20T14:20:00.000Z"
  }
}
```

#### Error Responses

**404 Not Found** - Lớp học không tồn tại
```json
{
  "statusCode": 404,
  "message": "Không tìm thấy lớp học"
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

---

## 10. Cập nhật thông tin lớp học

### Endpoint
```
PUT /academic-staff/classes/:id
```

### Mô tả
Cập nhật thông tin của một lớp học. Tất cả các trường đều optional, chỉ cập nhật các trường được gửi.

### Authentication
- **Required**: Yes
- **Type**: JWT Bearer Token
- **Role**: `ACADEMIC_STAFF`

### Headers
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | ID của lớp học cần cập nhật |

### Request Body

Tất cả các trường đều **optional**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `className` | string | No | Tên lớp học (1-255 ký tự) |
| `majorId` | number | No | ID chuyên ngành mới |
| `academicYear` | string | No | Khóa học (tối đa 10 ký tự) |
| `studentCount` | number | No | Số lượng sinh viên |
| `advisorId` | number | No | ID giảng viên cố vấn học tập (có thể null để xóa cố vấn) |
| `status` | boolean | No | Trạng thái hoạt động (true/false) |

### Request Example

```json
{
  "className": "Công nghệ thông tin K19 - Lớp A (Cập nhật)",
  "academicYear": "K19",
  "studentCount": 50,
  "advisorId": 2,
  "status": true
}
```

### Response Format

#### Success Response (200 OK)

```json
{
  "message": "Cập nhật thông tin lớp học thành công",
  "class": {
    "id": 1,
    "classCode": "CNTT19A",
    "className": "Công nghệ thông tin K19 - Lớp A (Cập nhật)",
    "majorId": 1,
    "academicYear": "K19",
    "studentCount": 50,
    "advisorId": 2,
    "status": true,
    "updatedAt": "2024-01-20T14:20:00.000Z"
  }
}
```

#### Error Responses

**400 Bad Request** - Dữ liệu không hợp lệ
```json
{
  "statusCode": 400,
  "message": [
    "className must be a string",
    "studentCount must be a number"
  ]
}
```

**404 Not Found** - Lớp học, chuyên ngành hoặc giảng viên cố vấn không tồn tại
```json
{
  "statusCode": 404,
  "message": "Không tìm thấy lớp học"
}
```

```json
{
  "statusCode": 404,
  "message": "Không tìm thấy chuyên ngành"
}
```

```json
{
  "statusCode": 404,
  "message": "Không tìm thấy giảng viên cố vấn"
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

---

## 11. Xóa lớp học

### Endpoint
```
DELETE /academic-staff/classes/:id
```

### Mô tả
Xóa lớp học khỏi hệ thống. Không thể xóa lớp học nếu đang có sinh viên.

### Authentication
- **Required**: Yes
- **Type**: JWT Bearer Token
- **Role**: `ACADEMIC_STAFF`

### Headers
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | ID của lớp học cần xóa |

### Request Example

```bash
DELETE /academic-staff/classes/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response Format

#### Success Response (200 OK)

```json
{
  "message": "Xóa lớp học thành công"
}
```

#### Error Responses

**400 Bad Request** - Không thể xóa do ràng buộc
```json
{
  "statusCode": 400,
  "message": "Không thể xóa lớp học đang có sinh viên"
}
```

**404 Not Found** - Lớp học không tồn tại
```json
{
  "statusCode": 404,
  "message": "Không tìm thấy lớp học"
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

---

## 12. Lấy lớp học theo chuyên ngành

### Endpoint
```
GET /academic-staff/majors/:majorId/classes
```

### Mô tả
Lấy danh sách tất cả lớp học thuộc một chuyên ngành cụ thể.

### Authentication
- **Required**: Yes
- **Type**: JWT Bearer Token
- **Role**: `ACADEMIC_STAFF`

### Headers
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `majorId` | number | Yes | ID của chuyên ngành |

### Request Example

```bash
GET /academic-staff/majors/1/classes
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response Format

#### Success Response (200 OK)

```json
{
  "message": "Lấy danh sách lớp học theo chuyên ngành thành công",
  "classes": [
    {
      "id": 1,
      "classCode": "CNTT19A",
      "className": "Công nghệ thông tin K19 - Lớp A",
      "academicYear": "K19",
      "studentCount": 45,
      "advisor": {
        "id": 1,
        "instructorCode": "GV001",
        "user": {
          "id": 1,
          "fullName": "Nguyễn Văn A",
          "email": "nguyenvana@example.com"
        }
      },
      "status": true
    },
    {
      "id": 2,
      "classCode": "CNTT19B",
      "className": "Công nghệ thông tin K19 - Lớp B",
      "academicYear": "K19",
      "studentCount": 42,
      "advisor": {
        "id": 2,
        "instructorCode": "GV002",
        "user": {
          "id": 2,
          "fullName": "Trần Thị B",
          "email": "tranthib@example.com"
        }
      },
      "status": true
    }
  ]
}
```

#### Error Responses

**404 Not Found** - Chuyên ngành không tồn tại
```json
{
  "statusCode": 404,
  "message": "Không tìm thấy chuyên ngành"
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

---

## Frontend Integration - Quản Lý Lớp Học

### TypeScript Interfaces

```typescript
// Request Interfaces
interface CreateClassRequest {
  classCode: string;
  className: string;
  majorId: number;
  academicYear?: string;
  studentCount?: number;
  advisorId?: number;
  status?: boolean;
}

interface UpdateClassRequest {
  className?: string;
  majorId?: number;
  academicYear?: string;
  studentCount?: number;
  advisorId?: number | null;
  status?: boolean;
}

interface GetClassesQuery {
  page?: number;
  limit?: number;
  majorId?: number;
  departmentId?: number;
  facultyId?: number;
  search?: string;
  academicYear?: string;
  advisorId?: number;
  status?: boolean;
  sortBy?: 'classCode' | 'className' | 'createdAt' | 'studentCount';
  sortOrder?: 'ASC' | 'DESC';
}

// Response Interfaces
interface Class {
  id: number;
  classCode: string;
  className: string;
  major: {
    id: number;
    majorCode: string;
    majorName: string;
    department: {
      id: number;
      departmentCode: string;
      departmentName: string;
      faculty?: {
        id: number;
        facultyCode: string;
        facultyName: string;
      };
    };
  };
  academicYear?: string;
  studentCount: number;
  advisor?: {
    id: number;
    instructorCode: string;
    user: {
      id: number;
      fullName: string;
      email: string;
      phone?: string;
    };
  };
  status: boolean;
  students?: Array<{
    id: number;
    studentCode: string;
    user: {
      id: number;
      fullName: string;
      email: string;
    };
    gpa?: number;
    academicStatus: string;
  }>;
  createdAt: string;
  updatedAt?: string;
}

interface GetClassesResponse {
  message: string;
  data: Class[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface ClassDetailResponse {
  message: string;
  class: Class;
}

interface CreateClassResponse {
  message: string;
  class: {
    id: number;
    classCode: string;
    className: string;
    majorId: number;
    academicYear?: string;
    studentCount: number;
    advisorId?: number;
    status: boolean;
  };
}

interface UpdateClassResponse {
  message: string;
  class: {
    id: number;
    classCode: string;
    className: string;
    majorId: number;
    academicYear?: string;
    studentCount: number;
    advisorId?: number;
    status: boolean;
    updatedAt: string;
  };
}

interface DeleteClassResponse {
  message: string;
}
```

### API Call Functions

```typescript
// 1. Tạo lớp học
async function createClass(
  data: CreateClassRequest
): Promise<CreateClassResponse> {
  const response = await fetch('/academic-staff/classes', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create class');
  }

  return response.json();
}

// 2. Lấy danh sách lớp học
async function getClasses(
  query?: GetClassesQuery
): Promise<GetClassesResponse> {
  const queryString = query ? `?${buildQueryString(query)}` : '';
  const response = await fetch(`/academic-staff/classes${queryString}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch classes');
  }

  return response.json();
}

// 3. Lấy chi tiết lớp học
async function getClassById(
  id: number
): Promise<ClassDetailResponse> {
  const response = await fetch(`/academic-staff/classes/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch class');
  }

  return response.json();
}

// 4. Cập nhật lớp học
async function updateClass(
  id: number,
  data: UpdateClassRequest
): Promise<UpdateClassResponse> {
  const response = await fetch(`/academic-staff/classes/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update class');
  }

  return response.json();
}

// 5. Xóa lớp học
async function deleteClass(
  id: number
): Promise<DeleteClassResponse> {
  const response = await fetch(`/academic-staff/classes/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete class');
  }

  return response.json();
}

// 6. Lấy lớp học theo chuyên ngành
async function getClassesByMajor(
  majorId: number
): Promise<{ message: string; classes: Class[] }> {
  const response = await fetch(
    `/academic-staff/majors/${majorId}/classes`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch classes');
  }

  return response.json();
}
```

### Usage Examples

```typescript
// Ví dụ 1: Tạo lớp học mới
try {
  const result = await createClass({
    classCode: 'CNTT19A',
    className: 'Công nghệ thông tin K19 - Lớp A',
    majorId: 1,
    academicYear: 'K19',
    advisorId: 1
  });
  
  console.log('Success:', result.message);
  console.log('Created class ID:', result.class.id);
  showNotification(result.message, 'success');
} catch (error) {
  console.error('Error:', error);
  showNotification(error.message, 'error');
}

// Ví dụ 2: Lấy danh sách với filters và pagination
try {
  const result = await getClasses({
    page: 1,
    limit: 20,
    majorId: 1,
    search: 'CNTT',
    status: true,
    sortBy: 'className',
    sortOrder: 'ASC'
  });
  
  console.log('Total:', result.pagination.total);
  console.log('Classes:', result.data);
  
  // Hiển thị danh sách
  displayClassesList(result.data);
  displayPagination(result.pagination);
} catch (error) {
  console.error('Error:', error);
  showNotification('Không thể tải danh sách lớp học', 'error');
}

// Ví dụ 3: Cập nhật lớp học
try {
  const result = await updateClass(1, {
    className: 'Công nghệ thông tin K19 - Lớp A (Cập nhật)',
    studentCount: 50,
    advisorId: 2,
    status: true
  });
  
  console.log('Success:', result.message);
  showNotification(result.message, 'success');
  
  // Refresh danh sách
  await refreshClassesList();
} catch (error) {
  console.error('Error:', error);
  showNotification(error.message, 'error');
}

// Ví dụ 4: Xóa lớp học
try {
  const confirmed = await confirmDialog(
    'Bạn có chắc chắn muốn xóa lớp học này?'
  );
  
  if (confirmed) {
    const result = await deleteClass(1);
    console.log('Success:', result.message);
    showNotification(result.message, 'success');
    
    // Refresh danh sách
    await refreshClassesList();
  }
} catch (error) {
  console.error('Error:', error);
  showNotification(error.message, 'error');
}
```

### React Hook Example

```typescript
import { useState, useEffect } from 'react';

interface UseClassesOptions {
  page?: number;
  limit?: number;
  majorId?: number;
  departmentId?: number;
  facultyId?: number;
  search?: string;
  academicYear?: string;
  status?: boolean;
}

export function useClasses(options: UseClassesOptions = {}) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClasses = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getClasses(options);
      setClasses(result.data);
      setPagination(result.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [JSON.stringify(options)]);

  return {
    classes,
    pagination,
    loading,
    error,
    refetch: fetchClasses
  };
}

// Usage trong component
function ClassesList() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    majorId: undefined as number | undefined
  });

  const { classes, pagination, loading, error, refetch } = useClasses(filters);

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;

  return (
    <div>
      <input
        type="text"
        placeholder="Tìm kiếm..."
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
      />
      
      <table>
        <thead>
          <tr>
            <th>Mã lớp</th>
            <th>Tên lớp</th>
            <th>Chuyên ngành</th>
            <th>Khóa học</th>
            <th>Số SV</th>
            <th>Cố vấn</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {classes.map((classItem) => (
            <tr key={classItem.id}>
              <td>{classItem.classCode}</td>
              <td>{classItem.className}</td>
              <td>{classItem.major.majorName}</td>
              <td>{classItem.academicYear || '-'}</td>
              <td>{classItem.studentCount}</td>
              <td>{classItem.advisor?.user.fullName || '-'}</td>
              <td>
                <button onClick={() => handleEdit(classItem.id)}>Sửa</button>
                <button onClick={() => handleDelete(classItem.id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <Pagination
        current={pagination.page}
        total={pagination.totalPages}
        onChange={(page) => setFilters({ ...filters, page })}
      />
    </div>
  );
}
```

---

## 13. Tạo thông tin học sinh

### Endpoint
```
POST /academic-staff/students
```

### Mô tả
Tạo thông tin học sinh mới trong hệ thống. Giáo vụ có thể tạo thông tin học sinh cho người dùng đã có tài khoản.

### Authentication
- **Required**: Yes
- **Type**: JWT Bearer Token
- **Role**: `ACADEMIC_STAFF`

### Headers
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | number | Yes | ID người dùng (phải tồn tại trong hệ thống) |
| `studentCode` | string | Yes | Mã học sinh (2-20 ký tự, unique) |
| `classId` | number | Yes | ID lớp học |
| `admissionYear` | number | No | Năm nhập học |
| `cvFile` | string | No | Đường dẫn file CV |

### Request Example

```json
{
  "userId": 1,
  "studentCode": "SV001",
  "classId": 1,
  "admissionYear": 2020
}
```

### Response Format

#### Success Response (201 Created)

```json
{
  "message": "Tạo thông tin học sinh thành công",
  "student": {
    "id": 1,
    "userId": 1,
    "studentCode": "SV001",
    "classId": 1,
    "admissionYear": 2020,
    "academicStatus": "Active",
    "status": true
  }
}
```

#### Error Responses

**400 Bad Request** - Dữ liệu không hợp lệ
```json
{
  "statusCode": 400,
  "message": [
    "studentCode should not be empty",
    "userId must be a number"
  ]
}
```

**404 Not Found** - Người dùng hoặc lớp học không tồn tại
```json
{
  "statusCode": 404,
  "message": "Không tìm thấy người dùng"
}
```

```json
{
  "statusCode": 404,
  "message": "Không tìm thấy lớp học"
}
```

**409 Conflict** - Mã học sinh đã tồn tại hoặc người dùng đã có thông tin học sinh
```json
{
  "statusCode": 409,
  "message": "Mã sinh viên đã tồn tại"
}
```

```json
{
  "statusCode": 409,
  "message": "Người dùng đã có thông tin sinh viên"
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

---

## 14. Lấy danh sách học sinh

### Endpoint
```
GET /academic-staff/students
```

### Mô tả
Lấy danh sách tất cả học sinh trong hệ thống với khả năng tìm kiếm, lọc và phân trang.

### Authentication
- **Required**: Yes
- **Type**: JWT Bearer Token
- **Role**: `ACADEMIC_STAFF`

### Headers
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Số trang (mặc định: 1, tối thiểu: 1) |
| `limit` | number | No | Số lượng mỗi trang (mặc định: 10, tối đa: 100) |
| `classId` | number | No | Lọc theo ID lớp học |
| `majorId` | number | No | Lọc theo ID chuyên ngành |
| `departmentId` | number | No | Lọc theo ID bộ môn |
| `facultyId` | number | No | Lọc theo ID khoa |
| `search` | string | No | Tìm kiếm theo mã học sinh, tên, email |
| `academicStatus` | string | No | Lọc theo trạng thái học tập (Active, On Leave, Withdrawn) |
| `admissionYear` | number | No | Lọc theo năm nhập học |
| `status` | boolean | No | Lọc theo trạng thái (true/false) |
| `sortBy` | string | No | Sắp xếp theo: `studentCode`, `fullName`, `createdAt`, `gpa`, `admissionYear` (mặc định: `studentCode`) |
| `sortOrder` | string | No | Thứ tự sắp xếp: `ASC` hoặc `DESC` (mặc định: `ASC`) |

### Request Example

```bash
# Lấy tất cả học sinh
GET /academic-staff/students
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Lấy với phân trang
GET /academic-staff/students?page=1&limit=20
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Tìm kiếm và lọc
GET /academic-staff/students?search=SV&classId=1&status=true&page=1&limit=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Lọc theo khoa và trạng thái học tập
GET /academic-staff/students?facultyId=1&academicStatus=Active&sortBy=fullName&sortOrder=ASC
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response Format

#### Success Response (200 OK)

**Khi có query params (filters, pagination):**
```json
{
  "message": "Lấy danh sách học sinh thành công",
  "data": [
    {
      "id": 1,
      "userId": 1,
      "studentCode": "SV001",
      "user": {
        "id": 1,
        "username": "tranvanb",
        "email": "tranvanb@example.com",
        "fullName": "Trần Văn B",
        "phone": "0912345678",
        "gender": "Male",
        "dateOfBirth": "2002-05-15",
        "avatar": "/uploads/avatar/sv001.jpg"
      },
      "class": {
        "id": 1,
        "classCode": "CNTT19A",
        "className": "Công nghệ thông tin K19 - Lớp A",
        "major": {
          "id": 1,
          "majorCode": "CNTT",
          "majorName": "Công nghệ thông tin",
          "department": {
            "id": 1,
            "departmentCode": "CNTT",
            "departmentName": "Công nghệ thông tin",
            "faculty": {
              "id": 1,
              "facultyCode": "KHCN",
              "facultyName": "Khoa Khoa học và Công nghệ"
            }
          }
        }
      },
      "admissionYear": 2020,
      "gpa": 3.5,
      "creditsEarned": 120,
      "academicStatus": "Active",
      "cvFile": "/uploads/cv/sv001.pdf",
      "status": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

**Khi không có query params (lấy tất cả):**
```json
{
  "message": "Lấy danh sách học sinh thành công",
  "data": [
    {
      "id": 1,
      "userId": 1,
      "studentCode": "SV001",
      "user": {
        "id": 1,
        "username": "tranvanb",
        "email": "tranvanb@example.com",
        "fullName": "Trần Văn B",
        "phone": "0912345678",
        "gender": "Male",
        "dateOfBirth": "2002-05-15",
        "avatar": "/uploads/avatar/sv001.jpg"
      },
      "class": {
        "id": 1,
        "classCode": "CNTT19A",
        "className": "Công nghệ thông tin K19 - Lớp A",
        "major": {
          "id": 1,
          "majorCode": "CNTT",
          "majorName": "Công nghệ thông tin",
          "department": {
            "id": 1,
            "departmentCode": "CNTT",
            "departmentName": "Công nghệ thông tin",
            "faculty": {
              "id": 1,
              "facultyCode": "KHCN",
              "facultyName": "Khoa Khoa học và Công nghệ"
            }
          }
        }
      },
      "admissionYear": 2020,
      "gpa": 3.5,
      "creditsEarned": 120,
      "academicStatus": "Active",
      "cvFile": "/uploads/cv/sv001.pdf",
      "status": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 100,
    "totalPages": 1
  }
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

**403 Forbidden** - Không có quyền truy cập
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

---

## 15. Lấy chi tiết học sinh

### Endpoint
```
GET /academic-staff/students/:id
```

### Mô tả
Lấy thông tin chi tiết của một học sinh theo ID.

### Authentication
- **Required**: Yes
- **Type**: JWT Bearer Token
- **Role**: `ACADEMIC_STAFF`

### Headers
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | ID của học sinh |

### Request Example

```bash
GET /academic-staff/students/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response Format

#### Success Response (200 OK)

```json
{
  "message": "Lấy thông tin học sinh thành công",
  "student": {
    "id": 1,
    "userId": 1,
    "studentCode": "SV001",
    "user": {
      "id": 1,
      "username": "tranvanb",
      "email": "tranvanb@example.com",
      "fullName": "Trần Văn B",
      "phone": "0912345678",
      "gender": "Male",
      "dateOfBirth": "2002-05-15",
      "address": "123 Đường ABC, Quận XYZ",
      "avatar": "/uploads/avatar/sv001.jpg",
      "status": true
    },
    "class": {
      "id": 1,
      "classCode": "CNTT19A",
      "className": "Công nghệ thông tin K19 - Lớp A",
      "major": {
        "id": 1,
        "majorCode": "CNTT",
        "majorName": "Công nghệ thông tin",
        "department": {
          "id": 1,
          "departmentCode": "CNTT",
          "departmentName": "Công nghệ thông tin"
        }
      }
    },
    "admissionYear": 2020,
    "gpa": 3.5,
    "creditsEarned": 120,
    "academicStatus": "Active",
    "cvFile": "/uploads/cv/sv001.pdf",
    "status": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-20T14:20:00.000Z"
  }
}
```

#### Error Responses

**404 Not Found** - Học sinh không tồn tại
```json
{
  "statusCode": 404,
  "message": "Không tìm thấy sinh viên"
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

---

## 16. Cập nhật thông tin học sinh

### Endpoint
```
PUT /academic-staff/students/:id
```

### Mô tả
Cập nhật thông tin của một học sinh. Tất cả các trường đều optional, chỉ cập nhật các trường được gửi.

### Authentication
- **Required**: Yes
- **Type**: JWT Bearer Token
- **Role**: `ACADEMIC_STAFF`

### Headers
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | ID của học sinh cần cập nhật |

### Request Body

Tất cả các trường đều **optional**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `classId` | number | No | ID lớp học mới |
| `admissionYear` | number | No | Năm nhập học |
| `gpa` | number | No | Điểm trung bình (0-4) |
| `creditsEarned` | number | No | Số tín chỉ đã tích lũy |
| `academicStatus` | string | No | Trạng thái học tập (Active, On Leave, Withdrawn) |
| `cvFile` | string | No | Đường dẫn file CV |
| `status` | boolean | No | Trạng thái hoạt động (true/false) |

### Request Example

```json
{
  "gpa": 3.7,
  "creditsEarned": 130,
  "academicStatus": "Active",
  "status": true
}
```

### Response Format

#### Success Response (200 OK)

```json
{
  "message": "Cập nhật thông tin học sinh thành công",
  "student": {
    "id": 1,
    "userId": 1,
    "studentCode": "SV001",
    "classId": 1,
    "admissionYear": 2020,
    "gpa": 3.7,
    "creditsEarned": 130,
    "academicStatus": "Active",
    "cvFile": "/uploads/cv/sv001.pdf",
    "status": true,
    "updatedAt": "2024-01-20T14:20:00.000Z"
  }
}
```

#### Error Responses

**400 Bad Request** - Dữ liệu không hợp lệ
```json
{
  "statusCode": 400,
  "message": [
    "gpa must be a number",
    "creditsEarned must be a number"
  ]
}
```

**404 Not Found** - Học sinh hoặc lớp học không tồn tại
```json
{
  "statusCode": 404,
  "message": "Không tìm thấy sinh viên"
}
```

```json
{
  "statusCode": 404,
  "message": "Không tìm thấy lớp học"
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

---

## 17. Xóa học sinh

### Endpoint
```
DELETE /academic-staff/students/:id
```

### Mô tả
Xóa thông tin học sinh khỏi hệ thống. Không thể xóa học sinh nếu:
- Đang có đề tài đăng ký
- Đang có đề tài đang làm

### Authentication
- **Required**: Yes
- **Type**: JWT Bearer Token
- **Role**: `ACADEMIC_STAFF`

### Headers
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | ID của học sinh cần xóa |

### Request Example

```bash
DELETE /academic-staff/students/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response Format

#### Success Response (200 OK)

```json
{
  "message": "Xóa học sinh thành công"
}
```

#### Error Responses

**400 Bad Request** - Không thể xóa do ràng buộc
```json
{
  "statusCode": 400,
  "message": "Không thể xóa sinh viên đang có đề tài đăng ký"
}
```

```json
{
  "statusCode": 400,
  "message": "Không thể xóa sinh viên đang có đề tài"
}
```

**404 Not Found** - Học sinh không tồn tại
```json
{
  "statusCode": 404,
  "message": "Không tìm thấy sinh viên"
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

---

## 18. Lấy học sinh theo lớp

### Endpoint
```
GET /academic-staff/classes/:classId/students
```

### Mô tả
Lấy danh sách tất cả học sinh thuộc một lớp học cụ thể.

### Authentication
- **Required**: Yes
- **Type**: JWT Bearer Token
- **Role**: `ACADEMIC_STAFF`

### Headers
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `classId` | number | Yes | ID của lớp học |

### Request Example

```bash
GET /academic-staff/classes/1/students
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response Format

#### Success Response (200 OK)

```json
{
  "message": "Lấy danh sách học sinh theo lớp thành công",
  "students": [
    {
      "id": 1,
      "studentCode": "SV001",
      "user": {
        "id": 1,
        "fullName": "Trần Văn B",
        "email": "tranvanb@example.com",
        "phone": "0912345678"
      },
      "admissionYear": 2020,
      "gpa": 3.5,
      "creditsEarned": 120,
      "academicStatus": "Active",
      "status": true
    },
    {
      "id": 2,
      "studentCode": "SV002",
      "user": {
        "id": 2,
        "fullName": "Nguyễn Thị C",
        "email": "nguyenthic@example.com",
        "phone": "0912345679"
      },
      "admissionYear": 2020,
      "gpa": 3.8,
      "creditsEarned": 125,
      "academicStatus": "Active",
      "status": true
    }
  ]
}
```

#### Error Responses

**404 Not Found** - Lớp học không tồn tại
```json
{
  "statusCode": 404,
  "message": "Không tìm thấy lớp học"
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

---

## Frontend Integration - Quản Lý Học Sinh

### TypeScript Interfaces

```typescript
// Request Interfaces
interface CreateStudentRequest {
  userId: number;
  studentCode: string;
  classId: number;
  admissionYear?: number;
  cvFile?: string;
}

interface UpdateStudentRequest {
  classId?: number;
  admissionYear?: number;
  gpa?: number;
  creditsEarned?: number;
  academicStatus?: string;
  cvFile?: string;
  status?: boolean;
}

interface GetStudentsQuery {
  page?: number;
  limit?: number;
  classId?: number;
  majorId?: number;
  departmentId?: number;
  facultyId?: number;
  search?: string;
  academicStatus?: string;
  admissionYear?: number;
  status?: boolean;
  sortBy?: 'studentCode' | 'fullName' | 'createdAt' | 'gpa' | 'admissionYear';
  sortOrder?: 'ASC' | 'DESC';
}

// Response Interfaces
interface Student {
  id: number;
  userId: number;
  studentCode: string;
  user: {
    id: number;
    username: string;
    email: string;
    fullName: string;
    phone?: string;
    gender?: string;
    dateOfBirth?: string;
    address?: string;
    avatar?: string;
    status: boolean;
  };
  class: {
    id: number;
    classCode: string;
    className: string;
    major: {
      id: number;
      majorCode: string;
      majorName: string;
      department: {
        id: number;
        departmentCode: string;
        departmentName: string;
        faculty?: {
          id: number;
          facultyCode: string;
          facultyName: string;
        };
      };
    };
  };
  admissionYear?: number;
  gpa?: number;
  creditsEarned: number;
  academicStatus: string;
  cvFile?: string;
  status: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface GetStudentsResponse {
  message: string;
  data: Student[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface StudentDetailResponse {
  message: string;
  student: Student;
}

interface CreateStudentResponse {
  message: string;
  student: {
    id: number;
    userId: number;
    studentCode: string;
    classId: number;
    admissionYear?: number;
    academicStatus: string;
    status: boolean;
  };
}

interface UpdateStudentResponse {
  message: string;
  student: {
    id: number;
    userId: number;
    studentCode: string;
    classId: number;
    admissionYear?: number;
    gpa?: number;
    creditsEarned: number;
    academicStatus: string;
    cvFile?: string;
    status: boolean;
    updatedAt: string;
  };
}

interface DeleteStudentResponse {
  message: string;
}
```

### API Call Functions

```typescript
// 1. Tạo học sinh
async function createStudent(
  data: CreateStudentRequest
): Promise<CreateStudentResponse> {
  const response = await fetch('/academic-staff/students', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create student');
  }

  return response.json();
}

// 2. Lấy danh sách học sinh
async function getStudents(
  query?: GetStudentsQuery
): Promise<GetStudentsResponse> {
  const queryString = query ? `?${buildQueryString(query)}` : '';
  const response = await fetch(`/academic-staff/students${queryString}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch students');
  }

  return response.json();
}

// 3. Lấy chi tiết học sinh
async function getStudentById(
  id: number
): Promise<StudentDetailResponse> {
  const response = await fetch(`/academic-staff/students/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch student');
  }

  return response.json();
}

// 4. Cập nhật học sinh
async function updateStudent(
  id: number,
  data: UpdateStudentRequest
): Promise<UpdateStudentResponse> {
  const response = await fetch(`/academic-staff/students/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update student');
  }

  return response.json();
}

// 5. Xóa học sinh
async function deleteStudent(
  id: number
): Promise<DeleteStudentResponse> {
  const response = await fetch(`/academic-staff/students/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete student');
  }

  return response.json();
}

// 6. Lấy học sinh theo lớp
async function getStudentsByClass(
  classId: number
): Promise<{ message: string; students: Student[] }> {
  const response = await fetch(
    `/academic-staff/classes/${classId}/students`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch students');
  }

  return response.json();
}
```

### Usage Examples

```typescript
// Ví dụ 1: Tạo học sinh mới
try {
  const result = await createStudent({
    userId: 1,
    studentCode: 'SV001',
    classId: 1,
    admissionYear: 2020
  });
  
  console.log('Success:', result.message);
  console.log('Created student ID:', result.student.id);
  showNotification(result.message, 'success');
} catch (error) {
  console.error('Error:', error);
  showNotification(error.message, 'error');
}

// Ví dụ 2: Lấy danh sách với filters và pagination
try {
  const result = await getStudents({
    page: 1,
    limit: 20,
    classId: 1,
    search: 'SV',
    status: true,
    sortBy: 'fullName',
    sortOrder: 'ASC'
  });
  
  console.log('Total:', result.pagination.total);
  console.log('Students:', result.data);
  
  // Hiển thị danh sách
  displayStudentsList(result.data);
  displayPagination(result.pagination);
} catch (error) {
  console.error('Error:', error);
  showNotification('Không thể tải danh sách học sinh', 'error');
}

// Ví dụ 3: Cập nhật học sinh
try {
  const result = await updateStudent(1, {
    gpa: 3.7,
    creditsEarned: 130,
    academicStatus: 'Active',
    status: true
  });
  
  console.log('Success:', result.message);
  showNotification(result.message, 'success');
  
  // Refresh danh sách
  await refreshStudentsList();
} catch (error) {
  console.error('Error:', error);
  showNotification(error.message, 'error');
}

// Ví dụ 4: Xóa học sinh
try {
  const confirmed = await confirmDialog(
    'Bạn có chắc chắn muốn xóa học sinh này?'
  );
  
  if (confirmed) {
    const result = await deleteStudent(1);
    console.log('Success:', result.message);
    showNotification(result.message, 'success');
    
    // Refresh danh sách
    await refreshStudentsList();
  }
} catch (error) {
  console.error('Error:', error);
  showNotification(error.message, 'error');
}
```

### React Hook Example

```typescript
import { useState, useEffect } from 'react';

interface UseStudentsOptions {
  page?: number;
  limit?: number;
  classId?: number;
  majorId?: number;
  departmentId?: number;
  facultyId?: number;
  search?: string;
  academicStatus?: string;
  admissionYear?: number;
  status?: boolean;
}

export function useStudents(options: UseStudentsOptions = {}) {
  const [students, setStudents] = useState<Student[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getStudents(options);
      setStudents(result.data);
      setPagination(result.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [JSON.stringify(options)]);

  return {
    students,
    pagination,
    loading,
    error,
    refetch: fetchStudents
  };
}

// Usage trong component
function StudentsList() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    classId: undefined as number | undefined
  });

  const { students, pagination, loading, error, refetch } = useStudents(filters);

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;

  return (
    <div>
      <input
        type="text"
        placeholder="Tìm kiếm..."
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
      />
      
      <table>
        <thead>
          <tr>
            <th>Mã SV</th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Lớp</th>
            <th>GPA</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>{student.studentCode}</td>
              <td>{student.user.fullName}</td>
              <td>{student.user.email}</td>
              <td>{student.class.className}</td>
              <td>{student.gpa || '-'}</td>
              <td>{student.academicStatus}</td>
              <td>
                <button onClick={() => handleEdit(student.id)}>Sửa</button>
                <button onClick={() => handleDelete(student.id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <Pagination
        current={pagination.page}
        total={pagination.totalPages}
        onChange={(page) => setFilters({ ...filters, page })}
      />
    </div>
  );
}
```

---

## Tổng kết

### Các API endpoints cho Giáo Vụ:

#### Quản lý Giảng viên:
1. **POST** `/academic-staff/instructors` - Tạo thông tin giảng viên
2. **GET** `/academic-staff/instructors` - Lấy danh sách giảng viên (có filters, search, pagination)
3. **GET** `/academic-staff/instructors/:id` - Lấy chi tiết giảng viên
4. **PUT** `/academic-staff/instructors/:id` - Cập nhật thông tin giảng viên
5. **DELETE** `/academic-staff/instructors/:id` - Xóa giảng viên
6. **GET** `/academic-staff/departments/:departmentId/instructors` - Lấy giảng viên theo bộ môn

#### Quản lý Lớp học:
7. **POST** `/academic-staff/classes` - Tạo lớp học mới
8. **GET** `/academic-staff/classes` - Lấy danh sách lớp học (có filters, search, pagination)
9. **GET** `/academic-staff/classes/:id` - Lấy chi tiết lớp học
10. **PUT** `/academic-staff/classes/:id` - Cập nhật thông tin lớp học
11. **DELETE** `/academic-staff/classes/:id` - Xóa lớp học
12. **GET** `/academic-staff/majors/:majorId/classes` - Lấy lớp học theo chuyên ngành

#### Quản lý Học sinh:
13. **POST** `/academic-staff/students` - Tạo thông tin học sinh
14. **GET** `/academic-staff/students` - Lấy danh sách học sinh (có filters, search, pagination)
15. **GET** `/academic-staff/students/:id` - Lấy chi tiết học sinh
16. **PUT** `/academic-staff/students/:id` - Cập nhật thông tin học sinh
17. **DELETE** `/academic-staff/students/:id` - Xóa học sinh
18. **GET** `/academic-staff/classes/:classId/students` - Lấy học sinh theo lớp

### Lưu ý chung:

- Tất cả các API đều yêu cầu **JWT Authentication**
- Tất cả các API đều yêu cầu **Role: ACADEMIC_STAFF**
- Tất cả các API đều trả về format chuẩn với `message`
- Các lỗi được trả về với HTTP status code phù hợp và message rõ ràng
- Khi xóa giảng viên, hệ thống sẽ kiểm tra ràng buộc trước khi cho phép xóa
- Khi xóa lớp học, hệ thống sẽ kiểm tra ràng buộc (không cho xóa lớp có sinh viên)
- Khi xóa học sinh, hệ thống sẽ kiểm tra ràng buộc (không cho xóa học sinh có đề tài đăng ký hoặc đang làm)

### Error Handling

Tất cả các API đều có thể trả về các lỗi sau:

- **401 Unauthorized**: Chưa đăng nhập hoặc token không hợp lệ
- **403 Forbidden**: Không có quyền truy cập (không phải giáo vụ)
- **404 Not Found**: Tài nguyên không tồn tại
- **400 Bad Request**: Dữ liệu không hợp lệ hoặc vi phạm ràng buộc
- **409 Conflict**: Xung đột dữ liệu (ví dụ: mã giảng viên đã tồn tại)
- **500 Internal Server Error**: Lỗi server

### Best Practices

1. **Luôn kiểm tra response status** trước khi xử lý dữ liệu
2. **Xử lý lỗi một cách graceful** và hiển thị thông báo rõ ràng cho người dùng
3. **Sử dụng TypeScript interfaces** để đảm bảo type safety
4. **Cache token** và tự động refresh khi hết hạn
5. **Hiển thị loading state** khi gọi API
6. **Validate dữ liệu** ở frontend trước khi gửi request
7. **Refresh danh sách** sau khi thực hiện các thao tác create/update/delete
8. **Xác nhận trước khi xóa** để tránh xóa nhầm

---

**Tài liệu này được cập nhật lần cuối:** 2024-01-20

**Phiên bản:** 3.0 (Đã thêm quản lý lớp học và học sinh)

