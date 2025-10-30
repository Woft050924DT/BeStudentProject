import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  Query, 
  UseGuards, 
  Request,
  Response,
  HttpCode,
  HttpStatus,
  UnauthorizedException
} from '@nestjs/common';
import type { Response as ExpressResponse } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './interface/login.dto';
import { RegisterDto } from './interface/register.dto';
import { ForgotPasswordDto } from './interface/forgotPassword.dto';
import { ResetPasswordDto } from './interface/resetPassword.dto';
import { ChangePasswordDto } from './interface/changePassword.dto';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { RedisService } from '../redis/redis.service';
import { JwtService } from '@nestjs/jwt';


@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Response({ passthrough: true }) res: ExpressResponse
  ) {
    const result = await this.authService.login(loginDto);
    
    // Set access token vào httpOnly cookie
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS trong production
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000, // 1 giờ
    });

    // Set refresh token vào httpOnly cookie
    if (result.refresh_token) {
      res.cookie('refresh_token', result.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
      });
    }

    return {
      message: 'Đăng nhập thành công',
      user: result.user,
      access_token: result.access_token, // Optional: có thể bỏ nếu chỉ dùng cookie
    };
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Request() req: any,
    @Response({ passthrough: true }) res: ExpressResponse
  ) {
    try {
      const accessToken = (req.cookies?.access_token as string) || 
                          (req.headers?.authorization?.replace('Bearer ', '') as string);
      
      const refreshToken = req.cookies?.refresh_token as string;

      if (accessToken) {
        try {
          const payload = this.jwtService.verify(accessToken) as any;
          const exp = (payload.exp as number) * 1000; // Convert to milliseconds
          const now = Date.now();
          const ttl = Math.max(0, Math.floor((exp - now) / 1000));
          
          if (ttl > 0) {
            // Thêm token vào blacklist với TTL = thời gian còn lại của token
            await this.redisService.set(`blacklist:access:${accessToken}`, 'true', ttl);
          }

          // Xóa session của user nếu có
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (payload.sub) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            await this.redisService.del(`session:${String(payload.sub)}`);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            await this.redisService.del(`user:socket:${String(payload.sub)}`);
          }
        } catch {
          // Token không hợp lệ hoặc đã hết hạn, bỏ qua
        }
      }

      // Xóa refresh_token từ Redis (thêm vào blacklist)
      if (refreshToken) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const payload = this.jwtService.verify(refreshToken, {
            secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
          });
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          const exp = (payload.exp as number) * 1000;
          const now = Date.now();
          const ttl = Math.max(0, Math.floor((exp - now) / 1000));
          
          if (ttl > 0) {
            await this.redisService.set(`blacklist:refresh:${refreshToken}`, 'true', ttl);
          }
        } catch {
          // Token không hợp lệ hoặc đã hết hạn, bỏ qua
        }
      }

      res.clearCookie('access_token', {
        httpOnly: true,
        sameSite: 'strict',
      });
      res.clearCookie('refresh_token', {
        httpOnly: true,
        sameSite: 'strict',
      });
      
      return {
        success: true,
        message: 'Đăng xuất thành công. Token đã được xóa khỏi cookie và Redis.'
      };
    } catch {
      // Vẫn xóa cookies dù có lỗi
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
      
      return {
        success: true,
        message: 'Đăng xuất thành công'
      };
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Request() req: any,
    @Response({ passthrough: true }) res: ExpressResponse
  ) {
    const refreshToken = req.cookies?.refresh_token as string;
    
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token không tồn tại');
    }

    // Kiểm tra refresh token có trong blacklist không
    const isBlacklisted = await this.redisService.exists(`blacklist:refresh:${refreshToken}`);
    if (isBlacklisted) {
      throw new UnauthorizedException('Refresh token đã bị vô hiệu hóa. Vui lòng đăng nhập lại.');
    }

    const result = await this.authService.refreshAccessToken(refreshToken);
    
    // Set access token mới vào cookie
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000, // 1 giờ
    });

    return {
      message: 'Refresh token thành công',
      access_token: result.access_token,
    };
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('resend-verification')
  async resendVerificationEmail(@Body() body: { email: string }) {
    return this.authService.resendVerificationEmail(body.email);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Request() req: any,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    return this.authService.changePassword(Number(req.user.sub), changePasswordDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: any) {
    return {
      user: req.user as Record<string, any>
    };
  }
}
