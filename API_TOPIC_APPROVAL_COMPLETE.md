S# API Tổng Hợp - Quy Trình Phê Duyệt Đăng Ký Đề Tài

## Base URL
```
http://localhost:3000
```

---

## Mục Lục

1. [Tổng Quan Quy Trình](#tổng-quan-quy-trình)
2. [API Giảng Viên](#api-giảng-viên)
   - [Lấy danh sách đăng ký đề tài](#1-lấy-danh-sách-đăng-ký-đề-tài)
   - [Phê duyệt/Từ chối đăng ký](#2-phê-duyệttừ-chối-đăng-ký)
3. [API Trưởng Bộ Môn](#api-trưởng-bộ-môn)
   - [Lấy danh sách chờ phê duyệt](#3-lấy-danh-sách-chờ-phê-duyệt)
   - [Phê duyệt/Từ chối đăng ký](#4-phê-duyệttừ-chối-đăng-ký)
4. [WebSocket Notifications](#websocket-notifications)
5. [Frontend Integration Guide](#frontend-integration-guide)
6. [Error Handling](#error-handling)

---

## Tổng Quan Quy Trình

### Luồng Phê Duyệt Đăng Ký Đề Tài

```
┌─────────────────┐
│  Sinh viên đăng │
│  ký đề tài      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ instructorStatus │
│ = 'Pending'      │
│ headStatus =     │
│ 'Pending'        │
└────────┬────────┘
         │
         ▼
    ┌─────────┐
    │ Giảng   │
    │ viên    │
    │ xử lý   │
    └────┬────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌──────┐  ┌────────┐
│ Từ   │  │ Phê    │
│ chối │  │ duyệt  │
└──┬───┘  └───┬────┘
   │          │
   │          ▼
   │    ┌─────────────────────────┐
   │    │ Kiểm tra loại đợt       │
   │    └───────┬─────────────────┘
   │            │
   │    ┌───────┴────────┐
   │    │                │
   │    ▼                ▼
   │ ┌────────┐    ┌──────────┐
   │ │ Tiểu   │    │ Luận văn │
   │ │ luận   │    │          │
   │ └───┬────┘    └────┬─────┘
   │     │             │
   │     │             ▼
   │     │    ┌─────────────────┐
   │     │    │ headStatus =     │
   │     │    │ 'Pending'        │
   │     │    │ Chờ trưởng bộ môn│
   │     │    └────────┬─────────┘
   │     │             │
   │     │             ▼
   │     │    ┌─────────────────┐
   │     │    │ Trưởng bộ môn   │
   │     │    │ phê duyệt       │
   │     │    └────────┬─────────┘
   │     │             │
   │     └─────┬───────┘
   │           │
   └───────────┘
           │
           ▼
    ┌──────────────┐
    │ Hoàn tất     │
    │ Có thể bắt   │
    │ đầu làm đề tài│
    └──────────────┘
```

### Phân Biệt Đợt Tiểu Luận và Luận Văn

| Đặc điểm | Đợt Tiểu Luận | Đợt Luận Văn |
|----------|---------------|--------------|
| **Số cấp phê duyệt** | 1 cấp (chỉ giảng viên) | 2 cấp (giảng viên → trưởng bộ môn) |
| **Sau khi giảng viên phê duyệt** | Tự động hoàn tất, có thể báo cáo hàng tuần ngay | Chờ trưởng bộ môn phê duyệt |
| **Cách nhận biết** | `thesisType.typeCode` hoặc `typeName` chứa "tiểu luận" hoặc "essay" | Các loại khác |

---

## API Giảng Viên

### 1. Lấy Danh Sách Đăng Ký Đề Tài

**Endpoint:** `GET /thesis/student-registrations`

**Quyền:** `TEACHER`

**Query Parameters:**
- `thesisRoundId` (optional): Lọc theo đợt luận văn
- `status` (optional): `Pending`, `Approved`, `Rejected`

**Request Example:**
```bash
GET /thesis/student-registrations?status=Pending
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
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
        "email": "sv001@example.com",
        "phone": "0123456789",
        "class": {
          "id": 1,
          "className": "Lớp CNTT K19",
          "classCode": "CNTT-K19"
        }
      },
      "thesisRound": {
        "id": 1,
        "roundName": "Đợt luận văn 2024-2025",
        "roundCode": "LV2024",
        "status": "In Progress"
      },
      "proposedTopic": {
        "id": 1,
        "topicTitle": "Hệ thống quản lý thư viện",
        "topicCode": "DT001"
      },
      "selfProposedTitle": null,
      "topicTitle": "Hệ thống quản lý thư viện",
      "selectionReason": "Tôi quan tâm đến lĩnh vực này",
      "instructorStatus": "Pending",
      "headStatus": "Pending",
      "instructorRejectionReason": null,
      "registrationDate": "2024-01-15T10:30:00.000Z",
      "instructorApprovalDate": null
    }
  ]
}
```

---

### 2. Phê Duyệt/Từ Chối Đăng Ký

**Endpoint:** `PUT /thesis/approve-registration`

**Quyền:** `TEACHER`

**Request Body:**
```json
{
  "registrationId": 1,
  "approved": true,
  "rejectionReason": null
}
```

**cURL Example:**
```bash
curl -X PUT "http://localhost:3000/thesis/approve-registration" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "registrationId": 1,
    "approved": true
  }'
```

**Response - Phê Duyệt Đợt Luận Văn:**
```json
{
  "success": true,
  "message": "Phê duyệt đăng ký thành công. Đăng ký đã được gửi lên trưởng bộ môn để phê duyệt",
  "data": {
    "registrationId": 1,
    "status": "Approved",
    "headStatus": "Pending",
    "nextStep": "Chờ trưởng bộ môn phê duyệt",
    "isFullyApproved": false
  }
}
```

**Response - Phê Duyệt Đợt Tiểu Luận:**
```json
{
  "success": true,
  "message": "Phê duyệt đăng ký thành công. Sinh viên có thể bắt đầu báo cáo hàng tuần.",
  "data": {
    "registrationId": 1,
    "status": "Approved",
    "headStatus": "Approved",
    "nextStep": "Có thể bắt đầu báo cáo hàng tuần",
    "isFullyApproved": true
  }
}
```

**Response - Từ Chối:**
```json
{
  "success": true,
  "message": "Từ chối đăng ký thành công",
  "data": {
    "registrationId": 1,
    "status": "Rejected",
    "headStatus": "Pending",
    "nextStep": null,
    "isFullyApproved": false
  }
}
```

---

## API Trưởng Bộ Môn

### 3. Lấy Danh Sách Chờ Phê Duyệt

**Endpoint:** `GET /thesis/head/pending-registrations`

**Quyền:** `HEAD_OF_DEPARTMENT`

**Query Parameters:**
- `thesisRoundId` (optional): Lọc theo đợt luận văn
- `status` (optional): `Pending`, `Approved`, `Rejected` (filter theo headStatus)
- `page` (optional): Số trang (mặc định: 1)
- `limit` (optional): Số lượng mỗi trang (mặc định: 10)

**Request Example:**
```bash
GET /thesis/head/pending-registrations?status=Pending&page=1&limit=10
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
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
        "email": "sv001@example.com",
        "phone": "0123456789",
        "class": {
          "id": 1,
          "className": "Lớp CNTT K19",
          "classCode": "CNTT-K19"
        }
      },
      "thesisRound": {
        "id": 1,
        "roundName": "Đợt luận văn 2024-2025",
        "roundCode": "LV2024",
        "status": "In Progress"
      },
      "topicTitle": "Hệ thống quản lý thư viện",
      "instructor": {
        "id": 1,
        "instructorCode": "GV001",
        "fullName": "Trần Thị B",
        "email": "gv001@example.com"
      },
      "instructorStatus": "Approved",
      "headStatus": "Pending",
      "instructorApprovalDate": "2024-01-16T09:00:00.000Z",
      "registrationDate": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1,
    "itemsPerPage": 10,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

### 4. Phê Duyệt/Từ Chối Đăng Ký

**Endpoint:** `PUT /thesis/head/approve-registration`

**Quyền:** `HEAD_OF_DEPARTMENT`

**Request Body:**
```json
{
  "registrationId": 1,
  "approved": true,
  "rejectionReason": null
}
```

**cURL Example:**
```bash
curl -X PUT "http://localhost:3000/thesis/head/approve-registration" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "registrationId": 1,
    "approved": true
  }'
```

**Response - Phê Duyệt:**
```json
{
  "success": true,
  "message": "Phê duyệt đăng ký thành công",
  "data": {
    "registrationId": 1,
    "status": "Approved",
    "headStatus": "Approved",
    "isFullyApproved": true
  }
}
```

**Response - Từ Chối:**
```json
{
  "success": true,
  "message": "Từ chối đăng ký thành công",
  "data": {
    "registrationId": 1,
    "status": "Approved",
    "headStatus": "Rejected",
    "isFullyApproved": false
  }
}
```

---

## WebSocket Notifications

### Event: `topic_registration_updated`

**Gửi cho sinh viên khi giảng viên xử lý:**

#### Phê duyệt đợt luận văn:
```json
{
  "registrationId": 1,
  "status": "Approved",
  "message": "Đăng ký đề tài của bạn đã được giáo viên hướng dẫn phê duyệt, đang chờ trưởng bộ môn phê duyệt",
  "rejectionReason": null,
  "isFullyApproved": false
}
```

#### Phê duyệt đợt tiểu luận:
```json
{
  "registrationId": 1,
  "status": "FullyApproved",
  "message": "Đăng ký đề tài của bạn đã được giáo viên hướng dẫn phê duyệt. Bạn có thể bắt đầu báo cáo hàng tuần.",
  "rejectionReason": null,
  "isFullyApproved": true
}
```

#### Từ chối:
```json
{
  "registrationId": 1,
  "status": "Rejected",
  "message": "Đăng ký đề tài của bạn đã bị từ chối",
  "rejectionReason": "Đề tài không phù hợp với chuyên ngành",
  "isFullyApproved": false
}
```

### Event: `new_registration_for_approval`

**Gửi cho trưởng bộ môn khi giảng viên phê duyệt (chỉ đợt luận văn):**
```json
{
  "registrationId": 1,
  "studentName": "Nguyễn Văn A",
  "studentCode": "SV001",
  "instructorName": "Trần Thị B",
  "topicTitle": "Hệ thống quản lý thư viện",
  "registrationDate": "2024-01-15T10:30:00.000Z",
  "instructorApprovalDate": "2024-01-16T09:00:00.000Z",
  "message": "Có đăng ký đề tài mới đã được giáo viên hướng dẫn phê duyệt, cần bạn phê duyệt"
}
```

### Event: `topic_registration_updated` (Từ trưởng bộ môn)

**Gửi cho sinh viên khi trưởng bộ môn xử lý:**
```json
{
  "registrationId": 1,
  "status": "FullyApproved",
  "message": "Đăng ký đề tài của bạn đã được trưởng bộ môn phê duyệt. Đăng ký đã hoàn tất!",
  "rejectionReason": null
}
```

---

## Frontend Integration Guide

### TypeScript Interfaces

```typescript
// Common Interfaces
interface Student {
  id: number;
  studentCode: string;
  fullName: string;
  email: string;
  phone: string;
  class: {
    id: number;
    className: string;
    classCode: string;
  } | null;
}

interface ThesisRound {
  id: number;
  roundName: string;
  roundCode: string;
  status: string;
}

interface Instructor {
  id: number;
  instructorCode: string;
  fullName: string;
  email: string;
}

interface TopicRegistration {
  id: number;
  student: Student;
  thesisRound: ThesisRound | null;
  proposedTopic: {
    id: number;
    topicTitle: string;
    topicCode: string;
  } | null;
  selfProposedTitle: string | null;
  topicTitle: string | null;
  selectionReason: string | null;
  instructorStatus: 'Pending' | 'Approved' | 'Rejected';
  headStatus: 'Pending' | 'Approved' | 'Rejected';
  instructorRejectionReason: string | null;
  headRejectionReason: string | null;
  registrationDate: string;
  instructorApprovalDate: string | null;
  headApprovalDate: string | null;
}

// Request Interfaces
interface ApproveTopicRegistrationRequest {
  registrationId: number;
  approved: boolean;
  rejectionReason?: string;
}

interface GetStudentRegistrationsParams {
  thesisRoundId?: number;
  status?: 'Pending' | 'Approved' | 'Rejected';
}

interface GetRegistrationsForHeadParams {
  thesisRoundId?: number;
  status?: 'Pending' | 'Approved' | 'Rejected';
  page?: number;
  limit?: number;
}

// Response Interfaces
interface ApproveTopicRegistrationResponse {
  success: boolean;
  message: string;
  data: {
    registrationId: number;
    status: 'Approved' | 'Rejected';
    headStatus: 'Pending' | 'Approved' | 'Rejected';
    nextStep: string | null;
    isFullyApproved: boolean;
  };
}

interface GetStudentRegistrationsResponse {
  success: boolean;
  data: TopicRegistration[];
}

interface GetRegistrationsForHeadResponse {
  success: boolean;
  data: (TopicRegistration & { instructor: Instructor })[];
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

### API Service Functions

```typescript
// API Base Configuration
const API_BASE_URL = 'http://localhost:3000';

function getAuthHeaders() {
  const token = localStorage.getItem('access_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

// ========== GIẢNG VIÊN APIs ==========

/**
 * Lấy danh sách đăng ký đề tài của sinh viên
 */
async function getStudentRegistrations(
  params?: GetStudentRegistrationsParams
): Promise<GetStudentRegistrationsResponse> {
  const queryParams = new URLSearchParams();
  if (params?.thesisRoundId) {
    queryParams.append('thesisRoundId', params.thesisRoundId.toString());
  }
  if (params?.status) {
    queryParams.append('status', params.status);
  }

  const response = await fetch(
    `${API_BASE_URL}/thesis/student-registrations?${queryParams.toString()}`,
    {
      method: 'GET',
      headers: getAuthHeaders()
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get student registrations');
  }

  return response.json();
}

/**
 * Giảng viên phê duyệt/từ chối đăng ký đề tài
 */
async function approveTopicRegistration(
  request: ApproveTopicRegistrationRequest
): Promise<ApproveTopicRegistrationResponse> {
  const response = await fetch(`${API_BASE_URL}/thesis/approve-registration`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to approve registration');
  }

  return response.json();
}

// ========== TRƯỞNG BỘ MÔN APIs ==========

/**
 * Lấy danh sách đăng ký chờ trưởng bộ môn phê duyệt
 */
async function getRegistrationsForHeadApproval(
  params?: GetRegistrationsForHeadParams
): Promise<GetRegistrationsForHeadResponse> {
  const queryParams = new URLSearchParams();
  if (params?.thesisRoundId) {
    queryParams.append('thesisRoundId', params.thesisRoundId.toString());
  }
  if (params?.status) {
    queryParams.append('status', params.status);
  }
  if (params?.page) {
    queryParams.append('page', params.page.toString());
  }
  if (params?.limit) {
    queryParams.append('limit', params.limit.toString());
  }

  const response = await fetch(
    `${API_BASE_URL}/thesis/head/pending-registrations?${queryParams.toString()}`,
    {
      method: 'GET',
      headers: getAuthHeaders()
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get registrations for approval');
  }

  return response.json();
}

/**
 * Trưởng bộ môn phê duyệt/từ chối đăng ký đề tài
 */
async function approveTopicRegistrationByHead(
  request: ApproveTopicRegistrationRequest
): Promise<ApproveTopicRegistrationResponse> {
  const response = await fetch(
    `${API_BASE_URL}/thesis/head/approve-registration`,
    {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(request)
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to approve registration');
  }

  return response.json();
}
```

### React Component Examples

#### Component cho Giảng Viên

```typescript
import React, { useState, useEffect } from 'react';

const InstructorApprovalPage: React.FC = () => {
  const [registrations, setRegistrations] = useState<TopicRegistration[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const result = await getStudentRegistrations({ status: 'Pending' });
      setRegistrations(result.data);
    } catch (error) {
      console.error('Error loading registrations:', error);
      alert('Không thể tải danh sách đăng ký');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (registrationId: number) => {
    try {
      await approveTopicRegistration({
        registrationId,
        approved: true
      });
      alert('Phê duyệt thành công!');
      await loadRegistrations();
    } catch (error: any) {
      alert(error.message || 'Không thể phê duyệt');
    }
  };

  const handleReject = async (registrationId: number) => {
    if (!rejectionReason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      await approveTopicRegistration({
        registrationId,
        approved: false,
        rejectionReason: rejectionReason
      });
      alert('Từ chối thành công!');
      setRejectionReason('');
      setSelectedRegistration(null);
      await loadRegistrations();
    } catch (error: any) {
      alert(error.message || 'Không thể từ chối');
    }
  };

  return (
    <div className="instructor-approval-page">
      <h2>Danh Sách Đăng Ký Đề Tài Chờ Phê Duyệt</h2>
      
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Sinh viên</th>
              <th>Đề tài</th>
              <th>Ngày đăng ký</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map(reg => (
              <tr key={reg.id}>
                <td>{reg.student.fullName} ({reg.student.studentCode})</td>
                <td>{reg.topicTitle}</td>
                <td>{new Date(reg.registrationDate).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handleApprove(reg.id)}>
                    Phê duyệt
                  </button>
                  <button onClick={() => setSelectedRegistration(reg.id)}>
                    Từ chối
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedRegistration && (
        <div className="rejection-modal">
          <h3>Nhập lý do từ chối</h3>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Nhập lý do từ chối..."
          />
          <button onClick={() => handleReject(selectedRegistration)}>
            Xác nhận từ chối
          </button>
          <button onClick={() => {
            setSelectedRegistration(null);
            setRejectionReason('');
          }}>
            Hủy
          </button>
        </div>
      )}
    </div>
  );
};
```

#### Component cho Trưởng Bộ Môn

```typescript
import React, { useState, useEffect } from 'react';

const HeadApprovalPage: React.FC = () => {
  const [registrations, setRegistrations] = useState<TopicRegistration[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedRegistration, setSelectedRegistration] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadRegistrations();
  }, [page]);

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const result = await getRegistrationsForHeadApproval({
        status: 'Pending',
        page,
        limit: 10
      });
      setRegistrations(result.data);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Error loading registrations:', error);
      alert('Không thể tải danh sách đăng ký');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (registrationId: number) => {
    try {
      await approveTopicRegistrationByHead({
        registrationId,
        approved: true
      });
      alert('Phê duyệt thành công!');
      await loadRegistrations();
    } catch (error: any) {
      alert(error.message || 'Không thể phê duyệt');
    }
  };

  const handleReject = async (registrationId: number) => {
    if (!rejectionReason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      await approveTopicRegistrationByHead({
        registrationId,
        approved: false,
        rejectionReason: rejectionReason
      });
      alert('Từ chối thành công!');
      setRejectionReason('');
      setSelectedRegistration(null);
      await loadRegistrations();
    } catch (error: any) {
      alert(error.message || 'Không thể từ chối');
    }
  };

  return (
    <div className="head-approval-page">
      <h2>Danh Sách Đăng Ký Chờ Phê Duyệt</h2>
      
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Sinh viên</th>
                <th>Giảng viên</th>
                <th>Đề tài</th>
                <th>Ngày giảng viên phê duyệt</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg: any) => (
                <tr key={reg.id}>
                  <td>{reg.student.fullName} ({reg.student.studentCode})</td>
                  <td>{reg.instructor.fullName}</td>
                  <td>{reg.topicTitle}</td>
                  <td>
                    {reg.instructorApprovalDate
                      ? new Date(reg.instructorApprovalDate).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td>
                    <button onClick={() => handleApprove(reg.id)}>
                      Phê duyệt
                    </button>
                    <button onClick={() => setSelectedRegistration(reg.id)}>
                      Từ chối
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pagination && (
            <div className="pagination">
              <button
                disabled={!pagination.hasPrevPage}
                onClick={() => setPage(page - 1)}
              >
                Trước
              </button>
              <span>
                Trang {pagination.currentPage} / {pagination.totalPages}
              </span>
              <button
                disabled={!pagination.hasNextPage}
                onClick={() => setPage(page + 1)}
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}

      {selectedRegistration && (
        <div className="rejection-modal">
          <h3>Nhập lý do từ chối</h3>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Nhập lý do từ chối..."
          />
          <button onClick={() => handleReject(selectedRegistration)}>
            Xác nhận từ chối
          </button>
          <button onClick={() => {
            setSelectedRegistration(null);
            setRejectionReason('');
          }}>
            Hủy
          </button>
        </div>
      )}
    </div>
  );
};
```

### WebSocket Integration

```typescript
import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    this.socket = io('http://localhost:3000', {
      auth: { token }
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    // Lắng nghe thông báo cập nhật đăng ký đề tài
    this.socket.on('topic_registration_updated', (data: any) => {
      console.log('Topic registration updated:', data);
      // Xử lý thông báo (ví dụ: hiển thị notification, refresh danh sách)
      this.handleRegistrationUpdate(data);
    });

    // Lắng nghe thông báo đăng ký mới cần phê duyệt (cho trưởng bộ môn)
    this.socket.on('new_registration_for_approval', (data: any) => {
      console.log('New registration for approval:', data);
      // Xử lý thông báo
      this.handleNewRegistrationForApproval(data);
    });
  }

  private handleRegistrationUpdate(data: any) {
    // Hiển thị thông báo cho người dùng
    if (data.isFullyApproved) {
      alert(`✅ ${data.message}`);
    } else if (data.status === 'Approved') {
      alert(`✅ ${data.message}`);
    } else if (data.status === 'Rejected') {
      alert(`❌ ${data.message}\nLý do: ${data.rejectionReason || 'Không có'}`);
    }
  }

  private handleNewRegistrationForApproval(data: any) {
    // Hiển thị thông báo cho trưởng bộ môn
    alert(`📋 ${data.message}\nSinh viên: ${data.studentName}\nĐề tài: ${data.topicTitle}`);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

// Sử dụng
const wsService = new WebSocketService();
wsService.connect(localStorage.getItem('access_token') || '');
```

---

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Đăng ký đề tài đã được xử lý rồi",
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
  "message": "Forbidden resource"
}
```

#### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Đăng ký đề tài không tồn tại hoặc không thuộc quyền quản lý của bạn",
  "error": "Not Found"
}
```

### Error Handling Utility

```typescript
async function handleApiError(error: any): Promise<string> {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    
    switch (status) {
      case 400:
        return data.message || 'Dữ liệu không hợp lệ';
      case 401:
        return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      case 403:
        return 'Bạn không có quyền thực hiện thao tác này';
      case 404:
        return data.message || 'Không tìm thấy dữ liệu';
      case 500:
        return 'Lỗi server. Vui lòng thử lại sau.';
      default:
        return data.message || 'Đã xảy ra lỗi';
    }
  }
  
  return error.message || 'Đã xảy ra lỗi không xác định';
}
```

---

## Testing với Postman

### Collection Structure

```
Topic Approval APIs
├── Instructor APIs
│   ├── Get Student Registrations
│   └── Approve/Reject Registration
└── Head of Department APIs
    ├── Get Pending Registrations
    └── Approve/Reject Registration
```

### Environment Variables

Tạo environment trong Postman:
```json
{
  "base_url": "http://localhost:3000",
  "instructor_token": "your_instructor_jwt_token",
  "head_token": "your_head_jwt_token"
}
```

### Pre-request Script Example

```javascript
// Tự động lấy token từ environment
pm.request.headers.add({
  key: 'Authorization',
  value: 'Bearer ' + pm.environment.get('instructor_token')
});
```

---

## Best Practices

### 1. Error Handling
- Luôn xử lý tất cả các trường hợp lỗi có thể xảy ra
- Hiển thị thông báo lỗi thân thiện với người dùng
- Log lỗi để debug

### 2. Loading States
- Hiển thị loading indicator khi đang xử lý
- Disable buttons khi đang submit để tránh duplicate requests

### 3. Real-time Updates
- Sử dụng WebSocket để cập nhật UI real-time
- Refresh danh sách sau khi xử lý thành công

### 4. Validation
- Validate dữ liệu phía frontend trước khi gửi request
- Yêu cầu nhập lý do từ chối khi từ chối đăng ký

### 5. User Experience
- Hiển thị thông báo thành công/lỗi rõ ràng
- Tự động refresh danh sách sau khi xử lý
- Hỗ trợ pagination cho danh sách dài

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01-20 | Initial API documentation |
| 1.1.0 | 2024-01-20 | Added essay type auto-approval logic |

---

## Support

Nếu có vấn đề hoặc câu hỏi về API, vui lòng liên hệ:
- Email: support@example.com
- Documentation: [API Documentation](https://docs.example.com)

