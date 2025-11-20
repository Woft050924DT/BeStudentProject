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
  ParseIntPipe,
  BadRequestException,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { RolesGuard } from '../guards/role.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../models/enum/userRole.enum';
import { ThesisService } from './thesis.service';
import {
  RegisterTopicDto,
  ApproveTopicRegistrationDto,
  GetStudentRegistrationsDto,
  GetMyRegistrationsDto,
} from './dto/register-topic.dto';
import {
  CreateProposedTopicDto,
  UpdateProposedTopicDto,
  GetProposedTopicsDto,
  SearchProposedTopicDto,
} from './dto/proposed-topic.dto';
import {
  CreateThesisRoundDto,
  UpdateThesisRoundDto,
  GetThesisRoundsDto,
} from './dto/thesis-round.dto';
import {
  AddInstructorToRoundDto,
  AddMultipleInstructorsDto,
  UpdateInstructorInRoundDto,
  GetInstructorsInRoundDto,
} from './dto/thesis-round-instructor.dto';
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
  async registerTopic(
    @Request() req: AuthenticatedRequest,
    @Body() registerTopicDto: RegisterTopicDto,
  ) {
    try {
      // Lấy studentId từ userId (không cần studentId trong token)
      let studentId: number | undefined = req.user.studentId;

      // Nếu không có studentId trong token, lấy từ userId
      if (!studentId) {
        const userId = req.user.userId;
        const foundStudentId =
          await this.thesisService.getStudentIdByUserId(userId);
        if (foundStudentId) {
          studentId = foundStudentId;
        }
      }

      if (!studentId) {
        throw new BadRequestException(
          'Không tìm thấy thông tin sinh viên. Vui lòng đăng nhập lại.',
        );
      }

      return await this.thesisService.registerTopic(
        studentId,
        registerTopicDto,
      );
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
  async getStudentTopicRegistrations(
    @Request() req: AuthenticatedRequest,
    @Query() query: GetMyRegistrationsDto,
  ) {
    const studentId = req.user.studentId;
    if (!studentId) {
      throw new Error('Student ID not found');
    }
    return this.thesisService.getStudentTopicRegistrations(studentId, query);
  }

  // Alias cho my-registrations (để tương thích với frontend)
  @Get('students')
  @Roles(UserRole.STUDENT)
  @UseGuards(RolesGuard)
  async getStudentRegistrationsAlias(
    @Request() req: AuthenticatedRequest,
    @Query() query: GetMyRegistrationsDto,
  ) {
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
  async getStudentRegistrations(
    @Request() req: AuthenticatedRequest,
    @Query() query: GetStudentRegistrationsDto,
  ) {
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
  async approveTopicRegistration(
    @Request() req: AuthenticatedRequest,
    @Body() approveDto: ApproveTopicRegistrationDto,
  ) {
    const instructorId = req.user.instructorId;
    if (!instructorId) {
      throw new Error('Instructor ID not found');
    }
    return this.thesisService.approveTopicRegistration(
      instructorId,
      approveDto,
    );
  }

  // Tạo đề tài đề xuất (chỉ giảng viên)
  @Post('proposed-topics')
  @Roles(UserRole.TEACHER)
  @UseGuards(RolesGuard)
  async createProposedTopic(
    @Request() req: AuthenticatedRequest,
    @Body() createDto: CreateProposedTopicDto,
  ) {
    const instructorId = req.user.instructorId;
    if (!instructorId) {
      throw new BadRequestException('');
    }
    return this.thesisService.createProposedTopic(instructorId, createDto);
  }

  // Cập nhật đề tài đề xuất (chỉ giảng viên)
  @Put('proposed-topics/:id')
  @Roles(UserRole.TEACHER)
  @UseGuards(RolesGuard)
  updateProposedTopic(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateProposedTopicDto,
  ) {
    const instructorId = req.user.instructorId;
    if (!instructorId) {
      throw new Error('Instructor ID not found');
    }

    // Gán các giá trị bắt buộc vào DTO
    updateDto.topicId = id;
    updateDto.instructorId = instructorId;

    // Gọi service
    return this.thesisService.updateProposedTopic(updateDto);
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
    @Body() updateDto: UpdateThesisRoundDto,
  ) {
    return this.thesisService.updateThesisRound(id, updateDto);
  }

  // Thêm một giảng viên vào đợt đề tài (chỉ trưởng bộ môn)
  @Post('thesis-rounds/:roundId/instructors')
  @Roles(UserRole.HEAD_OF_DEPARTMENT)
  @UseGuards(RolesGuard)
  async addInstructorToRound(
    @Request() req: AuthenticatedRequest,
    @Param('roundId', ParseIntPipe) roundId: number,
    @Body() addDto: AddInstructorToRoundDto,
  ) {
    const userId = req.user.id;
    const userRole = req.user.role;
    return this.thesisService.addInstructorToRound(
      roundId,
      addDto,
      userId,
      userRole,
    );
  }

  // Thêm nhiều giảng viên vào đợt đề tài (chỉ trưởng bộ môn)
  @Post('thesis-rounds/:roundId/instructors/bulk')
  @Roles(UserRole.HEAD_OF_DEPARTMENT)
  @UseGuards(RolesGuard)
  async addMultipleInstructorsToRound(
    @Request() req: AuthenticatedRequest,
    @Param('roundId', ParseIntPipe) roundId: number,
    @Body() addDto: AddMultipleInstructorsDto,
  ) {
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log('=== CONTROLLER DEBUG ===');
    console.log('Raw addDto received:', JSON.stringify(addDto, null, 2));
    console.log('addDto.instructors:', addDto.instructors);
    console.log('typeof addDto.instructors:', typeof addDto.instructors);
    console.log('addDto.instructors?.length:', addDto.instructors?.length);
    console.log('addDto keys:', Object.keys(addDto));

    return this.thesisService.addMultipleInstructorsToRound(
      roundId,
      addDto,
      userId,
      userRole,
    );
  }

  // Lấy danh sách giảng viên trong đợt đề tài (tất cả user)v
  @Get('thesis-rounds/:roundId/instructors')
  async getInstructorsInRound(
    @Param('roundId', ParseIntPipe) roundId: number,
    @Query() query: GetInstructorsInRoundDto,
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
    @Body() updateDto: UpdateInstructorInRoundDto,
  ) {
    const userId = req.user.id;
    const userRole = req.user.role;
    return this.thesisService.updateInstructorInRound(
      roundId,
      instructorId,
      updateDto,
      userId,
      userRole,
    );
  }

  // Xóa giảng viên khỏi đợt đề tài (chỉ trưởng bộ môn)
  @Put('thesis-rounds/:roundId/instructors/:instructorId/remove')
  @Roles(UserRole.HEAD_OF_DEPARTMENT)
  @UseGuards(RolesGuard)
  async removeInstructorFromRound(
    @Request() req: AuthenticatedRequest,
    @Param('roundId', ParseIntPipe) roundId: number,
    @Param('instructorId', ParseIntPipe) instructorId: number,
  ) {
    const userId = req.user.id;
    const userRole = req.user.role;
    return this.thesisService.removeInstructorFromRound(
      roundId,
      instructorId,
      userId,
      userRole,
    );
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
        rejectedRegistrations: 0,
      },
    };
  }
  // Lấy đề xuất đề tài của giảng viên
  @Get('proposed-topics')
  @Roles(UserRole.TEACHER)
  @UseGuards(RolesGuard)
  async getProposedTopicsByInstructor(@Request() req: AuthenticatedRequest) {
    const instructorId = req.user.instructorId;
    if (!instructorId) {
      throw new BadRequestException('Không xác định giảng viên');
    }

    return this.thesisService.getProposedTopicsByInstructor(instructorId);
  }

  // Xóa đề tài đề xuất (chỉ giảng viên)
  @Delete('proposed-topics/:id')
  @Roles(UserRole.TEACHER)
  @UseGuards(RolesGuard)
  async deleteProposedTopic(
    @Request() req: AuthenticatedRequest,
    @Param('id') topicId: string, // Lấy string trước
  ) {
    const instructorId = req.user.instructorId;
    if (!instructorId) {
      throw new NotFoundException('Instructor không hợp lệ');
    }

    // Convert sang number trước khi gửi vào service
    const topicIdNumber = Number(topicId);
    if (isNaN(topicIdNumber)) {
      throw new BadRequestException('ID đề tài không hợp lệ');
    }

    return this.thesisService.deleteProposedTopic(instructorId, topicIdNumber);
  }
  //Thêm de tài từ excel
  // controller
  @Post('proposed-topics/bulk')
  @Roles(UserRole.TEACHER)
  @UseGuards(RolesGuard)
  async createManyProposedTopics(
    @Body() data: CreateProposedTopicDto[],
    @Request() req: AuthenticatedRequest,
  ) {
    const instructorId = req.user.instructorId;
    if (!instructorId) {
      throw new BadRequestException('Không xác định giảng viên');
    }

    return this.thesisService.createManyProposedTopics(data, instructorId);
  }
  @Get('proposed-topics/search')
  async searchProposedTopics(@Query() searchDto: SearchProposedTopicDto) {
    return this.thesisService.searchProposedTopics(searchDto);
  }
}
