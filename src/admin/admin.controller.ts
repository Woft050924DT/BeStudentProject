import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/interface/create-user.dto';
import { UpdateUserDto } from '../user/interface/update-user.dto';
import { UserRole } from '../models/enum/userRole.enum';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { RolesGuard } from '../guards/role.guard';
import { Roles } from '../decorators/roles.decorator';
import { OrganizationService } from '../organization/organization.service';
import { InstructorService } from '../instructor/instructor.service';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { CreateInstructorDto } from './dto/create-instructor.dto';
import { CreateStudentDto } from './dto/create-student.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(
    private readonly userService: UserService,
    private readonly organizationService: OrganizationService,
    private readonly instructorService: InstructorService,
  ) {}

  // Tạo tài khoản mới
  @Post('users')
  @Roles(UserRole.ADMIN)
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @Request() req: any,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const assignedBy = req.user?.userId as number | undefined;
    const user = await this.userService.createUserWithRole(createUserDto, assignedBy);
    
    return {
      message: 'Tạo tài khoản thành công',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: createUserDto.role || UserRole.STUDENT,
      },
    };
  }

  // Lấy danh sách tất cả người dùng
  @Get('users')
  @Roles(UserRole.ADMIN)
  async getAllUsers() {
    const users = await this.userService.getAllUsersWithRoles();
    return {
      message: 'Lấy danh sách người dùng thành công',
      users: users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        status: user.status,
        role: user.role || null,
        createdAt: user.createdAt,
      })),
    };
  }

  // Lấy thông tin chi tiết người dùng
  @Get('users/:id')
  @Roles(UserRole.ADMIN)
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.findById(id);
    if (!user) {
      return { message: 'Không tìm thấy người dùng' };
    }

    return {
      message: 'Lấy thông tin người dùng thành công',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar,
        status: user.status,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  // Cập nhật thông tin người dùng
  @Put('users/:id')
  @Roles(UserRole.ADMIN)
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.userService.updateUser(id, updateUserDto);
    if (!user) {
      return { message: 'Không tìm thấy người dùng để cập nhật' };
    }
    return {
      message: 'Cập nhật thông tin người dùng thành công',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        status: user.status,
      },
    };
  }

  // Cập nhật role cho người dùng
  @Put('users/:id/role')
  @Roles(UserRole.ADMIN)
  async updateUserRole(
    @Param('id', ParseIntPipe) userId: number,
    @Body() body: { role: UserRole },
  ) {
    const user = await this.userService.updateUserRole(userId, body.role);
    if (!user) {
      return { message: 'Không tìm thấy người dùng' };
    }

    return {
      message: 'Cập nhật role thành công',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        updatedAt: user.updatedAt,
      },
    };
  }

  // Lấy role của người dùng
  @Get('users/:id/role')
  @Roles(UserRole.ADMIN)
  async getUserRole(@Param('id', ParseIntPipe) id: number) {
    const roleDetail = await this.userService.getUserRoleDetail(id);
    return {
      message: 'Lấy role thành công',
      role: roleDetail,
    };
  }

  // Thay đổi role của người dùng
  @Put('users/:id/change-role')
  @Roles(UserRole.ADMIN)
  async changeUserRole(
    @Param('id', ParseIntPipe) userId: number,
    @Body() body: { role: UserRole },
  ) {
    const user = await this.userService.changeUserRole(userId, body.role);
    if (!user) {
      return { message: 'Không tìm thấy người dùng' };
    }
    
    return {
      message: `Đã thay đổi role thành ${body.role}`,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }

  // Lấy danh sách người dùng theo role
  @Get('users/role/:role')
  @Roles(UserRole.ADMIN)
  async getUsersByRole(@Param('role') role: UserRole) {
    const users = await this.userService.getUsersByRole(role);
    return {
      message: `Lấy danh sách người dùng có role ${role} thành công`,
      users: users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        status: user.status,
        createdAt: user.createdAt,
      })),
    };
  }

  // Thống kê người dùng
  @Get('statistics')
  @Roles(UserRole.ADMIN)
  async getUserStatistics() {
    const allUsers = await this.userService.getAllUsersWithRoles();
    
    const statistics = {
      totalUsers: allUsers.length,
      activeUsers: allUsers.filter(user => user.status).length,
      inactiveUsers: allUsers.filter(user => !user.status).length,
      usersByRole: {
        [UserRole.ADMIN]: allUsers.filter(user => 
          user.role?.toUpperCase() === UserRole.ADMIN && user.status
        ).length,
        [UserRole.TEACHER]: allUsers.filter(user => 
          user.role?.toUpperCase() === UserRole.TEACHER && user.status
        ).length,
        [UserRole.STUDENT]: allUsers.filter(user => 
          user.role?.toUpperCase() === UserRole.STUDENT && user.status
        ).length,
        [UserRole.ACADEMIC_STAFF]: allUsers.filter(user => 
          user.role?.toUpperCase() === UserRole.ACADEMIC_STAFF && user.status
        ).length,
        [UserRole.HEAD_OF_DEPARTMENT]: allUsers.filter(user => 
          user.role?.toUpperCase() === UserRole.HEAD_OF_DEPARTMENT && user.status
        ).length,
      },
    };

    return {
      message: 'Lấy thống kê người dùng thành công',
      statistics,
    };
  }

  // ================================
  // QUẢN LÝ CẤU TRÚC TỔ CHỨC
  // ================================

  // Tạo khoa mới
  @Post('faculties')
  @Roles(UserRole.ADMIN)
  async createFaculty(@Body() createFacultyDto: CreateFacultyDto) {
    const faculty = await this.organizationService.createFaculty(createFacultyDto);
    return {
      message: 'Tạo khoa thành công',
      faculty: {
        id: faculty.id,
        facultyCode: faculty.facultyCode,
        facultyName: faculty.facultyName,
        email: faculty.email,
        phone: faculty.phone,
        address: faculty.address,
        status: faculty.status,
      },
    };
  }

  // Lấy danh sách tất cả khoa
  @Get('faculties')
  @Roles(UserRole.ADMIN)
  async getAllFaculties() {
    const faculties = await this.organizationService.getAllFaculties();
    return {
      message: 'Lấy danh sách khoa thành công',
      faculties: faculties.map(faculty => ({
        id: faculty.id,
        facultyCode: faculty.facultyCode,
        facultyName: faculty.facultyName,
        email: faculty.email,
        phone: faculty.phone,
        address: faculty.address,
        status: faculty.status,
        dean: faculty.dean ? {
          id: faculty.dean.id,
          instructorCode: faculty.dean.instructorCode,
          user: {
            id: faculty.dean.user.id,
            fullName: faculty.dean.user.fullName,
          }
        } : null,
        departmentCount: faculty.departments?.length || 0,
        createdAt: faculty.createdAt,
      })),
    };
  }

  // Tạo bộ môn mới
  @Post('departments')
  @Roles(UserRole.ADMIN)
  async createDepartment(@Body() createDepartmentDto: CreateDepartmentDto) {
    const department = await this.organizationService.createDepartment(createDepartmentDto);
    return {
      message: 'Tạo bộ môn thành công',
      department: {
        id: department.id,
        departmentCode: department.departmentCode,
        departmentName: department.departmentName,
        facultyId: department.facultyId,
        headId: department.headId,
        description: department.description,
        status: department.status,
      },
    };
  }

  // Lấy danh sách tất cả bộ môn
  @Get('departments')
  @Roles(UserRole.ADMIN)
  async getAllDepartments() {
    const departments = await this.organizationService.getAllDepartments();
    return {
      message: 'Lấy danh sách bộ môn thành công',
      departments: departments.map(department => ({
        id: department.id,
        departmentCode: department.departmentCode,
        departmentName: department.departmentName,
        facultyId: department.facultyId,
        faculty: department.faculty ? {
          id: department.faculty.id,
          facultyCode: department.faculty.facultyCode,
          facultyName: department.faculty.facultyName,
        } : null,
        head: department.head ? {
          id: department.head.id,
          instructorCode: department.head.instructorCode,
          user: {
            id: department.head.user.id,
            fullName: department.head.user.fullName,
          }
        } : null,
        description: department.description,
        status: department.status,
        majorCount: 0, // TODO: Implement major count when Major entity is available
        createdAt: department.createdAt,
      })),
    };
  }

  // Lấy bộ môn theo khoa
  @Get('faculties/:facultyId/departments')
  @Roles(UserRole.ADMIN)
  async getDepartmentsByFaculty(@Param('facultyId', ParseIntPipe) facultyId: number) {
    const departments = await this.organizationService.getDepartmentsByFaculty(facultyId);
    return {
      message: 'Lấy danh sách bộ môn theo khoa thành công',
      departments: departments.map(department => ({
        id: department.id,
        departmentCode: department.departmentCode,
        departmentName: department.departmentName,
        description: department.description,
        status: department.status,
        majorCount: 0, // TODO: Implement major count when Major entity is available
      })),
    };
  }

  // ================================
  // QUẢN LÝ GIẢNG VIÊN
  // ================================

  // Tạo thông tin giảng viên
  @Post('instructors')
  @Roles(UserRole.ADMIN)
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

  // Lấy danh sách tất cả giảng viên
  @Get('instructors')
  @Roles(UserRole.ADMIN)
  async getAllInstructors() {
    const instructors = await this.instructorService.getAllInstructors();
    return {
      message: 'Lấy danh sách giảng viên thành công',
      instructors: instructors.map(instructor => ({
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
    };
  }

  // Lấy giảng viên theo bộ môn
  @Get('departments/:departmentId/instructors')
  @Roles(UserRole.ADMIN)
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
  // QUẢN LÝ SINH VIÊN
  // ================================

  // Tạo thông tin sinh viên
  @Post('students')
  @Roles(UserRole.ADMIN)
  createStudent(@Body() createStudentDto: CreateStudentDto) {
    // Implementation sẽ được thêm vào StudentService
    return {
      message: 'Chức năng tạo sinh viên sẽ được implement trong StudentService',
      data: createStudentDto,
    };
  }

  // ================================
  // THỐNG KÊ NÂNG CAO
  // ================================

  // Thống kê theo khoa
  @Get('statistics/faculties')
  @Roles(UserRole.ADMIN)
  async getFacultyStatistics() {
    const faculties = await this.organizationService.getAllFaculties();
    const departments = await this.organizationService.getAllDepartments();
    const instructors = await this.instructorService.getAllInstructors();
    
    const statistics = faculties.map(faculty => {
      const facultyDepartments = departments.filter(dept => dept.facultyId === faculty.id);
      const facultyInstructors = instructors.filter(inst => 
        facultyDepartments.some(dept => dept.id === inst.departmentId)
      );
      
      return {
        facultyId: faculty.id,
        facultyCode: faculty.facultyCode,
        facultyName: faculty.facultyName,
        departmentCount: facultyDepartments.length,
        instructorCount: facultyInstructors.length,
        status: faculty.status,
      };
    });

    return {
      message: 'Lấy thống kê khoa thành công',
      statistics,
    };
  }
}
