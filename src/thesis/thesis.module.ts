import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThesisController } from './thesis.controller';
import { ThesisService } from './thesis.service';
import { ProposedTopic } from './entities/proposed-topic.entity';
import { TopicRegistration } from './entities/topic-registration.entity';
import { ThesisRound } from './entities/thesis-round.entity';
import { ThesisType } from './entities/thesis-type.entity';
import { Student } from '../student/entities/student.entity';
import { Instructor } from '../instructor/entities/instructor.entity';
import { Users } from '../user/user.entity';
import { Department } from '../organization/entities/department.entity';
import { Faculty } from '../organization/entities/faculty.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProposedTopic,
      TopicRegistration,
      ThesisRound,
      ThesisType,
      Student,
      Instructor,
      Users,
      Department,
      Faculty
    ])
  ],
  controllers: [ThesisController],
  providers: [ThesisService],
  exports: [ThesisService]
})
export class ThesisModule {}
