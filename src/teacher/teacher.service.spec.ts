import { Test, TestingModule } from '@nestjs/testing';
import { TeacherService } from './teacher.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Instructor } from '../instructor/entities/instructor.entity';
import { Users } from '../user/user.entity';
import { Department } from '../organization/entities/department.entity';
import { ThesisRound } from '../thesis/entities/thesis-round.entity';

describe('TeacherService', () => {
  let service: TeacherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeacherService,
        { provide: getRepositoryToken(Instructor), useValue: {} },
        { provide: getRepositoryToken(Users), useValue: {} },
        { provide: getRepositoryToken(Department), useValue: {} },
        { provide: getRepositoryToken(ThesisRound), useValue: {} },
      ],
    }).compile();

    service = module.get<TeacherService>(TeacherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
