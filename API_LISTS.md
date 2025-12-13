# API Lấy Danh Sách - Giáo Viên, Học Sinh, Lớp Học

## Base URL
```
http://localhost:3000
```

---

## Mục lục
1. [Lấy danh sách giáo viên](#1-lấy-danh-sách-giáo-viên)
2. [Lấy danh sách học sinh](#2-lấy-danh-sách-học-sinh)
3. [Lấy danh sách lớp học](#3-lấy-danh-sách-lớp-học)

---

## 1. Lấy danh sách giáo viên

### Endpoint
```
GET /instructors
```

### Mô tả
Lấy danh sách tất cả giáo viên (instructors) trong hệ thống.

### Authentication
- **Required**: No (Public endpoint)

### Headers
```http
Content-Type: application/json
```

### Request Example

```bash
GET /instructors
```

### Response Success (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "instructorCode": "GV001",
      "fullName": "Nguyễn Văn A",
      "email": "nguyenvana@example.com",
      "phone": "0912345678",
      "degree": "Thạc sĩ",
      "academicTitle": "Giảng viên",
      "specialization": "Công nghệ thông tin",
      "yearsOfExperience": 10,
      "department": {
        "id": 1,
        "departmentCode": "CNTT",
        "departmentName": "Công nghệ thông tin"
      },
      "status": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "instructorCode": "GV002",
      "fullName": "Trần Thị B",
      "email": "tranthib@example.com",
      "phone": "0912345679",
      "degree": "Tiến sĩ",
      "academicTitle": "Phó Giáo sư",
      "specialization": "Khoa học máy tính",
      "yearsOfExperience": 15,
      "department": {
        "id": 1,
        "departmentCode": "CNTT",
        "departmentName": "Công nghệ thông tin"
      },
      "status": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 2
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Trạng thái thành công |
| `data` | array | Danh sách giáo viên |
| `data[].id` | number | ID giáo viên |
| `data[].instructorCode` | string | Mã giảng viên |
| `data[].fullName` | string | Họ và tên |
| `data[].email` | string | Email |
| `data[].phone` | string | Số điện thoại |
| `data[].degree` | string | Học vị (Thạc sĩ, Tiến sĩ) |
| `data[].academicTitle` | string | Chức danh (Giảng viên, Phó Giáo sư, Giáo sư) |
| `data[].specialization` | string | Chuyên ngành |
| `data[].yearsOfExperience` | number | Số năm kinh nghiệm |
| `data[].department` | object | Thông tin bộ môn |
| `data[].department.id` | number | ID bộ môn |
| `data[].department.departmentCode` | string | Mã bộ môn |
| `data[].department.departmentName` | string | Tên bộ môn |
| `data[].status` | boolean | Trạng thái hoạt động |
| `data[].createdAt` | string | Ngày tạo |
| `data[].updatedAt` | string | Ngày cập nhật |
| `total` | number | Tổng số giáo viên |

---

## 2. Lấy danh sách học sinh

### Endpoint
```
GET /students
```

### Mô tả
Lấy danh sách tất cả học sinh (students) trong hệ thống.

### Authentication
- **Required**: No (Public endpoint)

### Headers
```http
Content-Type: application/json
```

### Request Example

```bash
GET /students
```

### Response Success (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "studentCode": "SV001",
      "fullName": "Lê Văn C",
      "email": "levanc@example.com",
      "phone": "0912345680",
      "gender": "Nam",
      "dateOfBirth": "2000-01-15T00:00:00.000Z",
      "avatar": "/uploads/avatar/sv001.jpg",
      "admissionYear": 2020,
      "gpa": 3.5,
      "creditsEarned": 120,
      "academicStatus": "Active",
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
            "departmentName": "Công nghệ thông tin"
          }
        }
      },
      "status": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "studentCode": "SV002",
      "fullName": "Phạm Thị D",
      "email": "phamthid@example.com",
      "phone": "0912345681",
      "gender": "Nữ",
      "dateOfBirth": "2000-02-20T00:00:00.000Z",
      "avatar": "/uploads/avatar/sv002.jpg",
      "admissionYear": 2020,
      "gpa": 3.8,
      "creditsEarned": 125,
      "academicStatus": "Active",
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
            "departmentName": "Công nghệ thông tin"
          }
        }
      },
      "status": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 2
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Trạng thái thành công |
| `data` | array | Danh sách học sinh |
| `data[].id` | number | ID học sinh |
| `data[].studentCode` | string | Mã sinh viên |
| `data[].fullName` | string | Họ và tên |
| `data[].email` | string | Email |
| `data[].phone` | string | Số điện thoại |
| `data[].gender` | string | Giới tính |
| `data[].dateOfBirth` | string | Ngày sinh |
| `data[].avatar` | string | Đường dẫn ảnh đại diện |
| `data[].admissionYear` | number | Năm nhập học |
| `data[].gpa` | number | Điểm trung bình |
| `data[].creditsEarned` | number | Số tín chỉ đã tích lũy |
| `data[].academicStatus` | string | Trạng thái học tập (Active, On Leave, Withdrawn) |
| `data[].class` | object | Thông tin lớp học |
| `data[].class.id` | number | ID lớp |
| `data[].class.classCode` | string | Mã lớp |
| `data[].class.className` | string | Tên lớp |
| `data[].class.major` | object | Thông tin chuyên ngành |
| `data[].class.major.id` | number | ID chuyên ngành |
| `data[].class.major.majorCode` | string | Mã chuyên ngành |
| `data[].class.major.majorName` | string | Tên chuyên ngành |
| `data[].class.major.department` | object | Thông tin bộ môn |
| `data[].class.major.department.id` | number | ID bộ môn |
| `data[].class.major.department.departmentCode` | string | Mã bộ môn |
| `data[].class.major.department.departmentName` | string | Tên bộ môn |
| `data[].status` | boolean | Trạng thái hoạt động |
| `data[].createdAt` | string | Ngày tạo |
| `data[].updatedAt` | string | Ngày cập nhật |
| `total` | number | Tổng số học sinh |

---

## 3. Lấy danh sách lớp học

### Endpoint
```
GET /classes
```

### Mô tả
Lấy danh sách tất cả lớp học trong hệ thống.

### Authentication
- **Required**: No (Public endpoint)

### Headers
```http
Content-Type: application/json
```

### Request Example

```bash
GET /classes
```

### Response Success (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "classCode": "K19",
      "className": "Lớp K19 - Công nghệ thông tin",
      "academicYear": "K19",
      "studentCount": 45,
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
            "facultyCode": "CNTT",
            "facultyName": "Khoa Công nghệ thông tin"
          }
        }
      },
      "advisor": {
        "id": 1,
        "instructorCode": "GV001",
        "fullName": "Nguyễn Văn A"
      },
      "status": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "classCode": "K20",
      "className": "Lớp K20 - Công nghệ thông tin",
      "academicYear": "K20",
      "studentCount": 50,
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
            "facultyCode": "CNTT",
            "facultyName": "Khoa Công nghệ thông tin"
          }
        }
      },
      "advisor": {
        "id": 1,
        "instructorCode": "GV001",
        "fullName": "Nguyễn Văn A"
      },
      "status": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 2
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Trạng thái thành công |
| `data` | array | Danh sách lớp học |
| `data[].id` | number | ID lớp học |
| `data[].classCode` | string | Mã lớp |
| `data[].className` | string | Tên lớp |
| `data[].academicYear` | string | Khóa học (VD: K19, K20) |
| `data[].studentCount` | number | Số lượng học sinh |
| `data[].major` | object | Thông tin chuyên ngành |
| `data[].major.id` | number | ID chuyên ngành |
| `data[].major.majorCode` | string | Mã chuyên ngành |
| `data[].major.majorName` | string | Tên chuyên ngành |
| `data[].major.department` | object | Thông tin bộ môn |
| `data[].major.department.id` | number | ID bộ môn |
| `data[].major.department.departmentCode` | string | Mã bộ môn |
| `data[].major.department.departmentName` | string | Tên bộ môn |
| `data[].major.department.faculty` | object | Thông tin khoa |
| `data[].major.department.faculty.id` | number | ID khoa |
| `data[].major.department.faculty.facultyCode` | string | Mã khoa |
| `data[].major.department.faculty.facultyName` | string | Tên khoa |
| `data[].advisor` | object | Thông tin giáo viên cố vấn |
| `data[].advisor.id` | number | ID giáo viên |
| `data[].advisor.instructorCode` | string | Mã giảng viên |
| `data[].advisor.fullName` | string | Họ và tên giáo viên |
| `data[].status` | boolean | Trạng thái hoạt động |
| `data[].createdAt` | string | Ngày tạo |
| `data[].updatedAt` | string | Ngày cập nhật |
| `total` | number | Tổng số lớp học |


---

## Lưu ý chung

- Tất cả các API này là **public endpoints**, không yêu cầu authentication
- Tất cả các API đều trả về format chuẩn với `success`, `data`, và `total`
- Các trường có thể là `null` nếu không có dữ liệu
- Tất cả các ngày tháng được trả về theo định dạng ISO 8601

---

## Error Handling

Tất cả các API đều có thể trả về các lỗi sau:

- **400 Bad Request**: Dữ liệu không hợp lệ (ví dụ: ID không phải số)
- **404 Not Found**: Tài nguyên không tồn tại (ví dụ: giáo viên không tồn tại)
- **500 Internal Server Error**: Lỗi server

---

## Ví dụ sử dụng với cURL

### Lấy danh sách giáo viên:
```bash
curl -X GET http://localhost:3000/instructors
```

### Lấy danh sách học sinh:
```bash
curl -X GET http://localhost:3000/students
```

### Lấy danh sách lớp học:
```bash
curl -X GET http://localhost:3000/classes
```

---

## Ví dụ sử dụng với JavaScript (Fetch API)

### Lấy danh sách giáo viên:
```javascript
fetch('http://localhost:3000/instructors')
  .then(response => response.json())
  .then(data => {
    console.log('Danh sách giáo viên:', data.data);
    console.log('Tổng số:', data.total);
  })
  .catch(error => console.error('Error:', error));
```

### Lấy danh sách học sinh:
```javascript
fetch('http://localhost:3000/students')
  .then(response => response.json())
  .then(data => {
    console.log('Danh sách học sinh:', data.data);
    console.log('Tổng số:', data.total);
  })
  .catch(error => console.error('Error:', error));
```

### Lấy danh sách lớp học:
```javascript
fetch('http://localhost:3000/classes')
  .then(response => response.json())
  .then(data => {
    console.log('Danh sách lớp học:', data.data);
    console.log('Tổng số lớp:', data.total);
  })
  .catch(error => console.error('Error:', error));
```

---

**Tài liệu này được cập nhật lần cuối:** 2024-01-15
