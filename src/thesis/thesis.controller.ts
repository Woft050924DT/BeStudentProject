import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Param, 
  Body, 
  Query, 
  UseGuards, 
  Request,
  ParseIntPipe,
  ValidationPipe
} from '@nestjs/common';
import { ThesisService } from './thesis.service';
import { RegisterTopicDto } from './dto/register-topic.dto';
import { ApproveTopicDto } from './dto/approve-topic.dto';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { RolesGuard } from '../guards/role.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../models/enum/userRole.enum';

@Controller('thesis')
@UseGuards(JwtAuthGuard)
export class ThesisController {
  constructor(private readonly thesisService: ThesisService) {}

  // ==================== ENDPOINTS CHO SINH VIÊN ====================

  @Get('student/available-topics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  async getAvailableTopicsForStudent(
    @Request() req: any,
    @Query('thesisRoundId') thesisRoundId?: string
  ) {
    const studentId = req.user.userId; // Lấy từ JWT token
    const roundId = thesisRoundId ? parseInt(thesisRoundId) : undefined;
    
    return {
      success: true,
      message: 'Lấy danh sách đề tài thành công',
      data: await this.thesisService.getAvailableTopicsForStudent(studentId, roundId)
    };
  }

  @Get('student/topic/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  async getTopicDetail(@Param('id', ParseIntPipe) topicId: number) {
    return {
      success: true,
      message: 'Lấy thông tin đề tài thành công',
      data: await this.thesisService.getTopicDetail(topicId)
    };
  }

  @Post('student/register-topic')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  async registerTopic(
    @Request() req: any,
    @Body(ValidationPipe) registerTopicDto: RegisterTopicDto
  ) {
    // Gán studentId từ JWT token
    registerTopicDto.studentId = req.user.userId;
    
    return {
      success: true,
      message: 'Đăng ký đề tài thành công',
      data: await this.thesisService.registerTopic(registerTopicDto)
    };
  }

  @Get('student/my-registrations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  async getStudentRegistrations(@Request() req: any) {
    const studentId = req.user.userId;
    
    return {
      success: true,
      message: 'Lấy danh sách đăng ký thành công',
      data: await this.thesisService.getStudentRegistrations(studentId)
    };
  }

  @Get('student/registration/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  async getRegistrationDetail(@Param('id', ParseIntPipe) registrationId: number) {
    return {
      success: true,
      message: 'Lấy thông tin đăng ký thành công',
      data: await this.thesisService.getRegistrationDetail(registrationId)
    };
  }


  @Get('instructor/available-instructors')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async getAvailableInstructors(@Query('departmentId') departmentId?: string) {
    const deptId = departmentId ? parseInt(departmentId) : undefined;
    
    return {
      success: true,
      message: 'Lấy danh sách giảng viên thành công',
      data: await this.thesisService.getAvailableInstructors(deptId)
    };
  }

  @Put('instructor/approve-topic/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TEACHER)
  async approveTopicByInstructor(
    @Param('id', ParseIntPipe) registrationId: number,
    @Body(ValidationPipe) approveTopicDto: ApproveTopicDto
  ) {
    return {
      success: true,
      message: 'Phê duyệt đề tài thành công',
      data: await this.thesisService.approveTopicByInstructor(registrationId, approveTopicDto)
    };
  }


  @Put('head/approve-topic/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.HEAD_OF_DEPARTMENT, UserRole.ADMIN)
  async approveTopicByHead(
    @Param('id', ParseIntPipe) registrationId: number,
    @Body(ValidationPipe) approveTopicDto: ApproveTopicDto
  ) {
    return {
      success: true,
      message: 'Phê duyệt đề tài thành công',
      data: await this.thesisService.approveTopicByHead(registrationId, approveTopicDto)
    };
  }

  // ==================== ENDPOINTS CHUNG ====================

  @Get('active-rounds')
  @UseGuards(JwtAuthGuard)
  async getActiveThesisRounds(@Request() req: any) {
    // Log thông tin user để debug
    console.log('User info from JWT:', req.user);
    
    return {
      success: true,
      message: 'Lấy danh sách đợt luận văn thành công',
      data: await this.thesisService.getActiveThesisRounds(),
      user: req.user // Thêm thông tin user vào response để debug
    };
  }
;
  }