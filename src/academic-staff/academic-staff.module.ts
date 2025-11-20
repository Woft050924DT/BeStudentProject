import { Module } from '@nestjs/common';
import { AcademicStaffController } from './academic-staff.controller';
import { InstructorModule } from '../instructor/instructor.module';
import { OrganizationModule } from '../organization/organization.module';
import { StudentModule } from '../student/student.module';

@Module({
  imports: [InstructorModule, OrganizationModule, StudentModule],
  controllers: [AcademicStaffController],
})
export class AcademicStaffModule {}

