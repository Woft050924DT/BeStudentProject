# API Phân Công Giáo Viên Phản Biện - Trưởng Bộ Môn

## Base URL
```
http://localhost:3000
```

---

## Mô Tả

API này cho phép trưởng bộ môn phân công giáo viên phản biện cho từng sinh viên (đề tài) trong bộ môn của mình. Hệ thống hỗ trợ:

1. **Phân công một giáo viên phản biện cho một đề tài**: Trưởng bộ môn có thể phân công một giáo viên phản biện cho một đề tài cụ thể.

2. **Phân công nhiều giáo viên phản biện cho nhiều đề tài**: Trưởng bộ môn có thể phân công nhiều giáo viên phản biện cho nhiều đề tài cùng lúc.

### Quyền Truy Cập
- **Role Required**: `HEAD_OF_DEPARTMENT` (Trưởng bộ môn)
- **Authentication**: JWT Bearer Token
- **Phạm vi**: Chỉ có thể phân công giáo viên phản biện cho các đề tài thuộc bộ môn của mình

---

## 1. Phân Công Một Giáo Viên Phản Biện Cho Một Đề Tài

### Endpoint
```
POST /thesis/head/assign-reviewer
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

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `thesisId` | number | Yes | ID của đề tài cần phân công phản biện |
| `reviewerId` | number | Yes | ID của giáo viên phản biện |
| `reviewOrder` | number | No | Thứ tự phản biện (1, 2, ...). Nếu không cung cấp, sẽ tự động tăng dựa trên số lượng phản biện hiện tại |
| `reviewDeadline` | string (ISO date) | No | Hạn phản biện (định dạng: YYYY-MM-DD) |

### Request Example
```json
{
  "thesisId": 1,
  "reviewerId": 5,
  "reviewOrder": 1,
  "reviewDeadline": "2024-06-30"
}
```

### Response Success (200 OK)
```json
{
  "success": true,
  "message": "Phân công giáo viên phản biện thành công",
  "data": {
    "id": 1,
    "thesis": {
      "id": 1,
      "thesisCode": "LV2024-001",
      "topicTitle": "Hệ thống quản lý thư viện",
      "student": {
        "id": 1,
        "studentCode": "SV001",
        "fullName": "Nguyễn Văn A"
      }
    },
    "reviewer": {
      "id": 5,
      "instructorCode": "GV005",
      "fullName": "Trần Thị B",
      "email": "tranthib@example.com"
    },
    "reviewOrder": 1,
    "reviewDeadline": "2024-06-30",
    "status": "Pending Review",
    "assignmentDate": "2024-01-15T10:30:00.000Z"
  }
}
```

### Response Error

#### 400 Bad Request - Giáo viên phản biện không thuộc bộ môn
```json
{
  "statusCode": 400,
  "message": "Giáo viên phản biện không thuộc bộ môn của đề tài này",
  "error": "Bad Request"
}
```

#### 400 Bad Request - Giáo viên phản biện là giáo viên hướng dẫn
```json
{
  "statusCode": 400,
  "message": "Giáo viên phản biện không thể là giáo viên hướng dẫn của đề tài này",
  "error": "Bad Request"
}
```

#### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

#### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Bạn không phải trưởng bộ môn"
}
```

#### 404 Not Found - Đề tài không tồn tại
```json
{
  "statusCode": 404,
  "message": "Đề tài không tồn tại",
  "error": "Not Found"
}
```

#### 404 Not Found - Giáo viên phản biện không tồn tại
```json
{
  "statusCode": 404,
  "message": "Giáo viên phản biện không tồn tại",
  "error": "Not Found"
}
```

#### 409 Conflict - Đã được phân công
```json
{
  "statusCode": 409,
  "message": "Giáo viên này đã được phân công phản biện cho đề tài này rồi",
  "error": "Conflict"
}
```

---

## 2. Phân Công Nhiều Giáo Viên Phản Biện Cho Nhiều Đề Tài (Bulk)

### Endpoint
```
POST /thesis/head/assign-reviewers/bulk
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

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `assignments` | array | Yes | Danh sách phân công giáo viên phản biện |

Mỗi phần tử trong mảng `assignments` có cấu trúc:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `thesisId` | number | Yes | ID của đề tài |
| `reviewerId` | number | Yes | ID của giáo viên phản biện |
| `reviewOrder` | number | No | Thứ tự phản biện |
| `reviewDeadline` | string (ISO date) | No | Hạn phản biện |

### Request Example
```json
{
  "assignments": [
    {
      "thesisId": 1,
      "reviewerId": 5,
      "reviewOrder": 1,
      "reviewDeadline": "2024-06-30"
    },
    {
      "thesisId": 2,
      "reviewerId": 6,
      "reviewOrder": 1,
      "reviewDeadline": "2024-07-15"
    },
    {
      "thesisId": 1,
      "reviewerId": 7,
      "reviewOrder": 2,
      "reviewDeadline": "2024-07-01"
    }
  ]
}
```

### Response Success (200 OK)
```json
{
  "success": true,
  "message": "Phân công thành công 2 giáo viên phản biện, 1 phân công thất bại",
  "data": {
    "successful": [
      {
        "id": 1,
        "thesis": {
          "id": 1,
          "thesisCode": "LV2024-001",
          "topicTitle": "Hệ thống quản lý thư viện",
          "student": {
            "id": 1,
            "studentCode": "SV001",
            "fullName": "Nguyễn Văn A"
          }
        },
        "reviewer": {
          "id": 5,
          "instructorCode": "GV005",
          "fullName": "Trần Thị B",
          "email": "tranthib@example.com"
        },
        "reviewOrder": 1,
        "reviewDeadline": "2024-06-30",
        "status": "Pending Review",
        "assignmentDate": "2024-01-15T10:30:00.000Z"
      },
      {
        "id": 2,
        "thesis": {
          "id": 2,
          "thesisCode": "LV2024-002",
          "topicTitle": "Hệ thống quản lý bán hàng",
          "student": {
            "id": 2,
            "studentCode": "SV002",
            "fullName": "Lê Văn C"
          }
        },
        "reviewer": {
          "id": 6,
          "instructorCode": "GV006",
          "fullName": "Phạm Văn D",
          "email": "phamvand@example.com"
        },
        "reviewOrder": 1,
        "reviewDeadline": "2024-07-15",
        "status": "Pending Review",
        "assignmentDate": "2024-01-15T10:30:00.000Z"
      }
    ],
    "failed": [
      {
        "thesisId": 1,
        "reviewerId": 7,
        "error": "Giáo viên này đã được phân công phản biện cho đề tài này rồi"
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
  "message": "Danh sách phân công không được để trống",
  "error": "Bad Request"
}
```

---

## Frontend Integration

### TypeScript Interfaces

```typescript
// Request Interfaces
interface AssignReviewerDto {
  thesisId: number;
  reviewerId: number;
  reviewOrder?: number;
  reviewDeadline?: string; // ISO date format: YYYY-MM-DD
}

interface AssignMultipleReviewersDto {
  assignments: AssignReviewerDto[];
}

// Response Interfaces
interface ReviewAssignmentResponse {
  id: number;
  thesis: {
    id: number;
    thesisCode: string;
    topicTitle: string;
    student: {
      id: number;
      studentCode: string;
      fullName: string;
    };
  };
  reviewer: {
    id: number;
    instructorCode: string;
    fullName: string;
    email: string;
  };
  reviewOrder: number;
  reviewDeadline: string | null;
  status: string;
  assignmentDate: string;
}

interface AssignReviewerResponse {
  success: boolean;
  message: string;
  data: ReviewAssignmentResponse;
}

interface BulkAssignReviewersResponse {
  success: boolean;
  message: string;
  data: {
    successful: ReviewAssignmentResponse[];
    failed?: Array<{
      thesisId: number;
      reviewerId: number;
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
// Phân công một giáo viên phản biện
async function assignReviewerToThesis(
  data: AssignReviewerDto
): Promise<AssignReviewerResponse> {
  const response = await fetch('/api/thesis/head/assign-reviewer', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to assign reviewer');
  }

  return response.json();
}

// Phân công nhiều giáo viên phản biện
async function assignMultipleReviewersToTheses(
  data: AssignMultipleReviewersDto
): Promise<BulkAssignReviewersResponse> {
  const response = await fetch('/api/thesis/head/assign-reviewers/bulk', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to assign reviewers');
  }

  return response.json();
}
```

### Usage Example

```typescript
// Phân công một giáo viên phản biện
try {
  const result = await assignReviewerToThesis({
    thesisId: 1,
    reviewerId: 5,
    reviewOrder: 1,
    reviewDeadline: '2024-06-30'
  });

  if (result.success) {
    console.log('Phân công thành công:', result.data);
    showNotification(result.message, 'success');
  }
} catch (error) {
  console.error('Error:', error);
  showNotification(error.message || 'Phân công thất bại', 'error');
}

// Phân công nhiều giáo viên phản biện
try {
  const result = await assignMultipleReviewersToTheses({
    assignments: [
      { thesisId: 1, reviewerId: 5, reviewOrder: 1 },
      { thesisId: 2, reviewerId: 6, reviewOrder: 1 },
      { thesisId: 1, reviewerId: 7, reviewOrder: 2 }
    ]
  });

  if (result.success) {
    console.log(`Thành công: ${result.data.summary.successful}`);
    console.log(`Thất bại: ${result.data.summary.failed}`);
    
    if (result.data.failed && result.data.failed.length > 0) {
      result.data.failed.forEach(failure => {
        showNotification(
          `Đề tài ${failure.thesisId}, Giáo viên ${failure.reviewerId}: ${failure.error}`,
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

## cURL Examples

### Phân công một giáo viên phản biện

```bash
curl -X POST "http://localhost:3000/thesis/head/assign-reviewer" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "thesisId": 1,
    "reviewerId": 5,
    "reviewOrder": 1,
    "reviewDeadline": "2024-06-30"
  }'
```

### Phân công nhiều giáo viên phản biện

```bash
curl -X POST "http://localhost:3000/thesis/head/assign-reviewers/bulk" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assignments": [
      {
        "thesisId": 1,
        "reviewerId": 5,
        "reviewOrder": 1,
        "reviewDeadline": "2024-06-30"
      },
      {
        "thesisId": 2,
        "reviewerId": 6,
        "reviewOrder": 1,
        "reviewDeadline": "2024-07-15"
      }
    ]
  }'
```

---

## Lưu Ý

### Validation Rules

1. **Quyền truy cập**: Chỉ trưởng bộ môn mới có thể sử dụng API này
2. **Phạm vi quản lý**: Trưởng bộ môn chỉ có thể phân công giáo viên phản biện cho các đề tài thuộc bộ môn của mình
3. **Giáo viên phản biện**: 
   - Phải thuộc cùng bộ môn với đề tài
   - Không thể là giáo viên hướng dẫn của đề tài đó
   - Không thể được phân công trùng lặp cho cùng một đề tài
4. **Thứ tự phản biện**: Nếu không cung cấp `reviewOrder`, hệ thống sẽ tự động tăng dựa trên số lượng phản biện hiện tại
5. **Hạn phản biện**: Có thể để trống, nhưng nếu cung cấp phải là định dạng ngày hợp lệ (ISO 8601)

### Business Rules

1. Một đề tài có thể có nhiều giáo viên phản biện
2. Mỗi giáo viên chỉ có thể được phân công một lần cho mỗi đề tài
3. Giáo viên phản biện không thể là giáo viên hướng dẫn của đề tài đó
4. Trạng thái mặc định của phân công là "Pending Review"

### Error Handling

- API sẽ trả về lỗi chi tiết cho từng phân công thất bại trong trường hợp bulk assignment
- Các phân công thành công vẫn được lưu ngay cả khi có một số phân công thất bại

---

## Testing

### Test Cases

#### 1. Successful Assignment
- **Precondition**: User logged in as HEAD_OF_DEPARTMENT, thesis exists, reviewer exists and belongs to same department
- **Request**: `POST /thesis/head/assign-reviewer` with valid data
- **Expected**: Status 200 with assignment details
- **Verify**: Assignment created in database with correct data

#### 2. Reviewer Not in Same Department
- **Precondition**: User logged in as HEAD_OF_DEPARTMENT, reviewer belongs to different department
- **Request**: `POST /thesis/head/assign-reviewer` with reviewer from different department
- **Expected**: Status 400 with error message
- **Verify**: Error message indicates reviewer doesn't belong to thesis department

#### 3. Reviewer is Supervisor
- **Precondition**: User logged in as HEAD_OF_DEPARTMENT, reviewer is the supervisor of the thesis
- **Request**: `POST /thesis/head/assign-reviewer` with supervisor as reviewer
- **Expected**: Status 400 with error message
- **Verify**: Error message indicates reviewer cannot be supervisor

#### 4. Duplicate Assignment
- **Precondition**: User logged in as HEAD_OF_DEPARTMENT, assignment already exists
- **Request**: `POST /thesis/head/assign-reviewer` with same thesisId and reviewerId
- **Expected**: Status 409 with error message
- **Verify**: Error message indicates duplicate assignment

#### 5. Bulk Assignment with Mixed Results
- **Precondition**: User logged in as HEAD_OF_DEPARTMENT
- **Request**: `POST /thesis/head/assign-reviewers/bulk` with mix of valid and invalid assignments
- **Expected**: Status 200 with successful and failed assignments
- **Verify**: Successful assignments are created, failed ones are reported in errors array

---

**Tài liệu này được cập nhật lần cuối:** 2025-01-XX

