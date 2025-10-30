import { 
  Controller, 
  Post, 
  Get, 
  Put, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Request,
  ParseIntPipe 
} from '@nestjs/common';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { RolesGuard } from '../guards/role.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../models/enum/userRole.enum';
import { ThesisService } from './thesis.service';
import { RegisterTopicDto, ApproveTopicRegistrationDto, GetStudentRegistrationsDto, GetMyRegistrationsDto } from './dto/register-topic.dto';
import { CreateProposedTopicDto, UpdateProposedTopicDto, GetProposedTopicsDto } from './dto/proposed-topic.dto';
import { CreateThesisRoundDto, UpdateThesisRoundDto, GetThesisRoundsDto } from './dto/thesis-round.dto';
import { AddInstructorToRoundDto, AddMultipleInstructorsDto, UpdateInstructorInRoundDto, GetInstructorsInRoundDto } from './dto/thesis-round-instructor.dto';

@Controller('thesis')
@UseGuards(JwtAuthGuard)
export class ThesisController {
  constructor(private readonly thesisService: ThesisService) {}

  // ==================== SINH VIÊN ====================

  // Đăng ký đề tài (chỉ sinh viên)
  @Post('register-topic')
  @Roles(UserRole.STUDENT)
  @UseGuards(RolesGuard)
  async registerTopic(@Request() req, @Body() registerTopicDto: RegisterTopicDto) {
    const studentId = req.user.studentId;
    return this.thesisService.registerTopic(studentId, registerTopicDto);
  }

  // Lấy danh sách đề tài được đề xuất (tất cả user)
  @Get('proposed-topics')
  async getProposedTopics(@Query() query: GetProposedTopicsDto) {
    return this.thesisService.getProposedTopics(query);
  }

  // Lấy danh sách đề tài có sẵn cho sinh viên (chỉ đề tài chưa được chọn)
  @Get('available-topics')
  @Roles(UserRole.STUDENT)
  @UseGuards(RolesGuard)
  async getAvailableTopicsForStudent(@Query() query: GetProposedTopicsDto) {
    return this.thesisService.getAvailableTopicsForStudent(query);
  }

  // Lấy lịch sử đăng ký đề tài của sinh viên
  @Get('my-registrations')
  @Roles(UserRole.STUDENT)
  @UseGuards(RolesGuard)
  async getStudentTopicRegistrations(@Request() req, @Query() query: GetMyRegistrationsDto) {
    const studentId = req.user.studentId;
    return this.thesisService.getStudentTopicRegistrations(studentId, query);
  }

  // Alias cho my-registrations (để tương thích với frontend)
  @Get('students')
  @Roles(UserRole.STUDENT)
  @UseGuards(RolesGuard)
  async getStudentRegistrationsAlias(@Request() req, @Query() query: GetMyRegistrationsDto) {
    const studentId = req.user.studentId;
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
  async getStudentRegistrations(@Request() req, @Query() query: GetStudentRegistrationsDto) {
    const instructorId = req.user.instructorId;
    return this.thesisService.getStudentRegistrations(instructorId, query);
  }

  // Phê duyệt/từ chối đăng ký đề tài (chỉ giảng viên)
  @Put('approve-registration')
  @Roles(UserRole.TEACHER)
  @UseGuards(RolesGuard)
  async approveTopicRegistration(@Request() req, @Body() approveDto: ApproveTopicRegistrationDto) {
    const instructorId = req.user.instructorId;
    return this.thesisService.approveTopicRegistration(instructorId, approveDto);
  }

  // Tạo đề tài đề xuất (chỉ giảng viên)
  @Post('proposed-topics')
  @Roles(UserRole.TEACHER)
  @UseGuards(RolesGuard)
  async createProposedTopic(@Request() req, @Body() createDto: CreateProposedTopicDto) {
    const instructorId = req.user.instructorId;
    return this.thesisService.createProposedTopic(instructorId, createDto);
  }

  // Cập nhật đề tài đề xuất (chỉ giảng viên)
  @Put('proposed-topics/:id')
  @Roles(UserRole.TEACHER)
  @UseGuards(RolesGuard)
  async updateProposedTopic(
    @Request() req, 
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateDto: UpdateProposedTopicDto
  ) {
    const instructorId = req.user.instructorId;
    // TODO: Implement update proposed topic
    return {
      success: true,
      message: 'Cập nhật đề tài đề xuất thành công'
    };
  }

  // ==================== ADMIN & TRƯỞNG BỘ MÔN ====================

  // Tạo đợt luận văn (chỉ trưởng bộ môn)
  @Post('thesis-rounds')
  @Roles(UserRole.HEAD_OF_DEPARTMENT)
  @UseGuards(RolesGuard)
  async createThesisRound(@Body() createDto: CreateThesisRoundDto) {
    return this.thesisService.createThesisRound(createDto);
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

  // Thêm một giảng viên vào đợt đề tài (chỉ trưởng bộ môn)
  @Post('thesis-rounds/:roundId/instructors')
  @Roles(UserRole.HEAD_OF_DEPARTMENT)
  @UseGuards(RolesGuard)
  async addInstructorToRound(
    @Request() req,
    @Param('roundId', ParseIntPipe) roundId: number,
    @Body() addDto: AddInstructorToRoundDto
  ) {
    const userId = req.user.id;
    const userRole = req.user.role;
    return this.thesisService.addInstructorToRound(roundId, addDto, userId, userRole);
  }

  // Thêm nhiều giảng viên vào đợt đề tài (chỉ trưởng bộ môn)
  @Post('thesis-rounds/:roundId/instructors/bulk')
  @Roles(UserRole.HEAD_OF_DEPARTMENT)
  @UseGuards(RolesGuard)
  async addMultipleInstructorsToRound(
    @Request() req,
    @Param('roundId', ParseIntPipe) roundId: number,
    @Body() addDto: AddMultipleInstructorsDto
  ) {
    const userId = req.user.id;
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
    @Request() req,
    @Param('roundId', ParseIntPipe) roundId: number,
    @Param('instructorId', ParseIntPipe) instructorId: number,
    @Body() updateDto: UpdateInstructorInRoundDto
  ) {
    const userId = req.user.id;
    const userRole = req.user.role;
    return this.thesisService.updateInstructorInRound(roundId, instructorId, updateDto, userId, userRole);
  }

  // Xóa giảng viên khỏi đợt đề tài (chỉ trưởng bộ môn)
  @Put('thesis-rounds/:roundId/instructors/:instructorId/remove')
  @Roles(UserRole.HEAD_OF_DEPARTMENT)
  @UseGuards(RolesGuard)
  async removeInstructorFromRound(
    @Request() req,
    @Param('roundId', ParseIntPipe) roundId: number,
    @Param('instructorId', ParseIntPipe) instructorId: number
  ) {
    const userId = req.user.id;
    const userRole = req.user.role;
    return this.thesisService.removeInstructorFromRound(roundId, instructorId, userId, userRole);
  }

  // Lấy thống kê đăng ký đề tài (chỉ admin)
  @Get('statistics')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async getStatistics(@Query() query: any) {
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
}
