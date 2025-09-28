import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { ProposedTopic } from './entities/proposed-topic.entity';
import { TopicRegistration } from './entities/topic-registration.entity';
import { ThesisRound } from './entities/thesis-round.entity';
import { Student } from '../student/entities/student.entity';
import { Instructor } from '../instructor/entities/instructor.entity';
import { RegisterTopicDto } from './dto/register-topic.dto';
import { ApproveTopicDto, ApprovalStatus } from './dto/approve-topic.dto';

@Injectable()
export class ThesisService {
  constructor(
    @InjectRepository(ProposedTopic)
    private readonly proposedTopicRepository: Repository<ProposedTopic>,
    @InjectRepository(TopicRegistration)
    private readonly topicRegistrationRepository: Repository<TopicRegistration>,
    @InjectRepository(ThesisRound)
    private readonly thesisRoundRepository: Repository<ThesisRound>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Instructor)
    private readonly instructorRepository: Repository<Instructor>,
  ) {}

  // Lấy danh sách đề tài cho sinh viên đăng ký
  async getAvailableTopicsForStudent(studentId: number, thesisRoundId?: number): Promise<ProposedTopic[]> {
    // Kiểm tra sinh viên có tồn tại không
    const student = await this.studentRepository.findOne({ 
      where: { id: studentId },
      relations: ['class', 'class.major', 'class.major.department']
    });
    
    if (!student) {
      throw new NotFoundException('Không tìm thấy sinh viên');
    }

    // Xây dựng query để lấy đề tài phù hợp
    const query = this.proposedTopicRepository
      .createQueryBuilder('topic')
      .leftJoinAndSelect('topic.instructor', 'instructor')
      .leftJoinAndSelect('instructor.user', 'user')
      .leftJoinAndSelect('instructor.department', 'department')
      .leftJoinAndSelect('topic.thesisRound', 'thesisRound')
      .where('topic.status = :status', { status: true })
      .andWhere('topic.isTaken = :isTaken', { isTaken: false });

    // Nếu có thesisRoundId, lọc theo đợt luận văn
    if (thesisRoundId) {
      query.andWhere('topic.thesisRoundId = :thesisRoundId', { thesisRoundId });
    }

    // Lọc theo khoa/bộ môn của sinh viên (nếu cần)
    if (student.classEntity?.major?.department) {
      query.andWhere('instructor.departmentId = :departmentId', { 
        departmentId: student.classEntity.major.department.id 
      });
    }

    return query.getMany();
  }

  // Lấy thông tin chi tiết một đề tài
  async getTopicDetail(topicId: number): Promise<ProposedTopic> {
    const topic = await this.proposedTopicRepository.findOne({
      where: { id: topicId },
      relations: [
        'instructor',
        'instructor.user',
        'instructor.department',
        'thesisRound'
      ]
    });

    if (!topic) {
      throw new NotFoundException('Không tìm thấy đề tài');
    }

    return topic;
  }

  // Đăng ký đề tài
  async registerTopic(registerTopicDto: RegisterTopicDto): Promise<TopicRegistration> {
    const { studentId, thesisRoundId, instructorId, proposedTopicId, selfProposedTitle, selfProposedDescription, selectionReason } = registerTopicDto;

    // Kiểm tra sinh viên có tồn tại không
    const student = await this.studentRepository.findOne({ where: { id: studentId } });
    if (!student) {
      throw new NotFoundException('Không tìm thấy sinh viên');
    }

    // Kiểm tra giảng viên có tồn tại không
    const instructor = await this.instructorRepository.findOne({ where: { id: instructorId } });
    if (!instructor) {
      throw new NotFoundException('Không tìm thấy giảng viên');
    }

    // Kiểm tra đợt luận văn có tồn tại không
    const thesisRound = await this.thesisRoundRepository.findOne({ where: { id: thesisRoundId } });
    if (!thesisRound) {
      throw new NotFoundException('Không tìm thấy đợt luận văn');
    }

    // Kiểm tra sinh viên đã đăng ký đề tài trong đợt này chưa
    const existingRegistration = await this.topicRegistrationRepository.findOne({
      where: { studentId, thesisRoundId }
    });

    if (existingRegistration) {
      throw new ConflictException('Sinh viên đã đăng ký đề tài trong đợt luận văn này');
    }

    // Nếu chọn đề tài có sẵn, kiểm tra đề tài có tồn tại và chưa được chọn không
    if (proposedTopicId) {
      const proposedTopic = await this.proposedTopicRepository.findOne({
        where: { id: proposedTopicId, thesisRoundId }
      });

      if (!proposedTopic) {
        throw new NotFoundException('Không tìm thấy đề tài đề xuất');
      }

      if (proposedTopic.isTaken) {
        throw new ConflictException('Đề tài này đã được chọn');
      }

      // Đánh dấu đề tài đã được chọn
      await this.proposedTopicRepository.update(proposedTopicId, { isTaken: true });
    }

    // Tạo đăng ký đề tài mới
    const topicRegistration = this.topicRegistrationRepository.create({
      studentId,
      thesisRoundId,
      instructorId,
      proposedTopicId,
      selfProposedTitle,
      selfProposedDescription,
      selectionReason,
      instructorStatus: 'Pending',
      headStatus: 'Pending'
    });

    return this.topicRegistrationRepository.save(topicRegistration);
  }

  // Lấy danh sách đăng ký đề tài của sinh viên
  async getStudentRegistrations(studentId: number): Promise<TopicRegistration[]> {
    return this.topicRegistrationRepository.find({
      where: { studentId },
      relations: [
        'thesisRound',
        'instructor',
        'instructor.user',
        'proposedTopic'
      ],
      order: { registrationDate: 'DESC' }
    });
  }

  // Lấy thông tin chi tiết đăng ký đề tài
  async getRegistrationDetail(registrationId: number): Promise<TopicRegistration> {
    const registration = await this.topicRegistrationRepository.findOne({
      where: { id: registrationId },
      relations: [
        'student',
        'student.user',
        'thesisRound',
        'instructor',
        'instructor.user',
        'proposedTopic'
      ]
    });

    if (!registration) {
      throw new NotFoundException('Không tìm thấy đăng ký đề tài');
    }

    return registration;
  }

  // Giảng viên phê duyệt/từ chối đề tài
  async approveTopicByInstructor(registrationId: number, approveTopicDto: ApproveTopicDto): Promise<TopicRegistration> {
    const registration = await this.topicRegistrationRepository.findOne({
      where: { id: registrationId }
    });

    if (!registration) {
      throw new NotFoundException('Không tìm thấy đăng ký đề tài');
    }

    if (registration.instructorStatus !== 'Pending') {
      throw new BadRequestException('Đăng ký đề tài này đã được xử lý');
    }

    const updateData: Partial<TopicRegistration> = {
      instructorStatus: approveTopicDto.status,
      instructorApprovalDate: new Date()
    };

    if (approveTopicDto.status === ApprovalStatus.REJECTED && approveTopicDto.rejectionReason) {
      updateData.instructorRejectionReason = approveTopicDto.rejectionReason;
    }

    await this.topicRegistrationRepository.update(registrationId, updateData);

    return this.getRegistrationDetail(registrationId);
  }

  // Trưởng bộ môn phê duyệt/từ chối đề tài
  async approveTopicByHead(registrationId: number, approveTopicDto: ApproveTopicDto): Promise<TopicRegistration> {
    const registration = await this.topicRegistrationRepository.findOne({
      where: { id: registrationId }
    });

    if (!registration) {
      throw new NotFoundException('Không tìm thấy đăng ký đề tài');
    }

    if (registration.headStatus !== 'Pending') {
      throw new BadRequestException('Đăng ký đề tài này đã được xử lý');
    }

    const updateData: Partial<TopicRegistration> = {
      headStatus: approveTopicDto.status,
      headApprovalDate: new Date()
    };

    if (approveTopicDto.status === ApprovalStatus.REJECTED && approveTopicDto.rejectionReason) {
      updateData.headRejectionReason = approveTopicDto.rejectionReason;
    }

    await this.topicRegistrationRepository.update(registrationId, updateData);

    return this.getRegistrationDetail(registrationId);
  }

  // Lấy danh sách đợt luận văn đang mở đăng ký
  async getActiveThesisRounds(): Promise<ThesisRound[]> {
    const currentDate = new Date();
    
    return this.thesisRoundRepository.find({
      where: {
        status: 'In Progress',
        registrationDeadline: MoreThan(currentDate)
      },
      relations: ['thesisType', 'department', 'faculty'],
      order: { registrationDeadline: 'ASC' }
    });
  }

  // Lấy danh sách giảng viên có thể hướng dẫn
  async getAvailableInstructors(departmentId?: number): Promise<Instructor[]> {
    const query = this.instructorRepository
      .createQueryBuilder('instructor')
      .leftJoinAndSelect('instructor.user', 'user')
      .leftJoinAndSelect('instructor.department', 'department')
      .where('instructor.status = :status', { status: true });

    if (departmentId) {
      query.andWhere('instructor.departmentId = :departmentId', { departmentId });
    }

    return query.getMany();
  }

  // Kiểm tra user có tồn tại trong database không
  async checkUserExists(userId: number): Promise<any> {
    try {
      const user = await this.studentRepository
        .createQueryBuilder('student')
        .leftJoinAndSelect('student.user', 'user')
        .where('user.id = :userId', { userId })
        .getOne();

      if (user) {
        return user.user;
      }

      // Nếu không tìm thấy trong student, kiểm tra trong instructor
      const instructor = await this.instructorRepository
        .createQueryBuilder('instructor')
        .leftJoinAndSelect('instructor.user', 'user')
        .where('user.id = :userId', { userId })
        .getOne();

      if (instructor) {
        return instructor.user;
      }

      // Nếu không tìm thấy trong cả hai, trả về null
      return null;
    } catch (error) {
      console.error('Error checking user exists:', error);
      return null;
    }
  }
}
