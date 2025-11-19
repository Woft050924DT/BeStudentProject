import { Module } from '@nestjs/common';
import { AcademicStaffController } from './academic-staff.controller';
import { InstructorModule } from '../instructor/instructor.module';
import { OrganizationModule } from '../organization/organization.module';

@Module({
  imports: [InstructorModule, OrganizationModule],
  controllers: [AcademicStaffController],
})
export class AcademicStaffModule {}

