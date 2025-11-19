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
import { OrganizationService } from '../organization/organization.service';
import { CreateInstructorDto } from '../admin/dto/create-instructor.dto';
import { UpdateInstructorDto } from '../admin/dto/update-instructor.dto';
import { GetInstructorsDto } from '../admin/dto/get-instructors.dto';
import { CreateClassDto } from '../admin/dto/create-class.dto';
import { UpdateClassDto } from '../admin/dto/update-class.dto';
import { GetClassesDto } from '../admin/dto/get-classes.dto';

@Controller('academic-staff')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ACADEMIC_STAFF)
export class AcademicStaffController {
  constructor(
    private readonly instructorService: InstructorService,
    private readonly organizationService: OrganizationService,
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

  // ================================
  // QUẢN LÝ LỚP HỌC
  // ================================

  // Tạo lớp học mới
  @Post('classes')
  @Roles(UserRole.ACADEMIC_STAFF)
  async createClass(@Body() createClassDto: CreateClassDto) {
    const classEntity = await this.organizationService.createClass(createClassDto);
    return {
      message: 'Tạo lớp học thành công',
      class: {
        id: classEntity.id,
        classCode: classEntity.classCode,
        className: classEntity.className,
        majorId: classEntity.majorId,
        academicYear: classEntity.academicYear,
        studentCount: classEntity.studentCount,
        advisorId: classEntity.advisorId,
        status: classEntity.status,
      },
    };
  }

  // Lấy danh sách lớp học với filters, search, pagination
  @Get('classes')
  @Roles(UserRole.ACADEMIC_STAFF)
  async getClasses(@Query() query: GetClassesDto) {
    // Nếu có query params thì dùng filter, không thì lấy tất cả
    if (query.page || query.majorId || query.departmentId || query.facultyId || 
        query.search || query.academicYear || query.advisorId || query.status !== undefined) {
      const result = await this.organizationService.getClassesWithFilters(query);
      return {
        message: 'Lấy danh sách lớp học thành công',
        data: result.data.map(classEntity => ({
          id: classEntity.id,
          classCode: classEntity.classCode,
          className: classEntity.className,
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
                facultyName: classEntity.major.department.faculty.facultyName,
              } : null,
            } : null,
          } : null,
          academicYear: classEntity.academicYear,
          studentCount: classEntity.studentCount,
          advisor: classEntity.advisor ? {
            id: classEntity.advisor.id,
            instructorCode: classEntity.advisor.instructorCode,
            user: classEntity.advisor.user ? {
              id: classEntity.advisor.user.id,
              fullName: classEntity.advisor.user.fullName,
              email: classEntity.advisor.user.email,
            } : null,
          } : null,
          status: classEntity.status,
          createdAt: classEntity.createdAt,
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
    const classes = await this.organizationService.getAllClasses();
    return {
      message: 'Lấy danh sách lớp học thành công',
      data: classes.map(classEntity => ({
        id: classEntity.id,
        classCode: classEntity.classCode,
        className: classEntity.className,
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
              facultyName: classEntity.major.department.faculty.facultyName,
            } : null,
          } : null,
        } : null,
        academicYear: classEntity.academicYear,
        studentCount: classEntity.studentCount,
        advisor: classEntity.advisor ? {
          id: classEntity.advisor.id,
          instructorCode: classEntity.advisor.instructorCode,
          user: classEntity.advisor.user ? {
            id: classEntity.advisor.user.id,
            fullName: classEntity.advisor.user.fullName,
            email: classEntity.advisor.user.email,
          } : null,
        } : null,
        status: classEntity.status,
        createdAt: classEntity.createdAt,
      })),
      pagination: {
        total: classes.length,
        page: 1,
        limit: classes.length,
        totalPages: 1,
      },
    };
  }

  // Lấy chi tiết lớp học theo ID
  @Get('classes/:id')
  @Roles(UserRole.ACADEMIC_STAFF)
  async getClassById(@Param('id', ParseIntPipe) id: number) {
    const classEntity = await this.organizationService.getClassById(id);
    return {
      message: 'Lấy thông tin lớp học thành công',
      class: {
        id: classEntity.id,
        classCode: classEntity.classCode,
        className: classEntity.className,
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
              facultyName: classEntity.major.department.faculty.facultyName,
            } : null,
          } : null,
        } : null,
        academicYear: classEntity.academicYear,
        studentCount: classEntity.studentCount,
        advisor: classEntity.advisor ? {
          id: classEntity.advisor.id,
          instructorCode: classEntity.advisor.instructorCode,
          user: classEntity.advisor.user ? {
            id: classEntity.advisor.user.id,
            fullName: classEntity.advisor.user.fullName,
            email: classEntity.advisor.user.email,
            phone: classEntity.advisor.user.phone,
          } : null,
        } : null,
        status: classEntity.status,
        students: classEntity.students ? classEntity.students.map(student => ({
          id: student.id,
          studentCode: student.studentCode,
          user: student.user ? {
            id: student.user.id,
            fullName: student.user.fullName,
            email: student.user.email,
          } : null,
          gpa: student.gpa,
          academicStatus: student.academicStatus,
        })) : [],
        createdAt: classEntity.createdAt,
        updatedAt: classEntity.updatedAt,
      },
    };
  }

  // Cập nhật thông tin lớp học
  @Put('classes/:id')
  @Roles(UserRole.ACADEMIC_STAFF)
  async updateClass(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClassDto: UpdateClassDto,
  ) {
    const classEntity = await this.organizationService.updateClass(id, updateClassDto);
    return {
      message: 'Cập nhật thông tin lớp học thành công',
      class: {
        id: classEntity.id,
        classCode: classEntity.classCode,
        className: classEntity.className,
        majorId: classEntity.majorId,
        academicYear: classEntity.academicYear,
        studentCount: classEntity.studentCount,
        advisorId: classEntity.advisorId,
        status: classEntity.status,
        updatedAt: classEntity.updatedAt,
      },
    };
  }

  // Xóa lớp học
  @Delete('classes/:id')
  @Roles(UserRole.ACADEMIC_STAFF)
  async deleteClass(@Param('id', ParseIntPipe) id: number) {
    await this.organizationService.deleteClass(id);
    return {
      message: 'Xóa lớp học thành công',
    };
  }

  // Lấy lớp học theo chuyên ngành
  @Get('majors/:majorId/classes')
  @Roles(UserRole.ACADEMIC_STAFF)
  async getClassesByMajor(@Param('majorId', ParseIntPipe) majorId: number) {
    const classes = await this.organizationService.getClassesByMajor(majorId);
    return {
      message: 'Lấy danh sách lớp học theo chuyên ngành thành công',
      classes: classes.map(classEntity => ({
        id: classEntity.id,
        classCode: classEntity.classCode,
        className: classEntity.className,
        academicYear: classEntity.academicYear,
        studentCount: classEntity.studentCount,
        advisor: classEntity.advisor ? {
          id: classEntity.advisor.id,
          instructorCode: classEntity.advisor.instructorCode,
          user: classEntity.advisor.user ? {
            id: classEntity.advisor.user.id,
            fullName: classEntity.advisor.user.fullName,
            email: classEntity.advisor.user.email,
          } : null,
        } : null,
        status: classEntity.status,
      })),
    };
  }
}

