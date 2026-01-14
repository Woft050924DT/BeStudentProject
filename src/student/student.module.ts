import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentController } from './student.controller';
import { StudentsController } from './students.controller';
import { StudentService } from './student.service';
import { Student } from './entities/student.entity';
import { Users } from '../user/user.entity';
import { Class } from '../organization/entities/class.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, Users, Class])
  ],
  controllers: [StudentController, StudentsController],
  providers: [StudentService],
  exports: [StudentService]
})
export class StudentModule {}
