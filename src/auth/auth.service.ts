import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotImplementedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { StudentService } from '../student/student.service';
import { InstructorService } from '../instructor/instructor.service';
import { AuthResponse, TokenPayload } from './interface/auth-response.interface';
import { Users } from '../user/user.entity';
import { RegisterDto } from './interface/register.dto';
import { LoginDto } from './interface/login.dto';
import { ChangePasswordDto } from './interface/changePassword.dto';
import { ResetPasswordDto } from './interface/resetPassword.dto';
import { ForgotPasswordDto } from './interface/forgotPassword.dto';
import { UserRole } from '../models/enum/userRole.enum';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly studentService: StudentService,
    private readonly instructorService: InstructorService,
    private readonly mailService: MailService,
  ) {}

  // Đăng ký tài khoản mới
  async register(
    registerDto: RegisterDto,
  ): Promise<{ message: string; user: Partial<Users> }> {
    const { email, password, username, fullName, role } = registerDto;

    // Kiểm tra email đã tồn tại (nếu cung cấp)
    if (email) {
      const existingUser = await this.userService.findByEmail(email);
      if (existingUser) {
        throw new ConflictException('Email đã được sử dụng');
      }
    }

    // Kiểm tra username đã tồn tại
    const existingUsername = await this.userService.findByUsername(username);
    if (existingUsername) {
      throw new ConflictException('Username đã được sử dụng');
    }

    // Tạo user mới với role mặc định hoặc role được chỉ định
    const userRole = role || UserRole.STUDENT;
    const user = await this.userService.create({
      email,
      username,
      password,
      fullName,
      role: userRole.toUpperCase(),
      status: true,
    });

    return {
      message:
        'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    };
  }

  // Đăng nhập bằng username/mật khẩu
  async login(
    loginDto: LoginDto,
  ): Promise<AuthResponse> {
    const { username, password } = loginDto;

    // Xác thực username và mật khẩu
    const user = await this.validateLocalUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Username hoặc mật khẩu không đúng');
    }

    // Kiểm tra trạng thái tài khoản
    if (user.status === false) {
      throw new UnauthorizedException('Tài khoản đã bị vô hiệu hóa');
    }

    return await this.generateTokenResponse(user);
  }

  // Xác thực user bằng username và mật khẩu
  async validateLocalUser(
    username: string,
    password: string,
  ): Promise<Users | null> {
    const user = await this.userService.findByUsername(username);
    if (!user || !user.password) return null;
    const ok = await bcrypt.compare(password, user.password);
    return ok ? user : null;
  }

  // Xác thực email bằng token
  verifyEmail(_token: string): Promise<{ message: string }> {
    void _token;
    return Promise.reject(
      new NotImplementedException('Chức năng xác thực email hiện không khả dụng'),
    );
  }

  resendVerificationEmail(_email: string): Promise<{ message: string }> {
    void _email;
    return Promise.reject(
      new NotImplementedException('Chức năng xác thực email hiện không khả dụng'),
    );
  }

  // Quên mật khẩu
  forgotPassword(_forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    void _forgotPasswordDto;
    return Promise.reject(
      new NotImplementedException('Chức năng quên mật khẩu hiện không khả dụng'),
    );
  }

  // Reset mật khẩu
  resetPassword(_resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    void _resetPasswordDto;
    return Promise.reject(
      new NotImplementedException('Chức năng reset mật khẩu hiện không khả dụng'),
    );
  }

  // Thay đổi mật khẩu
  async changePassword(
    userId: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const { oldPassword, newPassword } = changePasswordDto;

    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Không tìm thấy người dùng');
    }


    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new BadRequestException('Mật khẩu cũ không đúng');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    await this.userService.update(userId, {
      password: hashedNewPassword,
    });

    return { message: 'Mật khẩu đã được thay đổi thành công' };
  }

  // Helper method: Kiểm tra role có phải là instructor không
  private isInstructorRole(role: string): boolean {
    const roleUpper = role.toUpperCase();
    return roleUpper === 'TEACHER' || roleUpper === 'HEAD_OF_DEPARTMENT';
  }

  // Helper method: Kiểm tra role có phải là student không
  private isStudentRole(role: string): boolean {
    return role.toUpperCase() === 'STUDENT';
  }

  // Tạo payload cho JWT token
  private async createTokenPayload(user: Users): Promise<TokenPayload> {
    const userRole = user.role ? [user.role.toLowerCase()] : ['student'];

    const payload: TokenPayload = {
      sub: user.id.toString(),
      email: user.email || undefined,
      fullName: user.fullName || undefined,
      roles: userRole,
    };

    // Kiểm tra và thêm studentId hoặc instructorId dựa vào role
    if (user.role) {
      // Nhóm STUDENT - cần studentId
      if (this.isStudentRole(user.role)) {
        try {
          const student = await this.studentService.getStudentByUserId(user.id);
          if (student && student.id) {
            payload.studentId = student.id;
          }
        } catch {
          // Student chưa được tạo, bỏ qua
        }
      }

      // Nhóm INSTRUCTOR - cần instructorId (TEACHER và HEAD_OF_DEPARTMENT)
      if (this.isInstructorRole(user.role)) {
        try {
          const instructor = await this.instructorService.getInstructorByUserId(user.id);
          if (instructor && instructor.id) {
            payload.instructorId = instructor.id;
          }
        } catch {
          // Instructor chưa được tạo, bỏ qua
        }
      }
    }

    return payload;
  }

  // Tạo access token (thời gian ngắn - 15 phút đến 1 giờ)
  private generateAccessToken(payload: TokenPayload): string {
    const secret = this.configService.get<string>('JWT_SECRET') || 'default-secret';
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '1h';
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.jwtService.sign(payload as any, {
      secret,
      expiresIn,
    });
  }

  // Tạo refresh token (thời gian dài - 7 ngày)
  private generateRefreshToken(payload: TokenPayload): string {
    const secret = this.configService.get<string>('JWT_REFRESH_SECRET') 
      || this.configService.get<string>('JWT_SECRET') 
      || 'default-refresh-secret';
    const expiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.jwtService.sign({ sub: payload.sub } as any, {
      secret,
      expiresIn,
    });
  }

  // Generate token response với access token và refresh token
  private async generateTokenResponse(user: Users): Promise<AuthResponse> {
    if (!user.id) {
      throw new BadRequestException('Thông tin user không hợp lệ');
    }

    const payload = await this.createTokenPayload(user);
    const userRole = user.role ? [user.role.toLowerCase()] : ['student'];

    return {
      access_token: this.generateAccessToken(payload),
      refresh_token: this.generateRefreshToken(payload),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        roles: userRole,
      },
    };
  }

  // Refresh access token từ refresh token
  async refreshAccessToken(refreshToken: string): Promise<{ access_token: string }> {
    try {
      const secret = this.configService.get<string>('JWT_REFRESH_SECRET') 
        || this.configService.get<string>('JWT_SECRET') 
        || 'default-refresh-secret';
        
      const payload = this.jwtService.verify<{ sub: string }>(refreshToken, {
        secret,
      });

      if (!payload || !payload.sub) {
        throw new UnauthorizedException('Token payload không hợp lệ');
      }

      // Lấy thông tin user từ database
      const userId = parseInt(payload.sub, 10);
      const user = await this.userService.findById(userId);
      
      if (!user) {
        throw new UnauthorizedException('User không tồn tại');
      }

      if (user.status === false) {
        throw new UnauthorizedException('Tài khoản đã bị vô hiệu hóa');
      }

      // Tạo payload mới và generate access token mới
      const tokenPayload = await this.createTokenPayload(user);
      
      return {
        access_token: this.generateAccessToken(tokenPayload),
      };
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }
  }


}
