import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterTopicDto, ApproveTopicRegistrationDto, GetStudentRegistrationsDto, GetMyRegistrationsDto } from './dto/register-topic.dto';
import { CreateProposedTopicDto, GetProposedTopicsDto } from './dto/proposed-topic.dto';
import { GetThesisRoundsDto } from './dto/thesis-round.dto';
import { TopicRegistration } from './entities/topic-registration.entity';
import { ProposedTopic } from './entities/proposed-topic.entity';
import { ThesisRound } from './entities/thesis-round.entity';
import { ThesisType } from './entities/thesis-type.entity';
import { Student } from '../student/entities/student.entity';
import { Instructor } from '../instructor/entities/instructor.entity';
import { SocketGateway } from '../socket/socket.gateway';

@Injectable()
export class ThesisService {
  constructor(
    @InjectRepository(TopicRegistration)
    private topicRegistrationRepository: Repository<TopicRegistration>,
    @InjectRepository(ProposedTopic)
    private proposedTopicRepository: Repository<ProposedTopic>,
    @InjectRepository(ThesisRound)
    private thesisRoundRepository: Repository<ThesisRound>,
    @InjectRepository(ThesisType)
    private thesisTypeRepository: Repository<ThesisType>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Instructor)
    private instructorRepository: Repository<Instructor>,
    private socketGateway: SocketGateway,
  ) {}

  // Đăng ký đề tài cho sinh viên
  async registerTopic(studentId: number, registerTopicDto: RegisterTopicDto) {
    const { thesisRoundId, instructorId, proposedTopicId, selfProposedTitle, selfProposedDescription, selectionReason } = registerTopicDto;

    // Kiểm tra sinh viên tồn tại
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
      relations: ['user', 'classEntity']
    });

    if (!student) {
      throw new NotFoundException('Sinh viên không tồn tại');
    }

    // Kiểm tra đợt luận văn tồn tại và đang mở đăng ký
    const thesisRound = await this.thesisRoundRepository.findOne({
      where: { id: thesisRoundId }
    });

    if (!thesisRound) {
      throw new NotFoundException('Đợt luận văn không tồn tại');
    }

    if (thesisRound.status !== 'In Progress') {
      throw new BadRequestException('Đợt luận văn không đang mở đăng ký');
    }

    // Kiểm tra deadline đăng ký
    if (thesisRound.registrationDeadline && new Date() > new Date(thesisRound.registrationDeadline)) {
      throw new BadRequestException('Đã hết hạn đăng ký đề tài');
    }

    // Kiểm tra giảng viên tồn tại
    const instructor = await this.instructorRepository.findOne({
      where: { id: instructorId },
      relations: ['user']
    });

    if (!instructor) {
      throw new NotFoundException('Giảng viên không tồn tại');
    }

    // Kiểm tra sinh viên đã đăng ký đề tài trong đợt này chưa
    const existingRegistration = await this.topicRegistrationRepository.findOne({
      where: {
        studentId,
        thesisRoundId
      }
    });

    if (existingRegistration) {
      throw new ConflictException('Bạn đã đăng ký đề tài trong đợt này rồi');
    }

    // Nếu đăng ký đề tài được đề xuất
    if (proposedTopicId) {
      const proposedTopic = await this.proposedTopicRepository.findOne({
        where: { id: proposedTopicId }
      });

      if (!proposedTopic) {
        throw new NotFoundException('Đề tài được đề xuất không tồn tại');
      }

      if (proposedTopic.isTaken) {
        throw new ConflictException('Đề tài này đã được chọn');
      }

      if (proposedTopic.instructorId !== instructorId) {
        throw new BadRequestException('Giảng viên không phải người đề xuất đề tài này');
      }

      // Cập nhật trạng thái đề tài đã được chọn
      await this.proposedTopicRepository.update(proposedTopicId, { isTaken: true });
    }

    // Tạo đăng ký đề tài
    const topicRegistration = this.topicRegistrationRepository.create({
      studentId,
      thesisRoundId,
      instructorId,
      proposedTopicId,
      selfProposedTitle,
      selfProposedDescription,
      selectionReason,
      registrationDate: new Date()
    });

    const savedRegistration = await this.topicRegistrationRepository.save(topicRegistration);

    // Gửi thông báo real-time cho giảng viên
    await this.socketGateway.sendToUser(
      instructor.userId.toString(),
      'new_topic_registration',
      {
        registrationId: savedRegistration.id,
        studentName: student.user.fullName,
        studentCode: student.studentCode,
        topicTitle: proposedTopicId ? 
          (await this.proposedTopicRepository.findOne({ where: { id: proposedTopicId } }))?.topicTitle :
          selfProposedTitle,
        registrationDate: savedRegistration.registrationDate
      }
    );

    return {
      success: true,
      message: 'Đăng ký đề tài thành công',
      data: savedRegistration
    };
  }

  // Lấy danh sách sinh viên đăng ký đề tài cho giảng viên
  async getStudentRegistrations(instructorId: number, query: GetStudentRegistrationsDto) {
    const { thesisRoundId, status } = query;

    const whereCondition: Record<string, any> = {
      instructorId
    };

    if (thesisRoundId) {
      whereCondition.thesisRoundId = thesisRoundId;
    }

    if (status) {
      whereCondition.instructorStatus = status;
    }

    const registrations = await this.topicRegistrationRepository.find({
      where: whereCondition,
      relations: [
        'student',
        'student.user',
        'student.classEntity',
        'thesisRound',
        'proposedTopic'
      ],
      order: {
        registrationDate: 'DESC'
      }
    });

    return {
      success: true,
      data: registrations.map(registration => ({
        id: registration.id,
        student: {
          id: registration.student.id,
          studentCode: registration.student.studentCode,
          fullName: registration.student.user.fullName,
          email: registration.student.user.email,
          phone: registration.student.user.phone,
          class: {
            id: registration.student.classEntity.id,
            className: registration.student.classEntity.className,
            classCode: registration.student.classEntity.classCode
          }
        },
        thesisRound: {
          id: registration.thesisRound.id,
          roundName: registration.thesisRound.roundName,
          roundCode: registration.thesisRound.roundCode
        },
        proposedTopic: registration.proposedTopic ? {
          id: registration.proposedTopic.id,
          topicTitle: registration.proposedTopic.topicTitle,
          topicCode: registration.proposedTopic.topicCode
        } : null,
        selfProposedTitle: registration.selfProposedTitle,
        selfProposedDescription: registration.selfProposedDescription,
        selectionReason: registration.selectionReason,
        instructorStatus: registration.instructorStatus,
        headStatus: registration.headStatus,
        instructorRejectionReason: registration.instructorRejectionReason,
        headRejectionReason: registration.headRejectionReason,
        registrationDate: registration.registrationDate,
        instructorApprovalDate: registration.instructorApprovalDate,
        headApprovalDate: registration.headApprovalDate
      }))
    };
  }

  // Phê duyệt/từ chối đăng ký đề tài của giảng viên
  async approveTopicRegistration(instructorId: number, approveDto: ApproveTopicRegistrationDto) {
    const { registrationId, approved, rejectionReason } = approveDto;

    const registration = await this.topicRegistrationRepository.findOne({
      where: { 
        id: registrationId,
        instructorId 
      },
      relations: ['student', 'student.user', 'thesisRound']
    });

    if (!registration) {
      throw new NotFoundException('Đăng ký đề tài không tồn tại hoặc không thuộc quyền quản lý của bạn');
    }

    if (registration.instructorStatus !== 'Pending') {
      throw new BadRequestException('Đăng ký đề tài đã được xử lý rồi');
    }

    const updateData: Record<string, any> = {
      instructorStatus: approved ? 'Approved' : 'Rejected',
      instructorApprovalDate: new Date()
    };

    if (!approved && rejectionReason) {
      updateData.instructorRejectionReason = rejectionReason;
    }

    await this.topicRegistrationRepository.update(registrationId, updateData);

    // Gửi thông báo real-time cho sinh viên
    await this.socketGateway.sendToUser(
      registration.student.userId.toString(),
      'topic_registration_updated',
      {
        registrationId: registration.id,
        status: approved ? 'Approved' : 'Rejected',
        message: approved ? 
          'Đăng ký đề tài của bạn đã được phê duyệt' : 
          'Đăng ký đề tài của bạn đã bị từ chối',
        rejectionReason: rejectionReason
      }
    );

    return {
      success: true,
      message: approved ? 'Phê duyệt đăng ký thành công' : 'Từ chối đăng ký thành công',
      data: {
        registrationId,
        status: approved ? 'Approved' : 'Rejected'
      }
    };
  }

  // Lấy danh sách đề tài được đề xuất
  async getProposedTopics(query: GetProposedTopicsDto) {
    const { 
      thesisRoundId, 
      instructorId, 
      isTaken, 
      search, 
      page = 1, 
      limit = 10, 
      sortBy = 'createdAt', 
      sortOrder = 'DESC' 
    } = query;

    // Xây dựng điều kiện where
    const queryBuilder = this.proposedTopicRepository
      .createQueryBuilder('proposedTopic')
      .leftJoinAndSelect('proposedTopic.instructor', 'instructor')
      .leftJoinAndSelect('instructor.user', 'user')
      .leftJoinAndSelect('proposedTopic.thesisRound', 'thesisRound')
      .where('proposedTopic.status = :status', { status: true });

    // Thêm các filter
    if (thesisRoundId) {
      queryBuilder.andWhere('proposedTopic.thesisRoundId = :thesisRoundId', { thesisRoundId });
    }

    if (instructorId) {
      queryBuilder.andWhere('proposedTopic.instructorId = :instructorId', { instructorId });
    }

    if (isTaken !== undefined) {
      queryBuilder.andWhere('proposedTopic.isTaken = :isTaken', { isTaken });
    }

    // Tìm kiếm theo tiêu đề hoặc mô tả
    if (search) {
      queryBuilder.andWhere(
        '(proposedTopic.topicTitle ILIKE :search OR proposedTopic.topicDescription ILIKE :search OR user.fullName ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Sắp xếp
    const validSortFields = ['createdAt', 'topicTitle', 'updatedAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy as string : 'createdAt';
    
    if (sortBy === 'instructorName') {
      queryBuilder.orderBy('user.fullName', sortOrder as 'ASC' | 'DESC');
    } else {
      queryBuilder.orderBy(`proposedTopic.${sortField}`, sortOrder as 'ASC' | 'DESC');
    }

    // Phân trang
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit as number);

    // Thực hiện query
    const [proposedTopics, total] = await queryBuilder.getManyAndCount();

    // Tính toán thông tin phân trang
    const totalPages = Math.ceil(total / (limit as number));
    const hasNextPage = (page as number) < totalPages;
    const hasPrevPage = (page as number) > 1;

    return {
      success: true,
      data: proposedTopics.map(topic => ({
        id: topic.id,
        topicCode: topic.topicCode,
        topicTitle: topic.topicTitle,
        topicDescription: topic.topicDescription,
        objectives: topic.objectives,
        studentRequirements: topic.studentRequirements,
        technologiesUsed: topic.technologiesUsed,
        topicReferences: topic.topicReferences,
        isTaken: topic.isTaken,
        status: topic.status,
        instructor: {
          id: topic.instructor.id,
          instructorCode: topic.instructor.instructorCode,
          fullName: topic.instructor.user.fullName,
          email: topic.instructor.user.email,
          phone: topic.instructor.user.phone
        },
        thesisRound: {
          id: topic.thesisRound.id,
          roundName: topic.thesisRound.roundName,
          roundCode: topic.thesisRound.roundCode,
          status: topic.thesisRound.status
        },
        createdAt: topic.createdAt,
        updatedAt: topic.updatedAt
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage
      }
    };
  }

  // Lấy danh sách đề tài có sẵn cho sinh viên (chỉ đề tài chưa được chọn)
  async getAvailableTopicsForStudent(query: GetProposedTopicsDto) {
    const { 
      thesisRoundId, 
      search, 
      page = 1, 
      limit = 10, 
      sortBy = 'createdAt', 
      sortOrder = 'DESC' 
    } = query;

    // Xây dựng điều kiện where - chỉ lấy đề tài chưa được chọn và đang active
    const queryBuilder = this.proposedTopicRepository
      .createQueryBuilder('proposedTopic')
      .leftJoinAndSelect('proposedTopic.instructor', 'instructor')
      .leftJoinAndSelect('instructor.user', 'user')
      .leftJoinAndSelect('proposedTopic.thesisRound', 'thesisRound')
      .where('proposedTopic.status = :status', { status: true })
      .andWhere('proposedTopic.isTaken = :isTaken', { isTaken: false });

    // Chỉ hiển thị đề tài của đợt luận văn đang mở đăng ký
    if (thesisRoundId) {
      queryBuilder.andWhere('proposedTopic.thesisRoundId = :thesisRoundId', { thesisRoundId });
    } else {
      // Nếu không chỉ định đợt cụ thể, chỉ lấy đợt đang mở đăng ký
      queryBuilder.andWhere('thesisRound.status = :roundStatus', { roundStatus: 'In Progress' });
    }

    // Tìm kiếm theo tiêu đề, mô tả hoặc tên giảng viên
    if (search) {
      queryBuilder.andWhere(
        '(proposedTopic.topicTitle ILIKE :search OR proposedTopic.topicDescription ILIKE :search OR user.fullName ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Sắp xếp
    const validSortFields = ['createdAt', 'topicTitle', 'updatedAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy as string : 'createdAt';
    
    if (sortBy === 'instructorName') {
      queryBuilder.orderBy('user.fullName', sortOrder as 'ASC' | 'DESC');
    } else {
      queryBuilder.orderBy(`proposedTopic.${sortField}`, sortOrder as 'ASC' | 'DESC');
    }

    // Phân trang
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit as number);

    // Thực hiện query
    const [proposedTopics, total] = await queryBuilder.getManyAndCount();

    // Tính toán thông tin phân trang
    const totalPages = Math.ceil(total / (limit as number));
    const hasNextPage = (page as number) < totalPages;
    const hasPrevPage = (page as number) > 1;

    return {
      success: true,
      data: proposedTopics.map(topic => ({
        id: topic.id,
        topicCode: topic.topicCode,
        topicTitle: topic.topicTitle,
        topicDescription: topic.topicDescription,
        objectives: topic.objectives,
        studentRequirements: topic.studentRequirements,
        technologiesUsed: topic.technologiesUsed,
        topicReferences: topic.topicReferences,
        instructor: {
          id: topic.instructor.id,
          instructorCode: topic.instructor.instructorCode,
          fullName: topic.instructor.user.fullName,
          email: topic.instructor.user.email,
          phone: topic.instructor.user.phone
        },
        thesisRound: {
          id: topic.thesisRound.id,
          roundName: topic.thesisRound.roundName,
          roundCode: topic.thesisRound.roundCode,
          status: topic.thesisRound.status,
          registrationDeadline: topic.thesisRound.registrationDeadline
        },
        createdAt: topic.createdAt,
        updatedAt: topic.updatedAt
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage
      }
    };
  }

  // Lấy lịch sử đăng ký đề tài của sinh viên
  async getStudentTopicRegistrations(studentId: number, query: GetMyRegistrationsDto) {
    const { page = 1, limit = 10 } = query;

    const queryBuilder = this.topicRegistrationRepository
      .createQueryBuilder('registration')
      .leftJoinAndSelect('registration.thesisRound', 'thesisRound')
      .leftJoinAndSelect('registration.instructor', 'instructor')
      .leftJoinAndSelect('instructor.user', 'user')
      .leftJoinAndSelect('registration.proposedTopic', 'proposedTopic')
      .where('registration.studentId = :studentId', { studentId })
      .orderBy('registration.registrationDate', 'DESC');

    // Phân trang
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit as number);

    const [registrations, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / (limit as number));
    const hasNextPage = (page as number) < totalPages;
    const hasPrevPage = (page as number) > 1;

    return {
      success: true,
      data: registrations.map(registration => ({
        id: registration.id,
        thesisRound: {
          id: registration.thesisRound.id,
          roundName: registration.thesisRound.roundName,
          roundCode: registration.thesisRound.roundCode,
          status: registration.thesisRound.status
        },
        instructor: {
          id: registration.instructor.id,
          instructorCode: registration.instructor.instructorCode,
          fullName: registration.instructor.user.fullName,
          email: registration.instructor.user.email
        },
        proposedTopic: registration.proposedTopic ? {
          id: registration.proposedTopic.id,
          topicCode: registration.proposedTopic.topicCode,
          topicTitle: registration.proposedTopic.topicTitle
        } : null,
        selfProposedTitle: registration.selfProposedTitle,
        selfProposedDescription: registration.selfProposedDescription,
        selectionReason: registration.selectionReason,
        instructorStatus: registration.instructorStatus,
        headStatus: registration.headStatus,
        instructorRejectionReason: registration.instructorRejectionReason,
        headRejectionReason: registration.headRejectionReason,
        registrationDate: registration.registrationDate,
        instructorApprovalDate: registration.instructorApprovalDate,
        headApprovalDate: registration.headApprovalDate
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage
      }
    };
  }

  // Tạo đề tài đề xuất
  async createProposedTopic(instructorId: number, createDto: CreateProposedTopicDto) {
    const { topicCode, topicTitle, thesisRoundId, ...otherData } = createDto;

    // Kiểm tra đợt luận văn tồn tại
    const thesisRound = await this.thesisRoundRepository.findOne({
      where: { id: thesisRoundId }
    });

    if (!thesisRound) {
      throw new NotFoundException('Đợt luận văn không tồn tại');
    }

    // Kiểm tra mã đề tài đã tồn tại trong đợt này chưa
    const existingTopic = await this.proposedTopicRepository.findOne({
      where: {
        topicCode,
        thesisRoundId
      }
    });

    if (existingTopic) {
      throw new ConflictException('Mã đề tài đã tồn tại trong đợt này');
    }

    const proposedTopic = this.proposedTopicRepository.create({
      ...otherData,
      topicCode,
      topicTitle,
      instructorId,
      thesisRoundId
    });

    const savedTopic = await this.proposedTopicRepository.save(proposedTopic);

    return {
      success: true,
      message: 'Tạo đề tài đề xuất thành công',
      data: savedTopic
    };
  }

  // Lấy danh sách đợt luận văn
  async getThesisRounds(query: GetThesisRoundsDto) {
    const { thesisTypeId, departmentId, facultyId, status } = query;

    const whereCondition: Record<string, any> = {};

    if (thesisTypeId) {
      whereCondition.thesisTypeId = thesisTypeId;
    }

    if (departmentId) {
      whereCondition.departmentId = departmentId;
    }

    if (facultyId) {
      whereCondition.facultyId = facultyId;
    }

    if (status) {
      whereCondition.status = status;
    }

    const thesisRounds = await this.thesisRoundRepository.find({
      where: whereCondition,
      relations: ['thesisType', 'department', 'faculty'],
      order: {
        createdAt: 'DESC'
      }
    });

    return {
      success: true,
      data: thesisRounds
    };
  }
}
