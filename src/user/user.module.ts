import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './user.entity';
import { UserRoleAssignment } from './entities/usser-role-assignment.entity';
import { UserRoleDefinition } from './entities/user-role-definition.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Users, UserRoleAssignment, UserRoleDefinition])],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
