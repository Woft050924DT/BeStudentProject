import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { Users } from '../user/user.entity';
import { Class } from '../organization/entities/class.entity';
import { UpdateStudentInfoDto } from './dto/update-student-info.dto';
import { CreateStudentDto } from '../admin/dto/create-student.dto';
import { UpdateStudentDto } from '../admin/dto/update-student.dto';
import { GetStudentsDto } from '../admin/dto/get-students.dto';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
  ) {}

  private toProfileResponse(student: Student | null, user: Users, classEntity: Class | null) {
    const hasCompleteInfo = !!(
      student?.studentCode &&
      student?.classId &&
      user.fullName &&
      user.email
    );

    return {
      userId: user.id,
      studentId: student?.id || null,
      username: user.username || null,
      studentCode: student?.studentCode || null,
      fullName: user.fullName || null,
      email: user.email || null,
      phone: user.phone || null,
      gender: user.gender || null,
      dateOfBirth: user.dateOfBirth || null,
      address: user.address || null,
      avatar: user.avatar || null,
      academicStatus: student?.academicStatus || null,
      status: student?.status ?? null,
      cvFile: student?.cvFile || null,
      admissionYear: student?.admissionYear ?? null,
      gpa: student?.gpa ?? null,
      creditsEarned: student?.creditsEarned ?? 0,
      class: classEntity
        ? {
            id: classEntity.id,
            classCode: classEntity.classCode,
            className: classEntity.className,
            major: (classEntity as any).major
              ? {
                  id: (classEntity as any).major.id,
                  majorCode: (classEntity as any).major.majorCode,
                  majorName: (classEntity as any).major.majorName,
                  department: (classEntity as any).major.department
                    ? {
                        id: (classEntity as any).major.department.id,
                        departmentCode: (classEntity as any).major.department.departmentCode,
                        departmentName: (classEntity as any).major.department.departmentName,
                        faculty: (classEntity as any).major.department.faculty
                          ? {
                              id: (classEntity as any).major.department.faculty.id,
                              facultyCode: (classEntity as any).major.department.faculty.facultyCode,
                              facultyName: (classEntity as any).major.department.faculty.facultyName,
                            }
                          : null,
                      }
                    : null,
                }
              : null,
          }
        : null,
      isFirstTime: !hasCompleteInfo,
      ...(hasCompleteInfo ? {} : { message: 'Vui lòng điền đầy đủ thông tin để hoàn thiện hồ sơ sinh viên.' }),
    };
  }

  // Helper function để tìm lớp theo ID hoặc mã lớp
  private async findClassByIdOrCode(classId: string | number): Promise<Class | null> {
    // Nếu là số, tìm theo ID
    if (typeof classId === 'number' || (!isNaN(Number(classId)) && classId.toString().trim() !== '')) {
      const numericId = typeof classId === 'number' ? classId : Number(classId);
      const classEntity = await this.classRepository.findOne({
        where: { id: numericId }
      });
      if (classEntity) {
        return classEntity;
      }
    }
    
    // Nếu không tìm thấy theo ID hoặc là string, tìm theo classCode
    if (typeof classId === 'string') {
      const classEntity = await this.classRepository.findOne({
        where: { classCode: classId }
      });
      if (classEntity) {
        return classEntity;
      }
    }
    
    return null;
  }

  async getStudentByUserId(userId: number): Promise<Student | null> {
    const student = await this.studentRepository.findOne({
      where: { userId },
      relations: ['user', 'classEntity']
    });
    
    return student;
  }

  async getStudentById(id: number): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: ['user', 'classEntity']
    });
    
    if (!student) {
      throw new NotFoundException('Không tìm thấy sinh viên');
    }
    
    return student;
  }

  // Lấy thông tin sinh viên theo userId
  async getMyInfo(userId: number) {
    const student = await this.studentRepository.findOne({
      where: { userId },
      relations: ['user', 'classEntity', 'classEntity.major', 'classEntity.major.department', 'classEntity.major.department.faculty']
    });

    // Nếu chưa có student record, trả về thông tin user và thông báo cần tạo student
    if (!student) {
      const user = await this.userRepository.findOne({
        where: { id: userId }
      });

      if (!user) {
        throw new NotFoundException('Không tìm thấy thông tin người dùng');
      }

      return this.toProfileResponse(null, user, null);
    }

    return this.toProfileResponse(student, student.user, student.classEntity ?? null);
  }

  // Cập nhật thông tin sinh viên
  async updateMyInfo(userId: number, updateDto: UpdateStudentInfoDto) {
    // Tìm sinh viên theo userId
    let student = await this.studentRepository.findOne({
      where: { userId },
      relations: ['user', 'classEntity']
    });

    // Nếu chưa có student record, tạo mới
    if (!student) {
      // Lấy thông tin user
      const user = await this.userRepository.findOne({
        where: { id: userId }
      });

      if (!user) {
        throw new NotFoundException('Không tìm thấy thông tin người dùng');
      }

      // Kiểm tra các trường bắt buộc để tạo student
      if (!updateDto.studentCode) {
        throw new BadRequestException('Mã sinh viên là bắt buộc khi tạo mới');
      }

      if (!updateDto.classId) {
        throw new BadRequestException('Mã lớp là bắt buộc khi tạo mới');
      }

      // Kiểm tra mã sinh viên đã tồn tại chưa
      const existingStudent = await this.studentRepository.findOne({
        where: { studentCode: updateDto.studentCode }
      });

      if (existingStudent) {
        throw new ConflictException('Mã sinh viên đã tồn tại');
      }

      // Kiểm tra lớp tồn tại (theo ID hoặc mã lớp)
      const classEntity = await this.findClassByIdOrCode(updateDto.classId);

      if (!classEntity) {
        throw new NotFoundException('Lớp không tồn tại');
      }

      // Tạo student mới
      const newStudent = this.studentRepository.create({
        userId,
        studentCode: updateDto.studentCode,
        classId: classEntity.id,
        academicStatus: updateDto.academicStatus || 'Active',
        cvFile: updateDto.cvFile,
        status: true
      });

      student = await this.studentRepository.save(newStudent);

      // Load lại với relations
      student = await this.studentRepository.findOne({
        where: { id: student.id },
        relations: ['user', 'classEntity']
      });

      if (!student) {
        throw new NotFoundException('Lỗi khi tạo thông tin sinh viên');
      }

      // Cập nhật thông tin User ngay khi tạo student mới
      const userUpdateData: Partial<Users> = {};
      if (updateDto.fullName !== undefined) userUpdateData.fullName = updateDto.fullName;
      if (updateDto.email !== undefined) userUpdateData.email = updateDto.email;
      if (updateDto.phone !== undefined) userUpdateData.phone = updateDto.phone;
      if (updateDto.gender !== undefined) userUpdateData.gender = updateDto.gender;
      if (updateDto.dateOfBirth !== undefined) {
        userUpdateData.dateOfBirth = new Date(updateDto.dateOfBirth);
      }
      if (updateDto.address !== undefined) userUpdateData.address = updateDto.address;
      if (updateDto.avatar !== undefined) userUpdateData.avatar = updateDto.avatar;

      if (Object.keys(userUpdateData).length > 0) {
        await this.userRepository.update(userId, userUpdateData);
      }

      // Lấy lại thông tin đã cập nhật
      const updatedStudent = await this.studentRepository.findOne({
        where: { id: student.id },
        relations: ['user', 'classEntity', 'classEntity.major', 'classEntity.major.department', 'classEntity.major.department.faculty']
      });

      if (!updatedStudent) {
        throw new NotFoundException('Không tìm thấy thông tin sinh viên sau khi tạo');
      }

      if (!updatedStudent.user) {
        throw new NotFoundException('Không tìm thấy thông tin người dùng');
      }

      return this.toProfileResponse(updatedStudent, updatedStudent.user, updatedStudent.classEntity ?? null);
    }

    // Kiểm tra mã sinh viên nếu có thay đổi
    if (updateDto.studentCode && updateDto.studentCode !== student.studentCode) {
      const existingStudent = await this.studentRepository.findOne({
        where: { studentCode: updateDto.studentCode }
      });

      if (existingStudent && existingStudent.id !== student.id) {
        throw new ConflictException('Mã sinh viên đã tồn tại');
      }
    }

    // Kiểm tra email nếu có thay đổi
    if (updateDto.email && updateDto.email !== student.user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateDto.email }
      });

      if (existingUser && existingUser.id !== student.userId) {
        throw new ConflictException('Email đã được sử dụng');
      }
    }

    // Kiểm tra lớp nếu có thay đổi (theo ID hoặc mã lớp)
    let resolvedClassId: number | undefined;
    if (updateDto.classId !== undefined) {
      const classEntity = await this.findClassByIdOrCode(updateDto.classId);
      
      if (!classEntity) {
        throw new NotFoundException('Lớp không tồn tại');
      }
      
      resolvedClassId = classEntity.id;
      
      // Chỉ cập nhật nếu classId thay đổi
      if (resolvedClassId === student.classId) {
        resolvedClassId = undefined; // Không cần cập nhật
      }
    }

    // Cập nhật thông tin User
    const userUpdateData: Partial<Users> = {};
    if (updateDto.fullName !== undefined) userUpdateData.fullName = updateDto.fullName;
    if (updateDto.email !== undefined) userUpdateData.email = updateDto.email;
    if (updateDto.phone !== undefined) userUpdateData.phone = updateDto.phone;
    if (updateDto.gender !== undefined) userUpdateData.gender = updateDto.gender;
    if (updateDto.dateOfBirth !== undefined) {
      userUpdateData.dateOfBirth = new Date(updateDto.dateOfBirth);
    }
    if (updateDto.address !== undefined) userUpdateData.address = updateDto.address;
    if (updateDto.avatar !== undefined) userUpdateData.avatar = updateDto.avatar;

    if (Object.keys(userUpdateData).length > 0) {
      await this.userRepository.update(student.userId, userUpdateData);
    }

    // Cập nhật thông tin Student
    const studentUpdateData: Partial<Student> = {};
    if (updateDto.studentCode !== undefined) studentUpdateData.studentCode = updateDto.studentCode;
    if (updateDto.academicStatus !== undefined) studentUpdateData.academicStatus = updateDto.academicStatus;
    if (resolvedClassId !== undefined) studentUpdateData.classId = resolvedClassId;
    if (updateDto.cvFile !== undefined) studentUpdateData.cvFile = updateDto.cvFile;

    if (Object.keys(studentUpdateData).length > 0) {
      await this.studentRepository.update(student.id, studentUpdateData);
    }

    // Lấy lại thông tin đã cập nhật
    const updatedStudent = await this.studentRepository.findOne({
      where: { id: student.id },
      relations: ['user', 'classEntity', 'classEntity.major', 'classEntity.major.department', 'classEntity.major.department.faculty']
    });

    if (!updatedStudent) {
      throw new NotFoundException('Không tìm thấy thông tin sinh viên sau khi cập nhật');
    }

    if (!updatedStudent.user) {
      throw new NotFoundException('Không tìm thấy thông tin người dùng');
    }

    return this.toProfileResponse(updatedStudent, updatedStudent.user, updatedStudent.classEntity ?? null);
  }

  // ================================
  // METHODS CHO GIÁO VỤ (ACADEMIC STAFF)
  // ================================

  // Tạo thông tin sinh viên (cho giáo vụ)
  async createStudent(createStudentDto: CreateStudentDto): Promise<Student> {
    const { userId, studentCode, classId } = createStudentDto;

    // Kiểm tra user tồn tại
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    // Kiểm tra mã sinh viên đã tồn tại
    const existingStudent = await this.studentRepository.findOne({
      where: { studentCode }
    });

    if (existingStudent) {
      throw new ConflictException('Mã sinh viên đã tồn tại');
    }

    // Kiểm tra user đã có thông tin sinh viên chưa
    const existingStudentByUser = await this.studentRepository.findOne({
      where: { userId }
    });

    if (existingStudentByUser) {
      throw new ConflictException('Người dùng đã có thông tin sinh viên');
    }

    // Kiểm tra lớp tồn tại
    const classEntity = await this.classRepository.findOne({
      where: { id: classId }
    });

    if (!classEntity) {
      throw new NotFoundException('Không tìm thấy lớp học');
    }

    const student = this.studentRepository.create({
      userId,
      studentCode,
      classId,
      admissionYear: createStudentDto.admissionYear,
      cvFile: createStudentDto.cvFile,
      academicStatus: 'Active',
      status: true,
    });

    return this.studentRepository.save(student);
  }

  // Lấy tất cả sinh viên
  async getAllStudents(): Promise<Student[]> {
    return this.studentRepository.find({
      relations: ['user', 'classEntity', 'classEntity.major', 'classEntity.major.department', 'classEntity.major.department.faculty'],
      order: { studentCode: 'ASC' }
    });
  }

  // Lấy sinh viên với filters, search, pagination
  async getStudentsWithFilters(query: GetStudentsDto) {
    const {
      page = 1,
      limit = 10,
      classId,
      majorId,
      departmentId,
      facultyId,
      search,
      academicStatus,
      admissionYear,
      status,
      sortBy = 'studentCode',
      sortOrder = 'ASC'
    } = query;

    const queryBuilder = this.studentRepository.createQueryBuilder('student')
      .leftJoinAndSelect('student.user', 'user')
      .leftJoinAndSelect('student.classEntity', 'class')
      .leftJoinAndSelect('class.major', 'major')
      .leftJoinAndSelect('major.department', 'department')
      .leftJoinAndSelect('department.faculty', 'faculty');

    // Filters
    if (classId) {
      queryBuilder.andWhere('student.classId = :classId', { classId });
    }

    if (majorId) {
      queryBuilder.andWhere('class.majorId = :majorId', { majorId });
    }

    if (departmentId) {
      queryBuilder.andWhere('major.departmentId = :departmentId', { departmentId });
    }

    if (facultyId) {
      queryBuilder.andWhere('department.facultyId = :facultyId', { facultyId });
    }

    if (academicStatus) {
      queryBuilder.andWhere('student.academicStatus = :academicStatus', { academicStatus });
    }

    if (admissionYear) {
      queryBuilder.andWhere('student.admissionYear = :admissionYear', { admissionYear });
    }

    if (status !== undefined) {
      queryBuilder.andWhere('student.status = :status', { status });
    }

    // Search
    if (search) {
      queryBuilder.andWhere(
        '(student.studentCode ILIKE :search OR user.fullName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Sorting
    const validSortFields = ['studentCode', 'fullName', 'createdAt', 'gpa', 'admissionYear'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'studentCode';
    const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    
    if (sortField === 'fullName') {
      queryBuilder.orderBy('user.fullName', order);
    } else {
      queryBuilder.orderBy(`student.${sortField}`, order);
    }

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Cập nhật thông tin sinh viên (cho giáo vụ)
  async updateStudent(id: number, updateStudentDto: UpdateStudentDto): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { id }
    });

    if (!student) {
      throw new NotFoundException('Không tìm thấy sinh viên');
    }

    // Kiểm tra lớp tồn tại (nếu có thay đổi)
    if (updateStudentDto.classId) {
      const classEntity = await this.classRepository.findOne({
        where: { id: updateStudentDto.classId }
      });

      if (!classEntity) {
        throw new NotFoundException('Không tìm thấy lớp học');
      }
    }

    Object.assign(student, updateStudentDto);
    return this.studentRepository.save(student);
  }

  // Xóa sinh viên
  async deleteStudent(id: number): Promise<void> {
    const student = await this.studentRepository.findOne({
      where: { id },
    });

    if (!student) {
      throw new NotFoundException('Không tìm thấy sinh viên');
    }

    try {
      await this.studentRepository.remove(student);
    } catch {
      throw new BadRequestException('Không thể xóa sinh viên do đang được tham chiếu');
    }
  }

  // Lấy sinh viên theo lớp
  async getStudentsByClass(classId: number): Promise<Student[]> {
    const classEntity = await this.classRepository.findOne({
      where: { id: classId }
    });

    if (!classEntity) {
      throw new NotFoundException('Không tìm thấy lớp học');
    }

    return this.studentRepository.find({
      where: { classId },
      relations: ['user', 'classEntity'],
      order: { studentCode: 'ASC' }
    });
  }
}
