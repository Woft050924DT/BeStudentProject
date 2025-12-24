# API Lấy Danh Sách Sinh Viên Đăng Ký Đề Tài - Trưởng Bộ Môn

## Base URL
```
http://localhost:3000
```

---

## Mô Tả

API này cho phép trưởng bộ môn lấy danh sách **TẤT CẢ** sinh viên đăng ký đề tài trong bộ môn của mình. Khác với API `GET /thesis/head/pending-registrations` chỉ lấy các đăng ký chờ phê duyệt, API này cho phép xem tất cả đăng ký với các filter linh hoạt.

### Quyền Truy Cập
- **Role Required**: `HEAD_OF_DEPARTMENT` (Trưởng bộ môn)
- **Authentication**: JWT Bearer Token

---

## Endpoint

### Lấy Danh Sách Tất Cả Sinh Viên Đăng Ký Đề Tài

**URL**: `/thesis/head/student-registrations`

**Method**: `GET`

**Authentication**: Required (JWT Token)

**Role**: `HEAD_OF_DEPARTMENT`

---

## Request

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token để xác thực. Format: `Bearer <access_token>` |
| `Content-Type` | string | Yes | `application/json` |

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `thesisRoundId` | number | No | Lọc theo ID đợt luận văn |
| `instructorStatus` | string | No | Lọc theo trạng thái giáo viên: `Pending`, `Approved`, `Rejected` |
| `headStatus` | string | No | Lọc theo trạng thái trưởng bộ môn: `Pending`, `Approved`, `Rejected` |
| `page` | number | No | Số trang (mặc định: 1) |
| `limit` | number | No | Số lượng item mỗi trang (mặc định: 10) |

### Request Examples

```bash
# Lấy tất cả đăng ký (trang 1, 10 items/trang)
GET /thesis/head/student-registrations
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Lọc theo đợt luận văn
GET /thesis/head/student-registrations?thesisRoundId=1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Lọc theo trạng thái giáo viên
GET /thesis/head/student-registrations?instructorStatus=Approved
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Lọc theo trạng thái trưởng bộ môn
GET /thesis/head/student-registrations?headStatus=Pending
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Kết hợp nhiều filter
GET /thesis/head/student-registrations?thesisRoundId=1&instructorStatus=Approved&headStatus=Pending
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Phân trang
GET /thesis/head/student-registrations?page=2&limit=20
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Response

### Success Response (200 OK)

**Response Structure:**

```typescript
interface StudentRegistration {
  id: number;
  student: {
    id: number;
    studentCode: string;
    fullName: string;
    email: string;
    phone: string | null;
    class: {
      id: number;
      className: string;
      classCode: string;
    } | null;
  };
  thesisRound: {
    id: number;
    roundName: string;
    roundCode: string;
    status: string;
  } | null;
  proposedTopic: {
    id: number;
    topicTitle: string;
    topicCode: string;
  } | null;
  selfProposedTitle: string | null;
  selfProposedDescription: string | null;
  topicTitle: string | null;
  selectionReason: string | null;
  instructor: {
    id: number;
    instructorCode: string;
    fullName: string;
    email: string;
  } | null;
  instructorStatus: 'Pending' | 'Approved' | 'Rejected';
  headStatus: 'Pending' | 'Approved' | 'Rejected';
  instructorRejectionReason: string | null;
  headRejectionReason: string | null;
  registrationDate: string;
  instructorApprovalDate: string | null;
  headApprovalDate: string | null;
}

interface GetAllStudentRegistrationsResponse {
  success: boolean;
  data: StudentRegistration[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
```

**Example Response:**

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
        "roundCode": "LV2024",
        "status": "Active"
      },
      "proposedTopic": {
        "id": 1,
        "topicTitle": "Hệ thống quản lý thư viện",
        "topicCode": "DT001"
      },
      "selfProposedTitle": null,
      "selfProposedDescription": null,
      "topicTitle": "Hệ thống quản lý thư viện",
      "selectionReason": "Tôi quan tâm đến lĩnh vực này",
      "instructor": {
        "id": 1,
        "instructorCode": "GV001",
        "fullName": "Trần Thị B",
        "email": "tranthib@example.com"
      },
      "instructorStatus": "Approved",
      "headStatus": "Pending",
      "instructorRejectionReason": null,
      "headRejectionReason": null,
      "registrationDate": "2024-01-15T10:30:00.000Z",
      "instructorApprovalDate": "2024-01-16T09:00:00.000Z",
      "headApprovalDate": null
    },
    {
      "id": 2,
      "student": {
        "id": 2,
        "studentCode": "SV002",
        "fullName": "Lê Văn C",
        "email": "levanc@example.com",
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
        "roundCode": "LV2024",
        "status": "Active"
      },
      "proposedTopic": null,
      "selfProposedTitle": "Hệ thống quản lý bán hàng online",
      "selfProposedDescription": "Xây dựng hệ thống quản lý bán hàng trực tuyến",
      "topicTitle": "Hệ thống quản lý bán hàng online",
      "selectionReason": "Đề tài phù hợp với định hướng nghề nghiệp",
      "instructor": {
        "id": 2,
        "instructorCode": "GV002",
        "fullName": "Phạm Văn D",
        "email": "phamvand@example.com"
      },
      "instructorStatus": "Pending",
      "headStatus": "Pending",
      "instructorRejectionReason": null,
      "headRejectionReason": null,
      "registrationDate": "2024-01-20T14:00:00.000Z",
      "instructorApprovalDate": null,
      "headApprovalDate": null
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 48,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Error Responses

#### 401 Unauthorized
**Condition**: Token không hợp lệ hoặc hết hạn

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

#### 403 Forbidden
**Condition**: Người dùng không phải là trưởng bộ môn

```json
{
  "statusCode": 403,
  "message": "Bạn không phải trưởng bộ môn"
}
```

#### 400 Bad Request
**Condition**: Không tìm thấy instructorId trong token

```json
{
  "statusCode": 400,
  "message": "Không tìm thấy thông tin trưởng bộ môn. Vui lòng đăng nhập lại."
}
```

#### 404 Not Found
**Condition**: Không tìm thấy thông tin bộ môn

```json
{
  "statusCode": 404,
  "message": "Không tìm thấy thông tin bộ môn"
}
```

---

## Frontend Implementation

### TypeScript/JavaScript

#### 1. Interface Definition

```typescript
// types/student-registration.ts
export interface StudentRegistration {
  id: number;
  student: {
    id: number;
    studentCode: string;
    fullName: string;
    email: string;
    phone: string | null;
    class: {
      id: number;
      className: string;
      classCode: string;
    } | null;
  };
  thesisRound: {
    id: number;
    roundName: string;
    roundCode: string;
    status: string;
  } | null;
  proposedTopic: {
    id: number;
    topicTitle: string;
    topicCode: string;
  } | null;
  selfProposedTitle: string | null;
  selfProposedDescription: string | null;
  topicTitle: string | null;
  selectionReason: string | null;
  instructor: {
    id: number;
    instructorCode: string;
    fullName: string;
    email: string;
  } | null;
  instructorStatus: 'Pending' | 'Approved' | 'Rejected';
  headStatus: 'Pending' | 'Approved' | 'Rejected';
  instructorRejectionReason: string | null;
  headRejectionReason: string | null;
  registrationDate: string;
  instructorApprovalDate: string | null;
  headApprovalDate: string | null;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface GetAllStudentRegistrationsResponse {
  success: boolean;
  data: StudentRegistration[];
  pagination: PaginationInfo;
}

export interface GetAllStudentRegistrationsFilters {
  thesisRoundId?: number;
  instructorStatus?: 'Pending' | 'Approved' | 'Rejected';
  headStatus?: 'Pending' | 'Approved' | 'Rejected';
  page?: number;
  limit?: number;
}
```

#### 2. API Service Function (Axios)

```typescript
// services/departmentHeadService.ts
import axios from 'axios';
import type { GetAllStudentRegistrationsResponse, GetAllStudentRegistrationsFilters } from '../types/student-registration';

const API_BASE_URL = 'http://localhost:3000';

// Helper function để lấy token
function getToken(): string {
  return localStorage.getItem('access_token') || '';
}

// Lấy danh sách tất cả sinh viên đăng ký đề tài
export async function getAllStudentRegistrationsForHead(
  filters?: GetAllStudentRegistrationsFilters
): Promise<GetAllStudentRegistrationsResponse> {
  try {
    const params = new URLSearchParams();
    
    if (filters?.thesisRoundId) {
      params.append('thesisRoundId', filters.thesisRoundId.toString());
    }
    
    if (filters?.instructorStatus) {
      params.append('instructorStatus', filters.instructorStatus);
    }
    
    if (filters?.headStatus) {
      params.append('headStatus', filters.headStatus);
    }
    
    if (filters?.page) {
      params.append('page', filters.page.toString());
    }
    
    if (filters?.limit) {
      params.append('limit', filters.limit.toString());
    }

    const response = await axios.get<GetAllStudentRegistrationsResponse>(
      `${API_BASE_URL}/thesis/head/student-registrations?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Không thể lấy danh sách đăng ký');
    }
    throw error;
  }
}
```

#### 3. API Service Function (Fetch)

```typescript
// services/departmentHeadService.ts
import type { GetAllStudentRegistrationsResponse, GetAllStudentRegistrationsFilters } from '../types/student-registration';

const API_BASE_URL = 'http://localhost:3000';

// Helper function để lấy token
function getToken(): string {
  return localStorage.getItem('access_token') || '';
}

// Lấy danh sách tất cả sinh viên đăng ký đề tài
export async function getAllStudentRegistrationsForHead(
  filters?: GetAllStudentRegistrationsFilters
): Promise<GetAllStudentRegistrationsResponse> {
  const params = new URLSearchParams();
  
  if (filters?.thesisRoundId) {
    params.append('thesisRoundId', filters.thesisRoundId.toString());
  }
  
  if (filters?.instructorStatus) {
    params.append('instructorStatus', filters.instructorStatus);
  }
  
  if (filters?.headStatus) {
    params.append('headStatus', filters.headStatus);
  }
  
  if (filters?.page) {
    params.append('page', filters.page.toString());
  }
  
  if (filters?.limit) {
    params.append('limit', filters.limit.toString());
  }

  const response = await fetch(
    `${API_BASE_URL}/thesis/head/student-registrations?${params.toString()}`,
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
    throw new Error(error.message || 'Không thể lấy danh sách đăng ký');
  }

  return response.json();
}
```

#### 4. React Component Example

```typescript
// components/DepartmentHeadStudentRegistrations.tsx
import React, { useEffect, useState } from 'react';
import { getAllStudentRegistrationsForHead } from '../services/departmentHeadService';
import type { StudentRegistration, PaginationInfo, GetAllStudentRegistrationsFilters } from '../types/student-registration';

export const DepartmentHeadStudentRegistrationsComponent: React.FC = () => {
  const [registrations, setRegistrations] = useState<StudentRegistration[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<GetAllStudentRegistrationsFilters>({
    page: 1,
    limit: 10
  });

  useEffect(() => {
    fetchRegistrations();
  }, [filters]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAllStudentRegistrationsForHead(filters);
      setRegistrations(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<GetAllStudentRegistrationsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  if (loading) {
    return <div>Đang tải danh sách...</div>;
  }

  if (error) {
    return <div className="error">Lỗi: {error}</div>;
  }

  return (
    <div className="registrations-container">
      <h2>Danh Sách Sinh Viên Đăng Ký Đề Tài</h2>
      
      {/* Filters */}
      <div className="filters">
        <select
          value={filters.instructorStatus || ''}
          onChange={(e) => handleFilterChange({ 
            instructorStatus: e.target.value || undefined 
          })}
        >
          <option value="">Tất cả trạng thái giáo viên</option>
          <option value="Pending">Chờ giáo viên</option>
          <option value="Approved">Đã duyệt giáo viên</option>
          <option value="Rejected">Từ chối giáo viên</option>
        </select>
        
        <select
          value={filters.headStatus || ''}
          onChange={(e) => handleFilterChange({ 
            headStatus: e.target.value || undefined 
          })}
        >
          <option value="">Tất cả trạng thái trưởng bộ môn</option>
          <option value="Pending">Chờ trưởng bộ môn</option>
          <option value="Approved">Đã duyệt trưởng bộ môn</option>
          <option value="Rejected">Từ chối trưởng bộ môn</option>
        </select>
      </div>

      {/* Table */}
      <table className="registrations-table">
        <thead>
          <tr>
            <th>Mã SV</th>
            <th>Họ tên</th>
            <th>Đề tài</th>
            <th>Giảng viên</th>
            <th>Trạng thái GV</th>
            <th>Trạng thái TBM</th>
            <th>Ngày đăng ký</th>
          </tr>
        </thead>
        <tbody>
          {registrations.map((reg) => (
            <tr key={reg.id}>
              <td>{reg.student.studentCode}</td>
              <td>{reg.student.fullName}</td>
              <td>{reg.topicTitle || 'N/A'}</td>
              <td>{reg.instructor?.fullName || 'N/A'}</td>
              <td>
                <span className={`status status-${reg.instructorStatus.toLowerCase()}`}>
                  {reg.instructorStatus}
                </span>
              </td>
              <td>
                <span className={`status status-${reg.headStatus.toLowerCase()}`}>
                  {reg.headStatus}
                </span>
              </td>
              <td>{new Date(reg.registrationDate).toLocaleDateString('vi-VN')}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {pagination && (
        <div className="pagination">
          <button
            disabled={!pagination.hasPrevPage}
            onClick={() => handlePageChange(pagination.currentPage - 1)}
          >
            Trước
          </button>
          <span>
            Trang {pagination.currentPage} / {pagination.totalPages}
          </span>
          <button
            disabled={!pagination.hasNextPage}
            onClick={() => handlePageChange(pagination.currentPage + 1)}
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};
```

#### 5. React Query Hook Example

```typescript
// hooks/useDepartmentHeadStudentRegistrations.ts
import { useQuery } from '@tanstack/react-query';
import { getAllStudentRegistrationsForHead } from '../services/departmentHeadService';
import type { GetAllStudentRegistrationsFilters } from '../types/student-registration';

export function useDepartmentHeadStudentRegistrations(filters?: GetAllStudentRegistrationsFilters) {
  return useQuery({
    queryKey: ['departmentHeadStudentRegistrations', filters],
    queryFn: () => getAllStudentRegistrationsForHead(filters),
    staleTime: 30 * 1000, // 30 giây
    retry: 2,
  });
}

// Sử dụng trong component:
// const { data, isLoading, error } = useDepartmentHeadStudentRegistrations({ 
//   instructorStatus: 'Approved',
//   headStatus: 'Pending',
//   page: 1,
//   limit: 10
// });
```

---

## cURL Examples

### Basic Request

```bash
curl -X GET "http://localhost:3000/thesis/head/student-registrations" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### With Filters

```bash
curl -X GET "http://localhost:3000/thesis/head/student-registrations?thesisRoundId=1&instructorStatus=Approved&headStatus=Pending&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### With Token from Environment Variable

```bash
export ACCESS_TOKEN="your_jwt_token_here"

curl -X GET "http://localhost:3000/thesis/head/student-registrations?page=1&limit=10" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Postman Collection

### Request Setup

1. **Method**: GET
2. **URL**: `{{baseUrl}}/thesis/head/student-registrations`
3. **Headers**:
   - `Authorization`: `Bearer {{accessToken}}`
   - `Content-Type`: `application/json`
4. **Query Parameters** (Optional):
   - `thesisRoundId`: number
   - `instructorStatus`: string (Pending, Approved, Rejected)
   - `headStatus`: string (Pending, Approved, Rejected)
   - `page`: number (default: 1)
   - `limit`: number (default: 10)
5. **Environment Variables**:
   - `baseUrl`: `http://localhost:3000`
   - `accessToken`: Your JWT token

---

## So Sánh Với API Khác

### API `GET /thesis/head/pending-registrations`
- **Mục đích**: Chỉ lấy các đăng ký **chờ trưởng bộ môn phê duyệt**
- **Điều kiện**: `instructorStatus = 'Approved'` VÀ `headStatus = 'Pending'`
- **Use case**: Dùng để phê duyệt đăng ký

### API `GET /thesis/head/student-registrations` (API này)
- **Mục đích**: Lấy **TẤT CẢ** đăng ký trong bộ môn
- **Điều kiện**: Không có điều kiện cứng, có thể filter linh hoạt
- **Use case**: Xem tổng quan, thống kê, quản lý tất cả đăng ký

---

## Testing

### Test Cases

#### 1. Successful Retrieval - All Registrations
- **Precondition**: User logged in as HEAD_OF_DEPARTMENT
- **Request**: `GET /thesis/head/student-registrations`
- **Expected**: Status 200 with all registrations in department
- **Verify**: Data includes registrations with all statuses

#### 2. Filter by Instructor Status
- **Precondition**: User logged in as HEAD_OF_DEPARTMENT
- **Request**: `GET /thesis/head/student-registrations?instructorStatus=Approved`
- **Expected**: Status 200 with only approved registrations
- **Verify**: All items have `instructorStatus = 'Approved'`

#### 3. Filter by Head Status
- **Precondition**: User logged in as HEAD_OF_DEPARTMENT
- **Request**: `GET /thesis/head/student-registrations?headStatus=Pending`
- **Expected**: Status 200 with only pending registrations
- **Verify**: All items have `headStatus = 'Pending'`

#### 4. Combined Filters
- **Precondition**: User logged in as HEAD_OF_DEPARTMENT
- **Request**: `GET /thesis/head/student-registrations?thesisRoundId=1&instructorStatus=Approved&headStatus=Pending`
- **Expected**: Status 200 with filtered results
- **Verify**: Results match all filter criteria

#### 5. Pagination
- **Precondition**: User logged in as HEAD_OF_DEPARTMENT
- **Request**: `GET /thesis/head/student-registrations?page=2&limit=5`
- **Expected**: Status 200 with pagination info
- **Verify**: Returns 5 items, pagination shows correct page info

#### 6. Unauthorized Access
- **Precondition**: No token or invalid token
- **Expected**: Status 401 with error message
- **Verify**: Error message indicates authentication failure

#### 7. Forbidden Access
- **Precondition**: User is not HEAD_OF_DEPARTMENT
- **Expected**: Status 403 with error message
- **Verify**: Error message indicates insufficient permissions

---

## Notes

### Security
- API yêu cầu JWT token hợp lệ
- Chỉ trưởng bộ môn mới có thể truy cập
- Token được validate qua `JwtAuthGuard` và `RolesGuard`
- Chỉ trả về đăng ký thuộc bộ môn của trưởng bộ môn

### Performance
- Query bao gồm các relations: `student`, `user`, `class`, `thesisRound`, `department`, `proposedTopic`, `instructor`
- Response time dự kiến: < 500ms (tùy số lượng đăng ký)
- Nên sử dụng pagination để tối ưu performance

### Data Privacy
- Chỉ trả về đăng ký thuộc bộ môn của trưởng bộ môn đang đăng nhập
- Không cho phép xem đăng ký của bộ môn khác

### Filter Logic
- Tất cả filters là optional
- Có thể kết hợp nhiều filters cùng lúc
- Filter không phân biệt hoa thường (case-insensitive)

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-XX | Initial API release |

---

## Support

Nếu có vấn đề hoặc câu hỏi, vui lòng liên hệ team backend.

