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


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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

    // Vẫn trả về token trong response (để frontend có thể lưu nếu cần)
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
  async logout(@Response({ passthrough: true }) res: ExpressResponse) {
    // Xóa cookies
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    
    return {
      message: 'Đăng xuất thành công'
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Request() req,
    @Response({ passthrough: true }) res: ExpressResponse
  ) {
    const refreshToken = req.cookies?.refresh_token;
    
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token không tồn tại');
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
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    return this.authService.changePassword(req.user.sub, changePasswordDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return {
      user: req.user
    };
  }
}
