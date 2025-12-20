# API Lấy Danh Sách Đợt Tiểu Luận - Actor Teacher

## Base URL
```
http://localhost:3000
```

---

## 1. Lấy Danh Sách Đợt Tiểu Luận

### Endpoint
```
GET /teacher/thesis-rounds
```

### Mô tả
Lấy danh sách các đợt tiểu luận (thesis rounds) dành cho giáo viên. API này tự động lọc theo bộ môn (department) của giáo viên đăng nhập, đảm bảo giáo viên chỉ thấy các đợt tiểu luận liên quan đến bộ môn của mình.

### Authentication
- **Required**: Yes
- **Type**: JWT Bearer Token
- **Role**: TEACHER, HEAD_OF_DEPARTMENT

### Headers
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Query Parameters

Tất cả các query parameters đều **optional**:

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `thesisTypeId` | number | No | Lọc theo ID loại đề tài | `1` |
| `departmentId` | number | No | Lọc theo ID bộ môn (bổ sung, vì đã tự động filter theo department của giáo viên) | `1` |
| `facultyId` | number | No | Lọc theo ID khoa | `1` |
| `status` | string | No | Lọc theo trạng thái: `Preparing`, `In Progress`, `Completed` | `In Progress` |
| `search` | string | No | Tìm kiếm theo tên hoặc mã đợt (không phân biệt hoa thường) | `tiểu luận` |
| `page` | number | No | Số trang (mặc định: 1) | `1` |
| `limit` | number | No | Số item mỗi trang (mặc định: 10) | `10` |
| `sortBy` | string | No | Sắp xếp theo: `createdAt`, `roundName`, `startDate`, `endDate`, `id` (mặc định: `createdAt`) | `startDate` |
| `sortOrder` | string | No | Thứ tự sắp xếp: `ASC`, `DESC` (mặc định: `DESC`) | `DESC` |

### Request Examples

#### Lấy tất cả đợt tiểu luận (trang đầu):
```bash
GET /teacher/thesis-rounds
```

#### Lấy đợt tiểu luận với phân trang:
```bash
GET /teacher/thesis-rounds?page=1&limit=20
```

#### Lọc theo trạng thái:
```bash
GET /teacher/thesis-rounds?status=In Progress
```

#### Tìm kiếm theo tên:
```bash
GET /teacher/thesis-rounds?search=khóa luận
```

#### Lọc theo loại đề tài và sắp xếp:
```bash
GET /teacher/thesis-rounds?thesisTypeId=1&sortBy=startDate&sortOrder=DESC
```

#### Kết hợp nhiều filter:
```bash
GET /teacher/thesis-rounds?status=In Progress&search=tiểu luận&page=1&limit=10&sortBy=startDate&sortOrder=DESC
```

### Response Success (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "roundCode": "TL2024-1",
      "roundName": "Đợt tiểu luận học kỳ 1 năm 2024",
      "thesisType": {
        "id": 1,
        "typeCode": "TL",
        "typeName": "Tiểu luận"
      },
      "department": {
        "id": 1,
        "departmentCode": "CNTT",
        "departmentName": "Công nghệ thông tin"
      },
      "faculty": {
        "id": 1,
        "facultyCode": "CNTT",
        "facultyName": "Khoa Công nghệ thông tin"
      },
      "academicYear": "2024-2025",
      "semester": 1,
      "startDate": "2024-09-01",
      "endDate": "2024-12-31",
      "topicProposalDeadline": "2024-09-15",
      "registrationDeadline": "2024-09-30",
      "reportSubmissionDeadline": "2024-12-15",
      "status": "In Progress",
      "createdAt": "2024-08-01T00:00:00.000Z",
      "updatedAt": "2024-08-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "roundCode": "TL2024-2",
      "roundName": "Đợt tiểu luận học kỳ 2 năm 2024",
      "thesisType": {
        "id": 1,
        "typeCode": "TL",
        "typeName": "Tiểu luận"
      },
      "department": {
        "id": 1,
        "departmentCode": "CNTT",
        "departmentName": "Công nghệ thông tin"
      },
      "faculty": {
        "id": 1,
        "facultyCode": "CNTT",
        "facultyName": "Khoa Công nghệ thông tin"
      },
      "academicYear": "2024-2025",
      "semester": 2,
      "startDate": "2025-01-15",
      "endDate": "2025-05-31",
      "topicProposalDeadline": "2025-01-30",
      "registrationDeadline": "2025-02-15",
      "reportSubmissionDeadline": "2025-05-15",
      "status": "Preparing",
      "createdAt": "2024-12-01T00:00:00.000Z",
      "updatedAt": "2024-12-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Trạng thái thành công |
| `data` | array | Danh sách đợt tiểu luận |
| `data[].id` | number | ID đợt tiểu luận |
| `data[].roundCode` | string | Mã đợt |
| `data[].roundName` | string | Tên đợt |
| `data[].thesisType` | object\|null | Thông tin loại đề tài |
| `data[].thesisType.id` | number | ID loại đề tài |
| `data[].thesisType.typeCode` | string | Mã loại đề tài |
| `data[].thesisType.typeName` | string | Tên loại đề tài |
| `data[].department` | object\|null | Thông tin bộ môn |
| `data[].department.id` | number | ID bộ môn |
| `data[].department.departmentCode` | string | Mã bộ môn |
| `data[].department.departmentName` | string | Tên bộ môn |
| `data[].faculty` | object\|null | Thông tin khoa |
| `data[].faculty.id` | number | ID khoa |
| `data[].faculty.facultyCode` | string | Mã khoa |
| `data[].faculty.facultyName` | string | Tên khoa |
| `data[].academicYear` | string\|null | Năm học (VD: "2024-2025") |
| `data[].semester` | number\|null | Học kỳ (1: Fall, 2: Spring, 3: Summer) |
| `data[].startDate` | string\|null | Ngày bắt đầu (YYYY-MM-DD) |
| `data[].endDate` | string\|null | Ngày kết thúc (YYYY-MM-DD) |
| `data[].topicProposalDeadline` | string\|null | Hạn nộp đề xuất đề tài (YYYY-MM-DD) |
| `data[].registrationDeadline` | string\|null | Hạn đăng ký (YYYY-MM-DD) |
| `data[].reportSubmissionDeadline` | string\|null | Hạn nộp báo cáo (YYYY-MM-DD) |
| `data[].status` | string | Trạng thái: `Preparing`, `In Progress`, `Completed` |
| `data[].createdAt` | string | Ngày tạo (ISO 8601) |
| `data[].updatedAt` | string | Ngày cập nhật (ISO 8601) |
| `pagination` | object | Thông tin phân trang |
| `pagination.currentPage` | number | Trang hiện tại |
| `pagination.totalPages` | number | Tổng số trang |
| `pagination.totalItems` | number | Tổng số item |
| `pagination.itemsPerPage` | number | Số item mỗi trang |
| `pagination.hasNextPage` | boolean | Có trang tiếp theo |
| `pagination.hasPrevPage` | boolean | Có trang trước |

### Response Error

#### 400 Bad Request - Không tìm thấy thông tin người dùng
```json
{
  "statusCode": 400,
  "message": "Không tìm thấy thông tin người dùng",
  "error": "Bad Request"
}
```

#### 401 Unauthorized - Chưa đăng nhập
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

#### 403 Forbidden - Không có quyền truy cập
```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

---

## Frontend Integration

### TypeScript Interfaces

```typescript
// Query Parameters Interface
interface GetThesisRoundsQuery {
  thesisTypeId?: number;
  departmentId?: number;
  facultyId?: number;
  status?: 'Preparing' | 'In Progress' | 'Completed';
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'roundName' | 'startDate' | 'endDate' | 'id';
  sortOrder?: 'ASC' | 'DESC';
}

// Response Interface
interface ThesisRound {
  id: number;
  roundCode: string;
  roundName: string;
  thesisType: {
    id: number;
    typeCode: string;
    typeName: string;
  } | null;
  department: {
    id: number;
    departmentCode: string;
    departmentName: string;
  } | null;
  faculty: {
    id: number;
    facultyCode: string;
    facultyName: string;
  } | null;
  academicYear: string | null;
  semester: number | null; // 1: Fall, 2: Spring, 3: Summer
  startDate: string | null; // YYYY-MM-DD
  endDate: string | null; // YYYY-MM-DD
  topicProposalDeadline: string | null; // YYYY-MM-DD
  registrationDeadline: string | null; // YYYY-MM-DD
  reportSubmissionDeadline: string | null; // YYYY-MM-DD
  status: 'Preparing' | 'In Progress' | 'Completed';
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface GetThesisRoundsResponse {
  success: boolean;
  data: ThesisRound[];
  pagination: PaginationInfo;
}
```

### API Call Function

```typescript
// Lấy danh sách đợt tiểu luận
async function getThesisRounds(
  query?: GetThesisRoundsQuery
): Promise<GetThesisRoundsResponse> {
  const queryParams = new URLSearchParams();
  
  if (query?.thesisTypeId) {
    queryParams.append('thesisTypeId', query.thesisTypeId.toString());
  }
  if (query?.departmentId) {
    queryParams.append('departmentId', query.departmentId.toString());
  }
  if (query?.facultyId) {
    queryParams.append('facultyId', query.facultyId.toString());
  }
  if (query?.status) {
    queryParams.append('status', query.status);
  }
  if (query?.search) {
    queryParams.append('search', query.search);
  }
  if (query?.page) {
    queryParams.append('page', query.page.toString());
  }
  if (query?.limit) {
    queryParams.append('limit', query.limit.toString());
  }
  if (query?.sortBy) {
    queryParams.append('sortBy', query.sortBy);
  }
  if (query?.sortOrder) {
    queryParams.append('sortOrder', query.sortOrder);
  }
  
  const url = `/api/teacher/thesis-rounds${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch thesis rounds');
  }
  
  return response.json();
}
```

### Usage Examples

#### Lấy tất cả đợt tiểu luận:
```typescript
try {
  const result = await getThesisRounds();
  
  if (result.success) {
    console.log('Danh sách đợt tiểu luận:', result.data);
    console.log('Phân trang:', result.pagination);
  }
} catch (error) {
  console.error('Error:', error);
  showNotification('Không thể tải danh sách đợt tiểu luận', 'error');
}
```

#### Lọc theo trạng thái và phân trang:
```typescript
try {
  const result = await getThesisRounds({
    status: 'In Progress',
    page: 1,
    limit: 20,
    sortBy: 'startDate',
    sortOrder: 'DESC'
  });
  
  if (result.success) {
    setThesisRounds(result.data);
    setPagination(result.pagination);
  }
} catch (error) {
  console.error('Error:', error);
}
```

#### Tìm kiếm:
```typescript
const handleSearch = async (searchTerm: string) => {
  try {
    const result = await getThesisRounds({
      search: searchTerm,
      page: 1,
      limit: 10
    });
    
    if (result.success) {
      setThesisRounds(result.data);
      setPagination(result.pagination);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

#### React Component Example:
```typescript
import { useState, useEffect } from 'react';

function ThesisRoundsList() {
  const [thesisRounds, setThesisRounds] = useState<ThesisRound[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<GetThesisRoundsQuery>({
    status: 'In Progress',
    page: 1,
    limit: 10
  });

  useEffect(() => {
    loadThesisRounds();
  }, [filters]);

  const loadThesisRounds = async () => {
    setLoading(true);
    try {
      const result = await getThesisRounds(filters);
      if (result.success) {
        setThesisRounds(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handleFilterChange = (newFilters: Partial<GetThesisRoundsQuery>) => {
    setFilters({ ...newFilters, page: 1 }); // Reset về trang 1 khi filter thay đổi
  };

  return (
    <div>
      {/* Filter UI */}
      <div>
        <select 
          value={filters.status || ''} 
          onChange={(e) => handleFilterChange({ status: e.target.value as any })}
        >
          <option value="">Tất cả</option>
          <option value="Preparing">Chuẩn bị</option>
          <option value="In Progress">Đang diễn ra</option>
          <option value="Completed">Hoàn thành</option>
        </select>
        
        <input
          type="text"
          placeholder="Tìm kiếm..."
          onChange={(e) => handleFilterChange({ search: e.target.value })}
        />
      </div>

      {/* List */}
      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <div>
          {thesisRounds.map((round) => (
            <div key={round.id}>
              <h3>{round.roundName}</h3>
              <p>Mã đợt: {round.roundCode}</p>
              <p>Trạng thái: {round.status}</p>
              <p>Ngày bắt đầu: {round.startDate}</p>
              <p>Ngày kết thúc: {round.endDate}</p>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && (
        <div>
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
}
```

---

## Lưu ý

1. **Tự động filter theo department**: API tự động lọc theo bộ môn của giáo viên đăng nhập. Giáo viên chỉ thấy các đợt tiểu luận thuộc bộ môn của mình.

2. **Phân trang**: Mặc định trả về 10 items mỗi trang. Có thể thay đổi bằng query parameter `limit`.

3. **Sắp xếp**: Mặc định sắp xếp theo `createdAt DESC` (mới nhất trước). Có thể thay đổi bằng `sortBy` và `sortOrder`.

4. **Tìm kiếm**: Tìm kiếm không phân biệt hoa thường, tìm trong `roundName` và `roundCode`.

5. **Trạng thái**: Các giá trị hợp lệ:
   - `Preparing`: Đang chuẩn bị
   - `In Progress`: Đang diễn ra
   - `Completed`: Đã hoàn thành

6. **Học kỳ**: 
   - `1`: Fall (Học kỳ 1)
   - `2`: Spring (Học kỳ 2)
   - `3`: Summer (Học kỳ hè)

7. **Ngày tháng**: Tất cả các trường ngày tháng được trả về theo định dạng `YYYY-MM-DD`.

8. **Relations**: API tự động load các relations: `thesisType`, `department`, `faculty`.

---

## Ví dụ sử dụng với cURL

### Lấy tất cả đợt tiểu luận:
```bash
curl -X GET "http://localhost:3000/teacher/thesis-rounds" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### Lọc theo trạng thái:
```bash
curl -X GET "http://localhost:3000/teacher/thesis-rounds?status=In%20Progress" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### Tìm kiếm và phân trang:
```bash
curl -X GET "http://localhost:3000/teacher/thesis-rounds?search=tiểu%20luận&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### Kết hợp nhiều filter:
```bash
curl -X GET "http://localhost:3000/teacher/thesis-rounds?thesisTypeId=1&status=In%20Progress&sortBy=startDate&sortOrder=DESC&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

---

**Tài liệu này được cập nhật lần cuối:** 2024-01-15
