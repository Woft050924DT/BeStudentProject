import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UserModule } from '../user/user.module';
import { OrganizationModule } from '../organization/organization.module';
import { InstructorModule } from '../instructor/instructor.module';

@Module({
  imports: [
    UserModule,
    OrganizationModule,
    InstructorModule,
  ],
  controllers: [AdminController],
})
export class AdminModule {}
