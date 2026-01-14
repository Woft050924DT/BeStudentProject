import { Controller, Get } from '@nestjs/common';
import { StudentService } from './student.service';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentService: StudentService) {}

  // Lấy danh sách tất cả học sinh
  @Get()
  async getAllStudents() {
    const students = await this.studentService.getAllStudents();
    return {
      success: true,
      data: students.map(student => ({
        id: student.id,
        studentCode: student.studentCode,
        fullName: student.user?.fullName || null,
        email: student.user?.email || null,
        phone: student.user?.phone || null,
        gender: student.user?.gender || null,
        dateOfBirth: student.user?.dateOfBirth || null,
        avatar: student.user?.avatar || null,
        admissionYear: student.admissionYear,
        gpa: student.gpa,
        creditsEarned: student.creditsEarned,
        academicStatus: student.academicStatus,
        class: student.classEntity ? {
          id: student.classEntity.id,
          classCode: student.classEntity.classCode,
          className: student.classEntity.className,
          major: student.classEntity.major ? {
            id: student.classEntity.major.id,
            majorCode: student.classEntity.major.majorCode,
            majorName: student.classEntity.major.majorName,
            department: student.classEntity.major.department ? {
              id: student.classEntity.major.department.id,
              departmentCode: student.classEntity.major.department.departmentCode,
              departmentName: student.classEntity.major.department.departmentName
            } : null
          } : null
        } : null,
        status: student.status,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt
      })),
      total: students.length
    };
  }
}
