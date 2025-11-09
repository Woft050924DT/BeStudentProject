# API Lưu Thông Tin Sinh Viên - Actor Student

## Base URL
```
http://localhost:3000
```

---

## 1. Lấy Thông Tin Sinh Viên

### Endpoint
```
GET /student/info
```

### Authentication
- **Required**: Yes
- **Type**: JWT Bearer Token
- **Role**: STUDENT

### Headers
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request
Không cần request body. Thông tin sinh viên được lấy từ JWT token.

### Response Success (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "studentCode": "student001",
    "academicStatus": "Active",
    "status": true,
    "cvFile": "/uploads/cv/student001.pdf",
    "admissionYear": 2020,
    "gpa": 3.5,
    "creditsEarned": 120,
    "user": {
      "id": 1,
      "fullName": "Trần Thị Sinh Viên",
      "email": "student001@university.edu",
      "phone": "0912345678",
      "gender": "Male",
      "dateOfBirth": "2000-01-01",
      "avatar": "/uploads/avatar/student001.jpg",
      "address": "123 Đường ABC, Quận XYZ"
    },
    "class": {
      "id": 1,
      "classCode": "K19",
      "className": "Lớp K19",
      "major": {
        "id": 1,
        "majorCode": "CNTT",
        "majorName": "Công nghệ thông tin",
        "department": {
          "id": 1,
          "departmentCode": "CNTT",
          "departmentName": "Khoa Công nghệ thông tin"
        }
      }
    }
  }
}
```

### Response Error (404 Not Found)
```json
{
  "statusCode": 404,
  "message": "Không tìm thấy thông tin sinh viên",
  "error": "Not Found"
}
```

---

## 2. Cập Nhật Thông Tin Sinh Viên

### Endpoint
```
PUT /student/info
```

### Authentication
- **Required**: Yes
- **Type**: JWT Bearer Token
- **Role**: STUDENT

### Headers
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request Body
Tất cả các trường đều **optional** (tùy chọn). Chỉ gửi các trường cần cập nhật.

```json
{
  "studentCode": "student001",           // Mã sinh viên (tối đa 20 ký tự)
  "academicStatus": "Active",            // Trạng thái: "Active", "On Leave", "Withdrawn"
  "fullName": "Trần Thị Sinh Viên",      // Tên sinh viên (tối đa 255 ký tự)
  "classId": 1,                          // ID lớp học (number)
  "dateOfBirth": "2000-01-01",          // Ngày sinh (format: YYYY-MM-DD)
  "gender": "Male",                     // Giới tính: "Male", "Female", "Other"
  "phone": "0912345678",                // Số điện thoại (tối đa 15 ký tự)
  "email": "student001@university.edu",  // Email (phải đúng format email)
  "cvFile": "/uploads/cv/student001.pdf" // Đường dẫn file CV
}
```

### Request Body Fields

| Field | Type | Required | Max Length | Description |
|-------|------|----------|------------|-------------|
| `studentCode` | string | No | 20 | Mã sinh viên |
| `academicStatus` | string | No | 50 | Trạng thái học tập |
| `fullName` | string | No | 255 | Tên đầy đủ |
| `classId` | number | No | - | ID lớp học |
| `dateOfBirth` | string | No | - | Ngày sinh (YYYY-MM-DD) |
| `gender` | string | No | - | Giới tính: "Male", "Female", "Other" |
| `phone` | string | No | 15 | Số điện thoại |
| `email` | string | No | 100 | Email (phải đúng format) |
| `cvFile` | string | No | - | Đường dẫn file CV |

### Response Success (200 OK)
```json
{
  "success": true,
  "message": "Cập nhật thông tin sinh viên thành công",
  "data": {
    "id": 1,
    "studentCode": "student001",
    "academicStatus": "Active",
    "status": true,
    "cvFile": "/uploads/cv/student001.pdf",
    "admissionYear": 2020,
    "gpa": 3.5,
    "creditsEarned": 120,
    "user": {
      "id": 1,
      "fullName": "Trần Thị Sinh Viên",
      "email": "student001@university.edu",
      "phone": "0912345678",
      "gender": "Male",
      "dateOfBirth": "2000-01-01",
      "avatar": "/uploads/avatar/student001.jpg",
      "address": "123 Đường ABC, Quận XYZ"
    },
    "class": {
      "id": 1,
      "classCode": "K19",
      "className": "Lớp K19",
      "major": {
        "id": 1,
        "majorCode": "CNTT",
        "majorName": "Công nghệ thông tin",
        "department": {
          "id": 1,
          "departmentCode": "CNTT",
          "departmentName": "Khoa Công nghệ thông tin"
        }
      }
    }
  }
}
```

### Response Errors

#### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Không tìm thấy thông tin người dùng",
  "error": "Bad Request"
}
```

#### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Không tìm thấy thông tin sinh viên",
  "error": "Not Found"
}
```

```json
{
  "statusCode": 404,
  "message": "Lớp không tồn tại",
  "error": "Not Found"
}
```

#### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Mã sinh viên đã tồn tại",
  "error": "Conflict"
}
```

```json
{
  "statusCode": 409,
  "message": "Email đã được sử dụng",
  "error": "Conflict"
}
```

---

## Ví Dụ Sử Dụng (JavaScript/TypeScript)

### 1. Lấy Thông Tin Sinh Viên

```typescript
// Sử dụng fetch API
const getStudentInfo = async (token: string) => {
  try {
    const response = await fetch('http://localhost:3000/student/info', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include' // Nếu dùng cookie
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Lỗi khi lấy thông tin sinh viên');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// Sử dụng axios
import axios from 'axios';

const getStudentInfo = async (token: string) => {
  try {
    const response = await axios.get('http://localhost:3000/student/info', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
```

### 2. Cập Nhật Thông Tin Sinh Viên

```typescript
// Sử dụng fetch API
const updateStudentInfo = async (token: string, studentData: {
  studentCode?: string;
  academicStatus?: string;
  fullName?: string;
  classId?: number;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other';
  phone?: string;
  email?: string;
  cvFile?: string;
}) => {
  try {
    const response = await fetch('http://localhost:3000/student/info', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(studentData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Lỗi khi cập nhật thông tin');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// Sử dụng axios
import axios from 'axios';

const updateStudentInfo = async (token: string, studentData: any) => {
  try {
    const response = await axios.put(
      'http://localhost:3000/student/info',
      studentData,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
```

### 3. Ví Dụ React Hook

```typescript
import { useState, useEffect } from 'react';
import axios from 'axios';

const useStudentInfo = (token: string) => {
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentInfo = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3000/student/info', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          withCredentials: true
        });
        setStudentInfo(response.data.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Lỗi khi lấy thông tin');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchStudentInfo();
    }
  }, [token]);

  const updateStudentInfo = async (updateData: any) => {
    try {
      setLoading(true);
      const response = await axios.put(
        'http://localhost:3000/student/info',
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          withCredentials: true
        }
      );
      setStudentInfo(response.data.data);
      setError(null);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Lỗi khi cập nhật thông tin';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { studentInfo, loading, error, updateStudentInfo };
};

export default useStudentInfo;
```

### 4. Ví Dụ Form Submit (React)

```typescript
import { useState } from 'react';
import axios from 'axios';

const StudentInfoForm = ({ token }: { token: string }) => {
  const [formData, setFormData] = useState({
    studentCode: '',
    fullName: '',
    classId: '',
    dateOfBirth: '',
    gender: 'Male',
    phone: '',
    email: '',
    academicStatus: 'Active',
    cvFile: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Chỉ gửi các trường có giá trị
      const updateData: any = {};
      if (formData.studentCode) updateData.studentCode = formData.studentCode;
      if (formData.fullName) updateData.fullName = formData.fullName;
      if (formData.classId) updateData.classId = Number(formData.classId);
      if (formData.dateOfBirth) updateData.dateOfBirth = formData.dateOfBirth;
      if (formData.gender) updateData.gender = formData.gender;
      if (formData.phone) updateData.phone = formData.phone;
      if (formData.email) updateData.email = formData.email;
      if (formData.academicStatus) updateData.academicStatus = formData.academicStatus;
      if (formData.cvFile) updateData.cvFile = formData.cvFile;

      const response = await axios.put(
        'http://localhost:3000/student/info',
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      setMessage('Cập nhật thông tin thành công!');
      console.log('Updated data:', response.data);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Lỗi khi cập nhật thông tin';
      setMessage(errorMessage);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={loading}>
        {loading ? 'Đang lưu...' : 'Lưu thông tin'}
      </button>
      {message && <div>{message}</div>}
    </form>
  );
};
```

---

## Lưu Ý Quan Trọng

1. **Authentication**: Tất cả requests phải có JWT token trong header `Authorization`
2. **Role**: Chỉ user có role `STUDENT` mới có thể truy cập
3. **Optional Fields**: Tất cả fields trong request body đều optional, chỉ gửi các trường cần cập nhật
4. **Date Format**: `dateOfBirth` phải theo format `YYYY-MM-DD` (ví dụ: "2000-01-01")
5. **Gender**: Chỉ chấp nhận: "Male", "Female", "Other"
6. **Email Validation**: Email phải đúng format email
7. **Unique Fields**: `studentCode` và `email` phải unique trong hệ thống
8. **Class Validation**: `classId` phải tồn tại trong database

---

## Error Handling

Tất cả các lỗi đều trả về format chuẩn của NestJS:

```json
{
  "statusCode": 400,
  "message": "Thông báo lỗi cụ thể",
  "error": "Error Type"
}
```

Frontend nên xử lý các status code:
- `200`: Success
- `400`: Bad Request (dữ liệu không hợp lệ)
- `401`: Unauthorized (chưa đăng nhập hoặc token hết hạn)
- `403`: Forbidden (không có quyền truy cập)
- `404`: Not Found (không tìm thấy dữ liệu)
- `409`: Conflict (dữ liệu trùng lặp)
- `500`: Internal Server Error (lỗi server)

