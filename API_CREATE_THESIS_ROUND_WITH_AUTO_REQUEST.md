# API Tạo Đợt Tiểu Luận - Tự Động Gửi Yêu Cầu Cho Trưởng Bộ Môn

## Base URL
```
http://localhost:3000
```

---

## Mô Tả

API này cho phép giáo viên hoặc trưởng bộ môn tạo đợt tiểu luận. **Sau khi tạo thành công, hệ thống sẽ tự động tạo một yêu cầu phê duyệt và gửi cho trưởng bộ môn của bộ môn đó**.

---

## Tạo Đợt Tiểu Luận

### Endpoint
```
POST /thesis/thesis-rounds
```

### Authentication
- **Required**: Yes
- **Type**: JWT Bearer Token
- **Role**: TEACHER, HEAD_OF_DEPARTMENT

### Headers
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `roundCode` | string | Yes | Mã đợt tiểu luận (tối đa 20 ký tự, unique) |
| `roundName` | string | Yes | Tên đợt tiểu luận (tối đa 255 ký tự) |
| `thesisTypeId` | number | Yes | ID loại luận văn |
| `departmentId` | number | Optional | ID bộ môn (giáo viên không cần truyền, sẽ tự động lấy từ instructor của họ) |
| `facultyId` | number | Optional | ID khoa |
| `academicYear` | string | Optional | Năm học (tối đa 20 ký tự) |
| `semester` | number | Optional | Học kỳ (1: Fall, 2: Spring, 3: Summer) |
| `startDate` | string (ISO date) | Optional | Ngày bắt đầu |
| `endDate` | string (ISO date) | Optional | Ngày kết thúc |
| `topicProposalDeadline` | string (ISO date) | Optional | Hạn nộp đề xuất đề tài |
| `registrationDeadline` | string (ISO date) | Optional | Hạn đăng ký đề tài |
| `reportSubmissionDeadline` | string (ISO date) | Optional | Hạn nộp báo cáo |
| `guidanceProcess` | string | Optional | Quy trình hướng dẫn |
| `notes` | string | Optional | Ghi chú |

### Request Example

```json
{
  "roundCode": "TL2024-1",
  "roundName": "Đợt tiểu luận học kỳ 1 năm 2024",
  "thesisTypeId": 1,
  "academicYear": "2024-2025",
  "semester": 1,
  "startDate": "2024-09-01",
  "endDate": "2024-12-31",
  "topicProposalDeadline": "2024-09-15",
  "registrationDeadline": "2024-09-30",
  "reportSubmissionDeadline": "2024-12-15",
  "guidanceProcess": "Quy trình hướng dẫn tiểu luận",
  "notes": "Ghi chú về đợt tiểu luận"
}
```

### Response Success (200 OK)

```json
{
  "success": true,
  "message": "Tạo đợt luận văn thành công",
  "data": {
    "id": 1,
    "roundCode": "TL2024-1",
    "roundName": "Đợt tiểu luận học kỳ 1 năm 2024",
    "thesisTypeId": 1,
    "departmentId": 5,
    "facultyId": 1,
    "academicYear": "2024-2025",
    "semester": 1,
    "startDate": "2024-09-01T00:00:00.000Z",
    "endDate": "2024-12-31T00:00:00.000Z",
    "topicProposalDeadline": "2024-09-15T00:00:00.000Z",
    "registrationDeadline": "2024-09-30T00:00:00.000Z",
    "reportSubmissionDeadline": "2024-12-15T00:00:00.000Z",
    "guidanceProcess": "Quy trình hướng dẫn tiểu luận",
    "notes": "Ghi chú về đợt tiểu luận",
    "status": "Preparing",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Response Errors

#### 400 Bad Request - Mã đợt đã tồn tại
```json
{
  "statusCode": 400,
  "message": "Mã đợt luận văn đã tồn tại",
  "error": "Bad Request"
}
```

#### 400 Bad Request - Giáo viên chưa được gán vào bộ môn
```json
{
  "statusCode": 400,
  "message": "Giáo viên chưa được gán vào bộ môn. Vui lòng liên hệ quản trị viên.",
  "error": "Bad Request"
}
```

#### 403 Forbidden - Không có quyền tạo đợt cho bộ môn khác
```json
{
  "statusCode": 403,
  "message": "Bạn chỉ có thể tạo đợt tiểu luận cho bộ môn của mình",
  "error": "Forbidden"
}
```

#### 404 Not Found - Loại luận văn không tồn tại
```json
{
  "statusCode": 404,
  "message": "Loại luận văn không tồn tại",
  "error": "Not Found"
}
```

---

## Tính Năng Tự Động Tạo Request

### Mô Tả

Sau khi tạo đợt tiểu luận thành công, hệ thống sẽ **tự động**:

1. **Tạo yêu cầu phê duyệt** trong bảng `thesis_round_requests` với:
   - Trạng thái: `Pending`
   - Lý do: "Đợt tiểu luận đã được tạo, cần phê duyệt để mở đợt"
   - Người yêu cầu: Người tạo đợt tiểu luận

2. **Gửi thông báo real-time** đến trưởng bộ môn qua Socket.IO

### Điều Kiện Tạo Request

Request chỉ được tạo tự động nếu:

- ✅ Đợt tiểu luận có `departmentId`
- ✅ Bộ môn có trưởng bộ môn (head)
- ✅ Chưa có request với cùng `roundCode` đang ở trạng thái `Pending`

**Lưu ý**: Nếu việc tạo request thất bại, hệ thống chỉ log lỗi và không ảnh hưởng đến việc tạo đợt tiểu luận. Đợt tiểu luận vẫn được tạo thành công.

---

## Socket Event Notification

### Event Name
```
new_thesis_round_request
```

### Mô Tả

Khi có đợt tiểu luận mới được tạo, hệ thống sẽ gửi thông báo real-time đến trưởng bộ môn qua Socket.IO.

### Event Data Structure

```typescript
{
  requestId: number;
  roundCode: string;
  roundName: string;
  requestedBy: {
    id: number;
    fullName: string;
    email: string;
  };
  department: {
    id: number;
    departmentName: string;
  };
  requestedAt: string; // ISO date string
  message: string; // "Có đợt tiểu luận mới được tạo, cần bạn phê duyệt"
}
```

### Frontend Integration - Socket.IO

#### Setup Socket Connection

```typescript
import { io, Socket } from 'socket.io-client';

const socket: Socket = io('http://localhost:3000', {
  auth: {
    token: getAuthToken() // JWT token
  }
});

// Listen for new thesis round request
socket.on('new_thesis_round_request', (data) => {
  console.log('New thesis round request:', data);
  
  // Hiển thị thông báo cho trưởng bộ môn
  showNotification({
    type: 'info',
    title: 'Yêu cầu phê duyệt đợt tiểu luận mới',
    message: data.message,
    data: data
  });
  
  // Có thể navigate đến trang quản lý request
  // navigate(`/thesis/requests/${data.requestId}`);
});
```

#### React Hook Example

```typescript
import { useEffect } from 'react';
import { useSocket } from './hooks/useSocket'; // Your socket hook

function HeadOfDepartmentDashboard() {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewRequest = (data: any) => {
      // Hiển thị toast notification
      toast.info('Có đợt tiểu luận mới cần phê duyệt', {
        description: `${data.roundName} - ${data.requestedBy.fullName}`,
        action: {
          label: 'Xem chi tiết',
          onClick: () => navigate(`/thesis/requests/${data.requestId}`)
        }
      });
      
      // Update local state để refresh danh sách request
      refreshRequestList();
    };

    socket.on('new_thesis_round_request', handleNewRequest);

    return () => {
      socket.off('new_thesis_round_request', handleNewRequest);
    };
  }, [socket, isConnected]);

  return (
    <div>
      {/* Your dashboard content */}
    </div>
  );
}
```

---

## Frontend Integration Guide

### TypeScript Interfaces

```typescript
interface CreateThesisRoundRequest {
  roundCode: string;
  roundName: string;
  thesisTypeId: number;
  departmentId?: number;
  facultyId?: number;
  academicYear?: string;
  semester?: number; // 1: Fall, 2: Spring, 3: Summer
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  topicProposalDeadline?: string; // ISO date string
  registrationDeadline?: string; // ISO date string
  reportSubmissionDeadline?: string; // ISO date string
  guidanceProcess?: string;
  notes?: string;
}

interface ThesisRound {
  id: number;
  roundCode: string;
  roundName: string;
  thesisTypeId: number;
  departmentId?: number;
  facultyId?: number;
  academicYear?: string;
  semester?: number;
  startDate?: string;
  endDate?: string;
  topicProposalDeadline?: string;
  registrationDeadline?: string;
  reportSubmissionDeadline?: string;
  guidanceProcess?: string;
  notes?: string;
  status: string; // 'Preparing' | 'In Progress' | 'Completed'
  createdAt: string;
  updatedAt: string;
}

interface CreateThesisRoundResponse {
  success: boolean;
  message: string;
  data: ThesisRound;
}

interface NewThesisRoundRequestNotification {
  requestId: number;
  roundCode: string;
  roundName: string;
  requestedBy: {
    id: number;
    fullName: string;
    email: string;
  };
  department: {
    id: number;
    departmentName: string;
  };
  requestedAt: string;
  message: string;
}
```

### API Service Function

```typescript
async function createThesisRound(
  requestData: CreateThesisRoundRequest
): Promise<CreateThesisRoundResponse> {
  const response = await fetch('/api/thesis/thesis-rounds', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create thesis round');
  }

  return response.json();
}
```

### React Component Example

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner'; // or your toast library
import { createThesisRound } from './api/thesis';

function CreateThesisRoundForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateThesisRoundRequest>({
    roundCode: '',
    roundName: '',
    thesisTypeId: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createThesisRound(formData);

      if (result.success) {
        toast.success('Tạo đợt tiểu luận thành công', {
          description: 'Yêu cầu phê duyệt đã được gửi tự động cho trưởng bộ môn'
        });

        // Navigate to thesis rounds list or detail page
        navigate(`/thesis/rounds/${result.data.id}`);
      }
    } catch (error) {
      console.error('Error creating thesis round:', error);
      toast.error('Tạo đợt tiểu luận thất bại', {
        description: error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <div>
        <label>Mã đợt:</label>
        <input
          type="text"
          value={formData.roundCode}
          onChange={(e) => setFormData({ ...formData, roundCode: e.target.value })}
          required
        />
      </div>

      <div>
        <label>Tên đợt:</label>
        <input
          type="text"
          value={formData.roundName}
          onChange={(e) => setFormData({ ...formData, roundName: e.target.value })}
          required
        />
      </div>

      {/* Other fields... */}

      <button type="submit" disabled={loading}>
        {loading ? 'Đang tạo...' : 'Tạo đợt tiểu luận'}
      </button>
    </form>
  );
}
```

---

## Lưu Ý Quan Trọng

### Đối Với Giáo Viên (TEACHER)

1. **Không cần truyền `departmentId`**: Hệ thống sẽ tự động lấy `departmentId` từ instructor của giáo viên
2. **Chỉ có thể tạo đợt cho bộ môn mình**: Giáo viên không thể tạo đợt cho bộ môn khác
3. **Request tự động được gửi**: Sau khi tạo, yêu cầu phê duyệt sẽ tự động được gửi cho trưởng bộ môn

### Đối Với Trưởng Bộ Môn (HEAD_OF_DEPARTMENT)

1. **Có thể tạo đợt cho bộ môn mình**: Trưởng bộ môn có thể tạo đợt cho bộ môn mà họ quản lý
2. **Request vẫn được tạo**: Ngay cả khi trưởng bộ môn tự tạo đợt, request vẫn được tạo để theo dõi và có thể được phê duyệt bởi cấp cao hơn (nếu có)

### Luồng Hoạt Động

```
1. Giáo viên/Trưởng bộ môn gọi API POST /thesis/thesis-rounds
   ↓
2. Đợt tiểu luận được lưu vào database
   ↓
3. Hệ thống tự động tạo request trong bảng thesis_round_requests
   ↓
4. Gửi thông báo real-time (Socket.IO) đến trưởng bộ môn
   ↓
5. Trưởng bộ môn nhận được thông báo và có thể phê duyệt/từ chối request
```

### Best Practices

1. **Luôn xử lý response**: Kiểm tra `response.success` trước khi xử lý dữ liệu
2. **Hiển thị thông báo phù hợp**: Thông báo cho user biết rằng request đã được gửi tự động
3. **Lắng nghe Socket events**: Implement Socket.IO listener để nhận thông báo real-time
4. **Xử lý lỗi gracefully**: Hiển thị thông báo lỗi rõ ràng cho user
5. **Refresh danh sách sau khi tạo**: Sau khi tạo thành công, có thể refresh danh sách đợt tiểu luận

---

## Related APIs

- `POST /thesis/request-open-round` - Gửi yêu cầu mở đợt thủ công (nếu cần)
- `GET /thesis/thesis-rounds` - Lấy danh sách đợt tiểu luận
- `GET /thesis/thesis-rounds/:id` - Lấy chi tiết đợt tiểu luận
- `PUT /thesis/thesis-rounds/:id` - Cập nhật đợt tiểu luận

---

**Tài liệu này được cập nhật lần cuối:** 2024-01-15

