# API Lấy Thông Tin Cá Nhân Trưởng Bộ Môn

## Base URL
```
http://localhost:3000
```

---

## Mô Tả

API này cho phép trưởng bộ môn lấy thông tin cá nhân của mình, bao gồm thông tin giảng viên và thông tin bộ môn đang quản lý.

### Quyền Truy Cập
- **Role Required**: `HEAD_OF_DEPARTMENT` (Trưởng bộ môn)
- **Authentication**: JWT Bearer Token

---

## Endpoint

### Lấy Thông Tin Cá Nhân Trưởng Bộ Môn

**URL**: `/thesis/head/profile`

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

Không có query parameters.

### Request Body

Không có request body.

---

## Response

### Success Response (200 OK)

**Response Structure:**

```typescript
interface DepartmentHeadProfile {
  instructorCode: string;           // Mã giảng viên
  fullName: string;                 // Họ và tên
  email: string;                    // Email
  phone?: string;                   // Số điện thoại (optional)
  academicTitle?: string;           // Chức danh (VD: Phó Giáo Sư, Giảng viên chính)
  degree?: string;                  // Học vị (VD: Tiến sĩ, Thạc sĩ)
  specialization?: string;          // Chuyên môn
  yearsOfExperience: number;        // Số năm kinh nghiệm
  department: {
    id: number;                     // ID bộ môn
    departmentCode: string;         // Mã bộ môn
    departmentName: string;         // Tên bộ môn
    faculty?: {
      id: number;                   // ID khoa
      facultyCode: string;          // Mã khoa
      facultyName: string;          // Tên khoa
    };
  };
}
```

**Example Response:**

```json
{
  "instructorCode": "GV001",
  "fullName": "Nguyễn Văn A",
  "email": "nguyenvana@university.edu.vn",
  "phone": "0123456789",
  "academicTitle": "Phó Giáo Sư",
  "degree": "Tiến sĩ",
  "specialization": "Công nghệ thông tin, Trí tuệ nhân tạo",
  "yearsOfExperience": 15,
  "department": {
    "id": 1,
    "departmentCode": "CNTT",
    "departmentName": "Bộ môn Công nghệ thông tin",
    "faculty": {
      "id": 1,
      "facultyCode": "CNTT",
      "facultyName": "Khoa Công nghệ thông tin"
    }
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
  "message": "Bạn không phải là trưởng bộ môn"
}
```

#### 404 Not Found
**Condition**: Không tìm thấy thông tin giảng viên

```json
{
  "statusCode": 404,
  "message": "Không tìm thấy thông tin giảng viên"
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

---

## Frontend Implementation

### TypeScript/JavaScript

#### 1. Interface Definition

```typescript
// types/department-head.ts
export interface DepartmentHeadProfile {
  instructorCode: string;
  fullName: string;
  email: string;
  phone?: string;
  academicTitle?: string;
  degree?: string;
  specialization?: string;
  yearsOfExperience: number;
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
}
```

#### 2. API Service Function (Axios)

```typescript
// services/departmentHeadService.ts
import axios from 'axios';
import type { DepartmentHeadProfile } from '../types/department-head';

const API_BASE_URL = 'http://localhost:3000';

// Helper function để lấy token
function getToken(): string {
  return localStorage.getItem('access_token') || '';
}

// Lấy thông tin cá nhân trưởng bộ môn
export async function getDepartmentHeadProfile(): Promise<DepartmentHeadProfile> {
  try {
    const response = await axios.get<DepartmentHeadProfile>(
      `${API_BASE_URL}/thesis/head/profile`,
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
      throw new Error(error.response?.data?.message || 'Không thể lấy thông tin cá nhân');
    }
    throw error;
  }
}
```

#### 3. API Service Function (Fetch)

```typescript
// services/departmentHeadService.ts
import type { DepartmentHeadProfile } from '../types/department-head';

const API_BASE_URL = 'http://localhost:3000';

// Helper function để lấy token
function getToken(): string {
  return localStorage.getItem('access_token') || '';
}

// Lấy thông tin cá nhân trưởng bộ môn
export async function getDepartmentHeadProfile(): Promise<DepartmentHeadProfile> {
  const response = await fetch(`${API_BASE_URL}/thesis/head/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Không thể lấy thông tin cá nhân');
  }

  return response.json();
}
```

#### 4. React Component Example

```typescript
// components/DepartmentHeadProfile.tsx
import React, { useEffect, useState } from 'react';
import { getDepartmentHeadProfile } from '../services/departmentHeadService';
import type { DepartmentHeadProfile } from '../types/department-head';

export const DepartmentHeadProfileComponent: React.FC = () => {
  const [profile, setProfile] = useState<DepartmentHeadProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDepartmentHeadProfile();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Đang tải thông tin...</div>;
  }

  if (error) {
    return <div className="error">Lỗi: {error}</div>;
  }

  if (!profile) {
    return <div>Không có thông tin</div>;
  }

  return (
    <div className="profile-container">
      <h2>Thông Tin Cá Nhân</h2>
      
      <div className="profile-section">
        <h3>Thông Tin Giảng Viên</h3>
        <div className="profile-item">
          <label>Mã giảng viên:</label>
          <span>{profile.instructorCode}</span>
        </div>
        <div className="profile-item">
          <label>Họ và tên:</label>
          <span>{profile.fullName}</span>
        </div>
        <div className="profile-item">
          <label>Email:</label>
          <span>{profile.email}</span>
        </div>
        {profile.phone && (
          <div className="profile-item">
            <label>Số điện thoại:</label>
            <span>{profile.phone}</span>
          </div>
        )}
        {profile.academicTitle && (
          <div className="profile-item">
            <label>Chức danh:</label>
            <span>{profile.academicTitle}</span>
          </div>
        )}
        {profile.degree && (
          <div className="profile-item">
            <label>Học vị:</label>
            <span>{profile.degree}</span>
          </div>
        )}
        {profile.specialization && (
          <div className="profile-item">
            <label>Chuyên môn:</label>
            <span>{profile.specialization}</span>
          </div>
        )}
        <div className="profile-item">
          <label>Số năm kinh nghiệm:</label>
          <span>{profile.yearsOfExperience} năm</span>
        </div>
      </div>

      <div className="profile-section">
        <h3>Thông Tin Bộ Môn</h3>
        <div className="profile-item">
          <label>Mã bộ môn:</label>
          <span>{profile.department.departmentCode}</span>
        </div>
        <div className="profile-item">
          <label>Tên bộ môn:</label>
          <span>{profile.department.departmentName}</span>
        </div>
        {profile.department.faculty && (
          <>
            <div className="profile-item">
              <label>Mã khoa:</label>
              <span>{profile.department.faculty.facultyCode}</span>
            </div>
            <div className="profile-item">
              <label>Tên khoa:</label>
              <span>{profile.department.faculty.facultyName}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
```

#### 5. Vue 3 Component Example (Composition API)

```vue
<!-- components/DepartmentHeadProfile.vue -->
<template>
  <div class="profile-container">
    <div v-if="loading">Đang tải thông tin...</div>
    
    <div v-else-if="error" class="error">Lỗi: {{ error }}</div>
    
    <div v-else-if="profile">
      <h2>Thông Tin Cá Nhân</h2>
      
      <div class="profile-section">
        <h3>Thông Tin Giảng Viên</h3>
        <div class="profile-item">
          <label>Mã giảng viên:</label>
          <span>{{ profile.instructorCode }}</span>
        </div>
        <div class="profile-item">
          <label>Họ và tên:</label>
          <span>{{ profile.fullName }}</span>
        </div>
        <div class="profile-item">
          <label>Email:</label>
          <span>{{ profile.email }}</span>
        </div>
        <div v-if="profile.phone" class="profile-item">
          <label>Số điện thoại:</label>
          <span>{{ profile.phone }}</span>
        </div>
        <div v-if="profile.academicTitle" class="profile-item">
          <label>Chức danh:</label>
          <span>{{ profile.academicTitle }}</span>
        </div>
        <div v-if="profile.degree" class="profile-item">
          <label>Học vị:</label>
          <span>{{ profile.degree }}</span>
        </div>
        <div v-if="profile.specialization" class="profile-item">
          <label>Chuyên môn:</label>
          <span>{{ profile.specialization }}</span>
        </div>
        <div class="profile-item">
          <label>Số năm kinh nghiệm:</label>
          <span>{{ profile.yearsOfExperience }} năm</span>
        </div>
      </div>

      <div class="profile-section">
        <h3>Thông Tin Bộ Môn</h3>
        <div class="profile-item">
          <label>Mã bộ môn:</label>
          <span>{{ profile.department.departmentCode }}</span>
        </div>
        <div class="profile-item">
          <label>Tên bộ môn:</label>
          <span>{{ profile.department.departmentName }}</span>
        </div>
        <div v-if="profile.department.faculty">
          <div class="profile-item">
            <label>Mã khoa:</label>
            <span>{{ profile.department.faculty.facultyCode }}</span>
          </div>
          <div class="profile-item">
            <label>Tên khoa:</label>
            <span>{{ profile.department.faculty.facultyName }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getDepartmentHeadProfile } from '../services/departmentHeadService';
import type { DepartmentHeadProfile } from '../types/department-head';

const profile = ref<DepartmentHeadProfile | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const fetchProfile = async () => {
  try {
    loading.value = true;
    error.value = null;
    profile.value = await getDepartmentHeadProfile();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Đã xảy ra lỗi';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchProfile();
});
</script>

<style scoped>
.profile-container {
  padding: 20px;
}

.profile-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.profile-item {
  display: flex;
  margin-bottom: 15px;
}

.profile-item label {
  font-weight: bold;
  min-width: 180px;
  margin-right: 10px;
}

.error {
  color: red;
  padding: 10px;
  background-color: #ffe6e6;
  border-radius: 4px;
}
</style>
```

#### 6. React Query Hook Example

```typescript
// hooks/useDepartmentHeadProfile.ts
import { useQuery } from '@tanstack/react-query';
import { getDepartmentHeadProfile } from '../services/departmentHeadService';

export function useDepartmentHeadProfile() {
  return useQuery({
    queryKey: ['departmentHeadProfile'],
    queryFn: getDepartmentHeadProfile,
    staleTime: 5 * 60 * 1000, // 5 phút
    retry: 2,
  });
}

// Sử dụng trong component:
// const { data: profile, isLoading, error } = useDepartmentHeadProfile();
```

---

## cURL Examples

### Basic Request

```bash
curl -X GET "http://localhost:3000/thesis/head/profile" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### With Token from Environment Variable

```bash
export ACCESS_TOKEN="your_jwt_token_here"

curl -X GET "http://localhost:3000/thesis/head/profile" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Postman Collection

### Request Setup

1. **Method**: GET
2. **URL**: `{{baseUrl}}/thesis/head/profile`
3. **Headers**:
   - `Authorization`: `Bearer {{accessToken}}`
   - `Content-Type`: `application/json`
4. **Environment Variables**:
   - `baseUrl`: `http://localhost:3000`
   - `accessToken`: Your JWT token

---

## Testing

### Test Cases

#### 1. Successful Profile Retrieval
- **Precondition**: User logged in as HEAD_OF_DEPARTMENT
- **Expected**: Status 200 with complete profile data
- **Verify**: All fields are populated correctly

#### 2. Unauthorized Access
- **Precondition**: No token or invalid token
- **Expected**: Status 401 with error message
- **Verify**: Error message indicates authentication failure

#### 3. Forbidden Access
- **Precondition**: User is not HEAD_OF_DEPARTMENT
- **Expected**: Status 403 with error message
- **Verify**: Error message indicates insufficient permissions

#### 4. Missing Instructor ID
- **Precondition**: Token doesn't contain instructorId
- **Expected**: Status 400 with error message
- **Verify**: Error message requests re-login

---

## Notes

### Security
- API yêu cầu JWT token hợp lệ
- Chỉ trưởng bộ môn mới có thể truy cập
- Token được validate qua `JwtAuthGuard` và `RolesGuard`

### Performance
- Query bao gồm các relations: `user`, `department`, `faculty`
- Response time dự kiến: < 200ms

### Data Privacy
- Chỉ trả về thông tin của chính người đang đăng nhập
- Không cho phép xem thông tin của trưởng bộ môn khác

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-24 | Initial API release |

---

## Support

Nếu có vấn đề hoặc câu hỏi, vui lòng liên hệ team backend.

