import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { UserRole } from '../models/enum/userRole.enum';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { RolesGuard } from '../guards/role.guard';
import { Roles } from '../decorators/roles.decorator';
import { InstructorService } from '../instructor/instructor.service';
import { CreateInstructorDto } from '../admin/dto/create-instructor.dto';
import { UpdateInstructorDto } from '../admin/dto/update-instructor.dto';
import { GetInstructorsDto } from '../admin/dto/get-instructors.dto';

@Controller('academic-staff')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ACADEMIC_STAFF)
export class AcademicStaffController {
  constructor(
    private readonly instructorService: InstructorService,
  ) {}

  // ================================
  // QUẢN LÝ GIẢNG VIÊN
  // ================================

  // Tạo thông tin giảng viên
  @Post('instructors')
  @Roles(UserRole.ACADEMIC_STAFF)
  async createInstructor(@Body() createInstructorDto: CreateInstructorDto) {
    const instructor = await this.instructorService.createInstructor(createInstructorDto);
    return {
      message: 'Tạo thông tin giảng viên thành công',
      instructor: {
        id: instructor.id,
        userId: instructor.userId,
        instructorCode: instructor.instructorCode,
        departmentId: instructor.departmentId,
        degree: instructor.degree,
        academicTitle: instructor.academicTitle,
        specialization: instructor.specialization,
        yearsOfExperience: instructor.yearsOfExperience,
        status: instructor.status,
      },
    };
  }

  // Lấy danh sách giảng viên với filters, search, pagination
  @Get('instructors')
  @Roles(UserRole.ACADEMIC_STAFF)
  async getInstructors(@Query() query: GetInstructorsDto) {
    // Nếu có query params thì dùng filter, không thì lấy tất cả
    if (query.page || query.departmentId || query.facultyId || query.search || 
        query.degree || query.academicTitle || query.status !== undefined) {
      const result = await this.instructorService.getInstructorsWithFilters(query);
      return {
        message: 'Lấy danh sách giảng viên thành công',
        data: result.data.map(instructor => ({
          id: instructor.id,
          userId: instructor.userId,
          instructorCode: instructor.instructorCode,
          user: {
            id: instructor.user?.id,
            username: instructor.user?.username,
            email: instructor.user?.email,
            fullName: instructor.user?.fullName,
            phone: instructor.user?.phone,
          },
          department: instructor.department ? {
            id: instructor.department.id,
            departmentCode: instructor.department.departmentCode,
            departmentName: instructor.department.departmentName,
            faculty: instructor.department.faculty ? {
              id: instructor.department.faculty.id,
              facultyCode: instructor.department.faculty.facultyCode,
              facultyName: instructor.department.faculty.facultyName,
            } : null,
          } : null,
          degree: instructor.degree,
          academicTitle: instructor.academicTitle,
          specialization: instructor.specialization,
          yearsOfExperience: instructor.yearsOfExperience,
          status: instructor.status,
          createdAt: instructor.createdAt,
        })),
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      };
    }

    // Nếu không có query params, lấy tất cả
    const instructors = await this.instructorService.getAllInstructors();
    return {
      message: 'Lấy danh sách giảng viên thành công',
      data: instructors.map(instructor => ({
        id: instructor.id,
        userId: instructor.userId,
        instructorCode: instructor.instructorCode,
        user: {
          id: instructor.user.id,
          username: instructor.user.username,
          email: instructor.user.email,
          fullName: instructor.user.fullName,
          phone: instructor.user.phone,
        },
        department: instructor.department ? {
          id: instructor.department.id,
          departmentCode: instructor.department.departmentCode,
          departmentName: instructor.department.departmentName,
          faculty: instructor.department.faculty ? {
            id: instructor.department.faculty.id,
            facultyCode: instructor.department.faculty.facultyCode,
            facultyName: instructor.department.faculty.facultyName,
          } : null,
        } : null,
        degree: instructor.degree,
        academicTitle: instructor.academicTitle,
        specialization: instructor.specialization,
        yearsOfExperience: instructor.yearsOfExperience,
        status: instructor.status,
        createdAt: instructor.createdAt,
      })),
      pagination: {
        total: instructors.length,
        page: 1,
        limit: instructors.length,
        totalPages: 1,
      },
    };
  }

  // Lấy chi tiết giảng viên theo ID
  @Get('instructors/:id')
  @Roles(UserRole.ACADEMIC_STAFF)
  async getInstructorById(@Param('id', ParseIntPipe) id: number) {
    const instructor = await this.instructorService.getInstructorById(id);
    return {
      message: 'Lấy thông tin giảng viên thành công',
      instructor: {
        id: instructor.id,
        userId: instructor.userId,
        instructorCode: instructor.instructorCode,
        user: {
          id: instructor.user.id,
          username: instructor.user.username,
          email: instructor.user.email,
          fullName: instructor.user.fullName,
          phone: instructor.user.phone,
          gender: instructor.user.gender,
          dateOfBirth: instructor.user.dateOfBirth,
          address: instructor.user.address,
          avatar: instructor.user.avatar,
          status: instructor.user.status,
        },
        department: instructor.department ? {
          id: instructor.department.id,
          departmentCode: instructor.department.departmentCode,
          departmentName: instructor.department.departmentName,
          faculty: instructor.department.faculty ? {
            id: instructor.department.faculty.id,
            facultyCode: instructor.department.faculty.facultyCode,
            facultyName: instructor.department.faculty.facultyName,
          } : null,
        } : null,
        degree: instructor.degree,
        academicTitle: instructor.academicTitle,
        specialization: instructor.specialization,
        yearsOfExperience: instructor.yearsOfExperience,
        status: instructor.status,
        createdAt: instructor.createdAt,
        updatedAt: instructor.updatedAt,
      },
    };
  }

  // Cập nhật thông tin giảng viên
  @Put('instructors/:id')
  @Roles(UserRole.ACADEMIC_STAFF)
  async updateInstructor(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInstructorDto: UpdateInstructorDto,
  ) {
    const instructor = await this.instructorService.updateInstructor(id, updateInstructorDto);
    return {
      message: 'Cập nhật thông tin giảng viên thành công',
      instructor: {
        id: instructor.id,
        userId: instructor.userId,
        instructorCode: instructor.instructorCode,
        departmentId: instructor.departmentId,
        degree: instructor.degree,
        academicTitle: instructor.academicTitle,
        specialization: instructor.specialization,
        yearsOfExperience: instructor.yearsOfExperience,
        status: instructor.status,
        updatedAt: instructor.updatedAt,
      },
    };
  }

  // Xóa giảng viên
  @Delete('instructors/:id')
  @Roles(UserRole.ACADEMIC_STAFF)
  async deleteInstructor(@Param('id', ParseIntPipe) id: number) {
    await this.instructorService.deleteInstructor(id);
    return {
      message: 'Xóa giảng viên thành công',
    };
  }

  // Lấy giảng viên theo bộ môn
  @Get('departments/:departmentId/instructors')
  @Roles(UserRole.ACADEMIC_STAFF)
  async getInstructorsByDepartment(@Param('departmentId', ParseIntPipe) departmentId: number) {
    const instructors = await this.instructorService.getInstructorsByDepartment(departmentId);
    return {
      message: 'Lấy danh sách giảng viên theo bộ môn thành công',
      instructors: instructors.map(instructor => ({
        id: instructor.id,
        instructorCode: instructor.instructorCode,
        user: {
          id: instructor.user.id,
          fullName: instructor.user.fullName,
          email: instructor.user.email,
        },
        degree: instructor.degree,
        academicTitle: instructor.academicTitle,
        specialization: instructor.specialization,
        yearsOfExperience: instructor.yearsOfExperience,
        status: instructor.status,
      })),
    };
  }
}

