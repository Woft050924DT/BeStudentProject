import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { Faculty } from './entities/faculty.entity';
import { Department } from './entities/department.entity';
import { Major } from './entities/major.entity';
import { Class } from './entities/class.entity';
import { Instructor } from '../instructor/entities/instructor.entity';
import { Users } from '../user/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Faculty,
      Department,
      Major,
      Class,
      Instructor,
      Users,
    ]),
  ],
  controllers: [OrganizationController],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
