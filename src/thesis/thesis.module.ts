import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThesisController } from './thesis.controller';
import { ThesisService } from './thesis.service';
import { SocketModule } from '../socket/socket.module';

// Entities
import { ThesisType } from './entities/thesis-type.entity';
import { ThesisRound } from './entities/thesis-round.entity';
import { ThesisRoundRequest } from './entities/thesis-round-request.entity';
import { InstructorAssignment } from './entities/instructor-assignment.entity';
import { ProposedTopic } from './entities/proposed-topic.entity';
import { ProposedTopicRule } from './entities/proposed-topic-rule.entity';
import { TopicRegistration } from './entities/topic-registration.entity';
import { Thesis } from './entities/thesis.entity';
import { ThesisMember } from './entities/thesis-member.entity';
import { ThesisGroup } from './entities/thesis-group.entity';
import { ThesisGroupMember } from './entities/thesis-group-member.entity';
import { ThesisGroupInvitation } from './entities/thesis-group-invitation.entity';
import { ThesisRoundClass } from './entities/thesis-round-class.entity';
import { StudentThesisRound } from './entities/student-thesis-round.entity';
import { GuidanceProcess } from './entities/guidance-process.entity';
import { WeeklyReport } from './entities/weekly-report.entity';
import { WeeklyReportIndividualContribution } from './entities/weekly-report-individual-contribution.entity';
import { SupervisionComment } from './entities/supervision-comment.entity';
import { ReviewAssignment } from './entities/review-assignment.entity';
import { ReviewResult } from './entities/review-result.entity';
import { DefenseCouncil } from './entities/defense-council.entity';
import { CouncilMember } from './entities/council-member.entity';
import { DefenseAssignment } from './entities/defense-assignment.entity';
import { DefenseResult } from './entities/defense-result.entity';
import { StatusHistory } from './entities/status-history.entity';
import { ThesisRoundRule } from './entities/thesis-round-rule.entity';
import { ThesisTask } from './entities/thesis-task.entity';
import { PeerEvaluation } from './entities/peer-evaluation.entity';

// Related entities
import { Student } from '../student/entities/student.entity';
import { Instructor } from '../instructor/entities/instructor.entity';
import { Department } from '../organization/entities/department.entity';
import { Faculty } from '../organization/entities/faculty.entity';
import { Class } from '../organization/entities/class.entity';
import { Major } from '../organization/entities/major.entity';
import { Users } from '../user/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Thesis entities
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
      ThesisTask,
      PeerEvaluation,
      SupervisionComment,
      ReviewAssignment,
      ReviewResult,
      DefenseCouncil,
      CouncilMember,
      DefenseAssignment,
      DefenseResult,
      StatusHistory,
      // Related entities
      Student,
      Instructor,
      Department,
      Faculty,
      Class,
      Major,
      Users,
    ]),
    SocketModule,
  ],
  controllers: [ThesisController],
  providers: [ThesisService],
  exports: [ThesisService],
})
export class ThesisModule {}
