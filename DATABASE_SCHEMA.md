# Database Schema Documentation

## Mục lục
1. [Tổng quan](#tổng-quan)
2. [Bảng cơ bản](#bảng-cơ-bản)
3. [Bảng người dùng](#bảng-người-dùng)
4. [Bảng đề tài](#bảng-đề-tài)
5. [Bảng chat và messaging](#bảng-chat-và-messaging)
6. [Indexes](#indexes)

---

## Tổng quan

Database này quản lý hệ thống quản lý đề tài tốt nghiệp với các chức năng:
- Quản lý cơ cấu tổ chức (Khoa, Bộ môn, Chuyên ngành, Lớp)
- Quản lý người dùng (Sinh viên, Giảng viên, Admin)
- Quản lý đề tài và vòng đăng ký
- Quản lý quá trình hướng dẫn và báo cáo
- Quản lý phản biện và bảo vệ
- Hệ thống chat và messaging

---

## Bảng cơ bản

### 1. faculties (Khoa)

Quản lý thông tin các khoa trong trường.

| Cột | Kiểu dữ liệu | Mô tả | Ràng buộc |
|-----|-------------|-------|-----------|
| id | SERIAL | ID tự tăng | PRIMARY KEY |
| faculty_code | VARCHAR(10) | Mã khoa | NOT NULL, UNIQUE |
| faculty_name | VARCHAR(255) | Tên khoa | NOT NULL |
| dean_id | INTEGER | ID trưởng khoa | FK → instructors(id) |
| address | TEXT | Địa chỉ | |
| phone | VARCHAR(15) | Số điện thoại | |
| email | VARCHAR(100) | Email | |
| status | BOOLEAN | Trạng thái hoạt động | DEFAULT TRUE |
| created_at | TIMESTAMP | Ngày tạo | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | Ngày cập nhật | DEFAULT CURRENT_TIMESTAMP |

**Indexes:**
- Không có index riêng

---

### 2. departments (Bộ môn)

Quản lý thông tin các bộ môn thuộc khoa.

| Cột | Kiểu dữ liệu | Mô tả | Ràng buộc |
|-----|-------------|-------|-----------|
| id | SERIAL | ID tự tăng | PRIMARY KEY |
| department_code | VARCHAR(10) | Mã bộ môn | NOT NULL, UNIQUE |
| department_name | VARCHAR(255) | Tên bộ môn | NOT NULL |
| faculty_id | INTEGER | ID khoa | NOT NULL, FK → faculties(id) |
| head_id | INTEGER | ID trưởng bộ môn | FK → instructors(id) |
| description | TEXT | Mô tả | |
| status | BOOLEAN | Trạng thái hoạt động | DEFAULT TRUE |
| created_at | TIMESTAMP | Ngày tạo | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | Ngày cập nhật | DEFAULT CURRENT_TIMESTAMP |

**Foreign Keys:**
- `fk_departments_head`: head_id → instructors(id)

---

### 3. majors (Chuyên ngành)

Quản lý thông tin các chuyên ngành thuộc bộ môn.

| Cột | Kiểu dữ liệu | Mô tả | Ràng buộc |
|-----|-------------|-------|-----------|
| id | SERIAL | ID tự tăng | PRIMARY KEY |
| major_code | VARCHAR(10) | Mã chuyên ngành | NOT NULL, UNIQUE |
| major_name | VARCHAR(255) | Tên chuyên ngành | NOT NULL |
| department_id | INTEGER | ID bộ môn | NOT NULL, FK → departments(id) |
| description | TEXT | Mô tả | |
| status | BOOLEAN | Trạng thái hoạt động | DEFAULT TRUE |
| created_at | TIMESTAMP | Ngày tạo | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | Ngày cập nhật | DEFAULT CURRENT_TIMESTAMP |

---

### 4. classes (Lớp)

Quản lý thông tin các lớp học.

| Cột | Kiểu dữ liệu | Mô tả | Ràng buộc |
|-----|-------------|-------|-----------|
| id | SERIAL | ID tự tăng | PRIMARY KEY |
| class_code | VARCHAR(20) | Mã lớp | NOT NULL, UNIQUE |
| class_name | VARCHAR(255) | Tên lớp | NOT NULL |
| major_id | INTEGER | ID chuyên ngành | NOT NULL, FK → majors(id) |
| academic_year | VARCHAR(10) | Khóa học (VD: K19, K20) | |
| student_count | INTEGER | Số lượng sinh viên | DEFAULT 0 |
| advisor_id | INTEGER | ID cố vấn học tập | FK → instructors(id) |
| status | BOOLEAN | Trạng thái hoạt động | DEFAULT TRUE |
| created_at | TIMESTAMP | Ngày tạo | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | Ngày cập nhật | DEFAULT CURRENT_TIMESTAMP |

**Foreign Keys:**
- `fk_classes_advisor`: advisor_id → instructors(id)

---

## Bảng người dùng

### 5. user_roles (Vai trò người dùng)

Quản lý các vai trò trong hệ thống.

| Cột | Kiểu dữ liệu | Mô tả | Ràng buộc |
|-----|-------------|-------|-----------|
| id | SERIAL | ID tự tăng | PRIMARY KEY |
| role_code | VARCHAR(20) | Mã vai trò | NOT NULL, UNIQUE |
| role_name | VARCHAR(100) | Tên vai trò | NOT NULL |
| description | TEXT | Mô tả | |
| status | BOOLEAN | Trạng thái hoạt động | DEFAULT TRUE |

---

### 6. users (Người dùng)

Bảng chính quản lý thông tin người dùng.

| Cột | Kiểu dữ liệu | Mô tả | Ràng buộc |
|-----|-------------|-------|-----------|
| id | SERIAL | ID tự tăng | PRIMARY KEY |
| username | VARCHAR(50) | Tên đăng nhập | NOT NULL, UNIQUE |
| password | VARCHAR(255) | Mật khẩu (đã hash) | NOT NULL |
| email | VARCHAR(100) | Email | UNIQUE |
| full_name | VARCHAR(255) | Họ và tên | NOT NULL |
| gender | VARCHAR(10) | Giới tính | CHECK (Male, Female, Other) |
| date_of_birth | DATE | Ngày sinh | |
| phone | VARCHAR(15) | Số điện thoại | |
| address | TEXT | Địa chỉ | |
| avatar | VARCHAR(255) | Đường dẫn ảnh đại diện | |
| status | BOOLEAN | Trạng thái hoạt động | DEFAULT TRUE |
| last_login | TIMESTAMP | Lần đăng nhập cuối | |
| created_at | TIMESTAMP | Ngày tạo | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | Ngày cập nhật | DEFAULT CURRENT_TIMESTAMP |

**Indexes:**
- `idx_users_username`: username
- `idx_users_email`: email

---

### 7. user_role_assignments (Phân công vai trò)

Quản lý việc gán vai trò cho người dùng.

| Cột | Kiểu dữ liệu | Mô tả | Ràng buộc |
|-----|-------------|-------|-----------|
| id | SERIAL | ID tự tăng | PRIMARY KEY |
| user_id | INTEGER | ID người dùng | NOT NULL, FK → users(id) |
| role_id | INTEGER | ID vai trò | NOT NULL, FK → user_roles(id) |
| status | BOOLEAN | Trạng thái | DEFAULT TRUE |
| created_at | TIMESTAMP | Ngày tạo | DEFAULT CURRENT_TIMESTAMP |

**Constraints:**
- UNIQUE(user_id, role_id)

---

### 8. instructors (Giảng viên)

Quản lý thông tin giảng viên.

| Cột | Kiểu dữ liệu | Mô tả | Ràng buộc |
|-----|-------------|-------|-----------|
| id | SERIAL | ID tự tăng | PRIMARY KEY |
| user_id | INTEGER | ID người dùng | NOT NULL, FK → users(id), UNIQUE |
| instructor_code | VARCHAR(20) | Mã giảng viên | NOT NULL, UNIQUE |
| department_id | INTEGER | ID bộ môn | NOT NULL, FK → departments(id) |
| degree | VARCHAR(50) | Học vị (Thạc sĩ, Tiến sĩ) | |
| academic_title | VARCHAR(50) | Chức danh (GS, PGS) | |
| specialization | TEXT | Chuyên ngành | |
| years_of_experience | INTEGER | Số năm kinh nghiệm | DEFAULT 0 |
| status | BOOLEAN | Trạng thái hoạt động | DEFAULT TRUE |
| created_at | TIMESTAMP | Ngày tạo | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | Ngày cập nhật | DEFAULT CURRENT_TIMESTAMP |

**Indexes:**
- `idx_instructors_code`: instructor_code

---

### 9. students (Sinh viên)

Quản lý thông tin sinh viên.

| Cột | Kiểu dữ liệu | Mô tả | Ràng buộc |
|-----|-------------|-------|-----------|
| id | SERIAL | ID tự tăng | PRIMARY KEY |
| user_id | INTEGER | ID người dùng | NOT NULL, FK → users(id), UNIQUE |
| student_code | VARCHAR(20) | Mã sinh viên | NOT NULL, UNIQUE |
| class_id | INTEGER | ID lớp | NOT NULL, FK → classes(id) |
| admission_year | INTEGER | Năm nhập học | |
| gpa | DECIMAL(3,2) | Điểm trung bình | |
| credits_earned | INTEGER | Số tín chỉ đã tích lũy | DEFAULT 0 |
| academic_status | VARCHAR(50) | Trạng thái học tập | DEFAULT 'Active' |
| cv_file | VARCHAR(255) | File CV đính kèm | |
| status | BOOLEAN | Trạng thái hoạt động | DEFAULT TRUE |
| created_at | TIMESTAMP | Ngày tạo | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | Ngày cập nhật | DEFAULT CURRENT_TIMESTAMP |

**Indexes:**
- `idx_students_code`: student_code

---

## Bảng đề tài

### 10. thesis_types (Loại đề tài)

Quản lý các loại đề tài (Đồ án, Khóa luận, Luận văn).

| Cột | Kiểu dữ liệu | Mô tả | Ràng buộc |
|-----|-------------|-------|-----------|
| id | SERIAL | ID tự tăng | PRIMARY KEY |
| type_code | VARCHAR(20) | Mã loại đề tài | NOT NULL, UNIQUE |
| type_name | VARCHAR(100) | Tên loại đề tài | NOT NULL |
| description | TEXT | Mô tả | |
| has_review | BOOLEAN | Có quy trình phản biện | DEFAULT TRUE |
| has_defense | BOOLEAN | Có hội đồng bảo vệ | DEFAULT TRUE |
| reviewer_count | INTEGER | Số lượng phản biện | DEFAULT 1 |
| status | BOOLEAN | Trạng thái hoạt động | DEFAULT TRUE |

---

### 11. thesis_rounds (Vòng đăng ký đề tài)

Quản lý các đợt đăng ký đề tài.

| Cột | Kiểu dữ liệu | Mô tả | Ràng buộc |
|-----|-------------|-------|-----------|
| id | SERIAL | ID tự tăng | PRIMARY KEY |
| round_code | VARCHAR(20) | Mã vòng | NOT NULL, UNIQUE |
| round_name | VARCHAR(255) | Tên vòng | NOT NULL |
| thesis_type_id | INTEGER | ID loại đề tài | NOT NULL, FK → thesis_types(id) |
| department_id | INTEGER | ID bộ môn | FK → departments(id) |
| faculty_id | INTEGER | ID khoa | FK → faculties(id) |
| academic_year | VARCHAR(20) | Năm học (VD: 2023-2024) | |
| semester | INTEGER | Học kỳ | CHECK (1, 2, 3) |
| start_date | DATE | Ngày bắt đầu | |
| end_date | DATE | Ngày kết thúc | |
| topic_proposal_deadline | DATE | Hạn nộp đề xuất đề tài | |
| registration_deadline | DATE | Hạn đăng ký | |
| report_submission_deadline | DATE | Hạn nộp báo cáo | |
| guidance_process | TEXT | Quy trình hướng dẫn (JSON/XML) | |
| notes | TEXT | Ghi chú | |
| status | VARCHAR(50) | Trạng thái | DEFAULT 'Preparing' |
| created_at | TIMESTAMP | Ngày tạo | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | Ngày cập nhật | DEFAULT CURRENT_TIMESTAMP |

**Indexes:**
- `idx_thesis_rounds_status`: status

---

### 12. thesis_round_classes (Lớp tham gia vòng)

Quản lý các lớp tham gia vào vòng đăng ký.

| Cột | Kiểu dữ liệu | Mô tả | Ràng buộc |
|-----|-------------|-------|-----------|
| id | SERIAL | ID tự tăng | PRIMARY KEY |
| thesis_round_id | INTEGER | ID vòng đăng ký | NOT NULL, FK → thesis_rounds(id) |
| class_id | INTEGER | ID lớp | NOT NULL, FK → classes(id) |
| created_at | TIMESTAMP | Ngày tạo | DEFAULT CURRENT_TIMESTAMP |

**Constraints:**
- UNIQUE(thesis_round_id, class_id)

---

### 13. instructor_assignments (Phân công giảng viên)

Quản lý việc phân công giảng viên cho từng vòng.

| Cột | Kiểu dữ liệu | Mô tả | Ràng buộc |
|-----|-------------|-------|-----------|
| id | SERIAL | ID tự tăng | PRIMARY KEY |
| thesis_round_id | INTEGER | ID vòng đăng ký | NOT NULL, FK → thesis_rounds(id) |
| instructor_id | INTEGER | ID giảng viên | NOT NULL, FK → instructors(id) |
| supervision_quota | INTEGER | Số lượng được hướng dẫn | DEFAULT 0 |
| current_load | INTEGER | Số lượng hiện tại | DEFAULT 0 |
| notes | TEXT | Ghi chú | |
| status | BOOLEAN | Trạng thái | DEFAULT TRUE |
| created_at | TIMESTAMP | Ngày tạo | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | Ngày cập nhật | DEFAULT CURRENT_TIMESTAMP |

**Constraints:**
- UNIQUE(thesis_round_id, instructor_id)

---

### 14. student_thesis_rounds (Sinh viên tham gia vòng)

Quản lý sinh viên tham gia vào vòng đăng ký.

| Cột | Kiểu dữ liệu | Mô tả | Ràng buộc |
|-----|-------------|-------|-----------|
| id | SERIAL | ID tự tăng | PRIMARY KEY |
| thesis_round_id | INTEGER | ID vòng đăng ký | NOT NULL, FK → thesis_rounds(id) |
| student_id | INTEGER | ID sinh viên | NOT NULL, FK → students(id) |
| eligible | BOOLEAN | Đủ điều kiện | DEFAULT TRUE |
| notes | TEXT | Ghi chú | |
| created_at | TIMESTAMP | Ngày tạo | DEFAULT CURRENT_TIMESTAMP |

**Constraints:**
- UNIQUE(thesis_round_id, student_id)

---

### 15. proposed_topics (Đề tài đề xuất)

Quản lý các đề tài do giảng viên đề xuất.

| Cột | Kiểu dữ liệu | Mô tả | Ràng buộc |
|-----|-------------|-------|-----------|
| id | SERIAL | ID tự tăng | PRIMARY KEY |
| topic_code | VARCHAR(50) | Mã đề tài | NOT NULL |
| topic_title | VARCHAR(500) | Tên đề tài | NOT NULL |
| instructor_id | INTEGER | ID giảng viên | NOT NULL, FK → instructors(id) |
| thesis_round_id | INTEGER | ID vòng đăng ký | NOT NULL, FK → thesis_rounds(id) |
| topic_description | TEXT | Mô tả đề tài | |
| objectives | TEXT | Mục tiêu | |
| student_requirements | TEXT | Yêu cầu sinh viên | |
| technologies_used | TEXT | Công nghệ sử dụng | |
| topic_references | TEXT | Tài liệu tham khảo | |
| is_taken | BOOLEAN | Đã được chọn | DEFAULT FALSE |
| status | BOOLEAN | Trạng thái | DEFAULT TRUE |
| created_at | TIMESTAMP | Ngày tạo | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | Ngày cập nhật | DEFAULT CURRENT_TIMESTAMP |

**Constraints:**
- UNIQUE(topic_code, thesis_round_id)

---

### 16. topic_registrations (Đăng ký đề tài)

Quản lý việc đăng ký đề tài của sinh viên.

| Cột | Kiểu dữ liệu | Mô tả | Ràng buộc |
|-----|-------------|-------|-----------|
| id | SERIAL | ID tự tăng | PRIMARY KEY |
| student_id | INTEGER | ID sinh viên | NOT NULL, FK → students(id) |
| thesis_round_id | INTEGER | ID vòng đăng ký | NOT NULL, FK → thesis_rounds(id) |
| instructor_id | INTEGER | ID giảng viên | NOT NULL, FK → instructors(id) |
| proposed_topic_id | INTEGER | ID đề tài đề xuất | FK → proposed_topics(id) |
| self_proposed_title | VARCHAR(500) | Tên đề tài tự đề xuất | |
| self_proposed_description | TEXT | Mô tả đề tài tự đề xuất | |
| selection_reason | TEXT | Lý do chọn đề tài | |
| instructor_status | VARCHAR(50) | Trạng thái GVHD | DEFAULT 'Pending' |
| head_status | VARCHAR(50) | Trạng thái trưởng BM | DEFAULT 'Pending' |
| instructor_rejection_reason | TEXT | Lý do từ chối của GVHD | |
| head_rejection_reason | TEXT | Lý do từ chối của trưởng BM | |
| registration_date | TIMESTAMP | Ngày đăng ký | DEFAULT CURRENT_TIMESTAMP |
| instructor_approval_date | TIMESTAMP | Ngày GVHD duyệt | |
| head_approval_date | TIMESTAMP | Ngày trưởng BM duyệt | |

**Constraints:**
- UNIQUE(student_id, thesis_round_id)

**Indexes:**
- `idx_topic_registrations_status`: instructor_status, head_status

---

### 17. theses (Đề tài chính thức)

Quản lý thông tin đề tài sau khi được duyệt.

| Cột | Kiểu dữ liệu | Mô tả | Ràng buộc |
|-----|-------------|-------|-----------|
| id | SERIAL | ID tự tăng | PRIMARY KEY |
| thesis_code | VARCHAR(50) | Mã đề tài | NOT NULL, UNIQUE |
| topic_title | VARCHAR(500) | Tên đề tài | NOT NULL |
| student_id | INTEGER | ID sinh viên | NOT NULL, FK → students(id) |
| supervisor_id | INTEGER | ID giảng viên hướng dẫn | NOT NULL, FK → instructors(id) |
| thesis_round_id | INTEGER | ID vòng đăng ký | NOT NULL, FK → thesis_rounds(id) |
| topic_registration_id | INTEGER | ID đăng ký đề tài | NOT NULL, FK → topic_registrations(id) |
| topic_description | TEXT | Mô tả đề tài | |
| objectives | TEXT | Mục tiêu | |
| requirements | TEXT | Yêu cầu | |
| technologies_used | TEXT | Công nghệ sử dụng | |
| start_date | DATE | Ngày bắt đầu | |
| end_date | DATE | Ngày kết thúc | |
| outline_file | VARCHAR(255) | File đề cương | |
| final_report_file | VARCHAR(255) | File báo cáo cuối | |
| supervision_score | DECIMAL(3,2) | Điểm hướng dẫn | |
| review_score | DECIMAL(3,2) | Điểm phản biện | |
| defense_score | DECIMAL(3,2) | Điểm bảo vệ | |
| final_score | DECIMAL(3,2) | Điểm tổng kết | |
| grade | VARCHAR(20) | Xếp loại | |
| defense_eligible | BOOLEAN | Đủ điều kiện bảo vệ | DEFAULT FALSE |
| status | VARCHAR(50) | Trạng thái | DEFAULT 'In Progress' |
| notes | TEXT | Ghi chú | |
| created_at | TIMESTAMP | Ngày tạo | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | Ngày cập nhật | DEFAULT CURRENT_TIMESTAMP |

**Indexes:**
- `idx_theses_code`: thesis_code
- `idx_theses_status`: status

---

### 18. guidance_processes (Quy trình hướng dẫn)

Quản lý quy trình hướng dẫn theo tuần.

| Cột | Kiểu dữ liệu | Mô tả | Ràng buộc |
|-----|-------------|-------|-----------|
| id | SERIAL | ID tự tăng | PRIMARY KEY |
| thesis_round_id | INTEGER | ID vòng đăng ký | NOT NULL, FK → thesis_rounds(id) |
| week_number | INTEGER | Số tuần | NOT NULL |
| phase_name | VARCHAR(255) | Tên giai đoạn | NOT NULL |
| work_description | TEXT | Mô tả công việc | |
| expected_outcome | TEXT | Kết quả mong đợi | |
| status | BOOLEAN | Trạng thái | DEFAULT TRUE |
| created_at | TIMESTAMP | Ngày tạo | DEFAULT CURRENT_TIMESTAMP |

---

### 19. weekly_reports (Báo cáo tuần)

Quản lý báo cáo tuần của sinh viên.

| Cột | Kiểu dữ liệu | Mô tả | Ràng buộc |
|-----|-------------|-------|-----------|
| id | SERIAL | ID tự tăng | PRIMARY KEY |
| thesis_id | INTEGER | ID đề tài | NOT NULL, FK → theses(id) |
| week_number | INTEGER | Số tuần | NOT NULL |
| report_date | DATE | Ngày báo cáo | DEFAULT CURRENT_DATE |
| work_completed | TEXT | Công việc đã hoàn thành | |
| results_achieved | TEXT | Kết quả đạt được | |
| difficulties_encountered | TEXT | Khó khăn gặp phải | |
| next_week_plan | TEXT | Kế hoạch tuần sau | |
| attachment_file | VARCHAR(255) | File đính kèm | |
| student_status | VARCHAR(50) | Trạng thái SV | DEFAULT 'Submitted' |
| instructor_status | VARCHAR(50) | Trạng thái GV | DEFAULT 'Pending Review' |
| instructor_feedback | TEXT | Phản hồi của GV | |
| weekly_score | DECIMAL(3,2) | Điểm tuần | |
| feedback_date | TIMESTAMP | Ngày phản hồi | |
| created_at | TIMESTAMP | Ngày tạo | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | Ngày cập nhật | DEFAULT CURRENT_TIMESTAMP |

**Constraints:**
- UNIQUE(thesis_id, week_number)

**Indexes:**
- `idx_weekly_reports_thesis`: thesis_id
- `idx_weekly_reports_week`: week_number

---

### 20. supervision_comments (Nhận xét hướng dẫn)

Quản lý nhận xét của giảng viên hướng dẫn.

| Cột | Kiểu dữ liệu | Mô tả | Ràng buộc |
|-----|-------------|-------|-----------|
| id | SERIAL | ID tự tăng | PRIMARY KEY |
| thesis_id | INTEGER | ID đề tài | NOT NULL, FK → theses(id) |
| instructor_id | INTEGER | ID giảng viên | NOT NULL, FK → instructors(id) |
| comment_content | TEXT | Nội dung nhận xét | |
| attitude_evaluation | TEXT | Đánh giá thái độ | |
| capability_evaluation | TEXT | Đánh giá năng lực | |
| result_evaluation | TEXT | Đánh giá kết quả | |
| supervision_score | DECIMAL(3,2) | Điểm hướng dẫn | |
| defense_approval | BOOLEAN | Cho phép bảo vệ | DEFAULT FALSE |
| rejection_reason | TEXT | Lý do từ chối | |
| comment_date | DATE | Ngày nhận xét | DEFAULT CURRENT_DATE |
| created_at | TIMESTAMP | Ngày tạo | DEFAULT CURRENT_TIMESTAMP |

**Constraints:**
- UNIQUE(thesis_id, instructor_id)

---

### 21. review_assignments (Phân công phản biện)

Quản lý việc phân công phản biện.

| Cột | Kiểu dữ liệu | Mô tả | Ràng buộc |
|-----|-------------|-------|-----------|
| id | SERIAL | ID tự tăng | PRIMARY KEY |
| thesis_id | INTEGER | ID đề tài | NOT NULL, FK → theses(id) |
| reviewer_id | INTEGER | ID phản biện | NOT NULL, FK → instructors(id) |
| review_order | INTEGER | Thứ tự phản biện | DEFAULT 1 |
| assignment_date | DATE | Ngày phân công | DEFAULT CURRENT_DATE |
| review_deadline | DATE | Hạn phản biện | |
| status | VARCHAR(50) | Trạng thái | DEFAULT 'Pending Review' |
| created_at | TIMESTAMP | Ngày tạo | DEFAULT CURRENT_TIMESTAMP |

**Constraints:**
- UNIQUE(thesis_id, reviewer_id)

---

### 22. review_results (Kết quả phản biện)

Quản lý kết quả phản biện.

| Cột | Kiểu dữ liệu | Mô tả | Ràng buộc |
|-----|-------------|-------|-----------|
| id | SERIAL | ID tự tăng | PRIMARY KEY |
| review_assignment_id | INTEGER | ID phân công phản biện | NOT NULL, FK → review_assignments(id) |
| review_content | TEXT | Nội dung phản biện | |
| topic_evaluation | TEXT | Đánh giá đề tài | |
| result_evaluation | TEXT | Đánh giá kết quả | |
| improvement_suggestions | TEXT | Gợi ý cải thiện | |
| review_score | DECIMAL(3,2) | Điểm phản biện | |
| defense_approval | BOOLEAN | Cho phép bảo vệ | DEFAULT FALSE |
| rejection_reason | TEXT | Lý do từ chối | |
| review_date | DATE | Ngày phản biện | DEFAULT CURRENT_DATE |
| review_file | VARCHAR(255) | File phản biện | |
| created_at | TIMESTAMP | Ngày tạo | DEFAULT CURRENT_TIMESTAMP |

**Constraints:**
- UNIQUE(review_assignment_id)

---

### 23. defense_councils (Hội đồng bảo vệ)

Quản lý thông tin hội đồng bảo vệ.

| Cột | Kiểu dữ liệu | Mô tả | Ràng buộc |
|-----|-------------|-------|-----------|
| id | SERIAL | ID tự tăng | PRIMARY KEY |
| council_code | VARCHAR(50) | Mã hội đồng | NOT NULL, UNIQUE |
| council_name | VARCHAR(255) | Tên hội đồng | NOT NULL |
| thesis_round_id | INTEGER | ID vòng đăng ký | NOT NULL, FK → thesis_rounds(id) |
| chairman_id | INTEGER | ID chủ tịch | NOT NULL, FK → instructors(id) |
| secretary_id | INTEGER | ID thư ký | FK → instructors(id) |
| defense_date | DATE | Ngày bảo vệ | |
| start_time | TIME | Giờ bắt đầu | |
| end_time | TIME | Giờ kết thúc | |
| venue | VARCHAR(255) | Địa điểm | |
| status | VARCHAR(50) | Trạng thái | DEFAULT 'Preparing' |
| notes | TEXT | Ghi chú | |
| created_at | TIMESTAMP | Ngày tạo | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | Ngày cập nhật | DEFAULT CURRENT_TIMESTAMP |

---

### 24. council_members (Thành viên hội đồng)

Quản lý thành viên của hội đồng bảo vệ.

| Cột | Kiểu dữ liệu | Mô tả | Ràng buộc |
|-----|-------------|-------|-----------|
| id | SERIAL | ID tự tăng | PRIMARY KEY |
| defense_council_id | INTEGER | ID hội đồng | NOT NULL, FK → defense_councils(id) |
| instructor_id | INTEGER | ID giảng viên | NOT NULL, FK → instructors(id) |
| role | VARCHAR(50) | Vai trò | NOT NULL |
| order_number | INTEGER | Thứ tự | DEFAULT 1 |
| created_at | TIMESTAMP | Ngày tạo | DEFAULT CURRENT_TIMESTAMP |

**Constraints:**
- UNIQUE(defense_council_id, instructor_id)

---

### 25. defense_assignments (Phân công bảo vệ)

Quản lý việc phân công đề tài vào hội đồng bảo vệ.

| Cột | Kiểu dữ liệu | Mô tả | Ràng buộc |
|-----|-------------|-------|-----------|
| id | SERIAL | ID tự tăng | PRIMARY KEY |
| defense_council_id | INTEGER | ID hội đồng | NOT NULL, FK → defense_councils(id) |
| thesis_id | INTEGER | ID đề tài | NOT NULL, FK → theses(id) |
| defense_order | INTEGER | Thứ tự bảo vệ | |
| defense_time | TIME | Giờ bảo vệ | |
| status | VARCHAR(50) | Trạng thái | DEFAULT 'Pending Defense' |
| created_at | TIMESTAMP | Ngày tạo | DEFAULT CURRENT_TIMESTAMP |

**Constraints:**
- UNIQUE(defense_council_id, thesis_id)

---

### 26. defense_results (Kết quả bảo vệ)

Quản lý kết quả bảo vệ từng thành viên hội đồng.

| Cột | Kiểu dữ liệu | Mô tả | Ràng buộc |
|-----|-------------|-------|-----------|
| id | SERIAL | ID tự tăng | PRIMARY KEY |
| defense_assignment_id | INTEGER | ID phân công bảo vệ | NOT NULL, FK → defense_assignments(id) |
| instructor_id | INTEGER | ID giảng viên | NOT NULL, FK → instructors(id) |
| defense_score | DECIMAL(3,2) | Điểm bảo vệ | |
| comments | TEXT | Nhận xét | |
| suggestions | TEXT | Gợi ý | |
| created_at | TIMESTAMP | Ngày tạo | DEFAULT CURRENT_TIMESTAMP |

**Constraints:**
- UNIQUE(defense_assignment_id, instructor_id)

---

### 27. status_history (Lịch sử thay đổi trạng thái)

Quản lý lịch sử thay đổi trạng thái các bản ghi.

| Cột | Kiểu dữ liệu | Mô tả | Ràng buộc |
|-----|-------------|-------|-----------|
| id | SERIAL | ID tự tăng | PRIMARY KEY |
| table_name | VARCHAR(50) | Tên bảng | NOT NULL |
| record_id | INTEGER | ID bản ghi | NOT NULL |
| old_status | VARCHAR(100) | Trạng thái cũ | |
| new_status | VARCHAR(100) | Trạng thái mới | |
| changed_by_id | INTEGER | ID người thay đổi | FK → users(id) |
| change_reason | TEXT | Lý do thay đổi | |
| change_date | TIMESTAMP | Ngày thay đổi | DEFAULT CURRENT_TIMESTAMP |

---

## Bảng chat và messaging

### 28. conversation_types (Loại cuộc trò chuyện)

Quản lý các loại cuộc trò chuyện.

| Cột | Kiểu dữ liệu | Mô tả | Ràng buộc |
|-----|-------------|-------|-----------|
| id | SERIAL | ID tự tăng | PRIMARY KEY |
| type_code | VARCHAR(20) | Mã loại | NOT NULL, UNIQUE |
| type_name | VARCHAR(100) | Tên loại | NOT NULL |
| description | TEXT | Mô tả | |
| status | BOOLEAN | Trạng thái | DEFAULT TRUE |

**Các loại mặc định:**
- PRIVATE: Tin nhắn riêng (1-1)
- GROUP: Nhóm chat tự tạo
- THESIS_GROUP: Nhóm chat đề tài (tự động)

---

### 29. conversations (Cuộc trò chuyện)

Quản lý các cuộc trò chuyện.

| Cột | Kiểu dữ liệu | Mô tả | Ràng buộc |
|-----|-------------|-------|-----------|
| id | SERIAL | ID tự tăng | PRIMARY KEY |
| conversation_type_id | INTEGER | ID loại cuộc trò chuyện | NOT NULL, FK → conversation_types(id) |
| conversation_name | VARCHAR(255) | Tên nhóm | |
| conversation_avatar | VARCHAR(255) | Ảnh đại diện nhóm | |
| created_by_id | INTEGER | ID người tạo | NOT NULL, FK → users(id) |
| thesis_id | INTEGER | ID đề tài | FK → theses(id) |
| is_active | BOOLEAN | Đang hoạt động | DEFAULT TRUE |
| last_message_at | TIMESTAMP | Thời gian tin nhắn cuối | |
| created_at | TIMESTAMP | Ngày tạo | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | Ngày cập nhật | DEFAULT CURRENT_TIMESTAMP |

**Indexes:**
- `idx_conversations_type`: conversation_type_id
- `idx_conversations_thesis`: thesis_id
- `idx_conversations_last_message`: last_message_at DESC

---

### 30. conversation_members (Thành viên cuộc trò chuyện)

Quản lý thành viên trong cuộc trò chuyện.

| Cột | Kiểu dữ liệu | Mô tả | Ràng buộc |
|-----|-------------|-------|-----------|
| id | SERIAL | ID tự tăng | PRIMARY KEY |
| conversation_id | INTEGER | ID cuộc trò chuyện | NOT NULL, FK → conversations(id) |
| user_id | INTEGER | ID người dùng | NOT NULL, FK → users(id) |
| role | VARCHAR(20) | Vai trò | DEFAULT 'MEMBER' |
| nickname | VARCHAR(255) | Biệt danh trong nhóm | |
| joined_at | TIMESTAMP | Ngày tham gia | DEFAULT CURRENT_TIMESTAMP |
| left_at | TIMESTAMP | Ngày rời nhóm | |
| is_active | BOOLEAN | Đang hoạt động | DEFAULT TRUE |
| is_muted | BOOLEAN | Tắt thông báo | DEFAULT FALSE |
| is_pinned | BOOLEAN | Ghim hội thoại | DEFAULT FALSE |
| last_read_message_id | INTEGER | ID tin nhắn cuối đã đọc | FK → messages(id) |
| unread_count | INTEGER | Số tin nhắn chưa đọc | DEFAULT 0 |
| created_at | TIMESTAMP | Ngày tạo | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | Ngày cập nhật | DEFAULT CURRENT_TIMESTAMP |

**Constraints:**
- UNIQUE(conversation_id, user_id)

**Indexes:**
- `idx_conversation_members_user`: user_id, is_active
- `idx_conversation_members_conversation`: conversation_id, is_active
- `idx_conversation_members_unread`: user_id, unread_count

---

### 31. message_types (Loại tin nhắn)

Quản lý các loại tin nhắn.

| Cột | Kiểu dữ liệu | Mô tả | Ràng buộc |
|-----|-------------|-------|-----------|
| id | SERIAL | ID tự tăng | PRIMARY KEY |
| type_code | VARCHAR(20) | Mã loại | NOT NULL, UNIQUE |
| type_name | VARCHAR(100) | Tên loại | NOT NULL |
| icon | VARCHAR(50) | Icon | |
| status | BOOLEAN | Trạng thái | DEFAULT TRUE |

**Các loại mặc định:**
- TEXT: Tin nhắn văn bản
- IMAGE: Hình ảnh
- FILE: Tệp đính kèm
- VIDEO: Video
- AUDIO: Ghi âm
- LINK: Liên kết
- NOTIFICATION: Thông báo hệ thống
- STICKER: Sticker/Icon

---

### 32. messages (Tin nhắn)

Quản lý các tin nhắn.

| Cột | Kiểu dữ liệu | Mô tả | Ràng buộc |
|-----|-------------|-------|-----------|
| id | SERIAL | ID tự tăng | PRIMARY KEY |
| conversation_id | INTEGER | ID cuộc trò chuyện | NOT NULL, FK → conversations(id) |
| sender_id | INTEGER | ID người gửi | NOT NULL, FK → users(id) |
| message_type_id | INTEGER | ID loại tin nhắn | NOT NULL, FK → message_types(id) |
| content | TEXT | Nội dung tin nhắn | |
| parent_message_id | INTEGER | ID tin nhắn trả lời | FK → messages(id) |
| is_edited | BOOLEAN | Đã chỉnh sửa | DEFAULT FALSE |
| is_deleted | BOOLEAN | Đã xóa | DEFAULT FALSE |
| deleted_at | TIMESTAMP | Ngày xóa | |
| created_at | TIMESTAMP | Ngày tạo | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | Ngày cập nhật | DEFAULT CURRENT_TIMESTAMP |

**Indexes:**
- `idx_messages_conversation`: conversation_id, created_at DESC
- `idx_messages_sender`: sender_id
- `idx_messages_parent`: parent_message_id
- `idx_messages_deleted`: is_deleted

---

### 33. message_attachments (File đính kèm tin nhắn)

Quản lý file đính kèm trong tin nhắn.

| Cột | Kiểu dữ liệu | Mô tả | Ràng buộc |
|-----|-------------|-------|-----------|
| id | SERIAL | ID tự tăng | PRIMARY KEY |
| message_id | INTEGER | ID tin nhắn | NOT NULL, FK → messages(id) |
| file_name | VARCHAR(255) | Tên file | NOT NULL |
| file_path | VARCHAR(500) | Đường dẫn file | NOT NULL |
| file_type | VARCHAR(50) | Loại file (MIME) | |
| file_size | BIGINT | Kích thước file (bytes) | |
| thumbnail_path | VARCHAR(500) | Đường dẫn thumbnail | |
| duration | INTEGER | Thời lượng (giây) | |
| width | INTEGER | Chiều rộng (pixel) | |
| height | INTEGER | Chiều cao (pixel) | |
| created_at | TIMESTAMP | Ngày tạo | DEFAULT CURRENT_TIMESTAMP |

**Indexes:**
- `idx_message_attachments_message`: message_id

---

### 34. message_reactions (Cảm xúc tin nhắn)

Quản lý cảm xúc (like, love, haha...) cho tin nhắn.

| Cột | Kiểu dữ liệu | Mô tả | Ràng buộc |
|-----|-------------|-------|-----------|
| id | SERIAL | ID tự tăng | PRIMARY KEY |
| message_id | INTEGER | ID tin nhắn | NOT NULL, FK → messages(id) |
| user_id | INTEGER | ID người dùng | NOT NULL, FK → users(id) |
| reaction_type | VARCHAR(20) | Loại cảm xúc | NOT NULL |
| reaction_icon | VARCHAR(10) | Icon cảm xúc | |
| created_at | TIMESTAMP | Ngày tạo | DEFAULT CURRENT_TIMESTAMP |

**Constraints:**
- UNIQUE(message_id, user_id)

**Indexes:**
- `idx_message_reactions_message`: message_id
- `idx_message_reactions_user`: user_id

---

### 35. message_read_status (Trạng thái đã đọc)

Quản lý trạng thái đã đọc tin nhắn.

| Cột | Kiểu dữ liệu | Mô tả | Ràng buộc |
|-----|-------------|-------|-----------|
| id | SERIAL | ID tự tăng | PRIMARY KEY |
| message_id | INTEGER | ID tin nhắn | NOT NULL, FK → messages(id) |
| user_id | INTEGER | ID người dùng | NOT NULL, FK → users(id) |
| read_at | TIMESTAMP | Thời gian đọc | DEFAULT CURRENT_TIMESTAMP |

**Constraints:**
- UNIQUE(message_id, user_id)

**Indexes:**
- `idx_message_read_status_message`: message_id
- `idx_message_read_status_user`: user_id

---

### 36. message_mentions (Tag người trong tin nhắn)

Quản lý việc tag người dùng trong tin nhắn.

| Cột | Kiểu dữ liệu | Mô tả | Ràng buộc |
|-----|-------------|-------|-----------|
| id | SERIAL | ID tự tăng | PRIMARY KEY |
| message_id | INTEGER | ID tin nhắn | NOT NULL, FK → messages(id) |
| mentioned_user_id | INTEGER | ID người được tag | NOT NULL, FK → users(id) |
| created_at | TIMESTAMP | Ngày tạo | DEFAULT CURRENT_TIMESTAMP |

**Constraints:**
- UNIQUE(message_id, mentioned_user_id)

---

### 37. conversation_settings (Cài đặt nhóm)

Quản lý cài đặt cho cuộc trò chuyện nhóm.

| Cột | Kiểu dữ liệu | Mô tả | Ràng buộc |
|-----|-------------|-------|-----------|
| id | SERIAL | ID tự tăng | PRIMARY KEY |
| conversation_id | INTEGER | ID cuộc trò chuyện | NOT NULL, FK → conversations(id), UNIQUE |
| allow_member_invite | BOOLEAN | Cho phép thành viên mời | DEFAULT TRUE |
| allow_member_remove | BOOLEAN | Cho phép thành viên xóa | DEFAULT FALSE |
| allow_name_change | BOOLEAN | Cho phép đổi tên | DEFAULT TRUE |
| allow_avatar_change | BOOLEAN | Cho phép đổi ảnh | DEFAULT TRUE |
| require_admin_approval | BOOLEAN | Yêu cầu admin duyệt | DEFAULT FALSE |
| created_at | TIMESTAMP | Ngày tạo | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | Ngày cập nhật | DEFAULT CURRENT_TIMESTAMP |

---

### 38. blocked_users (Chặn người dùng)

Quản lý việc chặn người dùng.

| Cột | Kiểu dữ liệu | Mô tả | Ràng buộc |
|-----|-------------|-------|-----------|
| id | SERIAL | ID tự tăng | PRIMARY KEY |
| blocker_id | INTEGER | ID người chặn | NOT NULL, FK → users(id) |
| blocked_id | INTEGER | ID người bị chặn | NOT NULL, FK → users(id) |
| reason | TEXT | Lý do chặn | |
| blocked_at | TIMESTAMP | Ngày chặn | DEFAULT CURRENT_TIMESTAMP |

**Constraints:**
- UNIQUE(blocker_id, blocked_id)

---

### 39. typing_status (Trạng thái đang gõ)

Quản lý trạng thái đang gõ tin nhắn (realtime).

| Cột | Kiểu dữ liệu | Mô tả | Ràng buộc |
|-----|-------------|-------|-----------|
| id | SERIAL | ID tự tăng | PRIMARY KEY |
| conversation_id | INTEGER | ID cuộc trò chuyện | NOT NULL, FK → conversations(id) |
| user_id | INTEGER | ID người dùng | NOT NULL, FK → users(id) |
| is_typing | BOOLEAN | Đang gõ | DEFAULT TRUE |
| started_at | TIMESTAMP | Thời gian bắt đầu | DEFAULT CURRENT_TIMESTAMP |

**Constraints:**
- UNIQUE(conversation_id, user_id)

---

## Indexes

### Indexes cho hiệu suất

#### Users
- `idx_users_username`: Tìm kiếm theo username
- `idx_users_email`: Tìm kiếm theo email

#### Instructors
- `idx_instructors_code`: Tìm kiếm theo mã giảng viên

#### Students
- `idx_students_code`: Tìm kiếm theo mã sinh viên

#### Theses
- `idx_theses_code`: Tìm kiếm theo mã đề tài
- `idx_theses_status`: Lọc theo trạng thái

#### Thesis Rounds
- `idx_thesis_rounds_status`: Lọc theo trạng thái

#### Topic Registrations
- `idx_topic_registrations_status`: Lọc theo trạng thái duyệt

#### Weekly Reports
- `idx_weekly_reports_thesis`: Lấy báo cáo theo đề tài
- `idx_weekly_reports_week`: Lọc theo tuần

#### Messages
- `idx_messages_conversation`: Lấy tin nhắn theo cuộc trò chuyện
- `idx_messages_sender`: Lấy tin nhắn theo người gửi
- `idx_messages_parent`: Lấy tin nhắn trả lời
- `idx_messages_deleted`: Lọc tin nhắn đã xóa

#### Conversation Members
- `idx_conversation_members_user`: Lấy cuộc trò chuyện của user
- `idx_conversation_members_conversation`: Lấy thành viên của cuộc trò chuyện
- `idx_conversation_members_unread`: Đếm tin nhắn chưa đọc

#### Conversations
- `idx_conversations_type`: Lọc theo loại
- `idx_conversations_thesis`: Lấy nhóm chat đề tài
- `idx_conversations_last_message`: Sắp xếp theo tin nhắn cuối

#### Message Reactions
- `idx_message_reactions_message`: Lấy cảm xúc của tin nhắn
- `idx_message_reactions_user`: Lấy cảm xúc của user

#### Message Read Status
- `idx_message_read_status_message`: Lấy trạng thái đọc của tin nhắn
- `idx_message_read_status_user`: Lấy tin nhắn đã đọc của user

#### Message Attachments
- `idx_message_attachments_message`: Lấy file đính kèm của tin nhắn

---

## Quan hệ giữa các bảng

### Cấu trúc phân cấp
```
faculties (Khoa)
  └── departments (Bộ môn)
      └── majors (Chuyên ngành)
          └── classes (Lớp)
              └── students (Sinh viên)
```

### Quy trình đề tài
```
thesis_types → thesis_rounds → topic_registrations → theses
                                    ↓
                            proposed_topics
                                    ↓
                            weekly_reports
                                    ↓
                            supervision_comments
                                    ↓
                            review_assignments → review_results
                                    ↓
                            defense_councils → defense_assignments → defense_results
```

### Hệ thống chat
```
conversation_types → conversations → messages
                          ↓              ↓
                  conversation_members  message_attachments
                          ↓              message_reactions
                  conversation_settings  message_read_status
                                        message_mentions
```

---

## Ghi chú

1. **Foreign Keys**: Tất cả các foreign key đều có constraint để đảm bảo tính toàn vẹn dữ liệu
2. **Cascade Delete**: Một số bảng có `ON DELETE CASCADE` để tự động xóa dữ liệu liên quan
3. **Unique Constraints**: Nhiều bảng có unique constraint để tránh trùng lặp dữ liệu
4. **Timestamps**: Hầu hết các bảng đều có `created_at` và `updated_at` để theo dõi thời gian
5. **Status Fields**: Nhiều bảng có trường `status` để quản lý trạng thái hoạt động

---

## Tổng kết

Database này bao gồm:
- **39 bảng** chính
- **Hơn 30 indexes** để tối ưu hiệu suất
- **Hệ thống quản lý đề tài** hoàn chỉnh
- **Hệ thống chat và messaging** đầy đủ tính năng
- **Quản lý người dùng** với nhiều vai trò
- **Theo dõi lịch sử** thay đổi trạng thái

