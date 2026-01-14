import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from '../jwt/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { StudentModule } from '../student/student.module';
 import { InstructorModule } from '../instructor/instructor.module';
 import { ConfigModule } from '@nestjs/config';
 import { MailModule } from "../mail/mail.module";
 import { PassportModule } from '@nestjs/passport';
 import { RedisModule } from '../redis/redis.module';
 import { TypeOrmModule } from '@nestjs/typeorm';
 import { Department } from '../organization/entities/department.entity';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    }),
    TypeOrmModule.forFeature([Department]),
    UserModule,
    StudentModule,
    InstructorModule,
    ConfigModule,
    MailModule,
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
