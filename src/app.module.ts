import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { Users } from './user/user.entity';
import { UserRoleEntity } from './user/entities/user-role.entity';
import { UserRoleAssignment } from './user/entities/usser-role-assignment.entity';
import { UserRole } from './user/entities/user-role-definition.entity';
import { Student } from './student/entities/student.entity';
import { Faculty } from './organization/entities/faculty.entity';
import { Department } from './organization/entities/department.entity';
import { Major } from './organization/entities/major.entity';
import { Class } from './organization/entities/class.entity';
import { Instructor } from './instructor/entities/instructor.entity';
import { ThesisType } from './thesis/entities/thesis-type.entity';
import { ThesisRound } from './thesis/entities/thesis-round.entity';
import { ProposedTopic } from './thesis/entities/proposed-topic.entity';
import { TopicRegistration } from './thesis/entities/topic-registration.entity';
import { Thesis } from './thesis/entities/thesis.entity';
import { ThesisRoundClass } from './thesis/entities/thesis-round-class.entity';
import { JwtModule } from './jwt/jwt.module';
import { AuthModule } from './auth/auth.module';
import {ConfigModule} from '@nestjs/config';
import { StudentModule } from './student/student.module';
import { TeacherModule } from './teacher/teacher.module';
import { AdminModule } from './admin/admin.module';
import { OrganizationModule } from './organization/organization.module';
import { InstructorModule } from './instructor/instructor.module';
import { RedisModule } from './redis/redis.module';
import { SocketModule } from './socket/socket.module';
import { ThesisModule } from './thesis/thesis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'dt2711',
      database: 'student',
      entities: [
        Users, 
        Student,
        Faculty,
        Department,
        Major,
        Class,
        Instructor,
        ThesisType,
        ThesisRound,
        ProposedTopic,
        TopicRegistration,
        Thesis,
        ThesisRoundClass
      ],
      synchronize: false,
      logging: true,
    }),
    
    RedisModule,
    SocketModule,
    UserModule,
    JwtModule,
    AuthModule,
    StudentModule,
    TeacherModule,
    AdminModule,
    OrganizationModule,
    InstructorModule,
    ThesisModule,
  ],
})
export class AppModule {}