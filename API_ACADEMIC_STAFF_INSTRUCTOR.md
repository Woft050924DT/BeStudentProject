# API Quản Lý Giảng Viên - Actor Giáo Vụ (Academic Staff)

Tài liệu này mô tả các API endpoints dành cho **Actor: Giáo Vụ (ACADEMIC_STAFF)** trong việc quản lý giảng viên trong hệ thống quản lý đồ án tốt nghiệp.

## Mục lục
1. [Tạo thông tin giảng viên](#1-tạo-thông-tin-giảng-viên)
2. [Lấy danh sách giảng viên](#2-lấy-danh-sách-giảng-viên)
3. [Lấy chi tiết giảng viên](#3-lấy-chi-tiết-giảng-viên)
4. [Cập nhật thông tin giảng viên](#4-cập-nhật-thông-tin-giảng-viên)
5. [Xóa giảng viên](#5-xóa-giảng-viên)
6. [Lấy giảng viên theo bộ môn](#6-lấy-giảng-viên-theo-bộ-môn)

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

## Tổng kết

### Các API endpoints cho Giáo Vụ:

1. **POST** `/academic-staff/instructors` - Tạo thông tin giảng viên
2. **GET** `/academic-staff/instructors` - Lấy danh sách giảng viên (có filters, search, pagination)
3. **GET** `/academic-staff/instructors/:id` - Lấy chi tiết giảng viên
4. **PUT** `/academic-staff/instructors/:id` - Cập nhật thông tin giảng viên
5. **DELETE** `/academic-staff/instructors/:id` - Xóa giảng viên
6. **GET** `/academic-staff/departments/:departmentId/instructors` - Lấy giảng viên theo bộ môn

### Lưu ý chung:

- Tất cả các API đều yêu cầu **JWT Authentication**
- Tất cả các API đều yêu cầu **Role: ACADEMIC_STAFF**
- Tất cả các API đều trả về format chuẩn với `message`
- Các lỗi được trả về với HTTP status code phù hợp và message rõ ràng
- Khi xóa giảng viên, hệ thống sẽ kiểm tra ràng buộc trước khi cho phép xóa

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

