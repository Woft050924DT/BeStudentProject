import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotImplementedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { AuthResponse } from './interface/auth-response.interface';

// Local payload type
interface JwtPayload {
  sub: string;
  email?: string;
  fullName?: string;
  roles?: string[];
}
import { Users } from '../user/user.entity';
import { RegisterDto } from './interface/register.dto';
import { LoginDto } from './interface/login.dto';
import { ChangePasswordDto } from './interface/changePassword.dto';
import { ResetPasswordDto } from './interface/resetPassword.dto';
import { ForgotPasswordDto } from './interface/forgotPassword.dto';
import { UserRole } from '../models/enum/userRole.enum';
import * as bcrypt from 'bcrypt';
// import { randomBytes } from 'crypto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
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

    return this.generateTokenResponse(user);
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


  private generateTokenResponse(
    user: Users,
  ): AuthResponse {
    if (!user.id) {
      throw new BadRequestException('Thông tin user không hợp lệ');
    }

    // Lấy role của user từ trường role trực tiếp
    const userRole = user.role ? [user.role.toLowerCase()] : ['student'];

    const payload: JwtPayload = {
      sub: user.id.toString(),
      email: user.email || undefined,
      fullName: user.fullName || undefined,
      roles: userRole,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        roles: userRole,
      },
    };
  }


}
