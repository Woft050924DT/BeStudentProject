import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationService } from './organization.service';
import { Faculty } from './entities/faculty.entity';
import { Department } from './entities/department.entity';
import { Major } from './entities/major.entity';
import { Class } from './entities/class.entity';
import { Instructor } from '../instructor/entities/instructor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Faculty,
      Department,
      Major,
      Class,
      Instructor,
    ]),
  ],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
