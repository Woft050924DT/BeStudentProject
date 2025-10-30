import { Module } from '@nestjs/common';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from './jwt.service';
import { JwtController } from './jwt.controller';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    NestJwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '24h'),
        },
      }),
      inject: [ConfigService],
    }),
    RedisModule,
  ],
  controllers: [JwtController],
  providers: [JwtService, JwtAuthGuard],
  exports: [JwtService, JwtAuthGuard, NestJwtModule],
})
export class JwtModule {}
