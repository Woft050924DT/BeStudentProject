import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { RedisService } from '../redis/redis.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private redisService: RedisService,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request: Request) => {
          return request?.cookies?.access_token;
        }
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-super-secret-jwt-key-here',
      passReqToCallback: true, // Để có thể truy cập request trong validate
    });
  }

  async validate(request: Request, payload: any) {
    // Lấy token từ request
    const token = request?.cookies?.access_token || 
                  request?.headers?.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new UnauthorizedException('Token không tồn tại');
    }

    // Kiểm tra token có trong blacklist không
    const isBlacklisted = await this.redisService.exists(`blacklist:access:${token}`);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token đã bị vô hiệu hóa. Vui lòng đăng nhập lại.');
    }

    // Lưu token vào request để có thể sử dụng sau này
    (request as any).token = token;

    return {
      id: payload.sub,
      userId: payload.sub,
      email: payload.email,
      fullName: payload.fullName,
      role: payload.roles?.[0] || 'student',
      roles: payload.roles || [],
      studentId: payload.studentId,
      instructorId: payload.instructorId,
    };
  }
}
