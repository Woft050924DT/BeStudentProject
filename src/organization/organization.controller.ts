import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { OrganizationService } from './organization.service';

@Controller()
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  // Lấy danh sách tất cả lớp học
  @Get('classes')
  async getAllClasses() {
    const classes = await this.organizationService.getAllClasses();
    return {
      success: true,
      data: classes.map(classEntity => ({
        id: classEntity.id,
        classCode: classEntity.classCode,
        className: classEntity.className,
        academicYear: classEntity.academicYear,
        studentCount: classEntity.studentCount,
        major: classEntity.major ? {
          id: classEntity.major.id,
          majorCode: classEntity.major.majorCode,
          majorName: classEntity.major.majorName,
          department: classEntity.major.department ? {
            id: classEntity.major.department.id,
            departmentCode: classEntity.major.department.departmentCode,
            departmentName: classEntity.major.department.departmentName,
            faculty: classEntity.major.department.faculty ? {
              id: classEntity.major.department.faculty.id,
              facultyCode: classEntity.major.department.faculty.facultyCode,
              facultyName: classEntity.major.department.faculty.facultyName
            } : null
          } : null
        } : null,
        advisor: classEntity.advisor ? {
          id: classEntity.advisor.id,
          instructorCode: classEntity.advisor.instructorCode,
          fullName: classEntity.advisor.user?.fullName || null
        } : null,
        status: classEntity.status,
        createdAt: classEntity.createdAt,
        updatedAt: classEntity.updatedAt
      })),
      total: classes.length
    };
  }

  // Lấy danh sách tất cả bộ môn
  @Get('departments')
  async getAllDepartments(@Query('facultyId') facultyId?: string) {
    let departments;
    
    if (facultyId) {
      const facultyIdNum = parseInt(facultyId, 10);
      if (isNaN(facultyIdNum)) {
        return {
          success: false,
          message: 'facultyId phải là số',
          data: [],
          total: 0
        };
      }
      departments = await this.organizationService.getDepartmentsByFaculty(facultyIdNum);
    } else {
      departments = await this.organizationService.getAllDepartments();
    }

    return {
      success: true,
      data: departments.map(department => ({
        id: department.id,
        departmentCode: department.departmentCode,
        departmentName: department.departmentName,
        description: department.description,
        status: department.status,
        faculty: department.faculty ? {
          id: department.faculty.id,
          facultyCode: department.faculty.facultyCode,
          facultyName: department.faculty.facultyName
        } : null,
        head: department.head ? {
          id: department.head.id,
          instructorCode: department.head.instructorCode,
          fullName: department.head.user?.fullName || null,
          email: department.head.user?.email || null
        } : null,
        majorCount: department.majors ? department.majors.length : 0,
        instructorCount: department.instructors ? department.instructors.length : 0,
        createdAt: department.createdAt,
        updatedAt: department.updatedAt
      })),
      total: departments.length
    };
  }

  // Lấy danh sách bộ môn đang hoạt động (status = true)
  @Get('departments/active')
  async getActiveDepartments() {
    const departments = await this.organizationService.getActiveDepartments();

    return {
      success: true,
      data: departments.map(department => ({
        id: department.id,
        "Mã bộ môn": department.departmentCode,
        "Tên bộ môn": department.departmentName,
        "ID Khoa": department.facultyId,
        "ID Trưởng bộ môn": department.headId || null,
        "Mô tả": department.description || null,
        "Trạng thái": department.status,
        "Ngày tạo": department.createdAt,
        "Ngày cập nhật": department.updatedAt
      })),
      total: departments.length
    };
  }
}
