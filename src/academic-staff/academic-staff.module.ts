import { Module } from '@nestjs/common';
import { AcademicStaffController } from './academic-staff.controller';
import { InstructorModule } from '../instructor/instructor.module';
import { OrganizationModule } from '../organization/organization.module';
import { StudentModule } from '../student/student.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [InstructorModule, OrganizationModule, StudentModule, UserModule],
  controllers: [AcademicStaffController],
})
export class AcademicStaffModule {}

