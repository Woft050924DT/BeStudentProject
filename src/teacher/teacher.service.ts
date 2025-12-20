import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Instructor } from '../instructor/entities/instructor.entity';
import { Users } from '../user/user.entity';
import { Department } from '../organization/entities/department.entity';
import { ThesisRound } from '../thesis/entities/thesis-round.entity';
import { UpdateTeacherInfoDto } from './dto/update-teacher-info.dto';
import { GetThesisRoundsDto } from '../thesis/dto/thesis-round.dto';

@Injectable()
export class TeacherService {
  constructor(
    @InjectRepository(Instructor)
    private readonly instructorRepository: Repository<Instructor>,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(ThesisRound)
    private readonly thesisRoundRepository: Repository<ThesisRound>,
  ) {}

  // Lấy thông tin giảng viên theo userId
  async getMyInfo(userId: number) {
    const instructor = await this.instructorRepository.findOne({
      where: { userId },
      relations: ['user', 'department', 'department.faculty']
    });

    // Nếu chưa có instructor record, trả về thông tin user và thông báo cần tạo instructor
    if (!instructor) {
      const user = await this.userRepository.findOne({
        where: { id: userId }
      });

      if (!user) {
        throw new NotFoundException('Không tìm thấy thông tin người dùng');
      }

      return {
        success: true,
        data: {
          code: null,
          fullName: user.fullName || null,
          email: user.email || null,
          phone: user.phone || null,
          position: null, // Chức vụ
          degree: null, // Học vị
          department: null, // Khoa/Bộ môn
          joinDate: null // Ngày vào làm
        },
        message: 'Chưa có thông tin giảng viên. Vui lòng điền và lưu thông tin để tạo hồ sơ giảng viên.'
      };
    }

    // Đảm bảo user tồn tại
    if (!instructor.user) {
      throw new NotFoundException('Không tìm thấy thông tin người dùng');
    }

    return {
      success: true,
      data: {
        instructorId: instructor.id, // Trả về instructorId để sửa lỗi thiếu InstructorID
        instructorCode: instructor.instructorCode,
        fullName: instructor.user.fullName || null,
        email: instructor.user.email || null,
        phone: instructor.user.phone || null,
        academicTitle: instructor.academicTitle || null, // Chức vụ
        degree: instructor.degree || null, // Học vị
        department: instructor.department ? {
          id: instructor.department.id,
          departmentCode: instructor.department.departmentCode,
          departmentName: instructor.department.departmentName,
          faculty: instructor.department.faculty ? {
            id: instructor.department.faculty.id,
            facultyCode: instructor.department.faculty.facultyCode,
            facultyName: instructor.department.faculty.facultyName
          } : null
        } : null, // Khoa/Bộ môn
        startDate: instructor.createdAt ? instructor.createdAt.toISOString().split('T')[0] : null, // Ngày vào làm (dùng created_at)
        specialization: instructor.specialization || null,
        yearsOfExperience: instructor.yearsOfExperience || 0,
        status: instructor.status,
        user: {
          id: instructor.user.id,
          fullName: instructor.user.fullName,
          email: instructor.user.email,
          phone: instructor.user.phone,
          gender: instructor.user.gender,
          dateOfBirth: instructor.user.dateOfBirth,
          avatar: instructor.user.avatar,
          address: instructor.user.address
        }
      }
    };
  }

  // Helper function để tìm bộ môn theo ID hoặc mã bộ môn
  private async findDepartmentByIdOrCode(departmentIdOrCode: string | number): Promise<Department | null> {
    // Nếu là số, tìm theo ID
    if (typeof departmentIdOrCode === 'number' || (!isNaN(Number(departmentIdOrCode)) && departmentIdOrCode.toString().trim() !== '')) {
      const numericId = typeof departmentIdOrCode === 'number' ? departmentIdOrCode : Number(departmentIdOrCode);
      const department = await this.departmentRepository.findOne({
        where: { id: numericId }
      });
      if (department) {
        return department;
      }
    }
    
    // Nếu không tìm thấy theo ID hoặc là string, tìm theo departmentCode
    if (typeof departmentIdOrCode === 'string') {
      const department = await this.departmentRepository.findOne({
        where: { departmentCode: departmentIdOrCode }
      });
      if (department) {
        return department;
      }
    }
    
    return null;
  }

  // Helper function để tính số năm kinh nghiệm từ ngày vào làm
  private calculateYearsOfExperience(joinDate: string): number {
    if (!joinDate) return 0;
    
    try {
      const join = new Date(joinDate);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - join.getTime());
      const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
      return diffYears;
    } catch {
      return 0;
    }
  }

  // Cập nhật thông tin giảng viên
  async updateMyInfo(userId: number, updateDto: UpdateTeacherInfoDto) {
    // Map các trường từ frontend sang tên đúng trong database
    const instructorCode = updateDto.code;
    const academicTitle = updateDto.position;
    
    // Map department (có thể là ID hoặc departmentCode) sang departmentId
    let departmentId: number | undefined;
    if (updateDto.department) {
      const department = await this.findDepartmentByIdOrCode(updateDto.department);
      if (department) {
        departmentId = department.id;
      } else {
        throw new NotFoundException('Bộ môn không tồn tại');
      }
    }
    
    // Tính yearsOfExperience từ joinDate nếu có
    let yearsOfExperience: number | undefined;
    if (updateDto.joinDate) {
      yearsOfExperience = this.calculateYearsOfExperience(updateDto.joinDate);
    }

    // Tìm giảng viên theo userId
    let instructor = await this.instructorRepository.findOne({
      where: { userId },
      relations: ['user', 'department']
    });

    // Nếu chưa có instructor record, tạo mới
    if (!instructor) {
      // Lấy thông tin user
      const user = await this.userRepository.findOne({
        where: { id: userId }
      });

      if (!user) {
        throw new NotFoundException('Không tìm thấy thông tin người dùng');
      }

      // Kiểm tra các trường bắt buộc để tạo instructor
      if (!instructorCode) {
        throw new BadRequestException('Mã giảng viên là bắt buộc khi tạo mới');
      }

      if (!departmentId) {
        throw new BadRequestException('Bộ môn là bắt buộc khi tạo mới');
      }

      // Kiểm tra mã giảng viên đã tồn tại chưa
      const existingInstructor = await this.instructorRepository.findOne({
        where: { instructorCode }
      });

      if (existingInstructor) {
        throw new ConflictException('Mã giảng viên đã tồn tại');
      }

      // Tạo instructor mới
      const newInstructor = this.instructorRepository.create({
        userId,
        instructorCode,
        departmentId,
        degree: updateDto.degree,
        academicTitle,
        yearsOfExperience: yearsOfExperience || 0,
        status: true
      });

      instructor = await this.instructorRepository.save(newInstructor);

      // Load lại với relations
      instructor = await this.instructorRepository.findOne({
        where: { id: instructor.id },
        relations: ['user', 'department', 'department.faculty']
      });

      if (!instructor) {
        throw new NotFoundException('Lỗi khi tạo thông tin giảng viên');
      }

      // Cập nhật thông tin User ngay khi tạo instructor mới
      const userUpdateData: Partial<Users> = {};
      if (updateDto.fullName !== undefined) userUpdateData.fullName = updateDto.fullName;
      if (updateDto.email !== undefined) userUpdateData.email = updateDto.email;
      if (updateDto.phone !== undefined) userUpdateData.phone = updateDto.phone;

      if (Object.keys(userUpdateData).length > 0) {
        await this.userRepository.update(userId, userUpdateData);
      }

      // Lấy lại thông tin đã cập nhật
      const updatedInstructor = await this.instructorRepository.findOne({
        where: { id: instructor.id },
        relations: ['user', 'department', 'department.faculty']
      });

      if (!updatedInstructor) {
        throw new NotFoundException('Không tìm thấy thông tin giảng viên sau khi tạo');
      }

      if (!updatedInstructor.user) {
        throw new NotFoundException('Không tìm thấy thông tin người dùng');
      }

      return {
        success: true,
        message: 'Tạo và cập nhật thông tin giảng viên thành công',
        data: {
          code: updatedInstructor.instructorCode,
          fullName: updatedInstructor.user.fullName || null,
          email: updatedInstructor.user.email || null,
          phone: updatedInstructor.user.phone || null,
          position: updatedInstructor.academicTitle || null,
          degree: updatedInstructor.degree || null,
          department: updatedInstructor.department ? updatedInstructor.department.departmentCode : null,
          joinDate: updatedInstructor.createdAt ? updatedInstructor.createdAt.toISOString().split('T')[0] : null
        }
      };
    }

    // Kiểm tra mã giảng viên nếu có thay đổi
    if (instructorCode && instructorCode !== instructor.instructorCode) {
      const existingInstructor = await this.instructorRepository.findOne({
        where: { instructorCode }
      });

      if (existingInstructor && existingInstructor.id !== instructor.id) {
        throw new ConflictException('Mã giảng viên đã tồn tại');
      }
    }

    // Kiểm tra email nếu có thay đổi
    if (updateDto.email && updateDto.email !== instructor.user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateDto.email }
      });

      if (existingUser && existingUser.id !== instructor.userId) {
        throw new ConflictException('Email đã được sử dụng');
      }
    }

    // Kiểm tra bộ môn nếu có thay đổi
    if (departmentId !== undefined && departmentId !== instructor.departmentId) {
      const department = await this.departmentRepository.findOne({
        where: { id: departmentId }
      });

      if (!department) {
        throw new NotFoundException('Bộ môn không tồn tại');
      }
    }

    // Cập nhật thông tin User
    const userUpdateData: Partial<Users> = {};
    if (updateDto.fullName !== undefined) userUpdateData.fullName = updateDto.fullName;
    if (updateDto.email !== undefined) userUpdateData.email = updateDto.email;
    if (updateDto.phone !== undefined) userUpdateData.phone = updateDto.phone;

    if (Object.keys(userUpdateData).length > 0) {
      await this.userRepository.update(instructor.userId, userUpdateData);
    }

    // Cập nhật thông tin Instructor
    const instructorUpdateData: Partial<Instructor> = {};
    if (instructorCode !== undefined) instructorUpdateData.instructorCode = instructorCode;
    if (departmentId !== undefined) instructorUpdateData.departmentId = departmentId;
    if (updateDto.degree !== undefined) instructorUpdateData.degree = updateDto.degree;
    if (academicTitle !== undefined) instructorUpdateData.academicTitle = academicTitle;
    if (yearsOfExperience !== undefined) instructorUpdateData.yearsOfExperience = yearsOfExperience;

    if (Object.keys(instructorUpdateData).length > 0) {
      await this.instructorRepository.update(instructor.id, instructorUpdateData);
    }

    // Lấy lại thông tin đã cập nhật
    const updatedInstructor = await this.instructorRepository.findOne({
      where: { id: instructor.id },
      relations: ['user', 'department', 'department.faculty']
    });

    if (!updatedInstructor) {
      throw new NotFoundException('Không tìm thấy thông tin giảng viên sau khi cập nhật');
    }

    if (!updatedInstructor.user) {
      throw new NotFoundException('Không tìm thấy thông tin người dùng');
    }

    return {
      success: true,
      message: 'Cập nhật thông tin giảng viên thành công',
      data: {
        instructorId: updatedInstructor.id, // Trả về instructorId
        instructorCode: updatedInstructor.instructorCode,
        fullName: updatedInstructor.user.fullName || null,
        email: updatedInstructor.user.email || null,
        phone: updatedInstructor.user.phone || null,
        academicTitle: updatedInstructor.academicTitle || null,
        degree: updatedInstructor.degree || null,
        department: updatedInstructor.department ? {
          id: updatedInstructor.department.id,
          departmentCode: updatedInstructor.department.departmentCode,
          departmentName: updatedInstructor.department.departmentName,
          faculty: updatedInstructor.department.faculty ? {
            id: updatedInstructor.department.faculty.id,
            facultyCode: updatedInstructor.department.faculty.facultyCode,
            facultyName: updatedInstructor.department.faculty.facultyName
          } : null
        } : null,
        startDate: updatedInstructor.createdAt ? updatedInstructor.createdAt.toISOString().split('T')[0] : null,
        specialization: updatedInstructor.specialization || null,
        yearsOfExperience: updatedInstructor.yearsOfExperience || 0,
        status: updatedInstructor.status,
        user: {
          id: updatedInstructor.user.id,
          fullName: updatedInstructor.user.fullName,
          email: updatedInstructor.user.email,
          phone: updatedInstructor.user.phone,
          gender: updatedInstructor.user.gender,
          dateOfBirth: updatedInstructor.user.dateOfBirth,
          avatar: updatedInstructor.user.avatar,
          address: updatedInstructor.user.address
        }
      }
    };
  }

  // Lấy danh sách đợt tiểu luận cho giáo viên
  async getThesisRounds(userId: number, query: GetThesisRoundsDto) {
    // Lấy thông tin instructor để biết department của giáo viên
    const instructor = await this.instructorRepository.findOne({
      where: { userId },
      relations: ['department']
    });

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

    // Tự động filter theo department của giáo viên nếu có
    if (instructor && instructor.departmentId) {
      queryBuilder.andWhere('thesisRound.departmentId = :teacherDepartmentId', { 
        teacherDepartmentId: instructor.departmentId 
      });
    }

    // Áp dụng filters từ query
    if (thesisTypeId) {
      queryBuilder.andWhere('thesisRound.thesisTypeId = :thesisTypeId', { thesisTypeId });
    }

    // Nếu có departmentId trong query, vẫn áp dụng (có thể là filter bổ sung)
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

    // Sắp xếp
    const validSortFields: string[] = ['createdAt', 'roundName', 'startDate', 'endDate', 'id'];
    let sortField = 'createdAt';
    if (sortBy && typeof sortBy === 'string' && validSortFields.includes(sortBy)) {
      sortField = sortBy;
    }
    
    let finalSortOrder: 'ASC' | 'DESC' = 'DESC';
    if (sortOrder && sortOrder === 'ASC') {
      finalSortOrder = 'ASC';
    }
    
    queryBuilder.orderBy(`thesisRound.${sortField}`, finalSortOrder);
    
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
      data: thesisRounds.map(round => ({
        id: round.id,
        roundCode: round.roundCode,
        roundName: round.roundName,
        thesisType: round.thesisType ? {
          id: round.thesisType.id,
          typeCode: round.thesisType.typeCode,
          typeName: round.thesisType.typeName
        } : null,
        department: round.department ? {
          id: round.department.id,
          departmentCode: round.department.departmentCode,
          departmentName: round.department.departmentName
        } : null,
        faculty: round.faculty ? {
          id: round.faculty.id,
          facultyCode: round.faculty.facultyCode,
          facultyName: round.faculty.facultyName
        } : null,
        academicYear: round.academicYear,
        semester: round.semester,
        startDate: round.startDate,
        endDate: round.endDate,
        topicProposalDeadline: round.topicProposalDeadline,
        registrationDeadline: round.registrationDeadline,
        reportSubmissionDeadline: round.reportSubmissionDeadline,
        status: round.status,
        createdAt: round.createdAt,
        updatedAt: round.updatedAt
      })),
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

  // Lấy bộ môn của giáo viên
  async getMyDepartment(userId: number) {
    const instructor = await this.instructorRepository.findOne({
      where: { userId },
      relations: ['department', 'department.faculty']
    });

    if (!instructor) {
      throw new NotFoundException('Không tìm thấy thông tin giảng viên');
    }

    if (!instructor.department) {
      return {
        success: true,
        data: null,
        message: 'Bạn chưa được gán vào bộ môn nào. Vui lòng liên hệ quản trị viên.'
      };
    }

    const department = await this.departmentRepository.findOne({
      where: { id: instructor.departmentId },
      relations: ['faculty', 'head', 'head.user']
    });

    if (!department) {
      throw new NotFoundException('Không tìm thấy thông tin bộ môn');
    }

    return {
      success: true,
      data: {
        id: department.id,
        departmentCode: department.departmentCode,
        departmentName: department.departmentName,
        description: department.description,
        status: department.status,
        faculty: department.faculty ? {
          id: department.faculty.id,
          facultyCode: department.faculty.facultyCode,
          facultyName: department.faculty.facultyName
        } : null,
        head: department.head ? {
          id: department.head.id,
          instructorCode: department.head.instructorCode,
          fullName: department.head.user?.fullName || null,
          email: department.head.user?.email || null
        } : null,
        createdAt: department.createdAt,
        updatedAt: department.updatedAt
      }
    };
  }
}
