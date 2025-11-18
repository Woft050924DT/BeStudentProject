import { Module } from '@nestjs/common';
import { AcademicStaffController } from './academic-staff.controller';
import { InstructorModule } from '../instructor/instructor.module';

@Module({
  imports: [InstructorModule],
  controllers: [AcademicStaffController],
})
export class AcademicStaffModule {}

