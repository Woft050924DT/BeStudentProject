import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Instructor } from '../instructor/entities/instructor.entity';
import { Users } from '../user/user.entity';
import { Department } from '../organization/entities/department.entity';
import { ThesisRound } from '../thesis/entities/thesis-round.entity';
import { GetThesisRoundsDto } from '../thesis/dto/thesis-round.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

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
          position: null,
          degree: null,
          department: null,
          joinDate: null,
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
        instructorId: instructor.id,
        code: instructor.instructorCode || null,
        fullName: instructor.user.fullName || null,
        email: instructor.user.email || null,
        phone: instructor.user.phone || null,
        position: instructor.academicTitle || null,
        degree: instructor.degree || null,
        department: instructor.department?.departmentName || instructor.department?.departmentCode || null,
        joinDate: instructor.createdAt ? this.formatDateDDMMYYYY(instructor.createdAt) : null,
      }
    };
  }

  // Helper function để tìm bộ môn theo ID hoặc mã bộ môn
  private async findDepartmentByIdOrCode(departmentIdOrCode: string | number): Promise<Department | null> {
    if (typeof departmentIdOrCode === 'string') {
      departmentIdOrCode = departmentIdOrCode.trim();
    }

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
      if (!departmentIdOrCode) return null;

      const department = await this.departmentRepository.findOne({
        where: { departmentCode: departmentIdOrCode }
      });
      if (department) {
        return department;
      }

      const exactByName = await this.departmentRepository.findOne({
        where: { departmentName: ILike(departmentIdOrCode) },
      });
      if (exactByName) {
        return exactByName;
      }

      const fuzzyMatches = await this.departmentRepository.find({
        where: { departmentName: ILike(`%${departmentIdOrCode}%`) },
        take: 2,
      });
      if (fuzzyMatches.length === 1) {
        return fuzzyMatches[0];
      }
      if (fuzzyMatches.length > 1) {
        throw new BadRequestException('Tên bộ môn không rõ ràng. Vui lòng nhập mã bộ môn hoặc ID.');
      }
    }
    
    return null;
  }

  // Helper function để tính số năm kinh nghiệm từ ngày vào làm
  private calculateYearsOfExperience(joinDate: string): number {
    if (!joinDate) return 0;
    
    try {
      const join = this.parseDateFlexible(joinDate);
      if (!join) return 0;
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - join.getTime());
      const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
      return diffYears;
    } catch {
      return 0;
    }
  }

  private parseDateFlexible(value: string): Date | null {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;

    const iso = new Date(trimmed);
    if (!Number.isNaN(iso.getTime())) return iso;

    const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);
    if (!m) return null;

    const day = Number(m[1]);
    const month = Number(m[2]);
    const year = Number(m[3]);

    const d = new Date(year, month - 1, day);
    if (
      Number.isNaN(d.getTime()) ||
      d.getFullYear() !== year ||
      d.getMonth() !== month - 1 ||
      d.getDate() !== day
    ) {
      return null;
    }
    return d;
  }

  private formatDateDDMMYYYY(date: Date): string {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear().toString();
    return `${d}/${m}/${y}`;
  }

  // Cập nhật thông tin giảng viên
  async updateMyInfo(userId: number, updateDto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy thông tin người dùng');
    }

    let instructor = await this.instructorRepository.findOne({
      where: { userId },
      relations: ['user', 'department'],
    });

    const instructorCode = updateDto.code;
    const academicTitle = updateDto.position;
    const department = await this.findDepartmentByIdOrCode(updateDto.department);
    if (!department) {
      throw new NotFoundException('Bộ môn không tồn tại');
    }
    const departmentId = department.id;
    const yearsOfExperience = this.calculateYearsOfExperience(updateDto.joinDate);

    if (updateDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({ where: { email: updateDto.email } });
      if (existingUser && existingUser.id !== user.id) {
        throw new ConflictException('Email đã được sử dụng');
      }
    }

    if (!instructor) {
      const existingInstructor = await this.instructorRepository.findOne({
        where: { instructorCode },
      });
      if (existingInstructor) {
        throw new ConflictException('Mã giảng viên đã tồn tại');
      }

      const newInstructor = this.instructorRepository.create();
      newInstructor.userId = userId;
      newInstructor.instructorCode = instructorCode;
      newInstructor.departmentId = departmentId;
      newInstructor.degree = updateDto.degree?.trim() || undefined;
      newInstructor.academicTitle = academicTitle;
      newInstructor.specialization = undefined;
      newInstructor.yearsOfExperience = yearsOfExperience || 0;
      newInstructor.status = true;
      instructor = await this.instructorRepository.save(newInstructor);
    } else {
      if (instructorCode && instructorCode !== instructor.instructorCode) {
        const existingInstructor = await this.instructorRepository.findOne({
          where: { instructorCode },
        });
        if (existingInstructor && existingInstructor.id !== instructor.id) {
          throw new ConflictException('Mã giảng viên đã tồn tại');
        }
      }

      const instructorUpdateData: Partial<Instructor> = {};
      if (instructorCode !== undefined) instructorUpdateData.instructorCode = instructorCode;
      if (departmentId !== undefined) instructorUpdateData.departmentId = departmentId;
      if (academicTitle !== undefined) instructorUpdateData.academicTitle = academicTitle;
      if (updateDto.degree !== undefined) instructorUpdateData.degree = updateDto.degree;
      if (yearsOfExperience !== undefined) instructorUpdateData.yearsOfExperience = yearsOfExperience;

      if (Object.keys(instructorUpdateData).length > 0) {
        await this.instructorRepository.update(instructor.id, instructorUpdateData);
      }
    }

    const userUpdateData: Partial<Users> = {};
    userUpdateData.fullName = updateDto.fullName;
    userUpdateData.email = updateDto.email;
    userUpdateData.phone = updateDto.phone;

    if (Object.keys(userUpdateData).length > 0) {
      await this.userRepository.update(userId, userUpdateData);
    }

    const updatedInstructor = await this.instructorRepository.findOne({
      where: { userId },
      relations: ['user', 'department', 'department.faculty'],
    });

    if (!updatedInstructor || !updatedInstructor.user) {
      throw new NotFoundException('Không tìm thấy thông tin giảng viên sau khi cập nhật');
    }

    return {
      success: true,
      message: 'Cập nhật thông tin giảng viên thành công',
      data: {
        instructorId: updatedInstructor.id,
        code: updatedInstructor.instructorCode || null,
        fullName: updatedInstructor.user.fullName || null,
        email: updatedInstructor.user.email || null,
        phone: updatedInstructor.user.phone || null,
        position: updatedInstructor.academicTitle || null,
        degree: updatedInstructor.degree || null,
        department: department.departmentName || department.departmentCode,
        joinDate: updateDto.joinDate,
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
