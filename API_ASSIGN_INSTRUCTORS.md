# API Phân Công Giáo Viên Hướng Dẫn - Actor Trưởng Bộ Môn

## Base URL
```
http://localhost:3000
```

---

## Mô Tả Task

### Yêu Cầu
Trưởng bộ môn cần có khả năng phân công các giáo viên trong bộ môn của mình làm giáo viên hướng dẫn cho các đợt luận văn. Hệ thống cần hỗ trợ:

1. **Xem danh sách giáo viên trong bộ môn**: Trưởng bộ môn có thể xem tất cả giáo viên thuộc bộ môn của mình, bao gồm thông tin cơ bản và số lượng sinh viên đang hướng dẫn.

2. **Phân công giáo viên vào đợt đề tài**: Trưởng bộ môn có thể thêm một hoặc nhiều giáo viên vào một đợt đề tài cụ thể, với khả năng thiết lập số lượng sinh viên tối đa mà mỗi giáo viên có thể hướng dẫn.

3. **Quản lý phân công**: Trưởng bộ môn có thể cập nhật, xóa hoặc vô hiệu hóa phân công giáo viên trong đợt đề tài.

4. **Xem thống kê phân công**: Trưởng bộ môn có thể xem tổng quan về việc phân công giáo viên trong các đợt đề tài.

### Quyền Truy Cập
- **Role**: `HEAD_OF_DEPARTMENT` (Trưởng bộ môn)
- **Phạm vi**: Chỉ có thể quản lý giáo viên trong bộ môn của mình

---

## 1. Lấy Danh Sách Giáo Viên Trong Bộ Môn

### Endpoint
```
GET /thesis/department/instructors
```

### Authentication
- **Required**: Yes
- **Type**: JWT Bearer Token
- **Role**: HEAD_OF_DEPARTMENT

### Headers
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Số trang (mặc định: 1) |
| `limit` | number | No | Số lượng mỗi trang (mặc định: 10) |
| `status` | boolean | No | Lọc theo trạng thái hoạt động (true/false) |
| `search` | string | No | Tìm kiếm theo tên hoặc mã giảng viên |

### Response Success (200 OK)
```json
{
  "success": true,
  "data": {
    "instructors": [
      {
        "id": 1,
        "instructorCode": "GV001",
        "fullName": "Nguyễn Văn A",
        "email": "nguyenvana@example.com",
        "phone": "0987654321",
        "degree": "Tiến Sĩ",
        "academicTitle": "Phó Giáo sư",
        "specialization": "Công nghệ thông tin",
        "yearsOfExperience": 10,
        "department": {
          "id": 1,
          "departmentCode": "CNTT",
          "departmentName": "Công nghệ thông tin"
        },
        "currentSupervisionCount": 3,
        "status": true
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "totalPages": 3
    }
  }
}
```

### Response Error (403 Forbidden)
```json
{
  "statusCode": 403,
  "message": "Bạn không có quyền truy cập tài nguyên này",
  "error": "Forbidden"
}
```

---

## 2. Lấy Danh Sách Giáo Viên Đã Được Phân Công Trong Đợt Đề Tài

### Endpoint
```
GET /thesis/thesis-rounds/:roundId/instructors
```

### Authentication
- **Required**: Yes
- **Type**: JWT Bearer Token
- **Role**: HEAD_OF_DEPARTMENT

### Headers
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `roundId` | number | Yes | ID của đợt đề tài |

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | boolean | No | Lọc theo trạng thái phân công (true/false) |

### Response Success (200 OK)
```json
{
  "success": true,
  "data": {
    "thesisRound": {
      "id": 1,
      "roundName": "Đợt 1 - Học kỳ 1 năm 2024",
      "departmentId": 1
    },
    "instructors": [
      {
        "id": 1,
        "instructorId": 5,
        "instructorCode": "GV001",
        "fullName": "Nguyễn Văn A",
        "email": "nguyenvana@example.com",
        "supervisionQuota": 5,
        "currentLoad": 3,
        "status": true,
        "notes": "Giảng viên có kinh nghiệm",
        "addedBy": 1,
        "addedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 1
  }
}
```

### Response Error (404 Not Found)
```json
{
  "statusCode": 404,
  "message": "Đợt luận văn không tồn tại",
  "error": "Not Found"
}
```

---

## 3. Phân Công Một Giáo Viên Vào Đợt Đề Tài

### Endpoint
```
POST /thesis/thesis-rounds/:roundId/instructors
```

### Authentication
- **Required**: Yes
- **Type**: JWT Bearer Token
- **Role**: HEAD_OF_DEPARTMENT

### Headers
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `roundId` | number | Yes | ID của đợt đề tài |

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `instructorId` | number | Yes | ID của giáo viên cần phân công |
| `maxStudents` | number | No | Số lượng sinh viên tối đa (mặc định: 5) |
| `notes` | string | No | Ghi chú về phân công |

### Request Example
```json
{
  "instructorId": 5,
  "maxStudents": 8,
  "notes": "Giảng viên có nhiều kinh nghiệm, có thể hướng dẫn nhiều sinh viên"
}
```

### Response Success (200 OK)
```json
{
  "success": true,
  "message": "Phân công giáo viên vào đợt đề tài thành công",
  "data": {
    "thesisRoundId": 1,
    "instructor": {
      "id": 5,
      "instructorCode": "GV001",
      "fullName": "Nguyễn Văn A",
      "email": "nguyenvana@example.com",
      "department": "Công nghệ thông tin"
    },
    "supervisionQuota": 8,
    "notes": "Giảng viên có nhiều kinh nghiệm, có thể hướng dẫn nhiều sinh viên"
  }
}
```

### Response Error

#### 400 Bad Request - Giáo viên không thuộc bộ môn
```json
{
  "statusCode": 400,
  "message": "Giảng viên không thuộc bộ môn của đợt đề tài này",
  "error": "Bad Request"
}
```

#### 409 Conflict - Giáo viên đã được phân công
```json
{
  "statusCode": 409,
  "message": "Giảng viên đã được thêm vào đợt này rồi",
  "error": "Conflict"
}
```

---

## 4. Phân Công Nhiều Giáo Viên Vào Đợt Đề Tài (Bulk)

### Endpoint
```
POST /thesis/thesis-rounds/:roundId/instructors/bulk
```

### Authentication
- **Required**: Yes
- **Type**: JWT Bearer Token
- **Role**: HEAD_OF_DEPARTMENT

### Headers
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `roundId` | number | Yes | ID của đợt đề tài |

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `instructors` | array | Yes | Danh sách giáo viên cần phân công |

Mỗi phần tử trong mảng `instructors` có cấu trúc:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `instructorId` | number | Yes | ID của giáo viên |
| `maxStudents` | number | No | Số lượng sinh viên tối đa (mặc định: 5) |
| `notes` | string | No | Ghi chú về phân công |

### Request Example
```json
{
  "instructors": [
    {
      "instructorId": 5,
      "maxStudents": 8,
      "notes": "Giảng viên có nhiều kinh nghiệm"
    },
    {
      "instructorId": 6,
      "maxStudents": 5,
      "notes": "Giảng viên mới"
    },
    {
      "instructorId": 7,
      "maxStudents": 6
    }
  ]
}
```

### Response Success (200 OK)
```json
{
  "success": true,
  "message": "Phân công giáo viên thành công",
  "data": {
    "successful": [
      {
        "instructorId": 5,
        "instructorCode": "GV001",
        "fullName": "Nguyễn Văn A",
        "supervisionQuota": 8
      },
      {
        "instructorId": 6,
        "instructorCode": "GV002",
        "fullName": "Trần Thị B",
        "supervisionQuota": 5
      }
    ],
    "failed": [
      {
        "instructorId": 7,
        "error": "Giảng viên đã được thêm vào đợt này rồi"
      }
    ],
    "summary": {
      "total": 3,
      "successful": 2,
      "failed": 1
    }
  }
}
```

### Response Error (400 Bad Request)
```json
{
  "statusCode": 400,
  "message": "Phải cung cấp danh sách giáo viên",
  "error": "Bad Request"
}
```

---

## 5. Cập Nhật Phân Công Giáo Viên Trong Đợt Đề Tài

### Endpoint
```
PUT /thesis/thesis-rounds/:roundId/instructors/:instructorId
```

### Authentication
- **Required**: Yes
- **Type**: JWT Bearer Token
- **Role**: HEAD_OF_DEPARTMENT

### Headers
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `roundId` | number | Yes | ID của đợt đề tài |
| `instructorId` | number | Yes | ID của giáo viên |

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `maxStudents` | number | No | Số lượng sinh viên tối đa mới |
| `status` | boolean | No | Trạng thái phân công (true/false) |
| `notes` | string | No | Ghi chú mới |

### Request Example
```json
{
  "maxStudents": 10,
  "status": true,
  "notes": "Tăng số lượng sinh viên do nhu cầu cao"
}
```

### Response Success (200 OK)
```json
{
  "success": true,
  "message": "Cập nhật phân công giáo viên thành công",
  "data": {
    "thesisRoundId": 1,
    "instructorId": 5,
    "supervisionQuota": 10,
    "status": true,
    "notes": "Tăng số lượng sinh viên do nhu cầu cao",
    "updatedAt": "2024-01-15T14:30:00Z"
  }
}
```

### Response Error (404 Not Found)
```json
{
  "statusCode": 404,
  "message": "Không tìm thấy phân công giáo viên trong đợt này",
  "error": "Not Found"
}
```

---

## 6. Xóa Phân Công Giáo Viên Khỏi Đợt Đề Tài

### Endpoint
```
PUT /thesis/thesis-rounds/:roundId/instructors/:instructorId/remove
```

### Authentication
- **Required**: Yes
- **Type**: JWT Bearer Token
- **Role**: HEAD_OF_DEPARTMENT

### Headers
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `roundId` | number | Yes | ID của đợt đề tài |
| `instructorId` | number | Yes | ID của giáo viên |

### Response Success (200 OK)
```json
{
  "success": true,
  "message": "Xóa phân công giáo viên khỏi đợt đề tài thành công",
  "data": {
    "thesisRoundId": 1,
    "instructorId": 5,
    "instructorCode": "GV001",
    "fullName": "Nguyễn Văn A"
  }
}
```

### Response Error (404 Not Found)
```json
{
  "statusCode": 404,
  "message": "Không tìm thấy phân công giáo viên trong đợt này",
  "error": "Not Found"
}
```

### Response Error (400 Bad Request)
```json
{
  "statusCode": 400,
  "message": "Không thể xóa giáo viên đang có sinh viên đăng ký",
  "error": "Bad Request"
}
```

---

## 7. Lấy Thống Kê Phân Công Giáo Viên

### Endpoint
```
GET /thesis/department/instructors/statistics
```

### Authentication
- **Required**: Yes
- **Type**: JWT Bearer Token
- **Role**: HEAD_OF_DEPARTMENT

### Headers
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `roundId` | number | No | Lọc theo đợt đề tài cụ thể |
| `departmentId` | number | No | Lọc theo bộ môn (mặc định: bộ môn của trưởng bộ môn) |

### Response Success (200 OK)
```json
{
  "success": true,
  "data": {
    "department": {
      "id": 1,
      "departmentCode": "CNTT",
      "departmentName": "Công nghệ thông tin"
    },
    "statistics": {
      "totalInstructors": 25,
      "activeInstructors": 20,
      "instructorsInRounds": 15,
      "totalSupervisionQuota": 120,
      "currentLoad": 85,
      "availableCapacity": 35,
      "averageLoadPerInstructor": 4.25
    },
    "roundStatistics": [
      {
        "roundId": 1,
        "roundName": "Đợt 1 - Học kỳ 1 năm 2024",
        "assignedInstructors": 10,
        "totalQuota": 50,
        "currentLoad": 35
      }
    ]
  }
}
```

---

## Frontend Integration

### TypeScript Interfaces

```typescript
// Request Interfaces
interface AssignInstructorDto {
  instructorId: number;
  maxStudents?: number;
  notes?: string;
}

interface AssignMultipleInstructorsDto {
  instructors: AssignInstructorDto[];
}

interface UpdateInstructorAssignmentDto {
  maxStudents?: number;
  status?: boolean;
  notes?: string;
}

// Response Interfaces
interface InstructorInfo {
  id: number;
  instructorCode: string;
  fullName: string;
  email: string;
  phone?: string;
  degree?: string;
  academicTitle?: string;
  specialization?: string;
  yearsOfExperience: number;
  department: {
    id: number;
    departmentCode: string;
    departmentName: string;
  };
  currentSupervisionCount: number;
  status: boolean;
}

interface InstructorAssignment {
  id: number;
  instructorId: number;
  instructorCode: string;
  fullName: string;
  email: string;
  supervisionQuota: number;
  currentLoad: number;
  status: boolean;
  notes?: string;
  addedBy?: number;
  addedAt: string;
}

interface DepartmentInstructorsResponse {
  success: boolean;
  data: {
    instructors: InstructorInfo[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

interface AssignInstructorResponse {
  success: boolean;
  message: string;
  data: {
    thesisRoundId: number;
    instructor: {
      id: number;
      instructorCode: string;
      fullName: string;
      email: string;
      department: string;
    };
    supervisionQuota: number;
    notes?: string;
  };
}

interface BulkAssignResponse {
  success: boolean;
  message: string;
  data: {
    successful: Array<{
      instructorId: number;
      instructorCode: string;
      fullName: string;
      supervisionQuota: number;
    }>;
    failed: Array<{
      instructorId: number;
      error: string;
    }>;
    summary: {
      total: number;
      successful: number;
      failed: number;
    };
  };
}
```

### API Call Functions

```typescript
// Lấy danh sách giáo viên trong bộ môn
async function getDepartmentInstructors(
  params?: {
    page?: number;
    limit?: number;
    status?: boolean;
    search?: string;
  }
): Promise<DepartmentInstructorsResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.status !== undefined) queryParams.append('status', params.status.toString());
  if (params?.search) queryParams.append('search', params.search);

  const response = await fetch(
    `/api/thesis/department/instructors?${queryParams.toString()}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch department instructors');
  }

  return response.json();
}

// Phân công một giáo viên
async function assignInstructorToRound(
  roundId: number,
  data: AssignInstructorDto
): Promise<AssignInstructorResponse> {
  const response = await fetch(`/api/thesis/thesis-rounds/${roundId}/instructors`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to assign instructor');
  }

  return response.json();
}

// Phân công nhiều giáo viên
async function assignMultipleInstructorsToRound(
  roundId: number,
  data: AssignMultipleInstructorsDto
): Promise<BulkAssignResponse> {
  const response = await fetch(`/api/thesis/thesis-rounds/${roundId}/instructors/bulk`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to assign instructors');
  }

  return response.json();
}

// Cập nhật phân công
async function updateInstructorAssignment(
  roundId: number,
  instructorId: number,
  data: UpdateInstructorAssignmentDto
): Promise<AssignInstructorResponse> {
  const response = await fetch(
    `/api/thesis/thesis-rounds/${roundId}/instructors/${instructorId}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update assignment');
  }

  return response.json();
}

// Xóa phân công
async function removeInstructorFromRound(
  roundId: number,
  instructorId: number
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(
    `/api/thesis/thesis-rounds/${roundId}/instructors/${instructorId}/remove`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to remove instructor');
  }

  return response.json();
}

// Lấy thống kê
async function getInstructorStatistics(
  roundId?: number
): Promise<{
  success: boolean;
  data: {
    department: {
      id: number;
      departmentCode: string;
      departmentName: string;
    };
    statistics: {
      totalInstructors: number;
      activeInstructors: number;
      instructorsInRounds: number;
      totalSupervisionQuota: number;
      currentLoad: number;
      availableCapacity: number;
      averageLoadPerInstructor: number;
    };
    roundStatistics: Array<{
      roundId: number;
      roundName: string;
      assignedInstructors: number;
      totalQuota: number;
      currentLoad: number;
    }>;
  };
}> {
  const queryParams = roundId ? `?roundId=${roundId}` : '';
  const response = await fetch(`/api/thesis/department/instructors/statistics${queryParams}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch statistics');
  }

  return response.json();
}
```

### Usage Example

```typescript
// Lấy danh sách giáo viên trong bộ môn
try {
  const result = await getDepartmentInstructors({
    page: 1,
    limit: 10,
    status: true,
    search: 'Nguyễn'
  });

  if (result.success) {
    console.log('Instructors:', result.data.instructors);
    console.log('Total:', result.data.pagination.total);
  }
} catch (error) {
  console.error('Error:', error);
  showNotification('Không thể tải danh sách giáo viên', 'error');
}

// Phân công một giáo viên
try {
  const result = await assignInstructorToRound(1, {
    instructorId: 5,
    maxStudents: 8,
    notes: 'Giảng viên có nhiều kinh nghiệm'
  });

  if (result.success) {
    showNotification(result.message, 'success');
  }
} catch (error) {
  console.error('Error:', error);
  showNotification(error.message || 'Phân công thất bại', 'error');
}

// Phân công nhiều giáo viên
try {
  const result = await assignMultipleInstructorsToRound(1, {
    instructors: [
      { instructorId: 5, maxStudents: 8 },
      { instructorId: 6, maxStudents: 5 },
      { instructorId: 7, maxStudents: 6 }
    ]
  });

  if (result.success) {
    console.log(`Thành công: ${result.data.summary.successful}`);
    console.log(`Thất bại: ${result.data.summary.failed}`);
    
    if (result.data.failed.length > 0) {
      result.data.failed.forEach(failure => {
        showNotification(
          `Giáo viên ID ${failure.instructorId}: ${failure.error}`,
          'warning'
        );
      });
    }
  }
} catch (error) {
  console.error('Error:', error);
  showNotification(error.message || 'Phân công thất bại', 'error');
}
```

---


## Lưu Ý

1. **Quyền truy cập**: Chỉ Trưởng bộ môn mới có quyền sử dụng các API này
2. **Phạm vi quản lý**: Trưởng bộ môn chỉ có thể quản lý giáo viên trong bộ môn của mình
3. **Validation**: 
   - Giáo viên phải thuộc cùng bộ môn với đợt đề tài
   - Không thể xóa giáo viên đang có sinh viên đăng ký
   - Số lượng sinh viên tối đa phải lớn hơn 0
4. **Ghi chú**: Trường `notes` có thể được sử dụng để lưu thông tin bổ sung về phân công
5. **Thống kê**: API thống kê cung cấp cái nhìn tổng quan về tình hình phân công trong bộ môn

---

**Tài liệu này được cập nhật lần cuối:** 2024-01-15

