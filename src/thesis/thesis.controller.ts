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

  // ==================== ADMIN ====================

  // Tạo đợt luận văn (chỉ admin)
  @Post('thesis-rounds')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async createThesisRound(@Body() createDto: CreateThesisRoundDto) {
    // TODO: Implement create thesis round
    return {
      success: true,
      message: 'Tạo đợt luận văn thành công'
    };
  }

  // Cập nhật đợt luận văn (chỉ admin)
  @Put('thesis-rounds/:id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async updateThesisRound(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateDto: UpdateThesisRoundDto
  ) {
    // TODO: Implement update thesis round
    return {
      success: true,
      message: 'Cập nhật đợt luận văn thành công'
    };
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
