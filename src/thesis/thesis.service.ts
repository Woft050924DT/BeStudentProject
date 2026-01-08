import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterTopicDto, ApproveTopicRegistrationDto, GetStudentRegistrationsDto, GetMyRegistrationsDto, ApproveTopicRegistrationByHeadDto, GetRegistrationsForHeadApprovalDto, GetAllStudentRegistrationsForHeadDto } from './dto/register-topic.dto';
import { CreateProposedTopicDto, GetProposedTopicsDto, GetMyProposedTopicsDto, UpdateProposedTopicDto } from './dto/proposed-topic.dto';
import { CreateThesisRoundDto, UpdateThesisRoundDto, GetThesisRoundsDto } from './dto/thesis-round.dto';
import { AddInstructorToRoundDto, AddMultipleInstructorsDto, UpdateInstructorInRoundDto, GetInstructorsInRoundDto } from './dto/thesis-round-instructor.dto';
import { AddClassToRoundDto, AddMultipleClassesToRoundDto } from './dto/thesis-round-class.dto';
import { AddStudentToRoundDto, AddMultipleStudentsToRoundDto } from './dto/thesis-round-student.dto';
import { RequestOpenRoundDto } from './dto/thesis-round-request.dto';
import { UpdateHeadProfileDto } from './dto/head-profile.dto';
import { AssignReviewerDto, AssignMultipleReviewersDto } from './dto/review-assignment.dto';
import { TopicRegistration } from './entities/topic-registration.entity';
import { ProposedTopic } from './entities/proposed-topic.entity';
import { ThesisRound } from './entities/thesis-round.entity';
import { InstructorAssignment } from './entities/instructor-assignment.entity';
import { ThesisType } from './entities/thesis-type.entity';
import { ThesisRoundRequest } from './entities/thesis-round-request.entity';
import { ThesisRoundClass } from './entities/thesis-round-class.entity';
import { StudentThesisRound } from './entities/student-thesis-round.entity';
import { Thesis } from './entities/thesis.entity';
import { ReviewAssignment } from './entities/review-assignment.entity';
import { ThesisGroup } from './entities/thesis-group.entity';
import { ThesisGroupMember } from './entities/thesis-group-member.entity';
import { Student } from '../student/entities/student.entity';
import { Instructor } from '../instructor/entities/instructor.entity';
import { Department } from '../organization/entities/department.entity';
import { Class } from '../organization/entities/class.entity';
import { Users } from '../user/user.entity';
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
    @InjectRepository(ThesisRoundRequest)
    private thesisRoundRequestRepository: Repository<ThesisRoundRequest>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Instructor)
    private instructorRepository: Repository<Instructor>,
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
    @InjectRepository(Class)
    private classRepository: Repository<Class>,
    @InjectRepository(ThesisRoundClass)
    private thesisRoundClassRepository: Repository<ThesisRoundClass>,
    @InjectRepository(StudentThesisRound)
    private studentThesisRoundRepository: Repository<StudentThesisRound>,
    @InjectRepository(Thesis)
    private thesisRepository: Repository<Thesis>,
    @InjectRepository(ReviewAssignment)
    private reviewAssignmentRepository: Repository<ReviewAssignment>,
    @InjectRepository(ThesisGroup)
    private thesisGroupRepository: Repository<ThesisGroup>,
    @InjectRepository(ThesisGroupMember)
    private thesisGroupMemberRepository: Repository<ThesisGroupMember>,
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
    private socketGateway: SocketGateway,
  ) {}

  private makeIndividualGroupCode(thesisRoundId: number, studentId: number): string {
    const roundPart = thesisRoundId.toString(36);
    const studentPart = studentId.toString(36);
    const code = `I${roundPart}_${studentPart}`.toUpperCase();
    return code.length <= 20 ? code : code.slice(0, 20);
  }

  private async ensureIndividualGroup(studentId: number, thesisRoundId: number): Promise<ThesisGroup> {
    const existingGroup = await this.thesisGroupRepository.findOne({
      where: {
        thesisRoundId,
        createdBy: studentId,
        groupType: 'INDIVIDUAL',
      },
    });

    if (existingGroup) {
      const existingMember = await this.thesisGroupMemberRepository.findOne({
        where: { thesisGroupId: existingGroup.id, studentId },
      });

      if (!existingMember) {
        await this.thesisGroupMemberRepository.save(
          this.thesisGroupMemberRepository.create({
            thesisGroupId: existingGroup.id,
            thesisRoundId,
            studentId,
            role: 'SOLO',
            joinMethod: 'AUTO',
            isActive: true,
            joinedAt: new Date(),
          }),
        );
      }

      return existingGroup;
    }

    const newGroup = this.thesisGroupRepository.create({
      groupCode: this.makeIndividualGroupCode(thesisRoundId, studentId),
      thesisRoundId,
      groupType: 'INDIVIDUAL',
      createdBy: studentId,
      minMembers: 1,
      maxMembers: 1,
      currentMembers: 1,
      status: 'READY',
    });

    const savedGroup = await this.thesisGroupRepository.save(newGroup);

    await this.thesisGroupMemberRepository.save(
      this.thesisGroupMemberRepository.create({
        thesisGroupId: savedGroup.id,
        thesisRoundId,
        studentId,
        role: 'SOLO',
        joinMethod: 'AUTO',
        isActive: true,
        joinedAt: new Date(),
      }),
    );

    return savedGroup;
  }

  // Lấy studentId từ userId
  async getStudentIdByUserId(userId: number): Promise<number | null> {
    const student = await this.studentRepository.findOne({
      where: { userId }
    });
    return student?.id || null;
  }

  // Lấy instructorId từ userId
  async getInstructorIdByUserId(userId: number): Promise<number | null> {
    const instructor = await this.instructorRepository.findOne({
      where: { userId }
    });
    return instructor?.id || null;
  }

  // Đăng ký đề tài cho sinh viên
  async registerTopic(studentId: number, registerTopicDto: RegisterTopicDto) {
    const { 
      thesisRoundId, 
      instructorId, 
      studentCode,
      thesisRoundName,
      topicTitle,
      classId,
      classCode,
      proposedTopicId, 
      selfProposedTitle, 
      selfProposedDescription, 
      selectionReason 
    } = registerTopicDto;

    // Kiểm tra sinh viên tồn tại
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
      relations: ['user', 'classEntity']
    });

    if (!student) {
      throw new NotFoundException('Sinh viên không tồn tại');
    }

    // Validate mã sinh viên nếu có trong request
    if (studentCode && student.studentCode !== studentCode) {
      throw new BadRequestException('Mã sinh viên không khớp với tài khoản đăng nhập');
    }

    // Validate lớp nếu có trong request
    if (classId && student.classEntity && student.classEntity.id !== classId) {
      throw new BadRequestException('Lớp không khớp với thông tin sinh viên');
    }

    if (classCode && student.classEntity && student.classEntity.classCode !== classCode) {
      throw new BadRequestException('Mã lớp không khớp với thông tin sinh viên');
    }

    // Kiểm tra đợt luận văn tồn tại và đang mở đăng ký
    const thesisRound = await this.thesisRoundRepository.findOne({
      where: { id: thesisRoundId }
    });

    if (!thesisRound) {
      throw new NotFoundException('Đợt luận văn không tồn tại');
    }

    // Validate tên đợt luận văn nếu có trong request
    if (thesisRoundName && thesisRound.roundName !== thesisRoundName) {
      throw new BadRequestException('Tên đợt luận văn không khớp');
    }

    // Kiểm tra status: chỉ cho phép đăng ký khi status là 'Preparing' hoặc 'In Progress'
    if (thesisRound.status === 'Completed') {
      throw new BadRequestException('Đợt luận văn đã kết thúc');
    }

    // Tự động chuyển status từ 'Preparing' sang 'In Progress' nếu đủ điều kiện
    if (thesisRound.status === 'Preparing') {
      // Kiểm tra xem có giảng viên nào trong đợt không
      const hasInstructors = await this.instructorAssignmentRepository.count({
        where: { thesisRoundId, status: true }
      });

      if (hasInstructors > 0) {
        // Tự động chuyển status sang 'In Progress' khi đã có giảng viên
        await this.thesisRoundRepository.update(thesisRoundId, { status: 'In Progress' });
        thesisRound.status = 'In Progress';
      } else {
        throw new BadRequestException('Đợt luận văn chưa có giảng viên. Vui lòng chờ trưởng bộ môn thêm giảng viên vào đợt.');
      }
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

    const thesisGroup = await this.ensureIndividualGroup(studentId, thesisRoundId);

    const existingRegistration = await this.topicRegistrationRepository.findOne({
    where: {
      thesisGroupId: thesisGroup.id,
      thesisRoundId
    },
  });

  if (existingRegistration) {
    console.log('Existing registration found:', {
      registrationId: existingRegistration.id,
      thesisGroupId: existingRegistration.thesisGroupId,
      thesisRoundId: existingRegistration.thesisRoundId
    });
    
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

      // Validate tên đề tài nếu có trong request
      if (topicTitle && proposedTopic.topicTitle !== topicTitle) {
        throw new BadRequestException('Tên đề tài không khớp với đề tài được chọn');
      }

      // Cập nhật trạng thái đề tài đã được chọn
      await this.proposedTopicRepository.update(proposedTopicId, { isTaken: true });
    } else if (selfProposedTitle) {
      // Validate tên đề tài tự đề xuất nếu có trong request
      if (topicTitle && selfProposedTitle !== topicTitle) {
        throw new BadRequestException('Tên đề tài không khớp với đề tài tự đề xuất');
      }
    }

    // Tạo đăng ký đề tài
    const topicRegistration = this.topicRegistrationRepository.create({
      thesisGroupId: thesisGroup.id,
      thesisRoundId,
      instructorId,
      proposedTopicId,
      selfProposedTitle,
      selfProposedDescription,
      selectionReason,
      registrationDate: new Date()
    });

    const savedRegistration = await this.topicRegistrationRepository.save(topicRegistration);

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
            topicTitle: proposedTopicId ? 
              (await this.proposedTopicRepository.findOne({ where: { id: proposedTopicId } }))?.topicTitle :
              selfProposedTitle,
            registrationDate: savedRegistration.registrationDate
          }
        );
      }
    } catch (socketError) {
      // Log lỗi socket nhưng không fail toàn bộ request
      console.error('Error sending socket notification:', socketError);
    }

    // Lấy lại đăng ký với đầy đủ relations để trả về
    const registrationWithRelations = await this.topicRegistrationRepository.findOne({
      where: { id: savedRegistration.id },
      relations: [
        'thesisGroup',
        'thesisRound',
        'proposedTopic',
        'instructor',
        'instructor.user'
      ]
    });

    if (!registrationWithRelations) {
      throw new NotFoundException('Không tìm thấy đăng ký vừa tạo');
    }

    return {
      success: true,
      message: 'Đăng ký đề tài thành công',
      data: {
        id: registrationWithRelations.id,
        thesisGroupId: registrationWithRelations.thesisGroupId,
        student: {
          id: student.id,
          studentCode: student.studentCode,
          fullName: student.user?.fullName || null,
          email: student.user?.email || null,
          phone: student.user?.phone || null,
          class: student.classEntity ? {
            id: student.classEntity.id,
            className: student.classEntity.className,
            classCode: student.classEntity.classCode
          } : null
        },
        thesisRound: registrationWithRelations.thesisRound ? {
          id: registrationWithRelations.thesisRound.id,
          roundName: registrationWithRelations.thesisRound.roundName,
          roundCode: registrationWithRelations.thesisRound.roundCode,
          status: registrationWithRelations.thesisRound.status
        } : null,
        proposedTopic: registrationWithRelations.proposedTopic ? {
          id: registrationWithRelations.proposedTopic.id,
          topicTitle: registrationWithRelations.proposedTopic.topicTitle,
          topicCode: registrationWithRelations.proposedTopic.topicCode
        } : null,
        selfProposedTitle: registrationWithRelations.selfProposedTitle,
        selfProposedDescription: registrationWithRelations.selfProposedDescription,
        selectionReason: registrationWithRelations.selectionReason,
        instructorStatus: registrationWithRelations.instructorStatus,
        headStatus: registrationWithRelations.headStatus,
        registrationDate: registrationWithRelations.registrationDate
      }
    };
  }

  async getStudentRegistrations(instructorId: number, query: GetStudentRegistrationsDto) {
    const { thesisRoundId, status } = query;

    const queryBuilder = this.topicRegistrationRepository
      .createQueryBuilder('registration')
      .leftJoinAndSelect('registration.thesisGroup', 'thesisGroup')
      .leftJoinAndSelect(
        'thesisGroup.members',
        'groupMember',
        "groupMember.isActive = true AND groupMember.role IN ('LEADER','SOLO')",
      )
      .leftJoinAndSelect('groupMember.student', 'student')
      .leftJoinAndSelect('student.user', 'user')
      .leftJoinAndSelect('student.classEntity', 'class')
      .leftJoinAndSelect('registration.thesisRound', 'thesisRound')
      .leftJoinAndSelect('registration.proposedTopic', 'proposedTopic')
      .where('registration.instructorId = :instructorId', { instructorId });

    if (thesisRoundId) {
      queryBuilder.andWhere('registration.thesisRoundId = :thesisRoundId', { thesisRoundId });
    }

    if (status) {
      queryBuilder.andWhere('registration.instructorStatus = :status', { status });
    }

    queryBuilder.orderBy('registration.registrationDate', 'DESC');

    const registrations = await queryBuilder.getMany();

    return {
      success: true,
      data: registrations.map(registration => {
        const leaderStudent = registration.thesisGroup?.members?.[0]?.student;
        // Lấy tên đề tài (từ proposedTopic hoặc selfProposedTitle)
        const topicTitle = registration.proposedTopic?.topicTitle || registration.selfProposedTitle || null;
        
        return {
          id: registration.id,
          thesisGroupId: registration.thesisGroupId,
          student: {
            id: leaderStudent?.id || null,
            studentCode: leaderStudent?.studentCode || null,
            fullName: leaderStudent?.user?.fullName || null,
            email: leaderStudent?.user?.email || null,
            phone: leaderStudent?.user?.phone || null,
            class: leaderStudent?.classEntity ? {
              id: leaderStudent.classEntity.id,
              className: leaderStudent.classEntity.className,
              classCode: leaderStudent.classEntity.classCode
            } : null
          },
          thesisRound: registration.thesisRound ? {
            id: registration.thesisRound.id,
            roundName: registration.thesisRound.roundName,
            roundCode: registration.thesisRound.roundCode,
            status: registration.thesisRound.status
          } : null,
          proposedTopic: registration.proposedTopic ? {
            id: registration.proposedTopic.id,
            topicTitle: registration.proposedTopic.topicTitle,
            topicCode: registration.proposedTopic.topicCode
          } : null,
          selfProposedTitle: registration.selfProposedTitle,
          selfProposedDescription: registration.selfProposedDescription,
          // Thêm topicTitle để frontend dễ hiển thị
          topicTitle: topicTitle,
          selectionReason: registration.selectionReason,
          instructorStatus: registration.instructorStatus,
          headStatus: registration.headStatus,
          instructorRejectionReason: registration.instructorRejectionReason,
          headRejectionReason: registration.headRejectionReason,
          registrationDate: registration.registrationDate,
          instructorApprovalDate: registration.instructorApprovalDate,
          headApprovalDate: registration.headApprovalDate
        };
      })
    };
  }

  async approveTopicRegistration(instructorId: number, approveDto: ApproveTopicRegistrationDto) {
    const { registrationId, approved, rejectionReason } = approveDto;

    const registration = await this.topicRegistrationRepository.findOne({
      where: { 
        id: registrationId,
        instructorId 
      },
      relations: [
        'thesisGroup',
        'thesisGroup.members',
        'thesisGroup.members.student',
        'thesisGroup.members.student.user',
        'thesisGroup.members.student.classEntity',
        'thesisRound',
        'thesisRound.department',
        'thesisRound.department.head',
        'thesisRound.department.head.user',
        'instructor',
        'instructor.user',
        'proposedTopic'
      ]
    });

    if (!registration) {
      throw new NotFoundException('Đăng ký đề tài không tồn tại hoặc không thuộc quyền quản lý của bạn');
    }

    if (registration.instructorStatus !== 'Pending') {
      throw new BadRequestException('Đăng ký đề tài đã được xử lý rồi');
    }

    const approvalDate = new Date();
    const updateData: Partial<TopicRegistration> = {
      instructorStatus: approved ? 'Approved' : 'Rejected',
      instructorApprovalDate: approvalDate
    };

    if (!approved && rejectionReason) {
      updateData.instructorRejectionReason = rejectionReason;
    }

    await this.topicRegistrationRepository.update(registrationId, updateData);

    // Gửi thông báo real-time cho sinh viên
    const leaderStudent = registration.thesisGroup?.members?.[0]?.student;

    try {
      if (leaderStudent?.user?.id) {
        await this.socketGateway.sendToUser(
          leaderStudent.user.id.toString(),
          'topic_registration_updated',
          {
            registrationId: registration.id,
            status: approved ? 'Approved' : 'Rejected',
            message: approved ? 
              'Đăng ký đề tài của bạn đã được giáo viên hướng dẫn phê duyệt, đang chờ trưởng bộ môn phê duyệt' : 
              'Đăng ký đề tài của bạn đã bị từ chối',
            rejectionReason: rejectionReason
          }
        );
      }
    } catch (socketError) {
      console.error('Error sending socket notification to student:', socketError);
    }

    // Nếu giáo viên phê duyệt, gửi thông báo cho trưởng bộ môn
    if (approved && registration.thesisRound?.department?.head?.user?.id) {
      try {
        const topicTitle = registration.proposedTopic?.topicTitle || registration.selfProposedTitle || 'N/A';
        
        await this.socketGateway.sendToUser(
          registration.thesisRound.department.head.user.id.toString(),
          'new_registration_for_approval',
          {
            registrationId: registration.id,
            studentName: leaderStudent?.user?.fullName || 'N/A',
            studentCode: leaderStudent?.studentCode || 'N/A',
            instructorName: registration.instructor?.user?.fullName || 'N/A',
            topicTitle: topicTitle,
            registrationDate: registration.registrationDate,
            instructorApprovalDate: approvalDate,
            message: 'Có đăng ký đề tài mới đã được giáo viên hướng dẫn phê duyệt, cần bạn phê duyệt'
          }
        );
      } catch (socketError) {
        console.error('Error sending socket notification to head of department:', socketError);
      }
    }

    return {
      success: true,
      message: approved ? 'Phê duyệt đăng ký thành công. Đăng ký đã được gửi lên trưởng bộ môn để phê duyệt' : 'Từ chối đăng ký thành công',
      data: {
        registrationId,
        status: approved ? 'Approved' : 'Rejected',
        nextStep: approved ? 'Chờ trưởng bộ môn phê duyệt' : null
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
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const validSortOrder = sortOrder === 'ASC' || sortOrder === 'DESC' ? sortOrder : 'DESC';
    
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
    const validSortFields2 = ['createdAt', 'topicTitle', 'updatedAt'];
    const sortField2 = validSortFields2.includes(sortBy) ? sortBy : 'createdAt';
    const validSortOrder2 = sortOrder === 'ASC' || sortOrder === 'DESC' ? sortOrder : 'DESC';
    
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
        totalPages: totalPages2,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: hasNextPage2,
        hasPrevPage: hasPrevPage2
      }
    };
  }

  // Lấy lịch sử đăng ký đề tài của sinh viên
  async getStudentTopicRegistrations(studentId: number, query: GetMyRegistrationsDto) {
    const { page = 1, limit = 10 } = query;

    const queryBuilder = this.topicRegistrationRepository
      .createQueryBuilder('registration')
      .innerJoin('registration.thesisGroup', 'thesisGroup')
      .innerJoin(
        'thesisGroup.members',
        'groupMember',
        'groupMember.studentId = :studentId AND groupMember.isActive = true',
        { studentId },
      )
      .leftJoinAndSelect('registration.thesisRound', 'thesisRound')
      .leftJoinAndSelect('registration.instructor', 'instructor')
      .leftJoinAndSelect('instructor.user', 'user')
      .leftJoinAndSelect('registration.proposedTopic', 'proposedTopic')
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
        totalPages: totalPages3,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: hasNextPage3,
        hasPrevPage: hasPrevPage3
      }
    };
  }

  // Tạo đề tài đề xuất
  async createProposedTopic(instructorId: number, createDto: CreateProposedTopicDto) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { topicCode, topicTitle, thesisRoundId, maxStudents, notes, ...otherData } = createDto;
    // maxStudents và notes được frontend gửi nhưng không được lưu vào entity (entity không có trường này)

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

  // Lấy danh sách đề tài mà giáo viên đã tạo trong đợt đề tài
  async getMyProposedTopics(instructorId: number, query: GetMyProposedTopicsDto) {
    const { 
      thesisRoundId, 
      isTaken, 
      search, 
      page = 1, 
      limit = 10, 
      sortBy = 'createdAt', 
      sortOrder = 'DESC' 
    } = query;

    // Kiểm tra đợt luận văn tồn tại
    const thesisRound = await this.thesisRoundRepository.findOne({
      where: { id: thesisRoundId }
    });

    if (!thesisRound) {
      throw new NotFoundException('Đợt luận văn không tồn tại');
    }

    // Xây dựng điều kiện where
    const queryBuilder = this.proposedTopicRepository
      .createQueryBuilder('proposedTopic')
      .leftJoinAndSelect('proposedTopic.thesisRound', 'thesisRound')
      .leftJoinAndSelect('proposedTopic.topicRegistrations', 'topicRegistrations')
      .where('proposedTopic.instructorId = :instructorId', { instructorId })
      .andWhere('proposedTopic.thesisRoundId = :thesisRoundId', { thesisRoundId });

    // Filter theo isTaken
    if (isTaken !== undefined) {
      queryBuilder.andWhere('proposedTopic.isTaken = :isTaken', { isTaken });
    }

    // Tìm kiếm theo tiêu đề hoặc mô tả
    if (search) {
      queryBuilder.andWhere(
        '(proposedTopic.topicTitle ILIKE :search OR proposedTopic.topicDescription ILIKE :search OR proposedTopic.topicCode ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Sắp xếp
    const validSortFields = ['createdAt', 'topicTitle', 'updatedAt', 'topicCode'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const validSortOrder = sortOrder === 'ASC' || sortOrder === 'DESC' ? sortOrder : 'DESC';
    
    queryBuilder.orderBy(`proposedTopic.${sortField}`, validSortOrder);

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
        registrationCount: topic.topicRegistrations?.length || 0,
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

  // Cập nhật đề tài đề xuất
  async updateProposedTopic(instructorId: number, topicId: number, updateDto: UpdateProposedTopicDto) {
    // Loại bỏ các trường không được phép cập nhật (topicCode, maxStudents, notes)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { topicCode, maxStudents, notes, ...updateData } = updateDto;

    // Kiểm tra đề tài tồn tại và thuộc quyền quản lý của giảng viên
    const proposedTopic = await this.proposedTopicRepository.findOne({
      where: { 
        id: topicId,
        instructorId 
      }
    });

    if (!proposedTopic) {
      throw new NotFoundException('Đề tài không tồn tại hoặc không thuộc quyền quản lý của bạn');
    }

    // Cập nhật đề tài
    await this.proposedTopicRepository.update(topicId, updateData);

    // Lấy đề tài đã cập nhật
    const updatedTopic = await this.proposedTopicRepository.findOne({
      where: { id: topicId },
      relations: ['thesisRound', 'instructor']
    });

    return {
      success: true,
      message: 'Cập nhật đề tài đề xuất thành công',
      data: updatedTopic
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
      sortOrder = 'DESC'
    } = query;

    const queryBuilder = this.thesisRoundRepository
      .createQueryBuilder('thesisRound')
      .leftJoinAndSelect('thesisRound.thesisType', 'thesisType')
      .leftJoinAndSelect('thesisRound.department', 'department')
      .leftJoinAndSelect('thesisRound.faculty', 'faculty');

    // Áp dụng filters
    if (thesisTypeId) {
      queryBuilder.andWhere('thesisRound.thesisTypeId = :thesisTypeId', { thesisTypeId });
    }

    if (departmentId) {
      queryBuilder.andWhere('thesisRound.departmentId = :departmentId', { departmentId });
    }

    if (facultyId) {
      queryBuilder.andWhere('thesisRound.facultyId = :facultyId', { facultyId });
    }

    if (status) {
      queryBuilder.andWhere('thesisRound.status = :status', { status });
    }

    // Tìm kiếm theo tên hoặc mã đợt
    if (search) {
      queryBuilder.andWhere(
        '(thesisRound.roundName ILIKE :search OR thesisRound.roundCode ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Sắp xếp - mặc định sắp xếp theo createdAt DESC (mới nhất trước), sau đó theo id DESC để đảm bảo thứ tự
    const validSortFields: string[] = ['createdAt', 'roundName', 'startDate', 'endDate', 'id'];
    let sortField = 'createdAt';
    if (sortBy && typeof sortBy === 'string' && validSortFields.includes(sortBy)) {
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
        hasPrevPage
      }
    };
  }

  // Lấy chi tiết một đợt luận văn
  async getThesisRoundById(id: number) {
    const thesisRound = await this.thesisRoundRepository.findOne({
      where: { id },
      relations: ['thesisType', 'department', 'faculty']
    });

    if (!thesisRound) {
      throw new NotFoundException('Không tìm thấy đợt luận văn');
    }

    // Đếm số lượng đề tài được đề xuất trong đợt này
    const proposedTopicsCount = await this.proposedTopicRepository.count({
      where: { thesisRoundId: id }
    });

    // Đếm số lượng giảng viên tham gia
    const instructorsCount = await this.instructorAssignmentRepository.count({
      where: { thesisRoundId: id, status: true }
    });

    // Đếm số lượng sinh viên đăng ký
    const registrationsCount = await this.topicRegistrationRepository.count({
      where: { thesisRoundId: id }
    });

    return {
      success: true,
      data: {
        ...thesisRound,
        statistics: {
          proposedTopicsCount,
          instructorsCount,
          registrationsCount
        }
      }
    };
  }

  // ==================== QUẢN LÝ ĐỢT ĐỀ TÀI ====================

  // Tạo đợt đề tài (trưởng bộ môn và giáo viên)
  async createThesisRound(createDto: CreateThesisRoundDto, userId?: number, userRole?: string) {
    const { roundCode, roundName, thesisTypeId, departmentId, facultyId, ...otherData } = createDto;

    // Kiểm tra mã đợt đã tồn tại chưa
    const existingRound = await this.thesisRoundRepository.findOne({
      where: { roundCode }
    });

    if (existingRound) {
      throw new ConflictException('Mã đợt luận văn đã tồn tại');
    }

    // Kiểm tra loại luận văn tồn tại
    const thesisType = await this.thesisTypeRepository.findOne({
      where: { id: thesisTypeId }
    });

    if (!thesisType) {
      throw new NotFoundException('Loại luận văn không tồn tại');
    }

    // Nếu là giáo viên (TEACHER), tự động set departmentId từ instructor của họ
    let finalDepartmentId = departmentId;
    if (userRole === 'teacher' && userId) {
      const instructor = await this.instructorRepository.findOne({
        where: { userId }
      });

      if (instructor && instructor.departmentId) {
        // Nếu giáo viên có departmentId, sử dụng departmentId của giáo viên
        // Nếu departmentId được truyền vào và khác với department của giáo viên, kiểm tra quyền
        if (departmentId && departmentId !== instructor.departmentId) {
          throw new ForbiddenException('Bạn chỉ có thể tạo đợt tiểu luận cho bộ môn của mình');
        }
        finalDepartmentId = instructor.departmentId;
      } else if (!departmentId) {
        throw new BadRequestException('Giáo viên chưa được gán vào bộ môn. Vui lòng liên hệ quản trị viên.');
      }
    }

    // Tạo đợt luận văn
    const thesisRound = this.thesisRoundRepository.create({
      roundCode,
      roundName,
      thesisTypeId,
      departmentId: finalDepartmentId,
      facultyId,
      ...otherData,
      status: 'Preparing'
    });

    const savedRound = await this.thesisRoundRepository.save(thesisRound);

    // Tự động tạo yêu cầu gửi cho trưởng bộ môn sau khi tạo đợt tiểu luận thành công
    if (finalDepartmentId && userId) {
      try {
        await this.createRequestForHeadOfDepartment(savedRound, userId);
      } catch (error) {
        // Log lỗi nhưng không throw để không ảnh hưởng đến việc tạo đợt tiểu luận
        console.error('Error creating request for head of department:', error);
      }
    }

    return {
      success: true,
      message: 'Tạo đợt luận văn thành công',
      data: savedRound
    };
  }

  // Cập nhật đợt đề tài
  async updateThesisRound(roundId: number, updateDto: UpdateThesisRoundDto) {
    const thesisRound = await this.thesisRoundRepository.findOne({
      where: { id: roundId },
      relations: ['thesisType', 'department', 'faculty']
    });

    if (!thesisRound) {
      throw new NotFoundException('Đợt luận văn không tồn tại');
    }

    // Lưu trạng thái cũ để so sánh
    const oldStatus = thesisRound.status;
    const newStatus = updateDto.status;

    // Cập nhật thông tin
    await this.thesisRoundRepository.update(roundId, updateDto);

    const updatedRound = await this.thesisRoundRepository.findOne({
      where: { id: roundId },
      relations: ['thesisType', 'department', 'faculty']
    });

    // Nếu status thay đổi từ "Preparing" sang "In Progress" (mở đợt)
    if (oldStatus === 'Preparing' && newStatus === 'In Progress') {
      // Lấy tất cả giáo viên trong đợt
      const instructorAssignments = await this.instructorAssignmentRepository.find({
        where: { 
          thesisRoundId: roundId,
          status: true // Chỉ lấy giáo viên đang hoạt động
        },
        relations: ['instructor', 'instructor.user']
      });

      // Gửi thông báo cho tất cả giáo viên trong đợt
      for (const assignment of instructorAssignments) {
        if (assignment.instructor?.user?.id) {
          try {
            await this.socketGateway.sendToUser(
              assignment.instructor.user.id.toString(),
              'thesis_round_opened',
              {
                thesisRoundId: roundId,
                roundCode: updatedRound?.roundCode || thesisRound.roundCode,
                roundName: updatedRound?.roundName || thesisRound.roundName,
                message: `Đợt luận văn "${updatedRound?.roundName || thesisRound.roundName}" đã được mở. Bạn có thể bắt đầu nhận đăng ký đề tài từ sinh viên.`,
                status: 'In Progress',
                openedAt: new Date().toISOString()
              }
            );
          } catch (socketError) {
            console.error(`Error sending socket notification to instructor ${assignment.instructor.user.id}:`, socketError);
          }
        }
      }

      // Gửi thông báo đến room của đợt luận văn
      try {
        await this.socketGateway.sendToThesisRound(
          roundId,
          'thesis_round_status_updated',
          {
            thesisRoundId: roundId,
            roundCode: updatedRound?.roundCode || thesisRound.roundCode,
            roundName: updatedRound?.roundName || thesisRound.roundName,
            oldStatus: oldStatus,
            newStatus: newStatus,
            message: `Đợt luận văn "${updatedRound?.roundName || thesisRound.roundName}" đã được mở`,
            updatedAt: new Date().toISOString()
          }
        );
      } catch (socketError) {
        console.error('Error sending socket notification to thesis round room:', socketError);
      }
    }

    return {
      success: true,
      message: 'Cập nhật đợt luận văn thành công',
      data: updatedRound
    };
  }

  // ==================== QUẢN LÝ GIẢNG VIÊN TRONG ĐỢT ====================

  // Kiểm tra quyền quản lý đợt đề tài
  private async checkThesisRoundManagementPermission(roundId: number, userId: number, userRole: string): Promise<ThesisRound> {
    const thesisRound = await this.thesisRoundRepository.findOne({
      where: { id: roundId },
      relations: ['department']
    });

    if (!thesisRound) {
      throw new NotFoundException('Đợt luận văn không tồn tại');
    }

    // Admin và Head of Department có quyền quản lý tất cả đợt
    if (userRole === 'admin' || userRole === 'head_of_department') {
      return thesisRound;
    }

    // Giáo viên chỉ có thể quản lý đợt của bộ môn mình
    if (userRole === 'teacher') {
      const instructor = await this.instructorRepository.findOne({
        where: { userId }
      });

      if (!instructor) {
        throw new ForbiddenException('Bạn không có quyền quản lý đợt đề tài này');
      }

      if (thesisRound.departmentId && instructor.departmentId !== thesisRound.departmentId) {
        throw new ForbiddenException('Bạn chỉ có thể quản lý đợt đề tài của bộ môn mình');
      }

      return thesisRound;
    }

    throw new ForbiddenException('Bạn không có quyền quản lý đợt đề tài này');
  }

  // Thêm một giảng viên vào đợt đề tài
  async addInstructorToRound(roundId: number, addDto: AddInstructorToRoundDto, userId: number, userRole: string) {
    // Kiểm tra quyền
    const thesisRound = await this.checkThesisRoundManagementPermission(roundId, userId, userRole);

    const { instructorId, maxStudents = 5 } = addDto;

    // Kiểm tra giảng viên tồn tại
    const instructor = await this.instructorRepository.findOne({
      where: { id: instructorId },
      relations: ['user', 'department']
    });

    if (!instructor) {
      throw new NotFoundException('Giảng viên không tồn tại');
    }

    // Nếu đợt có departmentId, kiểm tra giảng viên có thuộc bộ môn đó không
    if (thesisRound.departmentId && instructor.departmentId !== thesisRound.departmentId) {
      throw new BadRequestException('Giảng viên không thuộc bộ môn của đợt đề tài này');
    }

    // Kiểm tra giảng viên đã được thêm vào đợt này chưa
    const existingInstructor = await this.instructorAssignmentRepository.findOne({
      where: {
        thesisRoundId: roundId,
        instructorId
      }
    });

    if (existingInstructor) {
      throw new ConflictException('Giảng viên đã được thêm vào đợt này rồi');
    }

    // Lấy instructorId của người thêm (nếu là trưởng bộ môn)
    let addedById: number | undefined;
    if (userRole === 'head_of_department') {
      const currentInstructor = await this.instructorRepository.findOne({
        where: { userId }
      });
      addedById = currentInstructor?.id;
    }

    // Thêm giảng viên vào đợt
    const instructorAssignment = this.instructorAssignmentRepository.create({
      thesisRoundId: roundId,
      instructorId,
      supervisionQuota: maxStudents,
      status: true,
      addedBy: addedById
    });

    await this.instructorAssignmentRepository.save(instructorAssignment);

    // Tự động chuyển status từ 'Preparing' sang 'In Progress' khi thêm giảng viên đầu tiên
    if (thesisRound.status === 'Preparing') {
      await this.thesisRoundRepository.update(roundId, { status: 'In Progress' });
    }

    return {
      success: true,
      message: 'Thêm giảng viên vào đợt đề tài thành công',
      data: {
        thesisRoundId: roundId,
        instructor: {
          id: instructor.id,
          instructorCode: instructor.instructorCode,
          fullName: instructor.user?.fullName || null,
          email: instructor.user?.email || null,
          department: instructor.department?.departmentName || null
        },
        maxStudents
      }
    };
  }

  // Thêm nhiều giảng viên vào đợt đề tài
  async addMultipleInstructorsToRound(roundId: number, addDto: AddMultipleInstructorsDto, userId: number, userRole: string) {
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
      console.log(`=== PROCESSING INSTRUCTOR ${i + 1}/${instructorsToProcess.length} ===`);
      console.log('instructorDto:', instructorDto);
      console.log('instructorDto.instructorId:', instructorDto.instructorId);
      console.log('typeof instructorDto.instructorId:', typeof instructorDto.instructorId);
      console.log('instructorDto.instructorId === null:', instructorDto.instructorId === null);
      console.log('instructorDto.instructorId === undefined:', instructorDto.instructorId === undefined);
      
      try {
        // Kiểm tra instructorId có tồn tại và là số không
        if (!instructorDto.instructorId || typeof instructorDto.instructorId !== 'number') {
          console.log(`=== VALIDATION ERROR for instructor ${i + 1}: instructorId is invalid ===`);
          console.log('instructorDto.instructorId:', instructorDto.instructorId);
          console.log('typeof instructorDto.instructorId:', typeof instructorDto.instructorId);
          throw new BadRequestException('instructorId phải là số và không được để trống');
        }

        console.log(`Calling addInstructorToRound with instructorId: ${instructorDto.instructorId}`);
        const result = await this.addInstructorToRound(roundId, instructorDto, userId, userRole);
        console.log(`Success for instructorId ${instructorDto.instructorId}:`, result);
        results.push(result.data);
      } catch (error) {
        console.log(`Error for instructorId ${instructorDto.instructorId}:`, error);
        console.log('Error message:', error instanceof Error ? error.message : 'Unknown error');
        console.log('Error stack:', error instanceof Error ? error.stack : 'No stack');
        
        errors.push({
          instructorId: instructorDto?.instructorId ?? null,
          error: error instanceof Error ? error.message : 'Unknown error'
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
        failed: errors
      }
    };
  }

  // Cập nhật thông tin giảng viên trong đợt
  async updateInstructorInRound(roundId: number, instructorId: number, updateDto: UpdateInstructorInRoundDto, userId: number, userRole: string) {
    // Kiểm tra quyền
    await this.checkThesisRoundManagementPermission(roundId, userId, userRole);

    const instructorAssignment = await this.instructorAssignmentRepository.findOne({
      where: {
        thesisRoundId: roundId,
        instructorId
      }
    });

    if (!instructorAssignment) {
      throw new NotFoundException('Giảng viên không có trong đợt đề tài này');
    }

    await this.instructorAssignmentRepository.update(instructorAssignment.id, updateDto);

    return {
      success: true,
      message: 'Cập nhật thông tin giảng viên thành công'
    };
  }

  // Xóa giảng viên khỏi đợt đề tài
  async removeInstructorFromRound(roundId: number, instructorId: number, userId: number, userRole: string) {
    // Kiểm tra quyền
    await this.checkThesisRoundManagementPermission(roundId, userId, userRole);

    const instructorAssignment = await this.instructorAssignmentRepository.findOne({
      where: {
        thesisRoundId: roundId,
        instructorId
      }
    });

    if (!instructorAssignment) {
      throw new NotFoundException('Giảng viên không có trong đợt đề tài này');
    }

    // Kiểm tra xem giảng viên đã có sinh viên đăng ký chưa
    const hasRegistrations = await this.topicRegistrationRepository.count({
      where: {
        thesisRoundId: roundId,
        instructorId
      }
    });

    if (hasRegistrations > 0) {
      throw new BadRequestException('Không thể xóa giảng viên vì đã có sinh viên đăng ký với giảng viên này');
    }

    await this.instructorAssignmentRepository.remove(instructorAssignment);

    return {
      success: true,
      message: 'Xóa giảng viên khỏi đợt đề tài thành công'
    };
  }

  // ==================== QUẢN LÝ LỚP TRONG ĐỢT ====================

  // Thêm một lớp vào đợt đề tài
  async addClassToRound(roundId: number, addDto: AddClassToRoundDto, userId: number, userRole: string) {
    // Kiểm tra quyền - cho phép cả giáo viên và trưởng bộ môn
    const thesisRound = await this.checkThesisRoundManagementPermission(roundId, userId, userRole);

    const { classId } = addDto;

    // Kiểm tra lớp tồn tại
    const classEntity = await this.classRepository.findOne({
      where: { id: classId },
      relations: ['major', 'major.department', 'advisor', 'advisor.user']
    });

    if (!classEntity) {
      throw new NotFoundException('Lớp không tồn tại');
    }

    // Nếu đợt có departmentId, kiểm tra lớp có thuộc bộ môn đó không
    if (thesisRound.departmentId && classEntity.major?.department?.id !== thesisRound.departmentId) {
      throw new BadRequestException('Lớp không thuộc bộ môn của đợt đề tài này');
    }

    // Kiểm tra lớp đã được thêm vào đợt này chưa
    const existingClass = await this.thesisRoundClassRepository.findOne({
      where: {
        thesisRoundId: roundId,
        classId
      }
    });

    if (existingClass) {
      throw new ConflictException('Lớp đã được thêm vào đợt này rồi');
    }

    // Thêm lớp vào đợt
    const thesisRoundClass = this.thesisRoundClassRepository.create({
      thesisRoundId: roundId,
      classId
    });

    await this.thesisRoundClassRepository.save(thesisRoundClass);

    return {
      success: true,
      message: 'Thêm lớp vào đợt đề tài thành công',
      data: {
        thesisRoundId: roundId,
        class: {
          id: classEntity.id,
          classCode: classEntity.classCode,
          className: classEntity.className,
          academicYear: classEntity.academicYear,
          studentCount: classEntity.studentCount,
          major: classEntity.major ? {
            id: classEntity.major.id,
            majorCode: classEntity.major.majorCode,
            majorName: classEntity.major.majorName,
            department: classEntity.major.department ? {
              id: classEntity.major.department.id,
              departmentCode: classEntity.major.department.departmentCode,
              departmentName: classEntity.major.department.departmentName
            } : null
          } : null,
          advisor: classEntity.advisor ? {
            id: classEntity.advisor.id,
            instructorCode: classEntity.advisor.instructorCode,
            fullName: classEntity.advisor.user?.fullName || null
          } : null
        }
      }
    };
  }

  // Thêm nhiều lớp vào đợt đề tài
  async addMultipleClassesToRound(roundId: number, addDto: AddMultipleClassesToRoundDto, userId: number, userRole: string) {
    // Kiểm tra quyền
    await this.checkThesisRoundManagementPermission(roundId, userId, userRole);

    const { classes } = addDto;

    if (!classes || classes.length === 0) {
      throw new BadRequestException('Danh sách lớp không được để trống');
    }

    const results: any[] = [];
    const errors: Array<{ classId: number; error: string }> = [];

    for (const classDto of classes) {
      try {
        const result = await this.addClassToRound(roundId, classDto, userId, userRole);
        results.push(result.data);
      } catch (error) {
        errors.push({
          classId: classDto.classId,
          error: error instanceof Error ? error.message : 'Lỗi không xác định'
        });
      }
    }

    return {
      success: true,
      message: `Đã thêm ${results.length} lớp thành công${errors.length > 0 ? `, ${errors.length} lớp thất bại` : ''}`,
      data: {
        thesisRoundId: roundId,
        classes: results,
        errors: errors.length > 0 ? errors : undefined
      },
      totalSuccess: results.length,
      totalErrors: errors.length
    };
  }

  // Lấy danh sách lớp trong đợt đề tài
  async getClassesInRound(roundId: number) {
    const thesisRound = await this.thesisRoundRepository.findOne({
      where: { id: roundId }
    });

    if (!thesisRound) {
      throw new NotFoundException('Đợt luận văn không tồn tại');
    }

    const thesisRoundClasses = await this.thesisRoundClassRepository.find({
      where: { thesisRoundId: roundId },
      relations: ['class', 'class.major', 'class.major.department', 'class.advisor', 'class.advisor.user']
    });

    return {
      success: true,
      data: {
        thesisRound: {
          id: thesisRound.id,
          roundCode: thesisRound.roundCode,
          roundName: thesisRound.roundName
        },
        classes: thesisRoundClasses.map(trc => ({
          id: trc.id,
          class: {
            id: trc.class.id,
            classCode: trc.class.classCode,
            className: trc.class.className,
            academicYear: trc.class.academicYear,
            studentCount: trc.class.studentCount,
            status: trc.class.status,
            major: trc.class.major ? {
              id: trc.class.major.id,
              majorCode: trc.class.major.majorCode,
              majorName: trc.class.major.majorName,
              department: trc.class.major.department ? {
                id: trc.class.major.department.id,
                departmentCode: trc.class.major.department.departmentCode,
                departmentName: trc.class.major.department.departmentName
              } : null
            } : null,
            advisor: trc.class.advisor ? {
              id: trc.class.advisor.id,
              instructorCode: trc.class.advisor.instructorCode,
              fullName: trc.class.advisor.user?.fullName || null
            } : null
          },
          addedAt: trc.createdAt
        })),
        total: thesisRoundClasses.length
      }
    };
  }

  // Xóa lớp khỏi đợt đề tài
  async removeClassFromRound(roundId: number, classId: number, userId: number, userRole: string) {
    // Kiểm tra quyền
    await this.checkThesisRoundManagementPermission(roundId, userId, userRole);

    const thesisRoundClass = await this.thesisRoundClassRepository.findOne({
      where: {
        thesisRoundId: roundId,
        classId
      }
    });

    if (!thesisRoundClass) {
      throw new NotFoundException('Lớp không tồn tại trong đợt đề tài này');
    }

    await this.thesisRoundClassRepository.remove(thesisRoundClass);

    return {
      success: true,
      message: 'Xóa lớp khỏi đợt đề tài thành công'
    };
  }

  // ==================== QUẢN LÝ HỌC SINH TRONG ĐỢT ====================

  // Thêm một học sinh vào đợt đề tài
  async addStudentToRound(roundId: number, addDto: AddStudentToRoundDto, userId: number, userRole: string) {
    // Kiểm tra quyền
    const thesisRound = await this.checkThesisRoundManagementPermission(roundId, userId, userRole);

    const { studentId, eligible = true, notes } = addDto;

    // Kiểm tra học sinh tồn tại
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
      relations: ['user', 'classEntity', 'classEntity.major', 'classEntity.major.department']
    });

    if (!student) {
      throw new NotFoundException('Học sinh không tồn tại');
    }

    // Nếu đợt có departmentId, kiểm tra học sinh có thuộc bộ môn đó không (thông qua lớp)
    if (thesisRound.departmentId && student.classEntity?.major?.department?.id !== thesisRound.departmentId) {
      throw new BadRequestException('Học sinh không thuộc bộ môn của đợt đề tài này');
    }

    // Kiểm tra học sinh đã được thêm vào đợt này chưa
    const existingStudent = await this.studentThesisRoundRepository.findOne({
      where: {
        thesisRoundId: roundId,
        studentId
      }
    });

    if (existingStudent) {
      throw new ConflictException('Học sinh đã được thêm vào đợt này rồi');
    }

    // Thêm học sinh vào đợt
    const studentThesisRound = this.studentThesisRoundRepository.create({
      thesisRoundId: roundId,
      studentId,
      eligible,
      notes
    });

    await this.studentThesisRoundRepository.save(studentThesisRound);

    return {
      success: true,
      message: 'Thêm học sinh vào đợt đề tài thành công',
      data: {
        thesisRoundId: roundId,
        student: {
          id: student.id,
          studentCode: student.studentCode,
          fullName: student.user?.fullName || null,
          email: student.user?.email || null,
          class: student.classEntity ? {
            id: student.classEntity.id,
            classCode: student.classEntity.classCode,
            className: student.classEntity.className
          } : null,
          eligible,
          notes
        }
      }
    };
  }

  // Thêm nhiều học sinh vào đợt đề tài
  async addMultipleStudentsToRound(roundId: number, addDto: AddMultipleStudentsToRoundDto, userId: number, userRole: string) {
    // Kiểm tra quyền
    await this.checkThesisRoundManagementPermission(roundId, userId, userRole);

    const { students } = addDto;

    if (!students || students.length === 0) {
      throw new BadRequestException('Danh sách học sinh không được để trống');
    }

    const results: any[] = [];
    const errors: Array<{ studentId: number | null; error: string }> = [];

    for (const studentDto of students) {
      try {
        const result = await this.addStudentToRound(roundId, studentDto, userId, userRole);
        results.push(result.data);
      } catch (error) {
        errors.push({
          studentId: studentDto?.studentId ?? null,
          error: error instanceof Error ? error.message : 'Lỗi không xác định'
        });
      }
    }

    return {
      success: true,
      message: `Đã thêm ${results.length} học sinh thành công${errors.length > 0 ? `, ${errors.length} học sinh thất bại` : ''}`,
      data: {
        thesisRoundId: roundId,
        students: results,
        errors: errors.length > 0 ? errors : undefined
      },
      totalSuccess: results.length,
      totalErrors: errors.length
    };
  }

  // Lấy danh sách học sinh trong đợt đề tài
  async getStudentsInRound(roundId: number) {
    const thesisRound = await this.thesisRoundRepository.findOne({
      where: { id: roundId }
    });

    if (!thesisRound) {
      throw new NotFoundException('Đợt luận văn không tồn tại');
    }

    const studentThesisRounds = await this.studentThesisRoundRepository.find({
      where: { thesisRoundId: roundId },
      relations: ['student', 'student.user', 'student.classEntity', 'student.classEntity.major', 'student.classEntity.major.department']
    });

    return {
      success: true,
      data: {
        thesisRound: {
          id: thesisRound.id,
          roundCode: thesisRound.roundCode,
          roundName: thesisRound.roundName
        },
        students: studentThesisRounds.map(str => ({
          id: str.id,
          student: {
            id: str.student.id,
            studentCode: str.student.studentCode,
            fullName: str.student.user?.fullName || null,
            email: str.student.user?.email || null,
            phone: str.student.user?.phone || null,
            gpa: str.student.gpa,
            academicStatus: str.student.academicStatus,
            class: str.student.classEntity ? {
              id: str.student.classEntity.id,
              classCode: str.student.classEntity.classCode,
              className: str.student.classEntity.className,
              major: str.student.classEntity.major ? {
                id: str.student.classEntity.major.id,
                majorCode: str.student.classEntity.major.majorCode,
                majorName: str.student.classEntity.major.majorName,
                department: str.student.classEntity.major.department ? {
                  id: str.student.classEntity.major.department.id,
                  departmentCode: str.student.classEntity.major.department.departmentCode,
                  departmentName: str.student.classEntity.major.department.departmentName
                } : null
              } : null
            } : null
          },
          eligible: str.eligible,
          notes: str.notes,
          addedAt: str.createdAt
        })),
        total: studentThesisRounds.length
      }
    };
  }

  // Xóa học sinh khỏi đợt đề tài
  async removeStudentFromRound(roundId: number, studentId: number, userId: number, userRole: string) {
    // Kiểm tra quyền
    await this.checkThesisRoundManagementPermission(roundId, userId, userRole);

    const studentThesisRound = await this.studentThesisRoundRepository.findOne({
      where: {
        thesisRoundId: roundId,
        studentId
      }
    });

    if (!studentThesisRound) {
      throw new NotFoundException('Học sinh không tồn tại trong đợt đề tài này');
    }

    await this.studentThesisRoundRepository.remove(studentThesisRound);

    return {
      success: true,
      message: 'Xóa học sinh khỏi đợt đề tài thành công'
    };
  }

  // Lấy danh sách giảng viên trong đợt đề tài
  async getInstructorsInRound(roundId: number, query?: GetInstructorsInRoundDto) {
    try {
      console.log(`[DEBUG] Getting instructors for roundId: ${roundId}`);
      
      const whereCondition: Record<string, any> = {
        thesisRoundId: roundId
      };

      if (query?.status !== undefined) {
        whereCondition.status = query.status;
      }

      console.log(`[DEBUG] Where condition:`, whereCondition);

      const instructors = await this.instructorAssignmentRepository.find({
        where: whereCondition,
        relations: ['instructor', 'instructor.user', 'instructor.department'],
        order: {
          createdAt: 'ASC'
        }
      });

      console.log(`[DEBUG] Found ${instructors.length} instructors`);

      // Kiểm tra nếu không có giảng viên nào
      if (!instructors || instructors.length === 0) {
        console.log(`[DEBUG] No instructors found for roundId: ${roundId}`);
        return {
          success: true,
          data: []
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
              department: item.instructor.department ? {
                id: item.instructor.department.id,
                departmentName: item.instructor.department.departmentName,
                departmentCode: item.instructor.department.departmentCode
              } : null
            },
            maxStudents: item.supervisionQuota,
            currentStudents: registrationCount,
            availableSlots: item.supervisionQuota - registrationCount,
            status: item.status,
            createdAt: item.createdAt
          };

          instructorsWithCount.push(instructorData);
        } catch (error) {
          console.error('Error processing instructor item:', error);
          continue;
        }
      }

      console.log(`[DEBUG] Processed ${instructorsWithCount.length} instructors successfully`);

      return {
        success: true,
        data: instructorsWithCount
      };
    } catch (error) {
      console.error('Error in getInstructorsInRound:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Lỗi khi lấy danh sách giảng viên: ${errorMessage}`);
    }
  }

  // ==================== PHÊ DUYỆT CỦA TRƯỞNG BỘ MÔN ====================

  // Lấy danh sách đăng ký chờ trưởng bộ môn phê duyệt (helper method)
  async getRegistrationsForHeadApprovalByInstructorId(headInstructorId: number, query: GetRegistrationsForHeadApprovalDto) {
    // Lấy thông tin trưởng bộ môn và department
    const instructor = await this.instructorRepository.findOne({
      where: { id: headInstructorId },
      relations: ['department']
    });

    if (!instructor || !instructor.departmentId) {
      throw new NotFoundException('Không tìm thấy thông tin bộ môn');
    }

    // Kiểm tra xem có phải trưởng bộ môn không
    const department = await this.departmentRepository.findOne({
      where: { headId: headInstructorId }
    });

    if (!department) {
      throw new ForbiddenException('Bạn không phải trưởng bộ môn');
    }

    return this.getRegistrationsForHeadApproval(department.id, query);
  }

  // Lấy danh sách đăng ký chờ trưởng bộ môn phê duyệt
  async getRegistrationsForHeadApproval(departmentId: number, query: GetRegistrationsForHeadApprovalDto) {
    const { thesisRoundId, status, page = 1, limit = 10 } = query;

    const queryBuilder = this.topicRegistrationRepository
      .createQueryBuilder('registration')
      .leftJoinAndSelect('registration.thesisGroup', 'thesisGroup')
      .leftJoinAndSelect(
        'thesisGroup.members',
        'groupMember',
        "groupMember.isActive = true AND groupMember.role IN ('LEADER','SOLO')",
      )
      .leftJoinAndSelect('groupMember.student', 'student')
      .leftJoinAndSelect('student.user', 'user')
      .leftJoinAndSelect('student.classEntity', 'class')
      .leftJoinAndSelect('registration.thesisRound', 'thesisRound')
      .leftJoinAndSelect('thesisRound.department', 'department')
      .leftJoinAndSelect('registration.proposedTopic', 'proposedTopic')
      .leftJoinAndSelect('registration.instructor', 'instructor')
      .leftJoinAndSelect('instructor.user', 'instructorUser')
      .where('department.id = :departmentId', { departmentId })
      .andWhere('registration.instructorStatus = :instructorStatus', { instructorStatus: 'Approved' })
      .andWhere('registration.headStatus = :headStatus', { headStatus: 'Pending' });

    if (thesisRoundId) {
      queryBuilder.andWhere('registration.thesisRoundId = :thesisRoundId', { thesisRoundId });
    }

    if (status) {
      queryBuilder.andWhere('registration.headStatus = :status', { status });
    }

    queryBuilder.orderBy('registration.instructorApprovalDate', 'DESC');

    // Phân trang
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [registrations, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      success: true,
      data: registrations.map(registration => {
        const leaderStudent = registration.thesisGroup?.members?.[0]?.student;
        const topicTitle = registration.proposedTopic?.topicTitle || registration.selfProposedTitle || null;
        
        return {
          id: registration.id,
          thesisGroupId: registration.thesisGroupId,
          student: {
            id: leaderStudent?.id || null,
            studentCode: leaderStudent?.studentCode || null,
            fullName: leaderStudent?.user?.fullName || null,
            email: leaderStudent?.user?.email || null,
            phone: leaderStudent?.user?.phone || null,
            class: leaderStudent?.classEntity ? {
              id: leaderStudent.classEntity.id,
              className: leaderStudent.classEntity.className,
              classCode: leaderStudent.classEntity.classCode
            } : null
          },
          thesisRound: registration.thesisRound ? {
            id: registration.thesisRound.id,
            roundName: registration.thesisRound.roundName,
            roundCode: registration.thesisRound.roundCode,
            status: registration.thesisRound.status
          } : null,
          proposedTopic: registration.proposedTopic ? {
            id: registration.proposedTopic.id,
            topicTitle: registration.proposedTopic.topicTitle,
            topicCode: registration.proposedTopic.topicCode
          } : null,
          selfProposedTitle: registration.selfProposedTitle,
          selfProposedDescription: registration.selfProposedDescription,
          topicTitle: topicTitle,
          selectionReason: registration.selectionReason,
          instructor: {
            id: registration.instructor?.id || null,
            instructorCode: registration.instructor?.instructorCode || null,
            fullName: registration.instructor?.user?.fullName || null,
            email: registration.instructor?.user?.email || null
          },
          instructorStatus: registration.instructorStatus,
          headStatus: registration.headStatus,
          instructorRejectionReason: registration.instructorRejectionReason,
          headRejectionReason: registration.headRejectionReason,
          registrationDate: registration.registrationDate,
          instructorApprovalDate: registration.instructorApprovalDate,
          headApprovalDate: registration.headApprovalDate
        };
      }),
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

  // Lấy tất cả đăng ký đề tài của sinh viên trong bộ môn (trưởng bộ môn)
  async getAllStudentRegistrationsForHeadByInstructorId(headInstructorId: number, query: GetAllStudentRegistrationsForHeadDto) {
    // Lấy thông tin trưởng bộ môn và department
    const instructor = await this.instructorRepository.findOne({
      where: { id: headInstructorId },
      relations: ['department']
    });

    if (!instructor || !instructor.departmentId) {
      throw new NotFoundException('Không tìm thấy thông tin bộ môn');
    }

    // Kiểm tra xem có phải trưởng bộ môn không
    const department = await this.departmentRepository.findOne({
      where: { headId: headInstructorId }
    });

    if (!department) {
      throw new ForbiddenException('Bạn không phải trưởng bộ môn');
    }

    return this.getAllStudentRegistrationsForHead(department.id, query);
  }

  // Lấy tất cả đăng ký đề tài của sinh viên trong bộ môn
  async getAllStudentRegistrationsForHead(departmentId: number, query: GetAllStudentRegistrationsForHeadDto) {
    const { thesisRoundId, instructorStatus, headStatus, page = 1, limit = 10 } = query;

    const queryBuilder = this.topicRegistrationRepository
      .createQueryBuilder('registration')
      .leftJoinAndSelect('registration.thesisGroup', 'thesisGroup')
      .leftJoinAndSelect(
        'thesisGroup.members',
        'groupMember',
        "groupMember.isActive = true AND groupMember.role IN ('LEADER','SOLO')",
      )
      .leftJoinAndSelect('groupMember.student', 'student')
      .leftJoinAndSelect('student.user', 'user')
      .leftJoinAndSelect('student.classEntity', 'class')
      .leftJoinAndSelect('registration.thesisRound', 'thesisRound')
      .leftJoinAndSelect('thesisRound.department', 'department')
      .leftJoinAndSelect('registration.proposedTopic', 'proposedTopic')
      .leftJoinAndSelect('registration.instructor', 'instructor')
      .leftJoinAndSelect('instructor.user', 'instructorUser')
      .where('department.id = :departmentId', { departmentId });

    // Filter theo đợt luận văn
    if (thesisRoundId) {
      queryBuilder.andWhere('registration.thesisRoundId = :thesisRoundId', { thesisRoundId });
    }

    // Filter theo trạng thái giáo viên
    if (instructorStatus) {
      queryBuilder.andWhere('registration.instructorStatus = :instructorStatus', { instructorStatus });
    }

    // Filter theo trạng thái trưởng bộ môn
    if (headStatus) {
      queryBuilder.andWhere('registration.headStatus = :headStatus', { headStatus });
    }

    queryBuilder.orderBy('registration.registrationDate', 'DESC');

    // Phân trang
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [registrations, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      success: true,
      data: registrations.map(registration => {
        const leaderStudent = registration.thesisGroup?.members?.[0]?.student;
        const topicTitle = registration.proposedTopic?.topicTitle || registration.selfProposedTitle || null;
        
        return {
          id: registration.id,
          thesisGroupId: registration.thesisGroupId,
          student: {
            id: leaderStudent?.id || null,
            studentCode: leaderStudent?.studentCode || null,
            fullName: leaderStudent?.user?.fullName || null,
            email: leaderStudent?.user?.email || null,
            phone: leaderStudent?.user?.phone || null,
            class: leaderStudent?.classEntity ? {
              id: leaderStudent.classEntity.id,
              className: leaderStudent.classEntity.className,
              classCode: leaderStudent.classEntity.classCode
            } : null
          },
          thesisRound: registration.thesisRound ? {
            id: registration.thesisRound.id,
            roundName: registration.thesisRound.roundName,
            roundCode: registration.thesisRound.roundCode,
            status: registration.thesisRound.status
          } : null,
          proposedTopic: registration.proposedTopic ? {
            id: registration.proposedTopic.id,
            topicTitle: registration.proposedTopic.topicTitle,
            topicCode: registration.proposedTopic.topicCode
          } : null,
          selfProposedTitle: registration.selfProposedTitle,
          selfProposedDescription: registration.selfProposedDescription,
          topicTitle: topicTitle,
          selectionReason: registration.selectionReason,
          instructor: {
            id: registration.instructor?.id || null,
            instructorCode: registration.instructor?.instructorCode || null,
            fullName: registration.instructor?.user?.fullName || null,
            email: registration.instructor?.user?.email || null
          },
          instructorStatus: registration.instructorStatus,
          headStatus: registration.headStatus,
          instructorRejectionReason: registration.instructorRejectionReason,
          headRejectionReason: registration.headRejectionReason,
          registrationDate: registration.registrationDate,
          instructorApprovalDate: registration.instructorApprovalDate,
          headApprovalDate: registration.headApprovalDate
        };
      }),
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

  // Trưởng bộ môn phê duyệt/từ chối đăng ký đề tài
  async approveTopicRegistrationByHead(headInstructorId: number, approveDto: ApproveTopicRegistrationByHeadDto) {
    const { registrationId, approved, rejectionReason } = approveDto;

    // Lấy thông tin trưởng bộ môn
    const headInstructor = await this.instructorRepository.findOne({
      where: { id: headInstructorId },
      relations: ['department', 'user']
    });

    if (!headInstructor) {
      throw new NotFoundException('Không tìm thấy thông tin trưởng bộ môn');
    }

    // Kiểm tra xem có phải trưởng bộ môn không
    const department = await this.departmentRepository.findOne({
      where: { headId: headInstructorId },
      relations: ['head']
    });

    if (!department) {
      throw new ForbiddenException('Bạn không phải trưởng bộ môn');
    }

    // Lấy thông tin đăng ký
    const registration = await this.topicRegistrationRepository.findOne({
      where: { id: registrationId },
      relations: [
        'thesisGroup',
        'thesisGroup.members',
        'thesisGroup.members.student',
        'thesisGroup.members.student.user',
        'thesisRound', 
        'thesisRound.department',
        'instructor',
        'instructor.user',
        'proposedTopic'
      ]
    });

    if (!registration) {
      throw new NotFoundException('Đăng ký đề tài không tồn tại');
    }

    // Kiểm tra đăng ký có thuộc bộ môn của trưởng bộ môn không
    if (registration.thesisRound?.departmentId !== department.id) {
      throw new ForbiddenException('Đăng ký đề tài không thuộc bộ môn của bạn');
    }

    // Kiểm tra giáo viên hướng dẫn đã phê duyệt chưa
    if (registration.instructorStatus !== 'Approved') {
      throw new BadRequestException('Giáo viên hướng dẫn chưa phê duyệt đăng ký này');
    }

    // Kiểm tra trưởng bộ môn đã xử lý chưa
    if (registration.headStatus !== 'Pending') {
      throw new BadRequestException('Đăng ký đề tài đã được xử lý rồi');
    }

    const leaderStudent = registration.thesisGroup?.members?.[0]?.student;

    const approvalDate = new Date();
    const updateData: Partial<TopicRegistration> = {
      headStatus: approved ? 'Approved' : 'Rejected',
      headApprovalDate: approvalDate
    };

    if (!approved && rejectionReason) {
      updateData.headRejectionReason = rejectionReason;
    }

    await this.topicRegistrationRepository.update(registrationId, updateData);

    // Gửi thông báo real-time cho sinh viên
    try {
      if (leaderStudent?.user?.id) {
        await this.socketGateway.sendToUser(
          leaderStudent.user.id.toString(),
          'topic_registration_updated',
          {
            registrationId: registration.id,
            status: approved ? 'FullyApproved' : 'RejectedByHead',
            message: approved ? 
              'Đăng ký đề tài của bạn đã được trưởng bộ môn phê duyệt. Đăng ký đã hoàn tất!' : 
              'Đăng ký đề tài của bạn đã bị trưởng bộ môn từ chối',
            rejectionReason: rejectionReason
          }
        );
      }
    } catch (socketError) {
      console.error('Error sending socket notification to student:', socketError);
    }

    // Gửi thông báo cho giáo viên hướng dẫn
    try {
      if (registration.instructor?.user?.id) {
        await this.socketGateway.sendToUser(
          registration.instructor.user.id.toString(),
          'registration_head_approval_updated',
          {
            registrationId: registration.id,
            studentName: leaderStudent?.user?.fullName || 'N/A',
            status: approved ? 'Approved' : 'Rejected',
            message: approved ? 
              `Đăng ký đề tài của sinh viên ${leaderStudent?.user?.fullName || 'N/A'} đã được trưởng bộ môn phê duyệt` : 
              `Đăng ký đề tài của sinh viên ${leaderStudent?.user?.fullName || 'N/A'} đã bị trưởng bộ môn từ chối`
          }
        );
      }
    } catch (socketError) {
      console.error('Error sending socket notification to instructor:', socketError);
    }

    return {
      success: true,
      message: approved ? 'Phê duyệt đăng ký thành công' : 'Từ chối đăng ký thành công',
      data: {
        registrationId,
        status: approved ? 'Approved' : 'Rejected',
        instructorStatus: registration.instructorStatus,
        headStatus: approved ? 'Approved' : 'Rejected',
        isFullyApproved: approved
      }
    };
  }

  // ==================== YÊU CẦU MỞ ĐỢT ĐỀ TÀI ====================

  // Gửi yêu cầu mở đợt đề tài cho trưởng bộ môn
  async requestOpenThesisRound(userId: number, requestDto: RequestOpenRoundDto) {
    const { roundCode, roundName, thesisTypeId, departmentId, facultyId, ...otherData } = requestDto;

    // Kiểm tra mã đợt đã tồn tại chưa (trong đợt đề tài hoặc yêu cầu)
    const existingRound = await this.thesisRoundRepository.findOne({
      where: { roundCode }
    });

    if (existingRound) {
      throw new ConflictException('Mã đợt đề tài đã tồn tại');
    }

    // Kiểm tra yêu cầu với mã này đã tồn tại chưa (trạng thái Pending)
    const existingRequest = await this.thesisRoundRequestRepository.findOne({
      where: { roundCode, status: 'Pending' }
    });

    if (existingRequest) {
      throw new ConflictException('Đã có yêu cầu mở đợt đề tài với mã này đang chờ phê duyệt');
    }

    // Kiểm tra loại đề tài tồn tại
    const thesisType = await this.thesisTypeRepository.findOne({
      where: { id: thesisTypeId }
    });

    if (!thesisType) {
      throw new NotFoundException('Loại đề tài không tồn tại');
    }

    // Kiểm tra bộ môn tồn tại và có trưởng bộ môn
    const department = await this.departmentRepository.findOne({
      where: { id: departmentId },
      relations: ['head', 'head.user']
    });

    if (!department) {
      throw new NotFoundException('Bộ môn không tồn tại');
    }

    if (!department.head || !department.head.user) {
      throw new BadRequestException('Bộ môn này chưa có trưởng bộ môn');
    }

    // Kiểm tra user tồn tại
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    // Tạo yêu cầu
    const request = this.thesisRoundRequestRepository.create({
      roundCode,
      roundName,
      thesisTypeId,
      departmentId,
      facultyId,
      requestedById: userId,
      status: 'Pending',
      ...otherData,
      // Chuyển đổi string dates thành Date objects
      startDate: requestDto.startDate ? new Date(requestDto.startDate) : undefined,
      endDate: requestDto.endDate ? new Date(requestDto.endDate) : undefined,
      topicProposalDeadline: requestDto.topicProposalDeadline ? new Date(requestDto.topicProposalDeadline) : undefined,
      registrationDeadline: requestDto.registrationDeadline ? new Date(requestDto.registrationDeadline) : undefined,
      reportSubmissionDeadline: requestDto.reportSubmissionDeadline ? new Date(requestDto.reportSubmissionDeadline) : undefined,
    });

    const savedRequest = await this.thesisRoundRequestRepository.save(request);

    // Load relations để trả về đầy đủ thông tin
    const requestWithRelations = await this.thesisRoundRequestRepository.findOne({
      where: { id: savedRequest.id },
      relations: ['thesisType', 'department', 'department.head', 'department.head.user', 'faculty', 'requestedBy']
    });

    if (!requestWithRelations) {
      throw new NotFoundException('Không tìm thấy yêu cầu sau khi tạo');
    }

    // Gửi thông báo real-time đến trưởng bộ môn
    if (department.head.user.id) {
      try {
        await this.socketGateway.sendToUser(
          department.head.user.id.toString(),
          'new_thesis_round_request',
          {
            requestId: savedRequest.id,
            roundCode: savedRequest.roundCode,
            roundName: savedRequest.roundName,
            requestedBy: {
              id: user.id,
              fullName: user.fullName,
              email: user.email
            },
            department: {
              id: department.id,
              departmentName: department.departmentName
            },
            requestedAt: savedRequest.createdAt,
            message: 'Có yêu cầu mở đợt đề tài mới cần bạn phê duyệt'
          }
        );
      } catch (socketError) {
        console.error('Error sending socket notification to head of department:', socketError);
        // Không throw error vì yêu cầu đã được lưu thành công
      }
    }

    return {
      success: true,
      message: 'Yêu cầu mở đợt đề tài đã được gửi thành công đến trưởng bộ môn',
      data: {
        requestId: requestWithRelations.id,
        roundCode: requestWithRelations.roundCode,
        roundName: requestWithRelations.roundName,
        department: requestWithRelations.department ? {
          id: requestWithRelations.department.id,
          departmentCode: requestWithRelations.department.departmentCode || '',
          departmentName: requestWithRelations.department.departmentName || '',
          head: requestWithRelations.department.head ? {
            id: requestWithRelations.department.head.id,
            instructorCode: requestWithRelations.department.head.instructorCode || '',
            fullName: requestWithRelations.department.head.user?.fullName || 'N/A',
            email: requestWithRelations.department.head.user?.email || 'N/A'
          } : null
        } : null,
        thesisType: requestWithRelations.thesisType ? {
          id: requestWithRelations.thesisType.id,
          typeCode: requestWithRelations.thesisType.typeCode || '',
          typeName: requestWithRelations.thesisType.typeName || ''
        } : null,
        status: requestWithRelations.status,
        requestedBy: requestWithRelations.requestedBy ? {
          id: requestWithRelations.requestedBy.id,
          username: requestWithRelations.requestedBy.username || '',
          fullName: requestWithRelations.requestedBy.fullName || '',
          email: requestWithRelations.requestedBy.email || ''
        } : null,
        requestedAt: requestWithRelations.createdAt,
        createdAt: requestWithRelations.createdAt
      }
    };
  }

  // Tạo yêu cầu tự động cho trưởng bộ môn sau khi tạo đợt tiểu luận
  private async createRequestForHeadOfDepartment(thesisRound: ThesisRound, requestedByUserId: number) {
    // Kiểm tra bộ môn có trưởng bộ môn không
    if (!thesisRound.departmentId) {
      return; // Không có departmentId thì không tạo request
    }

    const department = await this.departmentRepository.findOne({
      where: { id: thesisRound.departmentId },
      relations: ['head', 'head.user']
    });

    if (!department) {
      return; // Không tìm thấy department thì không tạo request
    }

    if (!department.head || !department.head.user) {
      // Không có trưởng bộ môn, không tạo request
      return;
    }

    // Kiểm tra xem đã có request với roundCode này chưa (trạng thái Pending)
    const existingRequest = await this.thesisRoundRequestRepository.findOne({
      where: { roundCode: thesisRound.roundCode, status: 'Pending' }
    });

    if (existingRequest) {
      // Đã có request đang chờ phê duyệt, không tạo mới
      return;
    }

    // Tạo yêu cầu
    const request = this.thesisRoundRequestRepository.create({
      roundCode: thesisRound.roundCode,
      roundName: thesisRound.roundName,
      thesisTypeId: thesisRound.thesisTypeId,
      departmentId: thesisRound.departmentId,
      facultyId: thesisRound.facultyId || undefined,
      academicYear: thesisRound.academicYear || undefined,
      semester: thesisRound.semester || undefined,
      startDate: thesisRound.startDate || undefined,
      endDate: thesisRound.endDate || undefined,
      topicProposalDeadline: thesisRound.topicProposalDeadline || undefined,
      registrationDeadline: thesisRound.registrationDeadline || undefined,
      reportSubmissionDeadline: thesisRound.reportSubmissionDeadline || undefined,
      guidanceProcess: thesisRound.guidanceProcess || undefined,
      notes: thesisRound.notes || undefined,
      requestedById: requestedByUserId,
      status: 'Pending',
      requestReason: 'Đợt tiểu luận đã được tạo, cần phê duyệt để mở đợt'
    });

    const savedRequest = await this.thesisRoundRequestRepository.save(request);

    // Gửi thông báo real-time đến trưởng bộ môn
    if (department.head.user.id) {
      try {
        const requestedByUser = await this.userRepository.findOne({
          where: { id: requestedByUserId }
        });

        await this.socketGateway.sendToUser(
          department.head.user.id.toString(),
          'new_thesis_round_request',
          {
            requestId: savedRequest.id,
            roundCode: savedRequest.roundCode,
            roundName: savedRequest.roundName,
            requestedBy: {
              id: requestedByUser?.id || requestedByUserId,
              fullName: requestedByUser?.fullName || 'N/A',
              email: requestedByUser?.email || 'N/A'
            },
            department: {
              id: department.id,
              departmentName: department.departmentName
            },
            requestedAt: savedRequest.createdAt,
            message: 'Có đợt tiểu luận mới được tạo, cần bạn phê duyệt'
          }
        );
      } catch (socketError) {
        console.error('Error sending socket notification to head of department:', socketError);
        // Không throw error vì request đã được lưu thành công
      }
    }
  }

  // ==================== THÔNG TIN TRƯỞNG BỘ MÔN ====================

  // Lấy thông tin cá nhân trưởng bộ môn
  async getHeadProfile(instructorId: number | null, userId: number | null) {
    let instructor: Instructor | null = null;
    let user: Users | null = null;
    let department: Department | null = null;

    // Nếu có instructorId, tìm instructor
    if (instructorId) {
      instructor = await this.instructorRepository.findOne({
        where: { id: instructorId },
        relations: ['user', 'department', 'department.faculty']
      });

      // Tìm department mà instructor này là head
      department = await this.departmentRepository.findOne({
        where: { headId: instructorId },
        relations: ['faculty']
      });
    }

    // Nếu không có instructor hoặc không tìm thấy, thử tìm từ userId
    if (!instructor && userId) {
      instructor = await this.instructorRepository.findOne({
        where: { userId },
        relations: ['user', 'department', 'department.faculty']
      });

      // Nếu có instructor, tìm department mà instructor này là head
      if (instructor) {
        department = await this.departmentRepository.findOne({
          where: { headId: instructor.id },
          relations: ['faculty']
        });
      }
    }

    // Lấy thông tin user
    if (instructor?.user) {
      user = instructor.user;
    } else if (userId) {
      user = await this.userRepository.findOne({
        where: { id: userId }
      });
    }

    // Nếu không có user, trả về thông tin rỗng
    if (!user) {
      return {
        instructorCode: null,
        fullName: null,
        email: null,
        phone: null,
        academicTitle: null,
        degree: null,
        specialization: null,
        yearsOfExperience: 0,
        department: null,
        isFirstTime: true,
        message: 'Chưa có thông tin trưởng bộ môn. Vui lòng điền và lưu thông tin để hoàn thiện hồ sơ.'
      };
    }

    // Sử dụng department từ instructor nếu không tìm thấy department từ headId
    if (!department && instructor?.department) {
      department = await this.departmentRepository.findOne({
        where: { id: instructor.department.id },
        relations: ['faculty']
      });
    }

    // Kiểm tra xem thông tin đã đầy đủ chưa
    // Thông tin đầy đủ khi có: instructorCode, department, fullName, email
    const hasCompleteInfo = instructor && 
      instructor.instructorCode && 
      instructor.departmentId &&
      user.fullName &&
      user.email;

    // Trả về thông tin có gì lấy đấy
    return {
      instructorCode: instructor?.instructorCode || null,
      fullName: user.fullName || null,
      email: user.email || null,
      phone: user.phone || null,
      academicTitle: instructor?.academicTitle || null,
      degree: instructor?.degree || null,
      specialization: instructor?.specialization || null,
      yearsOfExperience: instructor?.yearsOfExperience || 0,
      department: department ? {
        id: department.id,
        departmentCode: department.departmentCode,
        departmentName: department.departmentName,
        faculty: department.faculty ? {
          id: department.faculty.id,
          facultyCode: department.faculty.facultyCode,
          facultyName: department.faculty.facultyName
        } : null
      } : (instructor?.department ? {
        id: instructor.department.id,
        departmentCode: instructor.department.departmentCode,
        departmentName: instructor.department.departmentName,
        faculty: instructor.department.faculty ? {
          id: instructor.department.faculty.id,
          facultyCode: instructor.department.faculty.facultyCode,
          facultyName: instructor.department.faculty.facultyName
        } : null
      } : null),
      isFirstTime: !hasCompleteInfo,
      ...(hasCompleteInfo ? {} : { message: 'Vui lòng điền đầy đủ thông tin để hoàn thiện hồ sơ trưởng bộ môn.' })
    };
  }

  // Cập nhật thông tin cá nhân trưởng bộ môn
  async updateHeadProfile(instructorId: number | null, userId: number | null, updateDto: UpdateHeadProfileDto) {
    // Tìm instructor nếu có instructorId
    let instructor: Instructor | null = null;
    if (instructorId) {
      instructor = await this.instructorRepository.findOne({
        where: { id: instructorId },
        relations: ['user', 'department']
      });
    }

    // Nếu không có instructor, thử tìm từ userId
    if (!instructor && userId) {
      instructor = await this.instructorRepository.findOne({
        where: { userId },
        relations: ['user', 'department']
      });
    }

    // Lấy thông tin user
    let user: Users | null = null;
    if (instructor?.user) {
      user = instructor.user;
    } else if (userId) {
      user = await this.userRepository.findOne({
        where: { id: userId }
      });
    }

    if (!user) {
      throw new NotFoundException('Không tìm thấy thông tin người dùng');
    }

    // Cập nhật thông tin user
    if (updateDto.fullName !== undefined) {
      user.fullName = updateDto.fullName;
    }
    if (updateDto.email !== undefined) {
      user.email = updateDto.email;
    }
    if (updateDto.phone !== undefined) {
      user.phone = updateDto.phone;
    }

    // Lưu thay đổi user
    await this.userRepository.save(user);

    // Cập nhật thông tin instructor nếu có
    if (instructor) {
      // Kiểm tra và cập nhật mã giảng viên nếu có thay đổi
      if (updateDto.instructorCode !== undefined && updateDto.instructorCode !== instructor.instructorCode) {
        // Kiểm tra mã giảng viên đã tồn tại chưa (trừ chính bản thân instructor này)
        const existingInstructor = await this.instructorRepository.findOne({
          where: { instructorCode: updateDto.instructorCode }
        });

        if (existingInstructor && existingInstructor.id !== instructor.id) {
          throw new ConflictException('Mã giảng viên đã tồn tại');
        }

        instructor.instructorCode = updateDto.instructorCode;
      }

      // Cập nhật số năm kinh nghiệm
      if (updateDto.yearsOfExperience !== undefined) {
        instructor.yearsOfExperience = updateDto.yearsOfExperience;
      }

      if (updateDto.academicTitle !== undefined) {
        instructor.academicTitle = updateDto.academicTitle;
      }
      if (updateDto.degree !== undefined) {
        instructor.degree = updateDto.degree;
      }
      if (updateDto.specialization !== undefined) {
        instructor.specialization = updateDto.specialization;
      }

      await this.instructorRepository.save(instructor);
    }

    // Tìm department mà instructor này là head (nếu có)
    let department: Department | null = null;
    if (instructor) {
      department = await this.departmentRepository.findOne({
        where: { headId: instructor.id },
        relations: ['faculty']
      });
    }

    // Sử dụng department từ instructor nếu không tìm thấy từ headId
    if (!department && instructor?.department) {
      department = await this.departmentRepository.findOne({
        where: { id: instructor.department.id },
        relations: ['faculty']
      });
    }

    // Lấy lại thông tin đầy đủ
    if (instructor) {
      const updatedInstructor = await this.instructorRepository.findOne({
        where: { id: instructor.id },
        relations: ['user', 'department', 'department.faculty']
      });

      if (updatedInstructor) {
        const updatedUser = updatedInstructor.user || user;
        const updatedDept = department || updatedInstructor.department;

        return {
          instructorCode: updatedInstructor.instructorCode || null,
          fullName: updatedUser.fullName || null,
          email: updatedUser.email || null,
          phone: updatedUser.phone || null,
          academicTitle: updatedInstructor.academicTitle || null,
          degree: updatedInstructor.degree || null,
          specialization: updatedInstructor.specialization || null,
          yearsOfExperience: updatedInstructor.yearsOfExperience || 0,
          department: updatedDept ? {
            id: updatedDept.id,
            departmentCode: updatedDept.departmentCode,
            departmentName: updatedDept.departmentName,
            faculty: updatedDept.faculty ? {
              id: updatedDept.faculty.id,
              facultyCode: updatedDept.faculty.facultyCode,
              facultyName: updatedDept.faculty.facultyName
            } : null
          } : null,
          isFirstTime: !(updatedInstructor.instructorCode && updatedInstructor.departmentId && updatedUser.fullName && updatedUser.email)
        };
      }
    }

    // Nếu không có instructor, chỉ trả về thông tin user
    const updatedUser = await this.userRepository.findOne({
      where: { id: user.id }
    });

    return {
      instructorCode: null,
      fullName: updatedUser?.fullName || null,
      email: updatedUser?.email || null,
      phone: updatedUser?.phone || null,
      academicTitle: null,
      degree: null,
      specialization: null,
      yearsOfExperience: 0,
      department: department ? {
        id: department.id,
        departmentCode: department.departmentCode,
        departmentName: department.departmentName,
        faculty: department.faculty ? {
          id: department.faculty.id,
          facultyCode: department.faculty.facultyCode,
          facultyName: department.faculty.facultyName
        } : null
      } : null,
      isFirstTime: true
    };
  }

  // ==================== PHÂN CÔNG GIÁO VIÊN PHẢN BIỆN ====================

  // Kiểm tra quyền trưởng bộ môn và kiểm tra thesis thuộc bộ môn của họ
  private async checkHeadDepartmentPermissionForThesis(thesisId: number, headInstructorId: number): Promise<Thesis> {
    // Lấy thông tin thesis
    const thesis = await this.thesisRepository.findOne({
      where: { id: thesisId },
      relations: [
        'thesisRound',
        'thesisRound.department',
        'thesisGroup',
        'thesisGroup.creator',
        'thesisGroup.creator.classEntity',
        'thesisGroup.creator.classEntity.major',
        'thesisGroup.creator.classEntity.major.department',
      ]
    });

    if (!thesis) {
      throw new NotFoundException('Đề tài không tồn tại');
    }

    // Kiểm tra xem có phải trưởng bộ môn không
    const department = await this.departmentRepository.findOne({
      where: { headId: headInstructorId }
    });

    if (!department) {
      throw new ForbiddenException('Bạn không phải trưởng bộ môn');
    }

    // Kiểm tra thesis thuộc bộ môn của trưởng bộ môn
    // Có thể kiểm tra qua thesisRound.departmentId hoặc student.classEntity.major.departmentId
    const thesisDepartmentId =
      thesis.thesisRound?.departmentId ||
      thesis.thesisGroup?.creator?.classEntity?.major?.department?.id;

    if (!thesisDepartmentId || thesisDepartmentId !== department.id) {
      throw new ForbiddenException('Đề tài này không thuộc bộ môn của bạn');
    }

    return thesis;
  }

  // Phân công một giáo viên phản biện cho một đề tài
  async assignReviewerToThesis(headInstructorId: number, assignDto: AssignReviewerDto) {
    const { thesisId, reviewerId, reviewOrder, reviewDeadline } = assignDto;

    // Kiểm tra quyền và lấy thông tin thesis
    const thesis = await this.checkHeadDepartmentPermissionForThesis(thesisId, headInstructorId);

    // Kiểm tra giáo viên phản biện tồn tại
    const reviewer = await this.instructorRepository.findOne({
      where: { id: reviewerId },
      relations: ['user', 'department']
    });

    if (!reviewer) {
      throw new NotFoundException('Giáo viên phản biện không tồn tại');
    }

    // Kiểm tra giáo viên phản biện thuộc cùng bộ môn với đề tài
    const thesisDepartmentId =
      thesis.thesisRound?.departmentId ||
      thesis.thesisGroup?.creator?.classEntity?.major?.department?.id;
    if (thesisDepartmentId && reviewer.departmentId !== thesisDepartmentId) {
      throw new BadRequestException('Giáo viên phản biện không thuộc bộ môn của đề tài này');
    }

    // Kiểm tra giáo viên phản biện không phải là giáo viên hướng dẫn của đề tài này
    if (thesis.supervisorId === reviewerId) {
      throw new BadRequestException('Giáo viên phản biện không thể là giáo viên hướng dẫn của đề tài này');
    }

    // Kiểm tra đã được phân công chưa
    const existingAssignment = await this.reviewAssignmentRepository.findOne({
      where: {
        thesisId,
        reviewerId
      }
    });

    if (existingAssignment) {
      throw new ConflictException('Giáo viên này đã được phân công phản biện cho đề tài này rồi');
    }

    // Xác định reviewOrder nếu không được cung cấp
    let finalReviewOrder = reviewOrder;
    if (!finalReviewOrder) {
      // Lấy số lượng phản biện hiện tại của đề tài
      const currentReviewersCount = await this.reviewAssignmentRepository.count({
        where: { thesisId }
      });
      finalReviewOrder = currentReviewersCount + 1;
    }

    // Tạo phân công phản biện
    const reviewAssignment = this.reviewAssignmentRepository.create({
      thesisId,
      reviewerId,
      reviewOrder: finalReviewOrder,
      reviewDeadline: reviewDeadline ? new Date(reviewDeadline) : undefined,
      status: 'Pending Review',
      assignmentDate: new Date()
    });

    await this.reviewAssignmentRepository.save(reviewAssignment);

    // Lấy thông tin đầy đủ để trả về
    const savedAssignment = await this.reviewAssignmentRepository.findOne({
      where: { id: reviewAssignment.id },
      relations: [
        'reviewer',
        'reviewer.user',
        'thesis',
        'thesis.thesisGroup',
        'thesis.thesisGroup.creator',
        'thesis.thesisGroup.creator.user',
      ]
    });

    if (!savedAssignment) {
      throw new NotFoundException('Không thể lấy thông tin phân công phản biện sau khi tạo');
    }

    return {
      success: true,
      message: 'Phân công giáo viên phản biện thành công',
      data: {
        id: savedAssignment.id,
        thesis: {
          id: savedAssignment.thesis.id,
          thesisCode: savedAssignment.thesis.thesisCode,
          topicTitle: savedAssignment.thesis.topicTitle,
          student: {
            id: savedAssignment.thesis.thesisGroup?.creator?.id || null,
            studentCode: savedAssignment.thesis.thesisGroup?.creator?.studentCode || null,
            fullName: savedAssignment.thesis.thesisGroup?.creator?.user?.fullName || null
          }
        },
        reviewer: {
          id: savedAssignment.reviewer.id,
          instructorCode: savedAssignment.reviewer.instructorCode,
          fullName: savedAssignment.reviewer.user.fullName,
          email: savedAssignment.reviewer.user.email
        },
        reviewOrder: savedAssignment.reviewOrder,
        reviewDeadline: savedAssignment.reviewDeadline,
        status: savedAssignment.status,
        assignmentDate: savedAssignment.assignmentDate
      }
    };
  }

  // Phân công nhiều giáo viên phản biện cho nhiều đề tài
  async assignMultipleReviewersToTheses(headInstructorId: number, assignDto: AssignMultipleReviewersDto) {
    const { assignments } = assignDto;

    if (!assignments || assignments.length === 0) {
      throw new BadRequestException('Danh sách phân công không được để trống');
    }

    const results: any[] = [];
    const errors: Array<{ thesisId: number; reviewerId: number; error: string }> = [];

    for (const assignment of assignments) {
      try {
        const result = await this.assignReviewerToThesis(headInstructorId, assignment);
        results.push(result.data);
      } catch (error) {
        errors.push({
          thesisId: assignment.thesisId,
          reviewerId: assignment.reviewerId,
          error: error instanceof Error ? error.message : 'Lỗi không xác định'
        });
      }
    }

    return {
      success: true,
      message: `Phân công thành công ${results.length} giáo viên phản biện${errors.length > 0 ? `, ${errors.length} phân công thất bại` : ''}`,
      data: {
        successful: results,
        failed: errors.length > 0 ? errors : undefined,
        summary: {
          total: assignments.length,
          successful: results.length,
          failed: errors.length
        }
      }
    };
  }
}
