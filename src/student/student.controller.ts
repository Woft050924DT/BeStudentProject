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
import { StudentService } from './student.service';
import { UpdateStudentInfoDto } from './dto/update-student-info.dto';
import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';

@Controller('student')
@UseGuards(JwtAuthGuard)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  // Lấy thông tin sinh viên của chính mình
  @Get('info')
  @Roles(UserRole.STUDENT)
  @UseGuards(RolesGuard)
  async getMyInfo(@Request() req: AuthenticatedRequest) {
    const userId = req.user.userId;
    if (!userId) {
      throw new BadRequestException('Không tìm thấy thông tin người dùng');
    }
    return this.studentService.getMyInfo(userId);
  }

  // Cập nhật thông tin sinh viên
  @Put('info')
  @Roles(UserRole.STUDENT)
  @UseGuards(RolesGuard)
  async updateMyInfo(
    @Request() req: AuthenticatedRequest,
    @Body() updateDto: UpdateStudentInfoDto
  ) {
    const userId = req.user.userId;
    if (!userId) {
      throw new BadRequestException('Không tìm thấy thông tin người dùng');
    }
    return this.studentService.updateMyInfo(userId, updateDto);
  }
}
