# API: Trưởng bộ môn lấy danh sách đăng ký đã được GVHD phê duyệt

## Mục đích

Lấy danh sách **sinh viên đã đăng ký đề tài** và **đã được giáo viên hướng dẫn (GVHD) phê duyệt** để **trưởng bộ môn phê duyệt** bước tiếp theo.

Endpoint này trả về các đăng ký có:

- `instructorStatus = APPROVED`
- `headStatus = PENDING`

## Endpoint

- Method: `GET`
- URL: `/thesis/head/instructor-approved-registrations`

## Auth & quyền

- Header: `Authorization: Bearer <access_token>`
- Role yêu cầu: `head_of_department` (backend hiện cũng cho phép `teacher` theo cấu hình route)

## Query params

| Tên | Kiểu | Bắt buộc | Mặc định | Ý nghĩa |
|---|---:|:---:|---:|---|
| `thesisRoundId` | number | Không | - | Lọc theo đợt luận văn |
| `page` | number | Không | `1` | Trang |
| `limit` | number | Không | `10` | Số phần tử / trang |
| `status` | string | Không | - | Lọc theo `headStatus` (ví dụ: `PENDING`, `APPROVED`, `REJECTED`) |

## Ví dụ request

```http
GET /thesis/head/instructor-approved-registrations?thesisRoundId=1&page=1&limit=10 HTTP/1.1
Host: localhost:3000
Authorization: Bearer <access_token>
```

## Response (200)

```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "thesisGroupId": 45,
      "student": {
        "id": 67,
        "studentCode": "SV001",
        "fullName": "Nguyễn Văn A",
        "email": "a@example.com",
        "phone": "0123456789",
        "class": {
          "id": 9,
          "className": "DHKTPM1",
          "classCode": "KTPM1"
        }
      },
      "thesisRound": {
        "id": 1,
        "roundName": "Đợt 1",
        "roundCode": "ROUND1",
        "status": "In Progress"
      },
      "proposedTopic": {
        "id": 10,
        "topicTitle": "Đề tài mẫu",
        "topicCode": "DT001"
      },
      "selfProposedTitle": null,
      "selfProposedDescription": null,
      "topicTitle": "Đề tài mẫu",
      "selectionReason": "Lý do chọn",
      "instructor": {
        "id": 3,
        "instructorCode": "GV001",
        "fullName": "Trần Văn B",
        "email": "b@example.com"
      },
      "instructorStatus": "APPROVED",
      "headStatus": "PENDING",
      "instructorRejectionReason": null,
      "headRejectionReason": null,
      "registrationDate": "2026-01-14T00:00:00.000Z",
      "instructorApprovalDate": "2026-01-14T00:00:00.000Z",
      "headApprovalDate": null
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

## Error responses

- `401 Unauthorized`: token không hợp lệ / hết hạn
- `403 Forbidden`: không đủ quyền truy cập
- `400 Bad Request`: thiếu thông tin cần thiết (ví dụ không xác định được `instructorId` trong token)

## FE tích hợp nhanh (fetch)

```ts
type GetInstructorApprovedRegistrationsQuery = {
  thesisRoundId?: number;
  page?: number;
  limit?: number;
  status?: string;
};

export async function getInstructorApprovedRegistrationsForHead(
  baseUrl: string,
  accessToken: string,
  query: GetInstructorApprovedRegistrationsQuery,
) {
  const url = new URL("/thesis/head/instructor-approved-registrations", baseUrl);
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  });

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message || `Request failed: ${res.status}`);
  }

  return res.json();
}
```

## Nơi implement trong BE

- Route: `be/src/thesis/thesis.controller.ts`
- Service dùng chung logic: `be/src/thesis/thesis.service.ts`

