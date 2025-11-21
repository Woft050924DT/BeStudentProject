import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import {
  RegisterTopicDto,
  ApproveTopicRegistrationDto,
  GetStudentRegistrationsDto,
  GetMyRegistrationsDto,
} from './dto/register-topic.dto';
import {
  CreateProposedTopicDto,
  GetProposedTopicsDto,
  UpdateProposedTopicDto,
  SearchProposedTopicDto,
} from './dto/proposed-topic.dto';
import {
  CreateThesisRoundDto,
  UpdateThesisRoundDto,
  GetThesisRoundsDto,
} from './dto/thesis-round.dto';
import {
  AddInstructorToRoundDto,
  AddMultipleInstructorsDto,
  UpdateInstructorInRoundDto,
  GetInstructorsInRoundDto,
} from './dto/thesis-round-instructor.dto';
import { TopicRegistration } from './entities/topic-registration.entity';
import { ProposedTopic } from './entities/proposed-topic.entity';
import { ThesisRound } from './entities/thesis-round.entity';
import { InstructorAssignment } from './entities/instructor-assignment.entity';
import { ThesisType } from './entities/thesis-type.entity';
import { Student } from '../student/entities/student.entity';
import { Instructor } from '../instructor/entities/instructor.entity';
import { Department } from '../organization/entities/department.entity';
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
    @InjectRepository(InstructorAssignment)
    private instructorAssignmentRepository: Repository<InstructorAssignment>,
    @InjectRepository(ThesisType)
    private thesisTypeRepository: Repository<ThesisType>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Instructor)
    private instructorRepository: Repository<Instructor>,
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
    private socketGateway: SocketGateway,
  ) {}

  // Lấy studentId từ userId
  async getStudentIdByUserId(userId: number): Promise<number | null> {
    const student = await this.studentRepository.findOne({
      where: { userId },
    });
    return student?.id || null;
  }

  // Đăng ký đề tài cho sinh viên
  async registerTopic(studentId: number, registerTopicDto: RegisterTopicDto) {
    const {
      thesisRoundId,
      instructorId,
      proposedTopicId,
      selfProposedTitle,
      selfProposedDescription,
      selectionReason,
    } = registerTopicDto;

    // Kiểm tra sinh viên tồn tại
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
      relations: ['user', 'classEntity'],
    });

    if (!student) {
      throw new NotFoundException('Sinh viên không tồn tại');
    }

    // Kiểm tra đợt luận văn tồn tại và đang mở đăng ký
    const thesisRound = await this.thesisRoundRepository.findOne({
      where: { id: thesisRoundId },
    });

    if (!thesisRound) {
      throw new NotFoundException('Đợt luận văn không tồn tại');
    }

    // Kiểm tra status: chỉ cho phép đăng ký khi status là 'Preparing' hoặc 'In Progress'
    if (thesisRound.status === 'Completed') {
      throw new BadRequestException('Đợt luận văn đã kết thúc');
    }

    // Tự động chuyển status từ 'Preparing' sang 'In Progress' nếu đủ điều kiện
    if (thesisRound.status === 'Preparing') {
      // Kiểm tra xem có giảng viên nào trong đợt không
      const hasInstructors = await this.instructorAssignmentRepository.count({
        where: { thesisRoundId, status: true },
      });

      if (hasInstructors > 0) {
        // Tự động chuyển status sang 'In Progress' khi đã có giảng viên
        await this.thesisRoundRepository.update(thesisRoundId, {
          status: 'In Progress',
        });
        thesisRound.status = 'In Progress';
      } else {
        throw new BadRequestException(
          'Đợt luận văn chưa có giảng viên. Vui lòng chờ trưởng bộ môn thêm giảng viên vào đợt.',
        );
      }
    }

    // Kiểm tra deadline đăng ký
    if (
      thesisRound.registrationDeadline &&
      new Date() > new Date(thesisRound.registrationDeadline)
    ) {
      throw new BadRequestException('Đã hết hạn đăng ký đề tài');
    }

    // Kiểm tra giảng viên tồn tại
    const instructor = await this.instructorRepository.findOne({
      where: { id: instructorId },
      relations: ['user'],
    });

    if (!instructor) {
      throw new NotFoundException('Giảng viên không tồn tại');
    }

    const existingRegistration = await this.topicRegistrationRepository.findOne(
      {
        where: {
          studentId,
          thesisRoundId,
        },
        relations: ['student', 'student.user'],
      },
    );

    if (existingRegistration) {
      console.log('Existing registration found:', {
        registrationId: existingRegistration.id,
        studentId: existingRegistration.studentId,
        userId: existingRegistration.student?.user?.id,
        thesisRoundId: existingRegistration.thesisRoundId,
      });

      throw new ConflictException('Bạn đã đăng ký đề tài trong đợt này rồi');
    }

    // Nếu đăng ký đề tài được đề xuất
    if (proposedTopicId) {
      const proposedTopic = await this.proposedTopicRepository.findOne({
        where: { id: proposedTopicId },
      });

      if (!proposedTopic) {
        throw new NotFoundException('Đề tài được đề xuất không tồn tại');
      }

      if (proposedTopic.isTaken) {
        throw new ConflictException('Đề tài này đã được chọn');
      }

      if (proposedTopic.instructorId !== instructorId) {
        throw new BadRequestException(
          'Giảng viên không phải người đề xuất đề tài này',
        );
      }

      // Cập nhật trạng thái đề tài đã được chọn
      await this.proposedTopicRepository.update(proposedTopicId, {
        isTaken: true,
      });
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
      registrationDate: new Date(),
    });

    const savedRegistration =
      await this.topicRegistrationRepository.save(topicRegistration);

    // Gửi thông báo real-time cho giảng viên (nếu có userId)
    try {
      if (instructor.user && instructor.user.id) {
        await this.socketGateway.sendToUser(
          instructor.user.id.toString(),
          'new_topic_registration',
          {
            registrationId: savedRegistration.id,
            studentName: student.user?.fullName || 'N/A',
            studentCode: student.studentCode,
            topicTitle: proposedTopicId
              ? (
                  await this.proposedTopicRepository.findOne({
                    where: { id: proposedTopicId },
                  })
                )?.topicTitle
              : selfProposedTitle,
            registrationDate: savedRegistration.registrationDate,
          },
        );
      }
    } catch (socketError) {
      // Log lỗi socket nhưng không fail toàn bộ request
      console.error('Error sending socket notification:', socketError);
    }

    return {
      success: true,
      message: 'Đăng ký đề tài thành công',
      data: savedRegistration,
    };
  }

  async getStudentRegistrations(
    instructorId: number,
    query: GetStudentRegistrationsDto,
  ) {
    const { thesisRoundId, status } = query;

    const whereCondition: Record<string, any> = {
      instructorId,
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
        'proposedTopic',
      ],
      order: {
        registrationDate: 'DESC',
      },
    });

    return {
      success: true,
      data: registrations.map((registration) => ({
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
            classCode: registration.student.classEntity.classCode,
          },
        },
        thesisRound: {
          id: registration.thesisRound.id,
          roundName: registration.thesisRound.roundName,
          roundCode: registration.thesisRound.roundCode,
        },
        proposedTopic: registration.proposedTopic
          ? {
              id: registration.proposedTopic.id,
              topicTitle: registration.proposedTopic.topicTitle,
              topicCode: registration.proposedTopic.topicCode,
            }
          : null,
        selfProposedTitle: registration.selfProposedTitle,
        selfProposedDescription: registration.selfProposedDescription,
        selectionReason: registration.selectionReason,
        instructorStatus: registration.instructorStatus,
        headStatus: registration.headStatus,
        instructorRejectionReason: registration.instructorRejectionReason,
        headRejectionReason: registration.headRejectionReason,
        registrationDate: registration.registrationDate,
        instructorApprovalDate: registration.instructorApprovalDate,
        headApprovalDate: registration.headApprovalDate,
      })),
    };
  }

  async approveTopicRegistration(
    instructorId: number,
    approveDto: ApproveTopicRegistrationDto,
  ) {
    const { registrationId, approved, rejectionReason } = approveDto;

    const registration = await this.topicRegistrationRepository.findOne({
      where: {
        id: registrationId,
        instructorId,
      },
      relations: ['student', 'student.user', 'thesisRound'],
    });

    if (!registration) {
      throw new NotFoundException(
        'Đăng ký đề tài không tồn tại hoặc không thuộc quyền quản lý của bạn',
      );
    }

    if (registration.instructorStatus !== 'Pending') {
      throw new BadRequestException('Đăng ký đề tài đã được xử lý rồi');
    }

    const updateData: Record<string, any> = {
      instructorStatus: approved ? 'Approved' : 'Rejected',
      instructorApprovalDate: new Date(),
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
        message: approved
          ? 'Đăng ký đề tài của bạn đã được phê duyệt'
          : 'Đăng ký đề tài của bạn đã bị từ chối',
        rejectionReason: rejectionReason,
      },
    );

    return {
      success: true,
      message: approved
        ? 'Phê duyệt đăng ký thành công'
        : 'Từ chối đăng ký thành công',
      data: {
        registrationId,
        status: approved ? 'Approved' : 'Rejected',
      },
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
      sortOrder = 'DESC',
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
      queryBuilder.andWhere('proposedTopic.thesisRoundId = :thesisRoundId', {
        thesisRoundId,
      });
    }

    if (instructorId) {
      queryBuilder.andWhere('proposedTopic.instructorId = :instructorId', {
        instructorId,
      });
    }

    if (isTaken !== undefined) {
      queryBuilder.andWhere('proposedTopic.isTaken = :isTaken', { isTaken });
    }

    // Tìm kiếm theo tiêu đề hoặc mô tả
    if (search) {
      queryBuilder.andWhere(
        '(proposedTopic.topicTitle ILIKE :search OR proposedTopic.topicDescription ILIKE :search OR user.fullName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Sắp xếp
    const validSortFields = ['createdAt', 'topicTitle', 'updatedAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const validSortOrder =
      sortOrder === 'ASC' || sortOrder === 'DESC' ? sortOrder : 'DESC';

    if (sortBy === 'instructorName') {
      queryBuilder.orderBy('user.fullName', validSortOrder);
    } else {
      queryBuilder.orderBy(`proposedTopic.${sortField}`, validSortOrder);
    }

    // Phân trang
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Thực hiện query
    const [proposedTopics, total] = await queryBuilder.getManyAndCount();

    // Tính toán thông tin phân trang
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      success: true,
      data: proposedTopics.map((topic) => ({
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
          phone: topic.instructor.user.phone,
        },
        thesisRound: {
          id: topic.thesisRound.id,
          roundName: topic.thesisRound.roundName,
          roundCode: topic.thesisRound.roundCode,
          status: topic.thesisRound.status,
        },
        createdAt: topic.createdAt,
        updatedAt: topic.updatedAt,
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
      },
    };
  }

  async getAvailableTopicsForStudent(query: GetProposedTopicsDto) {
    const {
      thesisRoundId,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
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
      queryBuilder.andWhere('proposedTopic.thesisRoundId = :thesisRoundId', {
        thesisRoundId,
      });
    } else {
      // Nếu không chỉ định đợt cụ thể, chỉ lấy đợt đang mở đăng ký
      queryBuilder.andWhere('thesisRound.status = :roundStatus', {
        roundStatus: 'In Progress',
      });
    }

    // Tìm kiếm theo tiêu đề, mô tả hoặc tên giảng viên
    if (search) {
      queryBuilder.andWhere(
        '(proposedTopic.topicTitle ILIKE :search OR proposedTopic.topicDescription ILIKE :search OR user.fullName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Sắp xếp
    const validSortFields2 = ['createdAt', 'topicTitle', 'updatedAt'];
    const sortField2 = validSortFields2.includes(sortBy) ? sortBy : 'createdAt';
    const validSortOrder2 =
      sortOrder === 'ASC' || sortOrder === 'DESC' ? sortOrder : 'DESC';

    if (sortBy === 'instructorName') {
      queryBuilder.orderBy('user.fullName', validSortOrder2);
    } else {
      queryBuilder.orderBy(`proposedTopic.${sortField2}`, validSortOrder2);
    }

    // Phân trang
    const skip2 = (page - 1) * limit;
    queryBuilder.skip(skip2).take(limit);

    // Thực hiện query
    const [proposedTopics, total] = await queryBuilder.getManyAndCount();

    // Tính toán thông tin phân trang
    const totalPages2 = Math.ceil(total / limit);
    const hasNextPage2 = page < totalPages2;
    const hasPrevPage2 = page > 1;

    return {
      success: true,
      data: proposedTopics.map((topic) => ({
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
          phone: topic.instructor.user.phone,
        },
        thesisRound: {
          id: topic.thesisRound.id,
          roundName: topic.thesisRound.roundName,
          roundCode: topic.thesisRound.roundCode,
          status: topic.thesisRound.status,
          registrationDeadline: topic.thesisRound.registrationDeadline,
        },
        createdAt: topic.createdAt,
        updatedAt: topic.updatedAt,
      })),
      pagination: {
        currentPage: page,
        totalPages: totalPages2,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: hasNextPage2,
        hasPrevPage: hasPrevPage2,
      },
    };
  }

  // Lấy lịch sử đăng ký đề tài của sinh viên
  async getStudentTopicRegistrations(
    studentId: number,
    query: GetMyRegistrationsDto,
  ) {
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
    const skip3 = (page - 1) * limit;
    queryBuilder.skip(skip3).take(limit);

    const [registrations, total] = await queryBuilder.getManyAndCount();

    const totalPages3 = Math.ceil(total / limit);
    const hasNextPage3 = page < totalPages3;
    const hasPrevPage3 = page > 1;

    return {
      success: true,
      data: registrations.map((registration) => ({
        id: registration.id,
        thesisRound: {
          id: registration.thesisRound.id,
          roundName: registration.thesisRound.roundName,
          roundCode: registration.thesisRound.roundCode,
          status: registration.thesisRound.status,
        },
        instructor: {
          id: registration.instructor.id,
          instructorCode: registration.instructor.instructorCode,
          fullName: registration.instructor.user.fullName,
          email: registration.instructor.user.email,
        },
        proposedTopic: registration.proposedTopic
          ? {
              id: registration.proposedTopic.id,
              topicCode: registration.proposedTopic.topicCode,
              topicTitle: registration.proposedTopic.topicTitle,
            }
          : null,
        selfProposedTitle: registration.selfProposedTitle,
        selfProposedDescription: registration.selfProposedDescription,
        selectionReason: registration.selectionReason,
        instructorStatus: registration.instructorStatus,
        headStatus: registration.headStatus,
        instructorRejectionReason: registration.instructorRejectionReason,
        headRejectionReason: registration.headRejectionReason,
        registrationDate: registration.registrationDate,
        instructorApprovalDate: registration.instructorApprovalDate,
        headApprovalDate: registration.headApprovalDate,
      })),
      pagination: {
        currentPage: page,
        totalPages: totalPages3,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: hasNextPage3,
        hasPrevPage: hasPrevPage3,
      },
    };
  }

  // Tạo đề tài đề xuất
  async createProposedTopic(
    instructorId: number,
    createDto: CreateProposedTopicDto,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {
      topicCode,
      topicTitle,
      thesisRoundId,
      maxStudents,
      notes,
      ...otherData
    } = createDto;
    // maxStudents và notes được frontend gửi nhưng không được lưu vào entity (entity không có trường này)

    // Kiểm tra đợt luận văn tồn tại
    const thesisRound = await this.thesisRoundRepository.findOne({
      where: { id: thesisRoundId },
    });

    if (!thesisRound) {
      throw new NotFoundException('Đợt luận văn không tồn tại');
    }

    // Kiểm tra mã đề tài đã tồn tại trong đợt này chưa
    const existingTopic = await this.proposedTopicRepository.findOne({
      where: {
        topicCode,
        thesisRoundId,
      },
    });

    if (existingTopic) {
      throw new ConflictException('Mã đề tài đã tồn tại trong đợt này');
    }

    const proposedTopic = this.proposedTopicRepository.create({
      ...otherData,
      topicCode,
      topicTitle,
      instructorId,
      thesisRoundId,
    });

    const savedTopic = await this.proposedTopicRepository.save(proposedTopic);

    return {
      success: true,
      message: 'Tạo đề tài đề xuất thành công',
      data: savedTopic,
    };
  }

  // Lấy danh sách đợt luận văn với phân trang và tìm kiếm
  async getThesisRounds(query: GetThesisRoundsDto) {
    const {
      thesisTypeId,
      departmentId,
      facultyId,
      status,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.thesisRoundRepository
      .createQueryBuilder('thesisRound')
      .leftJoinAndSelect('thesisRound.thesisType', 'thesisType')
      .leftJoinAndSelect('thesisRound.department', 'department')
      .leftJoinAndSelect('thesisRound.faculty', 'faculty');

    // Áp dụng filters
    if (thesisTypeId) {
      queryBuilder.andWhere('thesisRound.thesisTypeId = :thesisTypeId', {
        thesisTypeId,
      });
    }

    if (departmentId) {
      queryBuilder.andWhere('thesisRound.departmentId = :departmentId', {
        departmentId,
      });
    }

    if (facultyId) {
      queryBuilder.andWhere('thesisRound.facultyId = :facultyId', {
        facultyId,
      });
    }

    if (status) {
      queryBuilder.andWhere('thesisRound.status = :status', { status });
    }

    // Tìm kiếm theo tên hoặc mã đợt
    if (search) {
      queryBuilder.andWhere(
        '(thesisRound.roundName ILIKE :search OR thesisRound.roundCode ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Sắp xếp - mặc định sắp xếp theo createdAt DESC (mới nhất trước), sau đó theo id DESC để đảm bảo thứ tự
    const validSortFields: string[] = [
      'createdAt',
      'roundName',
      'startDate',
      'endDate',
      'id',
    ];
    let sortField = 'createdAt';
    if (
      sortBy &&
      typeof sortBy === 'string' &&
      validSortFields.includes(sortBy)
    ) {
      sortField = sortBy;
    }

    let finalSortOrder: 'ASC' | 'DESC' = 'DESC';
    if (sortOrder && sortOrder === 'ASC') {
      finalSortOrder = 'ASC';
    }

    // Sắp xếp chính theo field được chọn
    queryBuilder.orderBy(`thesisRound.${sortField}`, finalSortOrder);

    // Nếu không phải sắp xếp theo id, thêm sắp xếp phụ theo id để đảm bảo đợt mới nhất luôn ở đầu
    if (sortField !== 'id') {
      queryBuilder.addOrderBy('thesisRound.id', 'DESC');
    }

    // Phân trang
    const finalPage: number = page || 1;
    const finalLimit: number = limit || 10;
    const skipCount: number = (finalPage - 1) * finalLimit;
    queryBuilder.skip(skipCount).take(finalLimit);

    // Thực hiện query
    const [thesisRounds, total] = await queryBuilder.getManyAndCount();

    // Tính toán thông tin phân trang
    const totalPages = Math.ceil(total / finalLimit);
    const hasNextPage = finalPage < totalPages;
    const hasPrevPage = finalPage > 1;

    return {
      success: true,
      data: thesisRounds,
      pagination: {
        currentPage: finalPage,
        totalPages,
        totalItems: total,
        itemsPerPage: finalLimit,
        hasNextPage,
        hasPrevPage,
      },
    };
  }

  // Lấy chi tiết một đợt luận văn
  async getThesisRoundById(id: number) {
    const thesisRound = await this.thesisRoundRepository.findOne({
      where: { id },
      relations: ['thesisType', 'department', 'faculty'],
    });

    if (!thesisRound) {
      throw new NotFoundException('Không tìm thấy đợt luận văn');
    }

    // Đếm số lượng đề tài được đề xuất trong đợt này
    const proposedTopicsCount = await this.proposedTopicRepository.count({
      where: { thesisRoundId: id },
    });

    // Đếm số lượng giảng viên tham gia
    const instructorsCount = await this.instructorAssignmentRepository.count({
      where: { thesisRoundId: id, status: true },
    });

    // Đếm số lượng sinh viên đăng ký
    const registrationsCount = await this.topicRegistrationRepository.count({
      where: { thesisRoundId: id },
    });

    return {
      success: true,
      data: {
        ...thesisRound,
        statistics: {
          proposedTopicsCount,
          instructorsCount,
          registrationsCount,
        },
      },
    };
  }

  // ==================== QUẢN LÝ ĐỢT ĐỀ TÀI ====================

  // Tạo đợt đề tài (chỉ trưởng bộ môn)
  async createThesisRound(createDto: CreateThesisRoundDto) {
    const {
      roundCode,
      roundName,
      thesisTypeId,
      departmentId,
      facultyId,
      ...otherData
    } = createDto;

    // Kiểm tra mã đợt đã tồn tại chưa
    const existingRound = await this.thesisRoundRepository.findOne({
      where: { roundCode },
    });

    if (existingRound) {
      throw new ConflictException('Mã đợt luận văn đã tồn tại');
    }

    // Kiểm tra loại luận văn tồn tại
    const thesisType = await this.thesisTypeRepository.findOne({
      where: { id: thesisTypeId },
    });

    if (!thesisType) {
      throw new NotFoundException('Loại luận văn không tồn tại');
    }

    // Tạo đợt luận văn
    const thesisRound = this.thesisRoundRepository.create({
      roundCode,
      roundName,
      thesisTypeId,
      departmentId,
      facultyId,
      ...otherData,
      status: 'Preparing',
    });

    const savedRound = await this.thesisRoundRepository.save(thesisRound);

    return {
      success: true,
      message: 'Tạo đợt luận văn thành công',
      data: savedRound,
    };
  }

  // Cập nhật đợt đề tài
  async updateThesisRound(roundId: number, updateDto: UpdateThesisRoundDto) {
    const thesisRound = await this.thesisRoundRepository.findOne({
      where: { id: roundId },
    });

    if (!thesisRound) {
      throw new NotFoundException('Đợt luận văn không tồn tại');
    }

    // Cập nhật thông tin
    await this.thesisRoundRepository.update(roundId, updateDto);

    const updatedRound = await this.thesisRoundRepository.findOne({
      where: { id: roundId },
      relations: ['thesisType', 'department', 'faculty'],
    });

    return {
      success: true,
      message: 'Cập nhật đợt luận văn thành công',
      data: updatedRound,
    };
  }

  // ==================== QUẢN LÝ GIẢNG VIÊN TRONG ĐỢT ====================

  // Kiểm tra quyền quản lý đợt đề tài
  private async checkThesisRoundManagementPermission(
    roundId: number,
    userId: number,
    userRole: string,
  ): Promise<ThesisRound> {
    const thesisRound = await this.thesisRoundRepository.findOne({
      where: { id: roundId },
    });

    if (!thesisRound) {
      throw new NotFoundException('Đợt luận văn không tồn tại');
    }

    // Admin và Head of Department có quyền quản lý
    if (userRole === 'admin' || userRole === 'head_of_department') {
      return thesisRound;
    }

    throw new ForbiddenException('Bạn không có quyền quản lý đợt đề tài này');
  }

  // Thêm một giảng viên vào đợt đề tài
  async addInstructorToRound(
    roundId: number,
    addDto: AddInstructorToRoundDto,
    userId: number,
    userRole: string,
  ) {
    // Kiểm tra quyền
    const thesisRound = await this.checkThesisRoundManagementPermission(
      roundId,
      userId,
      userRole,
    );

    const { instructorId, maxStudents = 5 } = addDto;

    // Kiểm tra giảng viên tồn tại
    const instructor = await this.instructorRepository.findOne({
      where: { id: instructorId },
      relations: ['user', 'department'],
    });

    if (!instructor) {
      throw new NotFoundException('Giảng viên không tồn tại');
    }

    // Nếu đợt có departmentId, kiểm tra giảng viên có thuộc bộ môn đó không
    if (
      thesisRound.departmentId &&
      instructor.departmentId !== thesisRound.departmentId
    ) {
      throw new BadRequestException(
        'Giảng viên không thuộc bộ môn của đợt đề tài này',
      );
    }

    // Kiểm tra giảng viên đã được thêm vào đợt này chưa
    const existingInstructor =
      await this.instructorAssignmentRepository.findOne({
        where: {
          thesisRoundId: roundId,
          instructorId,
        },
      });

    if (existingInstructor) {
      throw new ConflictException('Giảng viên đã được thêm vào đợt này rồi');
    }

    // Lấy instructorId của người thêm (nếu là trưởng bộ môn)
    let addedById: number | undefined;
    if (userRole === 'head_of_department') {
      const currentInstructor = await this.instructorRepository.findOne({
        where: { userId },
      });
      addedById = currentInstructor?.id;
    }

    // Thêm giảng viên vào đợt
    const instructorAssignment = this.instructorAssignmentRepository.create({
      thesisRoundId: roundId,
      instructorId,
      supervisionQuota: maxStudents,
      status: true,
      addedBy: addedById,
    });

    await this.instructorAssignmentRepository.save(instructorAssignment);

    // Tự động chuyển status từ 'Preparing' sang 'In Progress' khi thêm giảng viên đầu tiên
    if (thesisRound.status === 'Preparing') {
      await this.thesisRoundRepository.update(roundId, {
        status: 'In Progress',
      });
    }

    return {
      success: true,
      message: 'Thêm giảng viên vào đợt đề tài thành công',
      data: {
        thesisRoundId: roundId,
        instructor: {
          id: instructor.id,
          instructorCode: instructor.instructorCode,
          fullName: instructor.user.fullName,
          email: instructor.user.email,
          department: instructor.department.departmentName,
        },
        maxStudents,
      },
    };
  }

  // Thêm nhiều giảng viên vào đợt đề tài
  async addMultipleInstructorsToRound(
    roundId: number,
    addDto: AddMultipleInstructorsDto,
    userId: number,
    userRole: string,
  ) {
    console.log('=== DEBUG addMultipleInstructorsToRound START ===');
    console.log('roundId:', roundId);
    console.log('userId:', userId);
    console.log('userRole:', userRole);
    console.log('addDto:', JSON.stringify(addDto, null, 2));
    console.log('addDto.instructors:', addDto.instructors);
    console.log('typeof addDto.instructors:', typeof addDto.instructors);
    console.log('addDto.instructors?.length:', addDto.instructors?.length);

    // Kiểm tra quyền
    await this.checkThesisRoundManagementPermission(roundId, userId, userRole);

    // Kiểm tra bắt buộc có danh sách giảng viên
    if (!addDto.instructors || addDto.instructors.length === 0) {
      console.log('=== VALIDATION ERROR: No instructors provided ===');
      throw new BadRequestException('Phải cung cấp danh sách giảng viên');
    }
    console.log('=== VALIDATION PASSED: instructors provided ===');

    const results: any[] = [];
    const errors: { instructorId: number; error: string }[] = [];

    // Use a safe iterate (empty array if undefined) to satisfy TS and avoid runtime errors
    const instructorsToProcess = addDto.instructors ?? [];
    console.log('=== PROCESSING INSTRUCTORS ===');
    console.log('instructorsToProcess:', instructorsToProcess);
    console.log('instructorsToProcess.length:', instructorsToProcess.length);

    for (let i = 0; i < instructorsToProcess.length; i++) {
      const instructorDto = instructorsToProcess[i];
      console.log(
        `=== PROCESSING INSTRUCTOR ${i + 1}/${instructorsToProcess.length} ===`,
      );
      console.log('instructorDto:', instructorDto);
      console.log('instructorDto.instructorId:', instructorDto.instructorId);
      console.log(
        'typeof instructorDto.instructorId:',
        typeof instructorDto.instructorId,
      );
      console.log(
        'instructorDto.instructorId === null:',
        instructorDto.instructorId === null,
      );
      console.log(
        'instructorDto.instructorId === undefined:',
        instructorDto.instructorId === undefined,
      );

      try {
        // Kiểm tra instructorId có tồn tại và là số không
        if (
          !instructorDto.instructorId ||
          typeof instructorDto.instructorId !== 'number'
        ) {
          console.log(
            `=== VALIDATION ERROR for instructor ${i + 1}: instructorId is invalid ===`,
          );
          console.log(
            'instructorDto.instructorId:',
            instructorDto.instructorId,
          );
          console.log(
            'typeof instructorDto.instructorId:',
            typeof instructorDto.instructorId,
          );
          throw new BadRequestException(
            'instructorId phải là số và không được để trống',
          );
        }

        console.log(
          `Calling addInstructorToRound with instructorId: ${instructorDto.instructorId}`,
        );
        const result = await this.addInstructorToRound(
          roundId,
          instructorDto,
          userId,
          userRole,
        );
        console.log(
          `Success for instructorId ${instructorDto.instructorId}:`,
          result,
        );
        results.push(result.data);
      } catch (error) {
        console.log(
          `Error for instructorId ${instructorDto.instructorId}:`,
          error,
        );
        console.log(
          'Error message:',
          error instanceof Error ? error.message : 'Unknown error',
        );
        console.log(
          'Error stack:',
          error instanceof Error ? error.stack : 'No stack',
        );

        errors.push({
          instructorId: instructorDto?.instructorId ?? null,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    console.log('=== FINAL RESULTS ===');
    console.log('results:', results);
    console.log('errors:', errors);
    console.log('=== DEBUG addMultipleInstructorsToRound END ===');

    return {
      success: true,
      message: `Đã thêm ${results.length} giảng viên thành công`,
      data: {
        added: results,
        failed: errors,
      },
    };
  }

  // Cập nhật thông tin giảng viên trong đợt
  async updateInstructorInRound(
    roundId: number,
    instructorId: number,
    updateDto: UpdateInstructorInRoundDto,
    userId: number,
    userRole: string,
  ) {
    // Kiểm tra quyền
    await this.checkThesisRoundManagementPermission(roundId, userId, userRole);

    const instructorAssignment =
      await this.instructorAssignmentRepository.findOne({
        where: {
          thesisRoundId: roundId,
          instructorId,
        },
      });

    if (!instructorAssignment) {
      throw new NotFoundException('Giảng viên không có trong đợt đề tài này');
    }

    await this.instructorAssignmentRepository.update(
      instructorAssignment.id,
      updateDto,
    );

    return {
      success: true,
      message: 'Cập nhật thông tin giảng viên thành công',
    };
  }

  // Xóa giảng viên khỏi đợt đề tài
  async removeInstructorFromRound(
    roundId: number,
    instructorId: number,
    userId: number,
    userRole: string,
  ) {
    // Kiểm tra quyền
    await this.checkThesisRoundManagementPermission(roundId, userId, userRole);

    const instructorAssignment =
      await this.instructorAssignmentRepository.findOne({
        where: {
          thesisRoundId: roundId,
          instructorId,
        },
      });

    if (!instructorAssignment) {
      throw new NotFoundException('Giảng viên không có trong đợt đề tài này');
    }

    // Kiểm tra xem giảng viên đã có sinh viên đăng ký chưa
    const hasRegistrations = await this.topicRegistrationRepository.count({
      where: {
        thesisRoundId: roundId,
        instructorId,
      },
    });

    if (hasRegistrations > 0) {
      throw new BadRequestException(
        'Không thể xóa giảng viên vì đã có sinh viên đăng ký với giảng viên này',
      );
    }

    await this.instructorAssignmentRepository.remove(instructorAssignment);

    return {
      success: true,
      message: 'Xóa giảng viên khỏi đợt đề tài thành công',
    };
  }

  // Lấy danh sách giảng viên trong đợt đề tài
  async getInstructorsInRound(
    roundId: number,
    query?: GetInstructorsInRoundDto,
  ) {
    try {
      console.log(`[DEBUG] Getting instructors for roundId: ${roundId}`);

      const whereCondition: Record<string, any> = {
        thesisRoundId: roundId,
      };

      if (query?.status !== undefined) {
        whereCondition.status = query.status;
      }

      console.log(`[DEBUG] Where condition:`, whereCondition);

      const instructors = await this.instructorAssignmentRepository.find({
        where: whereCondition,
        relations: ['instructor', 'instructor.user', 'instructor.department'],
        order: {
          createdAt: 'ASC',
        },
      });

      console.log(`[DEBUG] Found ${instructors.length} instructors`);

      // Kiểm tra nếu không có giảng viên nào
      if (!instructors || instructors.length === 0) {
        console.log(`[DEBUG] No instructors found for roundId: ${roundId}`);
        return {
          success: true,
          data: [],
        };
      }

      // Xử lý từng giảng viên
      const instructorsWithCount: any[] = [];

      for (const item of instructors) {
        try {
          // Kiểm tra item và instructor tồn tại
          if (!item || !item.instructor || !item.instructorId) {
            console.warn('Invalid instructor item:', item);
            continue;
          }

          // Tạm thời bỏ đếm registrations để test
          const registrationCount = 0;

          const instructorData = {
            id: item.id,
            instructor: {
              id: item.instructor.id,
              instructorCode: item.instructor.instructorCode,
              fullName: item.instructor.user?.fullName || 'N/A',
              email: item.instructor.user?.email || '',
              phone: item.instructor.user?.phone || '',
              degree: item.instructor.degree || '',
              academicTitle: item.instructor.academicTitle || '',
              department: item.instructor.department
                ? {
                    id: item.instructor.department.id,
                    departmentName: item.instructor.department.departmentName,
                    departmentCode: item.instructor.department.departmentCode,
                  }
                : null,
            },
            maxStudents: item.supervisionQuota,
            currentStudents: registrationCount,
            availableSlots: item.supervisionQuota - registrationCount,
            status: item.status,
            createdAt: item.createdAt,
          };

          instructorsWithCount.push(instructorData);
        } catch (error) {
          console.error('Error processing instructor item:', error);
          continue;
        }
      }

      console.log(
        `[DEBUG] Processed ${instructorsWithCount.length} instructors successfully`,
      );

      return {
        success: true,
        data: instructorsWithCount,
      };
    } catch (error) {
      console.error('Error in getInstructorsInRound:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Lỗi khi lấy danh sách giảng viên: ${errorMessage}`);
    }
  }
  async getProposedTopicsByInstructor(instructorId: number) {
    return this.proposedTopicRepository.find({
      where: { instructorId },
      order: { createdAt: 'DESC' }, // mới nhất lên đầu
    });
  }
  // thesis.service.ts
  async deleteProposedTopic(instructorId: number, topicId: number) {
    const topic = await this.proposedTopicRepository.findOne({
      where: { id: topicId, instructorId },
    });

    if (!topic) {
      throw new NotFoundException(
        'Đề tài không tồn tại hoặc không thuộc quyền bạn',
      );
    }

    await this.proposedTopicRepository.delete(topicId);
    return { message: 'Xóa đề tài thành công' };
  }
  // Hàm sửa đề xuất đề tài
  async updateProposedTopic(updateDto: UpdateProposedTopicDto) {
    const { instructorId, topicId, ...data } = updateDto;

    const topic = await this.proposedTopicRepository.findOne({
      where: { id: topicId, instructorId },
    });

    if (!topic) {
      throw new NotFoundException(
        'Đề tài không tồn tại hoặc không thuộc quyền bạn',
      );
    }

    Object.assign(topic, data);
    await this.proposedTopicRepository.save(topic);

    return topic;
  }
  // service
  async createManyProposedTopics(
    data: CreateProposedTopicDto[],
    instructorId: number,
  ) {
    // Gán instructorId cho tất cả đề tài
    const topics = data.map((item) => ({
      ...item,
      instructorId,
    }));

    // bulk insert
    const entities = this.proposedTopicRepository.create(topics);
    return this.proposedTopicRepository.save(entities); // lưu tất cả cùng lúc
  }
}
