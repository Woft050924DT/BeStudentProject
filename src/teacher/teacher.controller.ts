import { 
  Controller, 
  Get, 
  Put, 
  Body, 
  Query,
  UseGuards, 
  Request,
  BadRequestException
} from '@nestjs/common';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { RolesGuard } from '../guards/role.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../models/enum/userRole.enum';
import { TeacherService } from './teacher.service';
import { UpdateTeacherInfoDto } from './dto/update-teacher-info.dto';
import { GetThesisRoundsDto } from '../thesis/dto/thesis-round.dto';
import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';

@Controller('teacher')
@UseGuards(JwtAuthGuard)
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  // Lấy thông tin giảng viên của chính mình
  @Get('info')
  @Roles(UserRole.TEACHER, UserRole.HEAD_OF_DEPARTMENT)
  @UseGuards(RolesGuard)
  async getMyInfo(@Request() req: AuthenticatedRequest) {
    const userId = req.user.userId;
    if (!userId) {
      throw new BadRequestException('Không tìm thấy thông tin người dùng');
    }
    return this.teacherService.getMyInfo(userId);
  }

  // Cập nhật thông tin giảng viên
  @Put('info')
  @Roles(UserRole.TEACHER, UserRole.HEAD_OF_DEPARTMENT)
  @UseGuards(RolesGuard)
  async updateMyInfo(
    @Request() req: AuthenticatedRequest,
    @Body() updateDto: UpdateTeacherInfoDto
  ) {
    const userId = req.user.userId;
    if (!userId) {
      throw new BadRequestException('Không tìm thấy thông tin người dùng');
    }
    return this.teacherService.updateMyInfo(userId, updateDto);
  }

  // Lấy danh sách đợt tiểu luận
  @Get('thesis-rounds')
  @Roles(UserRole.TEACHER, UserRole.HEAD_OF_DEPARTMENT)
  @UseGuards(RolesGuard)
  async getThesisRounds(
    @Request() req: AuthenticatedRequest,
    @Query() query: GetThesisRoundsDto
  ) {
    const userId = req.user.userId;
    if (!userId) {
      throw new BadRequestException('Không tìm thấy thông tin người dùng');
    }
    return this.teacherService.getThesisRounds(userId, query);
  }

  // Lấy bộ môn của giáo viên
  @Get('department')
  @Roles(UserRole.TEACHER, UserRole.HEAD_OF_DEPARTMENT)
  @UseGuards(RolesGuard)
  async getMyDepartment(@Request() req: AuthenticatedRequest) {
    const userId = req.user.userId;
    if (!userId) {
      throw new BadRequestException('Không tìm thấy thông tin người dùng');
    }
    return this.teacherService.getMyDepartment(userId);
  }
}
