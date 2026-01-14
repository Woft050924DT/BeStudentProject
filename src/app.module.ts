import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { Users } from './user/user.entity';
import { UserRoleAssignment } from './user/entities/usser-role-assignment.entity';
import { UserRoleDefinition } from './user/entities/user-role-definition.entity';
import { Student } from './student/entities/student.entity';
import { Faculty } from './organization/entities/faculty.entity';
import { Department } from './organization/entities/department.entity';
import { Major } from './organization/entities/major.entity';
import { Class } from './organization/entities/class.entity';
import { Instructor } from './instructor/entities/instructor.entity';
import { ThesisType } from './thesis/entities/thesis-type.entity';
import { ThesisRound } from './thesis/entities/thesis-round.entity';
import { ThesisRoundRequest } from './thesis/entities/thesis-round-request.entity';
import { InstructorAssignment } from './thesis/entities/instructor-assignment.entity';
import { ProposedTopic } from './thesis/entities/proposed-topic.entity';
import { ProposedTopicRule } from './thesis/entities/proposed-topic-rule.entity';
import { TopicRegistration } from './thesis/entities/topic-registration.entity';
import { Thesis } from './thesis/entities/thesis.entity';
import { ThesisMember } from './thesis/entities/thesis-member.entity';
import { ThesisGroup } from './thesis/entities/thesis-group.entity';
import { ThesisGroupMember } from './thesis/entities/thesis-group-member.entity';
import { ThesisGroupInvitation } from './thesis/entities/thesis-group-invitation.entity';
import { ThesisRoundClass } from './thesis/entities/thesis-round-class.entity';
import { StudentThesisRound } from './thesis/entities/student-thesis-round.entity';
import { GuidanceProcess } from './thesis/entities/guidance-process.entity';
import { WeeklyReport } from './thesis/entities/weekly-report.entity';
import { WeeklyReportIndividualContribution } from './thesis/entities/weekly-report-individual-contribution.entity';
import { SupervisionComment } from './thesis/entities/supervision-comment.entity';
import { ReviewAssignment } from './thesis/entities/review-assignment.entity';
import { ReviewResult } from './thesis/entities/review-result.entity';
import { DefenseCouncil } from './thesis/entities/defense-council.entity';
import { CouncilMember } from './thesis/entities/council-member.entity';
import { DefenseAssignment } from './thesis/entities/defense-assignment.entity';
import { DefenseResult } from './thesis/entities/defense-result.entity';
import { StatusHistory } from './thesis/entities/status-history.entity';
import { ThesisRoundRule } from './thesis/entities/thesis-round-rule.entity';
import { ThesisTask } from './thesis/entities/thesis-task.entity';
import { PeerEvaluation } from './thesis/entities/peer-evaluation.entity';
import { JwtModule } from './jwt/jwt.module';
import { AuthModule } from './auth/auth.module';
import {ConfigModule} from '@nestjs/config';
import { StudentModule } from './student/student.module';
import { TeacherModule } from './teacher/teacher.module';
import { AdminModule } from './admin/admin.module';
import { OrganizationModule } from './organization/organization.module';
import { InstructorModule } from './instructor/instructor.module';
import { AcademicStaffModule } from './academic-staff/academic-staff.module';
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
      database: 'PMstudentsProject',
      entities: [
        Users, 
        UserRoleDefinition,
        UserRoleAssignment,
        Student,
        Faculty,
        Department,
        Major,
        Class,
        Instructor,
        ThesisType,
        ThesisRound,
        ThesisRoundRequest,
        InstructorAssignment,
        ProposedTopic,
        ProposedTopicRule,
        TopicRegistration,
        Thesis,
        ThesisMember,
        ThesisGroup,
        ThesisGroupMember,
        ThesisGroupInvitation,
        ThesisRoundClass,
        StudentThesisRound,
        ThesisRoundRule,
        GuidanceProcess,
        WeeklyReport,
        WeeklyReportIndividualContribution,
        SupervisionComment,
        ThesisTask,
        PeerEvaluation,
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
    AcademicStaffModule,
    ThesisModule,
  ],
})
export class AppModule {}
