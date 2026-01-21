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
  Request,
  ParseIntPipe,
  BadRequestException
} from '@nestjs/common';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { RolesGuard } from '../guards/role.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../models/enum/userRole.enum';
import { ThesisService } from './thesis.service';
import { RegisterTopicDto, ApproveTopicRegistrationDto, GetStudentRegistrationsDto, GetMyRegistrationsDto, ApproveTopicRegistrationByHeadDto, GetRegistrationsForHeadApprovalDto, GetAllStudentRegistrationsForHeadDto, SubmitWeeklyReportDto } from './dto/register-topic.dto';
import { CreateProposedTopicDto, UpdateProposedTopicDto, GetProposedTopicsDto, GetMyProposedTopicsDto } from './dto/proposed-topic.dto';
import { CreateThesisRoundDto, UpdateThesisRoundDto, GetThesisRoundsDto } from './dto/thesis-round.dto';
import { AddInstructorToRoundDto, AddMultipleInstructorsDto, UpdateInstructorInRoundDto, GetInstructorsInRoundDto } from './dto/thesis-round-instructor.dto';
import { AddClassToRoundDto, AddMultipleClassesToRoundDto } from './dto/thesis-round-class.dto';
import { AddStudentToRoundDto, AddMultipleStudentsToRoundDto } from './dto/thesis-round-student.dto';
import { RequestOpenRoundDto } from './dto/thesis-round-request.dto';
import { UpdateHeadProfileDto } from './dto/head-profile.dto';
import { AssignReviewerDto, AssignMultipleReviewersDto } from './dto/review-assignment.dto';
import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';

@Controller('thesis')
@UseGuards(JwtAuthGuard)
export class ThesisController {
  constructor(private readonly thesisService: ThesisService) {}

  // ==================== SINH VIÊN ====================

  // Đăng ký đề tài (chỉ sinh viên)
  @Post('register-topic')
  @Roles(UserRole.STUDENT)
  @UseGuards(RolesGuard)
  async registerTopic(@Request() req: AuthenticatedRequest, @Body() registerTopicDto: RegisterTopicDto) {
    try {
      // Lấy studentId từ userId (không cần studentId trong token)
      let studentId: number | undefined = req.user.studentId;
      
      // Nếu không có studentId trong token, lấy từ userId
      if (!studentId) {
        const userId = req.user.userId;
        const foundStudentId = await this.thesisService.getStudentIdByUserId(userId);
        if (foundStudentId) {
          studentId = foundStudentId;
        }
      }
      
      if (!studentId) {
        throw new BadRequestException('Không tìm thấy thông tin sinh viên. Vui lòng đăng nhập lại.');
      }
      
      return await this.thesisService.registerTopic(studentId, registerTopicDto);
    } catch (error) {
      // Log lỗi để debug
      console.error('Error in registerTopic:', error);
      throw error;
    }
  }

  @Get('proposed-topics')
  async getProposedTopics(@Query() query: GetProposedTopicsDto) {
    return this.thesisService.getProposedTopics(query);
  }

  @Get('available-topics')
  @Roles(UserRole.STUDENT)
  @UseGuards(RolesGuard)
  async getAvailableTopicsForStudent(@Query() query: GetProposedTopicsDto) {
    return this.thesisService.getAvailableTopicsForStudent(query);
  }

  @Get('my-registrations')
  @Roles(UserRole.STUDENT)
  @UseGuards(RolesGuard)
  async getStudentTopicRegistrations(@Request() req: AuthenticatedRequest, @Query() query: GetMyRegistrationsDto) {
    const studentId = req.user.studentId;
    if (!studentId) {
      throw new Error('Student ID not found');
    }
    return this.thesisService.getStudentTopicRegistrations(studentId, query);
  }

  @Get('my-thesis')
  @Roles(UserRole.STUDENT)
  @UseGuards(RolesGuard)
  async getMyApprovedThesis(@Request() req: AuthenticatedRequest) {
    let studentId: number | undefined = req.user.studentId;

    if (!studentId) {
      const userId = req.user.userId;
      const foundStudentId = await this.thesisService.getStudentIdByUserId(userId);
      if (foundStudentId) {
        studentId = foundStudentId;
      }
    }

    if (!studentId) {
      throw new BadRequestException('Không tìm thấy thông tin sinh viên. Vui lòng đăng nhập lại.');
    }

    return this.thesisService.getMyApprovedThesis(studentId);
  }

  @Get('my-thesis/weekly-reports')
  @Roles(UserRole.STUDENT)
  @UseGuards(RolesGuard)
  async getMyWeeklyReports(@Request() req: AuthenticatedRequest) {
    let studentId: number | undefined = req.user.studentId;

    if (!studentId) {
      const userId = req.user.userId;
      const foundStudentId = await this.thesisService.getStudentIdByUserId(userId);
      if (foundStudentId) {
        studentId = foundStudentId;
      }
    }

    if (!studentId) {
      throw new BadRequestException('Không tìm thấy thông tin sinh viên. Vui lòng đăng nhập lại.');
    }

    return this.thesisService.getMyWeeklyReports(studentId);
  }

  @Put('weekly-reports/:id/submit')
  @Roles(UserRole.STUDENT)
  @UseGuards(RolesGuard)
  async submitWeeklyReport(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) reportId: number,
    @Body() submitDto: SubmitWeeklyReportDto,
  ) {
    let studentId: number | undefined = req.user.studentId;

    if (!studentId) {
      const userId = req.user.userId;
      const foundStudentId = await this.thesisService.getStudentIdByUserId(userId);
      if (foundStudentId) {
        studentId = foundStudentId;
      }
    }

    if (!studentId) {
      throw new BadRequestException('Không tìm thấy thông tin sinh viên. Vui lòng đăng nhập lại.');
    }

    return this.thesisService.submitWeeklyReport(studentId, reportId, submitDto);
  }

  // Alias cho my-registrations (để tương thích với frontend)
  @Get('students')
  @Roles(UserRole.STUDENT)
  @UseGuards(RolesGuard)
  async getStudentRegistrationsAlias(@Request() req: AuthenticatedRequest, @Query() query: GetMyRegistrationsDto) {
    const studentId = req.user.studentId;
    if (!studentId) {
      throw new Error('Student ID not found');
    }
    return this.thesisService.getStudentTopicRegistrations(studentId, query);
  }

  // Lấy danh sách đợt luận văn (tất cả user)
  @Get('thesis-rounds')
  async getThesisRounds(@Query() query: GetThesisRoundsDto) {
    return this.thesisService.getThesisRounds(query);
  }

  // Lấy chi tiết một đợt luận văn (tất cả user)
  @Get('thesis-rounds/:id')
  async getThesisRoundById(@Param('id', ParseIntPipe) id: number) {
    return this.thesisService.getThesisRoundById(id);
  }


  // Lấy danh sách sinh viên đăng ký đề tài (chỉ giảng viên)
  @Get('student-registrations')
  @Roles(UserRole.TEACHER)
  @UseGuards(RolesGuard)
  async getStudentRegistrations(@Request() req: AuthenticatedRequest, @Query() query: GetStudentRegistrationsDto) {
    const instructorId = req.user.instructorId;
    if (!instructorId) {
      throw new Error('Instructor ID not found');
    }
    return this.thesisService.getStudentRegistrations(instructorId, query);
  }

  // Phê duyệt/từ chối đăng ký đề tài (chỉ giảng viên)
  @Put('approve-registration')
  @Roles(UserRole.TEACHER)
  @UseGuards(RolesGuard)
  async approveTopicRegistration(@Request() req: AuthenticatedRequest, @Body() approveDto: ApproveTopicRegistrationDto) {
    const instructorId = req.user.instructorId;
    if (!instructorId) {
      throw new Error('Instructor ID not found');
    }
    return this.thesisService.approveTopicRegistration(instructorId, approveDto);
  }

  // Tạo đề tài đề xuất (chỉ giảng viên)
  @Post('proposed-topics')
  @Roles(UserRole.TEACHER)
  @UseGuards(RolesGuard)
  async createProposedTopic(@Request() req: AuthenticatedRequest, @Body() createDto: CreateProposedTopicDto) {
    const instructorId = req.user.instructorId;
    if (!instructorId) {
      throw new BadRequestException('Không tìm thấy thông tin giảng viên. Vui lòng đăng nhập lại.');
    }
    return this.thesisService.createProposedTopic(instructorId, createDto);
  }

  // Lấy danh sách đề tài mà giáo viên đã tạo trong đợt đề tài (chỉ giảng viên)
  @Get('my-proposed-topics')
  @Roles(UserRole.TEACHER)
  @UseGuards(RolesGuard)
  async getMyProposedTopics(@Request() req: AuthenticatedRequest, @Query() query: GetMyProposedTopicsDto) {
    const instructorId = req.user.instructorId;
    if (!instructorId) {
      throw new BadRequestException('Không tìm thấy thông tin giảng viên. Vui lòng đăng nhập lại.');
    }
    return this.thesisService.getMyProposedTopics(instructorId, query);
  }

  // Cập nhật đề tài đề xuất (chỉ giảng viên)
  @Put('proposed-topics/:id')
  @Roles(UserRole.TEACHER)
  @UseGuards(RolesGuard)
  async updateProposedTopic(
    @Request() req: AuthenticatedRequest, 
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateDto: UpdateProposedTopicDto
  ) {
    const instructorId = req.user.instructorId;
    if (!instructorId) {
      throw new BadRequestException('Không tìm thấy thông tin giảng viên. Vui lòng đăng nhập lại.');
    }
    return this.thesisService.updateProposedTopic(instructorId, id, updateDto);
  }

  // ==================== ADMIN & TRƯỞNG BỘ MÔN ====================

  // Gửi yêu cầu mở đợt đề tài cho trưởng bộ môn (Admin hoặc Giáo viên)
  @Post('request-open-round')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @UseGuards(RolesGuard)
  async requestOpenRound(@Request() req: AuthenticatedRequest, @Body() requestDto: RequestOpenRoundDto) {
    const userId = req.user.userId;
    if (!userId) {
      throw new BadRequestException('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
    }
    return this.thesisService.requestOpenThesisRound(userId, requestDto);
  }

  // Tạo đợt luận văn (trưởng bộ môn và giáo viên)
  @Post('thesis-rounds')
  @Roles(UserRole.HEAD_OF_DEPARTMENT, UserRole.TEACHER)
  @UseGuards(RolesGuard)
  async createThesisRound(
    @Request() req: AuthenticatedRequest,
    @Body() createDto: CreateThesisRoundDto
  ) {
    const userId = req.user.userId;
    const userRole = req.user.role;
    return this.thesisService.createThesisRound(createDto, userId, userRole);
  }

  // Cập nhật đợt luận văn (chỉ trưởng bộ môn)
  @Put('thesis-rounds/:id')
  @Roles(UserRole.HEAD_OF_DEPARTMENT)
  @UseGuards(RolesGuard)
  async updateThesisRound(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateDto: UpdateThesisRoundDto
  ) {
    return this.thesisService.updateThesisRound(id, updateDto);
  }

  // Thêm một giảng viên vào đợt đề tài (trưởng bộ môn và giáo viên)
  @Post('thesis-rounds/:roundId/instructors')
  @Roles(UserRole.HEAD_OF_DEPARTMENT, UserRole.TEACHER)
  @UseGuards(RolesGuard)
  async addInstructorToRound(
    @Request() req: AuthenticatedRequest,
    @Param('roundId', ParseIntPipe) roundId: number,
    @Body() addDto: AddInstructorToRoundDto
  ) {
    const userId = req.user.userId;
    const userRole = req.user.role;
    return this.thesisService.addInstructorToRound(roundId, addDto, userId, userRole);
  }

  // Thêm nhiều giảng viên vào đợt đề tài (trưởng bộ môn và giáo viên)
  @Post('thesis-rounds/:roundId/instructors/bulk')
  @Roles(UserRole.HEAD_OF_DEPARTMENT, UserRole.TEACHER)
  @UseGuards(RolesGuard)
  async addMultipleInstructorsToRound(
    @Request() req: AuthenticatedRequest,
    @Param('roundId', ParseIntPipe) roundId: number,
    @Body() addDto: AddMultipleInstructorsDto
  ) {
    const userId = req.user.userId;
    const userRole = req.user.role;

    console.log('=== CONTROLLER DEBUG ===');
    console.log('Raw addDto received:', JSON.stringify(addDto, null, 2));
    console.log('addDto.instructors:', addDto.instructors);
    console.log('typeof addDto.instructors:', typeof addDto.instructors);
    console.log('addDto.instructors?.length:', addDto.instructors?.length);
    console.log('addDto keys:', Object.keys(addDto));

    return this.thesisService.addMultipleInstructorsToRound(roundId, addDto, userId, userRole);
  }

  // Lấy danh sách giảng viên trong đợt đề tài (tất cả user)
  @Get('thesis-rounds/:roundId/instructors')
  async getInstructorsInRound(
    @Param('roundId', ParseIntPipe) roundId: number,
    @Query() query: GetInstructorsInRoundDto
  ) {
    return this.thesisService.getInstructorsInRound(roundId, query);
  }

  // Cập nhật thông tin giảng viên trong đợt (chỉ trưởng bộ môn)
  @Put('thesis-rounds/:roundId/instructors/:instructorId')
  @Roles(UserRole.HEAD_OF_DEPARTMENT)
  @UseGuards(RolesGuard)
  async updateInstructorInRound(
    @Request() req: AuthenticatedRequest,
    @Param('roundId', ParseIntPipe) roundId: number,
    @Param('instructorId', ParseIntPipe) instructorId: number,
    @Body() updateDto: UpdateInstructorInRoundDto
  ) {
    const userId = req.user.userId;
    const userRole = req.user.role;
    return this.thesisService.updateInstructorInRound(roundId, instructorId, updateDto, userId, userRole);
  }

  // Xóa giảng viên khỏi đợt đề tài (chỉ trưởng bộ môn)
  @Put('thesis-rounds/:roundId/instructors/:instructorId/remove')
  @Roles(UserRole.HEAD_OF_DEPARTMENT)
  @UseGuards(RolesGuard)
  async removeInstructorFromRound(
    @Request() req: AuthenticatedRequest,
    @Param('roundId', ParseIntPipe) roundId: number,
    @Param('instructorId', ParseIntPipe) instructorId: number
  ) {
    const userId = req.user.userId;
    const userRole = req.user.role;
    return this.thesisService.removeInstructorFromRound(roundId, instructorId, userId, userRole);
  }

  // ==================== QUẢN LÝ LỚP TRONG ĐỢT ====================

  // Thêm một lớp vào đợt đề tài (trưởng bộ môn và giáo viên)
  @Post('thesis-rounds/:roundId/classes')
  @Roles(UserRole.HEAD_OF_DEPARTMENT, UserRole.TEACHER)
  @UseGuards(RolesGuard)
  async addClassToRound(
    @Request() req: AuthenticatedRequest,
    @Param('roundId', ParseIntPipe) roundId: number,
    @Body() addDto: AddClassToRoundDto
  ) {
    const userId = req.user.userId;
    const userRole = req.user.role;
    return this.thesisService.addClassToRound(roundId, addDto, userId, userRole);
  }

  // Thêm nhiều lớp vào đợt đề tài (trưởng bộ môn và giáo viên)
  @Post('thesis-rounds/:roundId/classes/bulk')
  @Roles(UserRole.HEAD_OF_DEPARTMENT, UserRole.TEACHER)
  @UseGuards(RolesGuard)
  async addMultipleClassesToRound(
    @Request() req: AuthenticatedRequest,
    @Param('roundId', ParseIntPipe) roundId: number,
    @Body() addDto: AddMultipleClassesToRoundDto
  ) {
    const userId = req.user.userId;
    const userRole = req.user.role;
    return this.thesisService.addMultipleClassesToRound(roundId, addDto, userId, userRole);
  }

  // Lấy danh sách lớp trong đợt đề tài (tất cả user)
  @Get('thesis-rounds/:roundId/classes')
  async getClassesInRound(
    @Param('roundId', ParseIntPipe) roundId: number
  ) {
    return this.thesisService.getClassesInRound(roundId);
  }

  // Xóa lớp khỏi đợt đề tài (trưởng bộ môn và giáo viên)
  @Delete('thesis-rounds/:roundId/classes/:classId')
  @Roles(UserRole.HEAD_OF_DEPARTMENT, UserRole.TEACHER)
  @UseGuards(RolesGuard)
  async removeClassFromRound(
    @Request() req: AuthenticatedRequest,
    @Param('roundId', ParseIntPipe) roundId: number,
    @Param('classId', ParseIntPipe) classId: number
  ) {
    const userId = req.user.userId;
    const userRole = req.user.role;
    return this.thesisService.removeClassFromRound(roundId, classId, userId, userRole);
  }

  // ==================== QUẢN LÝ HỌC SINH TRONG ĐỢT ====================

  // Thêm một học sinh vào đợt đề tài (trưởng bộ môn và giáo viên)
  @Post('thesis-rounds/:roundId/students')
  @Roles(UserRole.HEAD_OF_DEPARTMENT, UserRole.TEACHER)
  @UseGuards(RolesGuard)
  async addStudentToRound(
    @Request() req: AuthenticatedRequest,
    @Param('roundId', ParseIntPipe) roundId: number,
    @Body() addDto: AddStudentToRoundDto
  ) {
    const userId = req.user.userId;
    const userRole = req.user.role;
    return this.thesisService.addStudentToRound(roundId, addDto, userId, userRole);
  }

  // Thêm nhiều học sinh vào đợt đề tài (trưởng bộ môn và giáo viên)
  @Post('thesis-rounds/:roundId/students/bulk')
  @Roles(UserRole.HEAD_OF_DEPARTMENT, UserRole.TEACHER)
  @UseGuards(RolesGuard)
  async addMultipleStudentsToRound(
    @Request() req: AuthenticatedRequest,
    @Param('roundId', ParseIntPipe) roundId: number,
    @Body() addDto: AddMultipleStudentsToRoundDto
  ) {
    const userId = req.user.userId;
    const userRole = req.user.role;
    return this.thesisService.addMultipleStudentsToRound(roundId, addDto, userId, userRole);
  }

  // Lấy danh sách học sinh trong đợt đề tài (tất cả user)
  @Get('thesis-rounds/:roundId/students')
  async getStudentsInRound(
    @Param('roundId', ParseIntPipe) roundId: number
  ) {
    return this.thesisService.getStudentsInRound(roundId);
  }

  // Xóa học sinh khỏi đợt đề tài (trưởng bộ môn và giáo viên)
  @Delete('thesis-rounds/:roundId/students/:studentId')
  @Roles(UserRole.HEAD_OF_DEPARTMENT, UserRole.TEACHER)
  @UseGuards(RolesGuard)
  async removeStudentFromRound(
    @Request() req: AuthenticatedRequest,
    @Param('roundId', ParseIntPipe) roundId: number,
    @Param('studentId', ParseIntPipe) studentId: number
  ) {
    const userId = req.user.userId;
    const userRole = req.user.role;
    return this.thesisService.removeStudentFromRound(roundId, studentId, userId, userRole);
  }

  // ==================== TRƯỞNG BỘ MÔN ====================

  // Lấy tất cả đăng ký đề tài của sinh viên trong bộ môn
  @Get('head/student-registrations')
  @Roles(UserRole.HEAD_OF_DEPARTMENT, UserRole.TEACHER)
  @UseGuards(RolesGuard)
  async getAllStudentRegistrationsForHead(@Request() req: AuthenticatedRequest, @Query() query: GetAllStudentRegistrationsForHeadDto) {
    const userId = req.user.userId;
    let instructorId: number | null = req.user.instructorId ?? null;

    if (!instructorId && userId) {
      const foundInstructorId = await this.thesisService.getInstructorIdByUserId(userId);
      if (foundInstructorId) {
        instructorId = foundInstructorId;
      }
    }

    if (!instructorId) {
      throw new BadRequestException('Không tìm thấy thông tin trưởng bộ môn. Vui lòng đăng nhập lại.');
    }
    return this.thesisService.getAllStudentRegistrationsForHeadByInstructorId(instructorId, query);
  }

  // Lấy danh sách đăng ký chờ trưởng bộ môn phê duyệt
  @Get('head/pending-registrations')
  @Roles(UserRole.HEAD_OF_DEPARTMENT, UserRole.TEACHER)
  @UseGuards(RolesGuard)
  async getRegistrationsForHeadApproval(@Request() req: AuthenticatedRequest, @Query() query: GetRegistrationsForHeadApprovalDto) {
    const userId = req.user.userId;
    let instructorId: number | null = req.user.instructorId ?? null;

    if (!instructorId && userId) {
      const foundInstructorId = await this.thesisService.getInstructorIdByUserId(userId);
      if (foundInstructorId) {
        instructorId = foundInstructorId;
      }
    }

    if (!instructorId) {
      throw new BadRequestException('Không tìm thấy thông tin trưởng bộ môn. Vui lòng đăng nhập lại.');
    }
    return this.thesisService.getRegistrationsForHeadApprovalByInstructorId(instructorId, query);
  }

  // Lấy danh sách sinh viên đăng ký đề tài đã được GVHD phê duyệt để trưởng bộ môn phê duyệt
  @Get('head/instructor-approved-registrations')
  @Roles(UserRole.HEAD_OF_DEPARTMENT, UserRole.TEACHER)
  @UseGuards(RolesGuard)
  async getInstructorApprovedRegistrationsForHead(
    @Request() req: AuthenticatedRequest,
    @Query() query: GetRegistrationsForHeadApprovalDto,
  ) {
    const userId = req.user.userId;
    let instructorId: number | null = req.user.instructorId ?? null;

    if (!instructorId && userId) {
      const foundInstructorId = await this.thesisService.getInstructorIdByUserId(userId);
      if (foundInstructorId) {
        instructorId = foundInstructorId;
      }
    }

    if (!instructorId) {
      throw new BadRequestException('Không tìm thấy thông tin trưởng bộ môn. Vui lòng đăng nhập lại.');
    }

    return this.thesisService.getRegistrationsForHeadApprovalByInstructorId(instructorId, query);
  }

  // Trưởng bộ môn phê duyệt/từ chối đăng ký đề tài
  @Put('head/approve-registration')
  @Roles(UserRole.HEAD_OF_DEPARTMENT, UserRole.TEACHER)
  @UseGuards(RolesGuard)
  async approveTopicRegistrationByHead(@Request() req: AuthenticatedRequest, @Body() approveDto: ApproveTopicRegistrationByHeadDto) {
    const userId = req.user.userId;
    let instructorId: number | null = req.user.instructorId ?? null;

    if (!instructorId && userId) {
      const foundInstructorId = await this.thesisService.getInstructorIdByUserId(userId);
      if (foundInstructorId) {
        instructorId = foundInstructorId;
      }
    }

    if (!instructorId) {
      throw new BadRequestException('Không tìm thấy thông tin trưởng bộ môn. Vui lòng đăng nhập lại.');
    }
    return this.thesisService.approveTopicRegistrationByHead(instructorId, approveDto);
  }

  // Lấy thông tin cá nhân trưởng bộ môn
  @Get('head/profile')
  @Roles(UserRole.HEAD_OF_DEPARTMENT, UserRole.TEACHER)
  @UseGuards(RolesGuard)
  async getHeadProfile(@Request() req: AuthenticatedRequest) {
    const userId = req.user.userId;
    let instructorId: number | null = req.user.instructorId ?? null;
    
    // Nếu không có instructorId trong token, thử lấy từ userId
    if (!instructorId && userId) {
      const foundInstructorId = await this.thesisService.getInstructorIdByUserId(userId);
      if (foundInstructorId) {
        instructorId = foundInstructorId;
      }
    }
    
    return this.thesisService.getHeadProfile(instructorId, userId);
  }

  // Cập nhật thông tin cá nhân trưởng bộ môn
  @Put('head/profile')
  @Roles(UserRole.HEAD_OF_DEPARTMENT, UserRole.TEACHER)
  @UseGuards(RolesGuard)
  async updateHeadProfile(@Request() req: AuthenticatedRequest, @Body() updateDto: UpdateHeadProfileDto) {
    const userId = req.user.userId;
    let instructorId: number | null = req.user.instructorId ?? null;
    
    // Nếu không có instructorId trong token, thử lấy từ userId
    if (!instructorId && userId) {
      const foundInstructorId = await this.thesisService.getInstructorIdByUserId(userId);
      if (foundInstructorId) {
        instructorId = foundInstructorId;
      }
    }
    
    return this.thesisService.updateHeadProfile(instructorId, userId, updateDto);
  }

  // Lấy thống kê đăng ký đề tài (chỉ admin)
  @Get('statistics')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  getStatistics() {
    // TODO: Implement statistics
    return {
      success: true,
      data: {
        totalRegistrations: 0,
        approvedRegistrations: 0,
        pendingRegistrations: 0,
        rejectedRegistrations: 0
      }
    };
  }

  // ==================== PHÂN CÔNG GIÁO VIÊN PHẢN BIỆN ====================

  // Phân công một giáo viên phản biện cho một đề tài
  @Post('head/assign-reviewer')
  @Roles(UserRole.HEAD_OF_DEPARTMENT)
  @UseGuards(RolesGuard)
  async assignReviewerToThesis(@Request() req: AuthenticatedRequest, @Body() assignDto: AssignReviewerDto) {
    const instructorId = req.user.instructorId;
    if (!instructorId) {
      throw new BadRequestException('Không tìm thấy thông tin trưởng bộ môn. Vui lòng đăng nhập lại.');
    }
    return this.thesisService.assignReviewerToThesis(instructorId, assignDto);
  }

  // Phân công nhiều giáo viên phản biện cho nhiều đề tài
  @Post('head/assign-reviewers/bulk')
  @Roles(UserRole.HEAD_OF_DEPARTMENT)
  @UseGuards(RolesGuard)
  async assignMultipleReviewersToTheses(@Request() req: AuthenticatedRequest, @Body() assignDto: AssignMultipleReviewersDto) {
    const instructorId = req.user.instructorId;
    if (!instructorId) {
      throw new BadRequestException('Không tìm thấy thông tin trưởng bộ môn. Vui lòng đăng nhập lại.');
    }
    return this.thesisService.assignMultipleReviewersToTheses(instructorId, assignDto);
  }
}
