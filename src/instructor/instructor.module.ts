import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstructorService } from './instructor.service';
import { Instructor } from './entities/instructor.entity';
import { Users } from '../user/user.entity';
import { Department } from '../organization/entities/department.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Instructor,
      Users,
      Department,
    ]),
  ],
  providers: [InstructorService],
  exports: [InstructorService],
})
export class InstructorModule {}
