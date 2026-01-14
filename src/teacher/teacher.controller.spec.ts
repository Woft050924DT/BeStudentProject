import { Test, TestingModule } from '@nestjs/testing';
import { TeacherController } from './teacher.controller';
import { TeacherService } from './teacher.service';

describe('TeacherController', () => {
  let controller: TeacherController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeacherController],
      providers: [{ provide: TeacherService, useValue: {} }],
    }).compile();

    controller = module.get<TeacherController>(TeacherController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
