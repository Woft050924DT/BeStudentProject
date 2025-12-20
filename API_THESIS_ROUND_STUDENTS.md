# API Quản Lý Học Sinh Trong Đợt Tiểu Luận

## Base URL
```
http://localhost:3000
```

---

## Mục lục
1. [Thêm một học sinh vào đợt tiểu luận](#1-thêm-một-học-sinh-vào-đợt-tiểu-luận)
2. [Thêm nhiều học sinh vào đợt tiểu luận (Bulk)](#2-thêm-nhiều-học-sinh-vào-đợt-tiểu-luận-bulk)
3. [Lấy danh sách học sinh trong đợt tiểu luận](#3-lấy-danh-sách-học-sinh-trong-đợt-tiểu-luận)
4. [Xóa học sinh khỏi đợt tiểu luận](#4-xóa-học-sinh-khỏi-đợt-tiểu-luận)

---

## 1. Thêm Một Học Sinh Vào Đợt Tiểu Luận

### Endpoint
```
POST /thesis/thesis-rounds/:roundId/students
```

### Mô tả
Thêm một học sinh vào đợt tiểu luận. Giáo viên và trưởng bộ môn có thể thêm học sinh vào đợt tiểu luận của bộ môn mình. Học sinh phải thuộc lớp đã được thêm vào đợt hoặc thuộc bộ môn của đợt.

### Authentication
- **Required**: Yes
- **Type**: JWT Bearer Token
- **Role**: TEACHER, HEAD_OF_DEPARTMENT

### Headers
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `roundId` | number | Yes | ID của đợt tiểu luận |

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `studentId` | number | Yes | ID của học sinh cần thêm |
| `eligible` | boolean | No | Đủ điều kiện tham gia (mặc định: true) |
| `notes` | string | No | Ghi chú về học sinh |

### Request Example
```json
{
  "studentId": 10,
  "eligible": true,
  "notes": "Học sinh có thành tích tốt"
}
```

### Response Success (200 OK)
```json
{
  "success": true,
  "message": "Thêm học sinh vào đợt đề tài thành công",
  "data": {
    "thesisRoundId": 1,
    "student": {
      "id": 10,
      "studentCode": "SV001",
      "fullName": "Nguyễn Văn A",
      "email": "nguyenvana@example.com",
      "class": {
        "id": 5,
        "classCode": "K19-CNTT",
        "className": "Lớp K19 Công nghệ thông tin"
      },
      "eligible": true,
      "notes": "Học sinh có thành tích tốt"
    }
  }
}
```

### Response Error

#### 400 Bad Request - Học sinh không thuộc bộ môn
```json
{
  "statusCode": 400,
  "message": "Học sinh không thuộc bộ môn của đợt đề tài này",
  "error": "Bad Request"
}
```

#### 404 Not Found - Học sinh không tồn tại
```json
{
  "statusCode": 404,
  "message": "Học sinh không tồn tại",
  "error": "Not Found"
}
```

#### 404 Not Found - Đợt tiểu luận không tồn tại
```json
{
  "statusCode": 404,
  "message": "Đợt luận văn không tồn tại",
  "error": "Not Found"
}
```

#### 409 Conflict - Học sinh đã được thêm
```json
{
  "statusCode": 409,
  "message": "Học sinh đã được thêm vào đợt này rồi",
  "error": "Conflict"
}
```

#### 403 Forbidden - Không có quyền
```json
{
  "statusCode": 403,
  "message": "Bạn chỉ có thể quản lý đợt đề tài của bộ môn mình",
  "error": "Forbidden"
}
```

---

## 2. Thêm Nhiều Học Sinh Vào Đợt Tiểu Luận (Bulk)

### Endpoint
```
POST /thesis/thesis-rounds/:roundId/students/bulk
```

### Mô tả
Thêm nhiều học sinh vào đợt tiểu luận cùng một lúc. API này sẽ xử lý từng học sinh và trả về kết quả cho mỗi học sinh.

### Authentication
- **Required**: Yes
- **Type**: JWT Bearer Token
- **Role**: TEACHER, HEAD_OF_DEPARTMENT

### Headers
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `roundId` | number | Yes | ID của đợt tiểu luận |

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `students` | array | Yes | Danh sách học sinh cần thêm |

Mỗi phần tử trong mảng `students`:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `studentId` | number | Yes | ID của học sinh |
| `eligible` | boolean | No | Đủ điều kiện tham gia (mặc định: true) |
| `notes` | string | No | Ghi chú về học sinh |

### Request Example
```json
{
  "students": [
    {
      "studentId": 10,
      "eligible": true,
      "notes": "Học sinh có thành tích tốt"
    },
    {
      "studentId": 11,
      "eligible": true
    },
    {
      "studentId": 12,
      "eligible": false,
      "notes": "Cần theo dõi thêm"
    }
  ]
}
```

### Response Success (200 OK)
```json
{
  "success": true,
  "message": "Đã thêm 2 học sinh thành công, 1 học sinh thất bại",
  "data": {
    "thesisRoundId": 1,
    "students": [
      {
        "thesisRoundId": 1,
        "student": {
          "id": 10,
          "studentCode": "SV001",
          "fullName": "Nguyễn Văn A",
          "email": "nguyenvana@example.com",
          "class": {
            "id": 5,
            "classCode": "K19-CNTT",
            "className": "Lớp K19 Công nghệ thông tin"
          },
          "eligible": true,
          "notes": "Học sinh có thành tích tốt"
        }
      },
      {
        "thesisRoundId": 1,
        "student": {
          "id": 11,
          "studentCode": "SV002",
          "fullName": "Trần Thị B",
          "email": "tranthib@example.com",
          "class": {
            "id": 5,
            "classCode": "K19-CNTT",
            "className": "Lớp K19 Công nghệ thông tin"
          },
          "eligible": true,
          "notes": null
        }
      }
    ],
    "errors": [
      {
        "studentId": 12,
        "error": "Học sinh đã được thêm vào đợt này rồi"
      }
    ]
  },
  "totalSuccess": 2,
  "totalErrors": 1
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Trạng thái thành công |
| `message` | string | Thông báo kết quả |
| `data` | object | Dữ liệu kết quả |
| `data.thesisRoundId` | number | ID đợt tiểu luận |
| `data.students` | array | Danh sách học sinh đã thêm thành công |
| `data.errors` | array | Danh sách lỗi (nếu có) |
| `data.errors[].studentId` | number | ID học sinh gặp lỗi |
| `data.errors[].error` | string | Thông báo lỗi |
| `totalSuccess` | number | Tổng số học sinh thêm thành công |
| `totalErrors` | number | Tổng số học sinh thất bại |

---

## 3. Lấy Danh Sách Học Sinh Trong Đợt Tiểu Luận

### Endpoint
```
GET /thesis/thesis-rounds/:roundId/students
```

### Mô tả
Lấy danh sách tất cả học sinh đã được thêm vào đợt tiểu luận. API này không yêu cầu authentication.

### Authentication
- **Required**: No (Public endpoint)

### Headers
```http
Content-Type: application/json
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `roundId` | number | Yes | ID của đợt tiểu luận |

### Request Example

```bash
GET /thesis/thesis-rounds/1/students
```

### Response Success (200 OK)
```json
{
  "success": true,
  "data": {
    "thesisRound": {
      "id": 1,
      "roundCode": "TL2024-1",
      "roundName": "Đợt tiểu luận học kỳ 1 năm 2024"
    },
    "students": [
      {
        "id": 1,
        "student": {
          "id": 10,
          "studentCode": "SV001",
          "fullName": "Nguyễn Văn A",
          "email": "nguyenvana@example.com",
          "phone": "0912345678",
          "gpa": 3.5,
          "academicStatus": "Active",
          "class": {
            "id": 5,
            "classCode": "K19-CNTT",
            "className": "Lớp K19 Công nghệ thông tin",
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
          }
        },
        "eligible": true,
        "notes": "Học sinh có thành tích tốt",
        "addedAt": "2024-01-15T10:30:00.000Z"
      },
      {
        "id": 2,
        "student": {
          "id": 11,
          "studentCode": "SV002",
          "fullName": "Trần Thị B",
          "email": "tranthib@example.com",
          "phone": "0912345679",
          "gpa": 3.8,
          "academicStatus": "Active",
          "class": {
            "id": 5,
            "classCode": "K19-CNTT",
            "className": "Lớp K19 Công nghệ thông tin",
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
          }
        },
        "eligible": true,
        "notes": null,
        "addedAt": "2024-01-15T11:00:00.000Z"
      }
    ],
    "total": 2
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Trạng thái thành công |
| `data` | object | Dữ liệu kết quả |
| `data.thesisRound` | object | Thông tin đợt tiểu luận |
| `data.thesisRound.id` | number | ID đợt tiểu luận |
| `data.thesisRound.roundCode` | string | Mã đợt |
| `data.thesisRound.roundName` | string | Tên đợt |
| `data.students` | array | Danh sách học sinh |
| `data.students[].id` | number | ID record trong bảng student_thesis_rounds |
| `data.students[].student` | object | Thông tin học sinh |
| `data.students[].student.id` | number | ID học sinh |
| `data.students[].student.studentCode` | string | Mã sinh viên |
| `data.students[].student.fullName` | string\|null | Họ và tên |
| `data.students[].student.email` | string\|null | Email |
| `data.students[].student.phone` | string\|null | Số điện thoại |
| `data.students[].student.gpa` | number\|null | Điểm trung bình |
| `data.students[].student.academicStatus` | string | Trạng thái học tập |
| `data.students[].student.class` | object\|null | Thông tin lớp |
| `data.students[].student.class.major` | object\|null | Thông tin chuyên ngành |
| `data.students[].student.class.major.department` | object\|null | Thông tin bộ môn |
| `data.students[].eligible` | boolean | Đủ điều kiện tham gia |
| `data.students[].notes` | string\|null | Ghi chú |
| `data.students[].addedAt` | string | Ngày thêm vào đợt (ISO 8601) |
| `data.total` | number | Tổng số học sinh |

---

## 4. Xóa Học Sinh Khỏi Đợt Tiểu Luận

### Endpoint
```
DELETE /thesis/thesis-rounds/:roundId/students/:studentId
```

### Mô tả
Xóa một học sinh khỏi đợt tiểu luận. Giáo viên và trưởng bộ môn có thể xóa học sinh khỏi đợt tiểu luận của bộ môn mình.

### Authentication
- **Required**: Yes
- **Type**: JWT Bearer Token
- **Role**: TEACHER, HEAD_OF_DEPARTMENT

### Headers
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `roundId` | number | Yes | ID của đợt tiểu luận |
| `studentId` | number | Yes | ID của học sinh cần xóa |

### Request Example

```bash
DELETE /thesis/thesis-rounds/1/students/10
```

### Response Success (200 OK)
```json
{
  "success": true,
  "message": "Xóa học sinh khỏi đợt đề tài thành công"
}
```

### Response Error

#### 404 Not Found - Học sinh không tồn tại trong đợt
```json
{
  "statusCode": 404,
  "message": "Học sinh không tồn tại trong đợt đề tài này",
  "error": "Not Found"
}
```

#### 403 Forbidden - Không có quyền
```json
{
  "statusCode": 403,
  "message": "Bạn chỉ có thể quản lý đợt đề tài của bộ môn mình",
  "error": "Forbidden"
}
```

---

## Frontend Integration

### TypeScript Interfaces

```typescript
// Request Interfaces
interface AddStudentToRoundRequest {
  studentId: number;
  eligible?: boolean;
  notes?: string;
}

interface AddMultipleStudentsToRoundRequest {
  students: AddStudentToRoundRequest[];
}

// Response Interfaces
interface StudentInfo {
  id: number;
  studentCode: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  gpa: number | null;
  academicStatus: string;
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
      } | null;
    } | null;
  } | null;
}

interface AddStudentToRoundResponse {
  success: boolean;
  message: string;
  data: {
    thesisRoundId: number;
    student: StudentInfo & {
      eligible: boolean;
      notes: string | null;
    };
  };
}

interface GetStudentsInRoundResponse {
  success: boolean;
  data: {
    thesisRound: {
      id: number;
      roundCode: string;
      roundName: string;
    };
    students: Array<{
      id: number;
      student: StudentInfo;
      eligible: boolean;
      notes: string | null;
      addedAt: string;
    }>;
    total: number;
  };
}

interface RemoveStudentFromRoundResponse {
  success: boolean;
  message: string;
}
```

### API Call Functions

```typescript
// Thêm một học sinh vào đợt tiểu luận
async function addStudentToRound(
  roundId: number,
  studentId: number,
  eligible: boolean = true,
  notes?: string
): Promise<AddStudentToRoundResponse> {
  const response = await fetch(`/api/thesis/thesis-rounds/${roundId}/students`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ studentId, eligible, notes })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to add student to round');
  }
  
  return response.json();
}

// Thêm nhiều học sinh vào đợt tiểu luận
async function addMultipleStudentsToRound(
  roundId: number,
  students: AddStudentToRoundRequest[]
): Promise<any> {
  const response = await fetch(`/api/thesis/thesis-rounds/${roundId}/students/bulk`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ students })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to add students to round');
  }
  
  return response.json();
}

// Lấy danh sách học sinh trong đợt tiểu luận
async function getStudentsInRound(roundId: number): Promise<GetStudentsInRoundResponse> {
  const response = await fetch(`/api/thesis/thesis-rounds/${roundId}/students`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch students');
  }
  
  return response.json();
}

// Xóa học sinh khỏi đợt tiểu luận
async function removeStudentFromRound(
  roundId: number,
  studentId: number
): Promise<RemoveStudentFromRoundResponse> {
  const response = await fetch(`/api/thesis/thesis-rounds/${roundId}/students/${studentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to remove student from round');
  }
  
  return response.json();
}
```

### Usage Examples

#### React Component Example:
```typescript
import { useState, useEffect } from 'react';

function ThesisRoundStudents({ roundId }: { roundId: number }) {
  const [students, setStudents] = useState<any[]>([]);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadStudents();
    loadAvailableStudents();
  }, [roundId]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const result = await getStudentsInRound(roundId);
      if (result.success) {
        setStudents(result.data.students);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableStudents = async () => {
    // Load students from classes in the round or from department
    // This would be a separate API call
  };

  const handleSelectStudent = (studentId: number) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleAddStudents = async () => {
    if (selectedStudents.length === 0) return;
    
    try {
      const studentsToAdd = selectedStudents.map(id => ({ studentId: id }));
      await addMultipleStudentsToRound(roundId, studentsToAdd);
      showNotification(`Đã thêm ${selectedStudents.length} học sinh thành công`, 'success');
      loadStudents();
      setSelectedStudents([]);
    } catch (error) {
      showNotification(error.message || 'Thêm học sinh thất bại', 'error');
    }
  };

  const handleRemoveStudent = async (studentId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa học sinh này?')) return;
    
    try {
      await removeStudentFromRound(roundId, studentId);
      showNotification('Xóa học sinh thành công', 'success');
      loadStudents();
    } catch (error) {
      showNotification(error.message || 'Xóa học sinh thất bại', 'error');
    }
  };

  const filteredStudents = availableStudents.filter(student =>
    student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="thesis-round-students">
      <div className="two-panel-layout">
        {/* Left Panel - Available Students */}
        <div className="left-panel">
          <h3>Danh sách học sinh</h3>
          <input
            type="text"
            placeholder="Tìm kiếm học sinh..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="student-list">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className={`student-item ${selectedStudents.includes(student.id) ? 'selected' : ''}`}
                onClick={() => handleSelectStudent(student.id)}
              >
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(student.id)}
                  onChange={() => handleSelectStudent(student.id)}
                />
                <span>{student.fullName || student.studentCode}</span>
              </div>
            ))}
          </div>
          <button 
            onClick={handleAddStudents}
            disabled={selectedStudents.length === 0}
          >
            + Thêm ({selectedStudents.length})
          </button>
        </div>

        {/* Right Panel - Added Students */}
        <div className="right-panel">
          <h3>Đã thêm ({students.length})</h3>
          {students.length === 0 ? (
            <p>Chưa thêm học sinh nào</p>
          ) : (
            <div className="added-students-list">
              {students.map((item) => (
                <div key={item.id} className="added-student-item">
                  <div>
                    <strong>{item.student.fullName || item.student.studentCode}</strong>
                    <span className="student-code">{item.student.studentCode}</span>
                  </div>
                  <button onClick={() => handleRemoveStudent(item.student.id)}>
                    Xóa
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## Lưu ý

1. **Quyền truy cập**: 
   - API thêm/xóa học sinh yêu cầu role `TEACHER` hoặc `HEAD_OF_DEPARTMENT`
   - API lấy danh sách học sinh là public, không cần authentication
   - Giáo viên chỉ có thể quản lý học sinh trong đợt tiểu luận của bộ môn mình

2. **Kiểm tra bộ môn**: 
   - Hệ thống tự động kiểm tra học sinh có thuộc bộ môn của đợt tiểu luận không (thông qua lớp)
   - Nếu học sinh không thuộc bộ môn, sẽ trả về lỗi 400 Bad Request

3. **Trùng lặp**: 
   - Mỗi học sinh chỉ có thể được thêm vào một đợt tiểu luận một lần
   - Nếu cố gắng thêm lại, sẽ trả về lỗi 409 Conflict

4. **Bulk operation**: 
   - Khi thêm nhiều học sinh, API sẽ xử lý từng học sinh độc lập
   - Một số học sinh có thể thành công, một số có thể thất bại
   - Response sẽ bao gồm cả kết quả thành công và lỗi

5. **Eligible flag**: 
   - Trường `eligible` cho phép đánh dấu học sinh có đủ điều kiện tham gia hay không
   - Có thể sử dụng để quản lý học sinh cần theo dõi đặc biệt

---

## Ví dụ sử dụng với cURL

### Thêm một học sinh:
```bash
curl -X POST "http://localhost:3000/thesis/thesis-rounds/1/students" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"studentId": 10, "eligible": true, "notes": "Học sinh có thành tích tốt"}'
```

### Thêm nhiều học sinh:
```bash
curl -X POST "http://localhost:3000/thesis/thesis-rounds/1/students/bulk" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"students": [{"studentId": 10}, {"studentId": 11}]}'
```

### Lấy danh sách học sinh:
```bash
curl -X GET "http://localhost:3000/thesis/thesis-rounds/1/students"
```

### Xóa học sinh:
```bash
curl -X DELETE "http://localhost:3000/thesis/thesis-rounds/1/students/10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

**Tài liệu này được cập nhật lần cuối:** 2024-01-15
