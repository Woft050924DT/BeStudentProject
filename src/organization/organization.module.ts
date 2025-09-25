import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationService } from './organization.service';
import { Faculty } from './entities/faculty.entity';
import { Department } from './entities/department.entity';
import { Major } from './entities/major.entity';
import { Class } from './entities/class.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Faculty,
      Department,
      Major,
      Class,
    ]),
  ],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
