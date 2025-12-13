import { Controller, Get } from '@nestjs/common';
import { OrganizationService } from './organization.service';

@Controller('classes')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  // Lấy danh sách tất cả lớp học
  @Get()
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
}
