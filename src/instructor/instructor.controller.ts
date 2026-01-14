import { Controller, Get, Query, Param } from '@nestjs/common';
import { InstructorService } from './instructor.service';
import { GetInstructorsWithSupervisionCountDto } from './dto/get-instructors-with-supervision-count.dto';
import { OrganizationService } from '../organization/organization.service';

@Controller('instructors')
export class InstructorController {
  constructor(
    private readonly instructorService: InstructorService,
    private readonly organizationService: OrganizationService,
  ) {}

  @Get('with-supervision-count')
  async getInstructorsWithSupervisionCount(
    @Query() query: GetInstructorsWithSupervisionCountDto
  ) {
    return this.instructorService.getInstructorsWithSupervisionCount(query);
  }

  // Lấy danh sách tất cả giáo viên
  @Get()
  async getAllInstructors() {
    const instructors = await this.instructorService.getAllInstructors();
    return {
      success: true,
      data: instructors.map(instructor => ({
        id: instructor.id,
        instructorCode: instructor.instructorCode,
        fullName: instructor.user?.fullName || null,
        email: instructor.user?.email || null,
        phone: instructor.user?.phone || null,
        degree: instructor.degree,
        academicTitle: instructor.academicTitle,
        specialization: instructor.specialization,
        yearsOfExperience: instructor.yearsOfExperience,
        department: instructor.department ? {
          id: instructor.department.id,
          departmentCode: instructor.department.departmentCode,
          departmentName: instructor.department.departmentName
        } : null,
        status: instructor.status,
        createdAt: instructor.createdAt,
        updatedAt: instructor.updatedAt
      })),
      total: instructors.length
    };
  }

}
