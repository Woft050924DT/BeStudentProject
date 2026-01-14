import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeacherController } from './teacher.controller';
import { TeacherService } from './teacher.service';
import { Instructor } from '../instructor/entities/instructor.entity';
import { Users } from '../user/user.entity';
import { Department } from '../organization/entities/department.entity';
import { ThesisRound } from '../thesis/entities/thesis-round.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Instructor, Users, Department, ThesisRound])
  ],
  controllers: [TeacherController],
  providers: [TeacherService],
  exports: [TeacherService]
})
export class TeacherModule {}
