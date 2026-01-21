import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ThesisService } from './thesis.service';
import { TopicRegistration } from './entities/topic-registration.entity';
import { ProposedTopic } from './entities/proposed-topic.entity';
import { ThesisRound } from './entities/thesis-round.entity';
import { InstructorAssignment } from './entities/instructor-assignment.entity';
import { ThesisType } from './entities/thesis-type.entity';
import { ThesisRoundRequest } from './entities/thesis-round-request.entity';
import { ThesisRoundClass } from './entities/thesis-round-class.entity';
import { StudentThesisRound } from './entities/student-thesis-round.entity';
import { Thesis } from './entities/thesis.entity';
import { GuidanceProcess } from './entities/guidance-process.entity';
import { WeeklyReport } from './entities/weekly-report.entity';
import { WeeklyReportIndividualContribution } from './entities/weekly-report-individual-contribution.entity';
import { ThesisTask } from './entities/thesis-task.entity';
import { ReviewAssignment } from './entities/review-assignment.entity';
import { ThesisGroup } from './entities/thesis-group.entity';
import { ThesisGroupMember } from './entities/thesis-group-member.entity';
import { Student } from '../student/entities/student.entity';
import { Instructor } from '../instructor/entities/instructor.entity';
import { Department } from '../organization/entities/department.entity';
import { Faculty } from '../organization/entities/faculty.entity';
import { Class } from '../organization/entities/class.entity';
import { Users } from '../user/user.entity';
import { SocketGateway } from '../socket/socket.gateway';

describe('ThesisService', () => {
  let service: ThesisService;
  const topicRegistrationRepo = {
    findOne: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
  const instructorRepo = { findOne: jest.fn() };
  const departmentRepo = { findOne: jest.fn() };
  const socketGateway = { sendToUser: jest.fn() };
  const thesisRepo = { findOne: jest.fn(), save: jest.fn(), create: jest.fn() };
  const guidanceProcessRepo = { find: jest.fn() };
  const weeklyReportRepo = { find: jest.fn(), save: jest.fn(), create: jest.fn() };
  const weeklyReportIndividualContributionRepo = {};
  const thesisTaskRepo = {};
  const dataSource = {
    transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThesisService,
        { provide: getRepositoryToken(TopicRegistration), useValue: topicRegistrationRepo },
        { provide: getRepositoryToken(ProposedTopic), useValue: {} },
        { provide: getRepositoryToken(ThesisRound), useValue: {} },
        { provide: getRepositoryToken(InstructorAssignment), useValue: {} },
        { provide: getRepositoryToken(ThesisType), useValue: {} },
        { provide: getRepositoryToken(ThesisRoundRequest), useValue: {} },
        { provide: getRepositoryToken(Student), useValue: {} },
        { provide: getRepositoryToken(Instructor), useValue: instructorRepo },
        { provide: getRepositoryToken(Department), useValue: departmentRepo },
        { provide: getRepositoryToken(Faculty), useValue: {} },
        { provide: getRepositoryToken(Class), useValue: {} },
        { provide: getRepositoryToken(ThesisRoundClass), useValue: {} },
        { provide: getRepositoryToken(StudentThesisRound), useValue: {} },
        { provide: getRepositoryToken(Thesis), useValue: thesisRepo },
        { provide: getRepositoryToken(GuidanceProcess), useValue: guidanceProcessRepo },
        { provide: getRepositoryToken(WeeklyReport), useValue: weeklyReportRepo },
        {
          provide: getRepositoryToken(WeeklyReportIndividualContribution),
          useValue: weeklyReportIndividualContributionRepo,
        },
        { provide: getRepositoryToken(ThesisTask), useValue: thesisTaskRepo },
        { provide: getRepositoryToken(ReviewAssignment), useValue: {} },
        { provide: getRepositoryToken(ThesisGroup), useValue: {} },
        { provide: getRepositoryToken(ThesisGroupMember), useValue: {} },
        { provide: getRepositoryToken(Users), useValue: {} },
        { provide: SocketGateway, useValue: socketGateway },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get(ThesisService);
  });

  it('approves registration when status is PENDING (case-insensitive)', async () => {
    topicRegistrationRepo.findOne.mockResolvedValue({
      id: 5,
      instructorStatus: 'PENDING',
      headStatus: 'PENDING',
      thesisGroup: { members: [{ student: { user: { id: 10 } } }] },
      thesisRound: { department: { head: { user: { id: 99 } } } },
      instructor: { user: { fullName: 'GVHD' } },
      proposedTopic: null,
      selfProposedTitle: 'T',
      registrationDate: new Date(),
    });

    const result = await service.approveTopicRegistration(1, { registrationId: 5, approved: true });

    expect(topicRegistrationRepo.update).toHaveBeenCalledWith(
      5,
      expect.objectContaining({ instructorStatus: 'APPROVED', headStatus: 'PENDING' }),
    );
    expect(result.success).toBe(true);
  });

  it('rejects already processed registration', async () => {
    topicRegistrationRepo.findOne.mockResolvedValue({
      id: 5,
      instructorStatus: 'APPROVED',
    });

    await expect(service.approveTopicRegistration(1, { registrationId: 5, approved: true })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('head approves registration when instructor approved (case-insensitive)', async () => {
    instructorRepo.findOne.mockResolvedValue({ id: 7, user: {}, department: {} });
    departmentRepo.findOne.mockResolvedValue({ id: 3, headId: 7 });
    const registration = {
      id: 11,
      instructorStatus: 'Approved',
      headStatus: 'PENDING',
      thesisRound: { departmentId: 3, department: {} },
      thesisGroup: { members: [{ student: { user: { id: 22, fullName: 'SV' } } }] },
      instructor: { user: { id: 33 } },
    };

    const qb: any = {
      setLock: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(registration),
    };

    topicRegistrationRepo.createQueryBuilder.mockReturnValue(qb);

    dataSource.transaction.mockImplementation(async (fn: any) => {
      const manager = {
        getRepository: (entity: any) => {
          if (entity === TopicRegistration) return topicRegistrationRepo;
          if (entity === Thesis) return thesisRepo;
          if (entity === GuidanceProcess) return guidanceProcessRepo;
          if (entity === WeeklyReport) return weeklyReportRepo;
          return {};
        },
      };
      return fn(manager);
    });

    const result = await service.approveTopicRegistrationByHead(7, { registrationId: 11, approved: true });

    expect(topicRegistrationRepo.update).toHaveBeenCalledWith(
      11,
      expect.objectContaining({ headStatus: 'APPROVED' }),
    );
    expect(result.success).toBe(true);
  });
});
