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
  Request,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { UserRole } from '../models/enum/userRole.enum';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { RolesGuard } from '../guards/role.guard';
import { Roles } from '../decorators/roles.decorator';
import { InstructorService } from '../instructor/instructor.service';
import { OrganizationService } from '../organization/organization.service';
import { UserService } from '../user/user.service';
import { CreateInstructorDto } from '../admin/dto/create-instructor.dto';
import { UpdateInstructorDto } from '../admin/dto/update-instructor.dto';
import { GetInstructorsDto } from '../admin/dto/get-instructors.dto';
import { CreateClassDto } from '../admin/dto/create-class.dto';
import { UpdateClassDto } from '../admin/dto/update-class.dto';
import { GetClassesDto } from '../admin/dto/get-classes.dto';
import { StudentService } from '../student/student.service';
import { CreateStudentDto } from '../admin/dto/create-student.dto';
import { UpdateStudentDto } from '../admin/dto/update-student.dto';
import { GetStudentsDto } from '../admin/dto/get-students.dto';
import { UpdateUserProfileDto } from '../common/dto/update-user-profile.dto';
import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';

@Controller('academic-staff')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ACADEMIC_STAFF)
export class AcademicStaffController {
  constructor(
    private readonly instructorService: InstructorService,
    private readonly organizationService: OrganizationService,
    private readonly studentService: StudentService,
    private readonly userService: UserService,
  ) {}

  @Get('profile')
  @Roles(UserRole.ACADEMIC_STAFF)
  getMyProfile(@Request() req: AuthenticatedRequest) {
    const userId = req.user.userId;
    if (!userId) {
      throw new BadRequestException('Không tìm thấy thông tin người dùng');
    }
    return this.userService.findById(userId).then((user) => {
      if (!user) {
        throw new BadRequestException('Không tìm thấy thông tin người dùng');
      }
      const hasCompleteInfo = !!(user.fullName && user.email);
      return {
        userId: user.id,
        username: user.username || null,
        fullName: user.fullName || null,
        email: user.email || null,
        phone: user.phone || null,
        gender: user.gender || null,
        dateOfBirth: user.dateOfBirth || null,
        address: user.address || null,
        avatar: user.avatar || null,
        isFirstTime: !hasCompleteInfo,
        ...(hasCompleteInfo ? {} : { message: 'Vui lòng điền đầy đủ thông tin để hoàn thiện hồ sơ giáo vụ.' }),
      };
    });
  }

  @Put('profile')
  @Roles(UserRole.ACADEMIC_STAFF)
  async updateMyProfile(
    @Request() req: AuthenticatedRequest,
    @Body() updateDto: UpdateUserProfileDto,
  ) {
    const userId = req.user.userId;
    if (!userId) {
      throw new BadRequestException('Không tìm thấy thông tin người dùng');
    }

    const user = await this.userService.findById(userId);
    if (!user) {
      throw new BadRequestException('Không tìm thấy thông tin người dùng');
    }

    if (updateDto.email && updateDto.email !== user.email) {
      const existing = await this.userService.findByEmail(updateDto.email);
      if (existing && existing.id !== userId) {
        throw new ConflictException('Email đã được sử dụng');
      }
    }

    const updateData: Record<string, any> = {};
    if (updateDto.fullName !== undefined) updateData.fullName = updateDto.fullName;
    if (updateDto.email !== undefined) updateData.email = updateDto.email;
    if (updateDto.phone !== undefined) updateData.phone = updateDto.phone;
    if (updateDto.gender !== undefined) updateData.gender = updateDto.gender;
    if (updateDto.dateOfBirth !== undefined) updateData.dateOfBirth = new Date(updateDto.dateOfBirth);
    if (updateDto.address !== undefined) updateData.address = updateDto.address;
    if (updateDto.avatar !== undefined) updateData.avatar = updateDto.avatar;

    await this.userService.update(userId, updateData);

    const updated = await this.userService.findById(userId);
    if (!updated) {
      throw new BadRequestException('Không tìm thấy thông tin người dùng');
    }
    const hasCompleteInfo = !!(updated.fullName && updated.email);
    return {
      userId: updated.id,
      username: updated.username || null,
      fullName: updated.fullName || null,
      email: updated.email || null,
      phone: updated.phone || null,
      gender: updated.gender || null,
      dateOfBirth: updated.dateOfBirth || null,
      address: updated.address || null,
      avatar: updated.avatar || null,
      isFirstTime: !hasCompleteInfo,
      ...(hasCompleteInfo ? {} : { message: 'Vui lòng điền đầy đủ thông tin để hoàn thiện hồ sơ giáo vụ.' }),
    };
  }

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

  // ================================
  // QUẢN LÝ HỌC SINH
  // ================================

  // Tạo thông tin học sinh mới
  @Post('students')
  @Roles(UserRole.ACADEMIC_STAFF)
  async createStudent(@Body() createStudentDto: CreateStudentDto) {
    const student = await this.studentService.createStudent(createStudentDto);
    return {
      message: 'Tạo thông tin học sinh thành công',
      student: {
        id: student.id,
        userId: student.userId,
        studentCode: student.studentCode,
        classId: student.classId,
        admissionYear: student.admissionYear,
        academicStatus: student.academicStatus,
        status: student.status,
      },
    };
  }

  // Lấy danh sách học sinh với filters, search, pagination
  @Get('students')
  @Roles(UserRole.ACADEMIC_STAFF)
  async getStudents(@Query() query: GetStudentsDto) {
    // Nếu có query params thì dùng filter, không thì lấy tất cả
    if (query.page || query.classId || query.majorId || query.departmentId || 
        query.facultyId || query.search || query.academicStatus || 
        query.admissionYear || query.status !== undefined) {
      const result = await this.studentService.getStudentsWithFilters(query);
      return {
        message: 'Lấy danh sách học sinh thành công',
        data: result.data.map(student => ({
          id: student.id,
          userId: student.userId,
          studentCode: student.studentCode,
          user: student.user ? {
            id: student.user.id,
            username: student.user.username,
            email: student.user.email,
            fullName: student.user.fullName,
            phone: student.user.phone,
            gender: student.user.gender,
            dateOfBirth: student.user.dateOfBirth,
            avatar: student.user.avatar,
          } : null,
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
                departmentName: student.classEntity.major.department.departmentName,
                faculty: student.classEntity.major.department.faculty ? {
                  id: student.classEntity.major.department.faculty.id,
                  facultyCode: student.classEntity.major.department.faculty.facultyCode,
                  facultyName: student.classEntity.major.department.faculty.facultyName,
                } : null,
              } : null,
            } : null,
          } : null,
          admissionYear: student.admissionYear,
          gpa: student.gpa,
          creditsEarned: student.creditsEarned,
          academicStatus: student.academicStatus,
          cvFile: student.cvFile,
          status: student.status,
          createdAt: student.createdAt,
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
    const students = await this.studentService.getAllStudents();
    return {
      message: 'Lấy danh sách học sinh thành công',
      data: students.map(student => ({
        id: student.id,
        userId: student.userId,
        studentCode: student.studentCode,
        user: student.user ? {
          id: student.user.id,
          username: student.user.username,
          email: student.user.email,
          fullName: student.user.fullName,
          phone: student.user.phone,
          gender: student.user.gender,
          dateOfBirth: student.user.dateOfBirth,
          avatar: student.user.avatar,
        } : null,
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
              departmentName: student.classEntity.major.department.departmentName,
              faculty: student.classEntity.major.department.faculty ? {
                id: student.classEntity.major.department.faculty.id,
                facultyCode: student.classEntity.major.department.faculty.facultyCode,
                facultyName: student.classEntity.major.department.faculty.facultyName,
              } : null,
            } : null,
          } : null,
        } : null,
        admissionYear: student.admissionYear,
        gpa: student.gpa,
        creditsEarned: student.creditsEarned,
        academicStatus: student.academicStatus,
        cvFile: student.cvFile,
        status: student.status,
        createdAt: student.createdAt,
      })),
      pagination: {
        total: students.length,
        page: 1,
        limit: students.length,
        totalPages: 1,
      },
    };
  }

  // Lấy chi tiết học sinh theo ID
  @Get('students/:id')
  @Roles(UserRole.ACADEMIC_STAFF)
  async getStudentById(@Param('id', ParseIntPipe) id: number) {
    const student = await this.studentService.getStudentById(id);
    return {
      message: 'Lấy thông tin học sinh thành công',
      student: {
        id: student.id,
        userId: student.userId,
        studentCode: student.studentCode,
        user: student.user ? {
          id: student.user.id,
          username: student.user.username,
          email: student.user.email,
          fullName: student.user.fullName,
          phone: student.user.phone,
          gender: student.user.gender,
          dateOfBirth: student.user.dateOfBirth,
          address: student.user.address,
          avatar: student.user.avatar,
          status: student.user.status,
        } : null,
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
              departmentName: student.classEntity.major.department.departmentName,
            } : null,
          } : null,
        } : null,
        admissionYear: student.admissionYear,
        gpa: student.gpa,
        creditsEarned: student.creditsEarned,
        academicStatus: student.academicStatus,
        cvFile: student.cvFile,
        status: student.status,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
      },
    };
  }

  // Cập nhật thông tin học sinh
  @Put('students/:id')
  @Roles(UserRole.ACADEMIC_STAFF)
  async updateStudent(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    const student = await this.studentService.updateStudent(id, updateStudentDto);
    return {
      message: 'Cập nhật thông tin học sinh thành công',
      student: {
        id: student.id,
        userId: student.userId,
        studentCode: student.studentCode,
        classId: student.classId,
        admissionYear: student.admissionYear,
        gpa: student.gpa,
        creditsEarned: student.creditsEarned,
        academicStatus: student.academicStatus,
        cvFile: student.cvFile,
        status: student.status,
        updatedAt: student.updatedAt,
      },
    };
  }

  // Xóa học sinh
  @Delete('students/:id')
  @Roles(UserRole.ACADEMIC_STAFF)
  async deleteStudent(@Param('id', ParseIntPipe) id: number) {
    await this.studentService.deleteStudent(id);
    return {
      message: 'Xóa học sinh thành công',
    };
  }

  // Lấy học sinh theo lớp
  @Get('classes/:classId/students')
  @Roles(UserRole.ACADEMIC_STAFF)
  async getStudentsByClass(@Param('classId', ParseIntPipe) classId: number) {
    const students = await this.studentService.getStudentsByClass(classId);
    return {
      message: 'Lấy danh sách học sinh theo lớp thành công',
      students: students.map(student => ({
        id: student.id,
        studentCode: student.studentCode,
        user: student.user ? {
          id: student.user.id,
          fullName: student.user.fullName,
          email: student.user.email,
          phone: student.user.phone,
        } : null,
        admissionYear: student.admissionYear,
        gpa: student.gpa,
        creditsEarned: student.creditsEarned,
        academicStatus: student.academicStatus,
        status: student.status,
      })),
    };
  }
}

