import { 
  Controller, 
  Get, 
  Put, 
  Body, 
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
import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';

@Controller('teacher')
@UseGuards(JwtAuthGuard)
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  // Lấy thông tin giảng viên của chính mình
  @Get('info')
  @Roles(UserRole.TEACHER)
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
  @Roles(UserRole.TEACHER)
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
}
