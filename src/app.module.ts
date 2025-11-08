import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { Users } from './user/user.entity';
import { Student } from './student/entities/student.entity';
import { Faculty } from './organization/entities/faculty.entity';
import { Department } from './organization/entities/department.entity';
import { Major } from './organization/entities/major.entity';
import { Class } from './organization/entities/class.entity';
import { Instructor } from './instructor/entities/instructor.entity';
import { ThesisType } from './thesis/entities/thesis-type.entity';
import { ThesisRound } from './thesis/entities/thesis-round.entity';
import { InstructorAssignment } from './thesis/entities/instructor-assignment.entity';
import { ProposedTopic } from './thesis/entities/proposed-topic.entity';
import { TopicRegistration } from './thesis/entities/topic-registration.entity';
import { Thesis } from './thesis/entities/thesis.entity';
import { ThesisRoundClass } from './thesis/entities/thesis-round-class.entity';
import { GuidanceProcess } from './thesis/entities/guidance-process.entity';
import { WeeklyReport } from './thesis/entities/weekly-report.entity';
import { SupervisionComment } from './thesis/entities/supervision-comment.entity';
import { ReviewAssignment } from './thesis/entities/review-assignment.entity';
import { ReviewResult } from './thesis/entities/review-result.entity';
import { DefenseCouncil } from './thesis/entities/defense-council.entity';
import { CouncilMember } from './thesis/entities/council-member.entity';
import { DefenseAssignment } from './thesis/entities/defense-assignment.entity';
import { DefenseResult } from './thesis/entities/defense-result.entity';
import { StatusHistory } from './thesis/entities/status-history.entity';
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
        InstructorAssignment,
        ProposedTopic,
        TopicRegistration,
        Thesis,
        ThesisRoundClass,
        GuidanceProcess,
        WeeklyReport,
        SupervisionComment,
        ReviewAssignment,
        ReviewResult,
        DefenseCouncil,
        CouncilMember,
        DefenseAssignment,
        DefenseResult,
        StatusHistory
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