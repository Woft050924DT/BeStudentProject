import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Users } from './user.entity';
import { UserRoleAssignment } from './entities/usser-role-assignment.entity';
import { UserRoleDefinition } from './entities/user-role-definition.entity';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(Users), useValue: {} },
        { provide: getRepositoryToken(UserRoleAssignment), useValue: {} },
        { provide: getRepositoryToken(UserRoleDefinition), useValue: {} },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
