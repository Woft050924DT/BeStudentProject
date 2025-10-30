import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThesisController } from './thesis.controller';
import { ThesisService } from './thesis.service';
import { SocketModule } from '../socket/socket.module';

// Entities
import { ThesisType } from './entities/thesis-type.entity';
import { ThesisRound } from './entities/thesis-round.entity';
import { InstructorAssignment } from './entities/instructor-assignment.entity';
import { ProposedTopic } from './entities/proposed-topic.entity';
import { TopicRegistration } from './entities/topic-registration.entity';
import { Thesis } from './entities/thesis.entity';
import { ThesisRoundClass } from './entities/thesis-round-class.entity';

// Related entities
import { Student } from '../student/entities/student.entity';
import { Instructor } from '../instructor/entities/instructor.entity';
import { Department } from '../organization/entities/department.entity';
import { Faculty } from '../organization/entities/faculty.entity';
import { Class } from '../organization/entities/class.entity';
import { Major } from '../organization/entities/major.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Thesis entities
      ThesisType,
      ThesisRound,
      InstructorAssignment,
      ProposedTopic,
      TopicRegistration,
      Thesis,
      ThesisRoundClass,
      // Related entities
      Student,
      Instructor,
      Department,
      Faculty,
      Class,
      Major,
    ]),
    SocketModule,
  ],
  controllers: [ThesisController],
  providers: [ThesisService],
  exports: [ThesisService],
})
export class ThesisModule {}
