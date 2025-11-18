import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Instructor } from './entities/instructor.entity';
import { Users } from '../user/user.entity';
import { Department } from '../organization/entities/department.entity';
import { CreateInstructorDto } from '../admin/dto/create-instructor.dto';
import { UpdateInstructorDto } from '../admin/dto/update-instructor.dto';
import { GetInstructorsDto } from '../admin/dto/get-instructors.dto';
import { Thesis } from '../thesis/entities/thesis.entity';
import { GetInstructorsWithSupervisionCountDto } from './dto/get-instructors-with-supervision-count.dto';
import { InstructorWithSupervisionCountDto } from './dto/instructor-with-supervision-count.dto';
import { Faculty } from '../organization/entities/faculty.entity';

@Injectable()
export class InstructorService {
  constructor(
    @InjectRepository(Instructor)
    private readonly instructorRepository: Repository<Instructor>,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(Thesis)
    private readonly thesisRepository: Repository<Thesis>,
    @InjectRepository(Faculty)
    private readonly facultyRepository: Repository<Faculty>,
  ) {}

  async createInstructor(createInstructorDto: CreateInstructorDto): Promise<Instructor> {
    const { userId, instructorCode, departmentId } = createInstructorDto;
    
    // Check if instructor code already exists
    const existingInstructor = await this.instructorRepository.findOne({
      where: { instructorCode }
    });
    
    if (existingInstructor) {
      throw new ConflictException('Mã giảng viên đã tồn tại');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId }
    });
    
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    // Check if department exists
    const department = await this.departmentRepository.findOne({
      where: { id: departmentId }
    });
    
    if (!department) {
      throw new NotFoundException('Không tìm thấy bộ môn');
    }

    // Check if user already has instructor record
    const existingUserInstructor = await this.instructorRepository.findOne({
      where: { userId }
    });
    
    if (existingUserInstructor) {
      throw new ConflictException('Người dùng đã có thông tin giảng viên');
    }

    const instructor = this.instructorRepository.create(createInstructorDto);
    return this.instructorRepository.save(instructor);
  }

  async getAllInstructors(): Promise<Instructor[]> {
    return this.instructorRepository.find({
      relations: ['user', 'department'],
      order: { instructorCode: 'ASC' }
    });
  }

  async getInstructorById(id: number): Promise<Instructor> {
    const instructor = await this.instructorRepository.findOne({
      where: { id },
      relations: ['user', 'department']
    });
    
    if (!instructor) {
      throw new NotFoundException('Không tìm thấy giảng viên');
    }
    
    return instructor;
  }

  async getInstructorsByDepartment(departmentId: number): Promise<Instructor[]> {
    return this.instructorRepository.find({
      where: { departmentId },
      relations: ['user', 'department'],
      order: { instructorCode: 'ASC' }
    });
  }

  async getInstructorByUserId(userId: number): Promise<Instructor> {
    const instructor = await this.instructorRepository.findOne({
      where: { userId },
      relations: ['user', 'department']
    });
    
    if (!instructor) {
      throw new NotFoundException('Không tìm thấy thông tin giảng viên');
    }
    
    return instructor;
  }

  async getInstructorsWithSupervisionCount(
    query: GetInstructorsWithSupervisionCountDto
  ): Promise<{
    data: InstructorWithSupervisionCountDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10, departmentId } = query;
    const skip = (page - 1) * limit;

    // Tạo query builder cho instructors
    let queryBuilder = this.instructorRepository
      .createQueryBuilder('i')
      .innerJoin('i.user', 'u')
      .leftJoin('i.supervisedTheses', 'thesis')
      .select('i.id', 'instructor_id')
      .addSelect('i.instructorCode', 'instructor_code')
      .addSelect('u.fullName', 'instructor_name')
      .addSelect('i.degree', 'i_degree')
      .addSelect('i.academicTitle', 'academic_title')
      .addSelect('i.specialization', 'i_specialization')
      .addSelect('i.yearsOfExperience', 'years_of_experience')
      .addSelect('COUNT(thesis.id)', 'supervision_count')
      .groupBy('i.id')
      .addGroupBy('u.id')
      .orderBy('i.instructorCode', 'ASC');

    // Lọc theo department nếu có
    if (departmentId) {
      queryBuilder = queryBuilder.where('i.departmentId = :departmentId', { departmentId });
    }

    // Đếm tổng số records
    const totalQuery = this.instructorRepository
      .createQueryBuilder('instructor')
      .leftJoin('instructor.supervisedTheses', 'thesis');
    
    if (departmentId) {
      totalQuery.where('instructor.departmentId = :departmentId', { departmentId });
    }

    const total = await totalQuery.getCount();

    // Lấy dữ liệu với phân trang
    const rawResults = await queryBuilder
      .skip(skip)
      .take(limit)
      .getRawMany();

    // Chuyển đổi dữ liệu thành DTO
    const data: InstructorWithSupervisionCountDto[] = rawResults.map((instructor: any) => {
      // @ts-ignore: TypeORM getRawMany() returns any[], safe to access properties
      return {
        id: instructor.instructor_id,
        instructorCode: instructor.instructor_code,
        instructorName: instructor.instructor_name,
        supervisionCount: parseInt(instructor.supervision_count) || 0,
        degree: instructor.i_degree,
        academicTitle: instructor.academic_title,
        specialization: instructor.i_specialization,
        yearsOfExperience: instructor.years_of_experience
      };
    });

    return {
      data,
      total,
      page,
      limit
    };
  }

  async updateInstructor(id: number, updateInstructorDto: UpdateInstructorDto): Promise<Instructor> {
    const instructor = await this.instructorRepository.findOne({
      where: { id }
    });

    if (!instructor) {
      throw new NotFoundException('Không tìm thấy giảng viên');
    }

    // Kiểm tra department nếu có thay đổi
    if (updateInstructorDto.departmentId) {
      const department = await this.departmentRepository.findOne({
        where: { id: updateInstructorDto.departmentId }
      });

      if (!department) {
        throw new NotFoundException('Không tìm thấy bộ môn');
      }
    }

    // Cập nhật thông tin
    Object.assign(instructor, updateInstructorDto);
    return this.instructorRepository.save(instructor);
  }

  async deleteInstructor(id: number): Promise<void> {
    const instructor = await this.instructorRepository.findOne({
      where: { id },
      relations: ['supervisedTheses', 'facultiesAsDean', 'departmentsAsHead', 'classesAsAdvisor']
    });

    if (!instructor) {
      throw new NotFoundException('Không tìm thấy giảng viên');
    }

    // Kiểm tra ràng buộc trước khi xóa
    if (instructor.supervisedTheses && instructor.supervisedTheses.length > 0) {
      throw new BadRequestException('Không thể xóa giảng viên đang có đề tài hướng dẫn');
    }

    if (instructor.facultiesAsDean && instructor.facultiesAsDean.length > 0) {
      throw new BadRequestException('Không thể xóa giảng viên đang là trưởng khoa');
    }

    if (instructor.departmentsAsHead && instructor.departmentsAsHead.length > 0) {
      throw new BadRequestException('Không thể xóa giảng viên đang là trưởng bộ môn');
    }

    if (instructor.classesAsAdvisor && instructor.classesAsAdvisor.length > 0) {
      throw new BadRequestException('Không thể xóa giảng viên đang là cố vấn học tập');
    }

    await this.instructorRepository.remove(instructor);
  }

  async getInstructorsWithFilters(query: GetInstructorsDto): Promise<{
    data: Instructor[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      departmentId,
      facultyId,
      search,
      degree,
      academicTitle,
      status,
      sortBy = 'instructorCode',
      sortOrder = 'ASC'
    } = query;

    const skip = (page - 1) * limit;

    // Tạo query builder
    const queryBuilder = this.instructorRepository
      .createQueryBuilder('instructor')
      .leftJoinAndSelect('instructor.user', 'user')
      .leftJoinAndSelect('instructor.department', 'department')
      .leftJoinAndSelect('department.faculty', 'faculty');

    // Lọc theo bộ môn
    if (departmentId) {
      queryBuilder.andWhere('instructor.departmentId = :departmentId', { departmentId });
    }

    // Lọc theo khoa
    if (facultyId) {
      queryBuilder.andWhere('faculty.id = :facultyId', { facultyId });
    }

    // Tìm kiếm
    if (search) {
      queryBuilder.andWhere(
        '(instructor.instructorCode ILIKE :search OR user.fullName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Lọc theo học vị
    if (degree) {
      queryBuilder.andWhere('instructor.degree = :degree', { degree });
    }

    // Lọc theo chức danh
    if (academicTitle) {
      queryBuilder.andWhere('instructor.academicTitle = :academicTitle', { academicTitle });
    }

    // Lọc theo trạng thái
    if (status !== undefined) {
      queryBuilder.andWhere('instructor.status = :status', { status });
    }

    // Sắp xếp
    const validSortFields = ['instructorCode', 'fullName', 'createdAt', 'yearsOfExperience'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'instructorCode';
    const validSortOrder = sortOrder === 'ASC' || sortOrder === 'DESC' ? sortOrder : 'ASC';

    if (sortField === 'fullName') {
      queryBuilder.orderBy('user.fullName', validSortOrder);
    } else if (sortField === 'createdAt') {
      queryBuilder.orderBy('instructor.createdAt', validSortOrder);
    } else if (sortField === 'yearsOfExperience') {
      queryBuilder.orderBy('instructor.yearsOfExperience', validSortOrder);
    } else {
      queryBuilder.orderBy('instructor.instructorCode', validSortOrder);
    }

    // Đếm tổng số records
    const total = await queryBuilder.getCount();

    // Lấy dữ liệu với phân trang
    const data = await queryBuilder
      .skip(skip)
      .take(limit)
      .getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages
    };
  }
}
