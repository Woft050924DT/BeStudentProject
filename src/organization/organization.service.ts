import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faculty } from './entities/faculty.entity';
import { Department } from './entities/department.entity';
import { Major } from './entities/major.entity';
import { Class } from './entities/class.entity';
import { CreateFacultyDto } from '../admin/dto/create-faculty.dto';
import { CreateDepartmentDto } from '../admin/dto/create-department.dto';
import { CreateClassDto } from '../admin/dto/create-class.dto';
import { UpdateClassDto } from '../admin/dto/update-class.dto';
import { GetClassesDto } from '../admin/dto/get-classes.dto';
import { Instructor } from '../instructor/entities/instructor.entity';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Faculty)
    private readonly facultyRepository: Repository<Faculty>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(Major)
    private readonly majorRepository: Repository<Major>,
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    @InjectRepository(Instructor)
    private readonly instructorRepository: Repository<Instructor>,
  ) {}

  // Faculty methods
  async createFaculty(createFacultyDto: CreateFacultyDto): Promise<Faculty> {
    const { facultyCode } = createFacultyDto;
    
    const existingFaculty = await this.facultyRepository.findOne({
      where: { facultyCode }
    });
    
    if (existingFaculty) {
      throw new ConflictException('Mã khoa đã tồn tại');
    }

    const faculty = this.facultyRepository.create(createFacultyDto);
    return this.facultyRepository.save(faculty);
  }

  async getAllFaculties(): Promise<Faculty[]> {
    return this.facultyRepository.find({
      relations: ['departments', 'dean'],
      order: { facultyName: 'ASC' }
    });
  }

  async getFacultyById(id: number): Promise<Faculty> {
    const faculty = await this.facultyRepository.findOne({
      where: { id },
      relations: ['departments', 'dean']
    });
    
    if (!faculty) {
      throw new NotFoundException('Không tìm thấy khoa');
    }
    
    return faculty;
  }

  // Department methods
  async createDepartment(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    const { departmentCode, facultyId } = createDepartmentDto;
    
    // Check if department code already exists
    const existingDepartment = await this.departmentRepository.findOne({
      where: { departmentCode }
    });
    
    if (existingDepartment) {
      throw new ConflictException('Mã bộ môn đã tồn tại');
    }

    // Check if faculty exists
    const faculty = await this.facultyRepository.findOne({
      where: { id: facultyId }
    });
    
    if (!faculty) {
      throw new NotFoundException('Không tìm thấy khoa');
    }

    const department = this.departmentRepository.create(createDepartmentDto);
    return this.departmentRepository.save(department);
  }

  async getAllDepartments(): Promise<Department[]> {
    return this.departmentRepository.find({
      relations: ['faculty', 'head', 'head.user', 'majors', 'instructors'],
      order: { departmentName: 'ASC' }
    });
  }

  async getDepartmentsByFaculty(facultyId: number): Promise<Department[]> {
    return this.departmentRepository.find({
      where: { facultyId },
      relations: ['faculty', 'head', 'head.user', 'majors', 'instructors'],
      order: { departmentName: 'ASC' }
    });
  }

  async getActiveDepartments(): Promise<Department[]> {
    return this.departmentRepository.find({
      where: { status: true },
      relations: ['faculty', 'head'],
      order: { departmentCode: 'ASC' }
    });
  }

  // Major methods
  async createMajor(majorData: Partial<Major>): Promise<Major> {
    const { majorCode, departmentId } = majorData;
    
    // Check if major code already exists
    const existingMajor = await this.majorRepository.findOne({
      where: { majorCode }
    });
    
    if (existingMajor) {
      throw new ConflictException('Mã chuyên ngành đã tồn tại');
    }

    // Check if department exists
    const department = await this.departmentRepository.findOne({
      where: { id: departmentId }
    });
    
    if (!department) {
      throw new NotFoundException('Không tìm thấy bộ môn');
    }

    const major = this.majorRepository.create(majorData);
    return this.majorRepository.save(major);
  }

  // Class methods
  async createClass(createClassDto: CreateClassDto): Promise<Class> {
    const { classCode, majorId, advisorId } = createClassDto;
    
    // Check if class code already exists
    const existingClass = await this.classRepository.findOne({
      where: { classCode }
    });
    
    if (existingClass) {
      throw new ConflictException('Mã lớp đã tồn tại');
    }

    // Check if major exists
    const major = await this.majorRepository.findOne({
      where: { id: majorId }
    });
    
    if (!major) {
      throw new NotFoundException('Không tìm thấy chuyên ngành');
    }

    // Check if advisor exists (if provided)
    if (advisorId) {
      const advisor = await this.instructorRepository.findOne({
        where: { id: advisorId }
      });
      
      if (!advisor) {
        throw new NotFoundException('Không tìm thấy giảng viên cố vấn');
      }
    }

    const classEntity = this.classRepository.create(createClassDto);
    return this.classRepository.save(classEntity);
  }

  async getAllClasses(): Promise<Class[]> {
    return this.classRepository.find({
      relations: ['major', 'major.department', 'major.department.faculty', 'advisor', 'advisor.user'],
      order: { classCode: 'ASC' }
    });
  }

  async getClassById(id: number): Promise<Class> {
    const classEntity = await this.classRepository.findOne({
      where: { id },
      relations: ['major', 'major.department', 'major.department.faculty', 'advisor', 'advisor.user', 'students', 'students.user']
    });
    
    if (!classEntity) {
      throw new NotFoundException('Không tìm thấy lớp học');
    }
    
    return classEntity;
  }

  async updateClass(id: number, updateClassDto: UpdateClassDto): Promise<Class> {
    const classEntity = await this.classRepository.findOne({
      where: { id }
    });
    
    if (!classEntity) {
      throw new NotFoundException('Không tìm thấy lớp học');
    }

    // Check if major exists (if provided)
    if (updateClassDto.majorId) {
      const major = await this.majorRepository.findOne({
        where: { id: updateClassDto.majorId }
      });
      
      if (!major) {
        throw new NotFoundException('Không tìm thấy chuyên ngành');
      }
    }

    // Check if advisor exists (if provided)
    if (updateClassDto.advisorId !== undefined) {
      if (updateClassDto.advisorId !== null) {
        const advisor = await this.instructorRepository.findOne({
          where: { id: updateClassDto.advisorId }
        });
        
        if (!advisor) {
          throw new NotFoundException('Không tìm thấy giảng viên cố vấn');
        }
      }
    }

    Object.assign(classEntity, updateClassDto);
    return this.classRepository.save(classEntity);
  }

  async deleteClass(id: number): Promise<void> {
    const classEntity = await this.classRepository.findOne({
      where: { id },
      relations: ['students']
    });
    
    if (!classEntity) {
      throw new NotFoundException('Không tìm thấy lớp học');
    }

    // Check if class has students
    if (classEntity.students && classEntity.students.length > 0) {
      throw new BadRequestException('Không thể xóa lớp học đang có sinh viên');
    }

    await this.classRepository.remove(classEntity);
  }

  async getClassesWithFilters(query: GetClassesDto) {
    const {
      page = 1,
      limit = 10,
      majorId,
      departmentId,
      facultyId,
      search,
      academicYear,
      advisorId,
      status,
      sortBy = 'classCode',
      sortOrder = 'ASC'
    } = query;

    const queryBuilder = this.classRepository.createQueryBuilder('class')
      .leftJoinAndSelect('class.major', 'major')
      .leftJoinAndSelect('major.department', 'department')
      .leftJoinAndSelect('department.faculty', 'faculty')
      .leftJoinAndSelect('class.advisor', 'advisor')
      .leftJoinAndSelect('advisor.user', 'advisorUser');

    // Filters
    if (majorId) {
      queryBuilder.andWhere('class.majorId = :majorId', { majorId });
    }

    if (departmentId) {
      queryBuilder.andWhere('major.departmentId = :departmentId', { departmentId });
    }

    if (facultyId) {
      queryBuilder.andWhere('department.facultyId = :facultyId', { facultyId });
    }

    if (academicYear) {
      queryBuilder.andWhere('class.academicYear = :academicYear', { academicYear });
    }

    if (advisorId) {
      queryBuilder.andWhere('class.advisorId = :advisorId', { advisorId });
    }

    if (status !== undefined) {
      queryBuilder.andWhere('class.status = :status', { status });
    }

    // Search
    if (search) {
      queryBuilder.andWhere(
        '(class.classCode ILIKE :search OR class.className ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Sorting
    const validSortFields = ['classCode', 'className', 'createdAt', 'studentCount'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'classCode';
    const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    
    queryBuilder.orderBy(`class.${sortField}`, order);

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

  async getClassesByMajor(majorId: number): Promise<Class[]> {
    return this.classRepository.find({
      where: { majorId },
      relations: ['major', 'advisor', 'advisor.user'],
      order: { classCode: 'ASC' }
    });
  }

  async getClassesByAdvisor(advisorId: number): Promise<{
    success: boolean;
    data?: any[];
    message?: string;
    total?: number;
  }> {
    // Kiểm tra instructor tồn tại
    const instructor = await this.instructorRepository.findOne({
      where: { id: advisorId },
      relations: ['user']
    });

    if (!instructor) {
      return {
        success: false,
        message: 'Không tìm thấy giảng viên'
      };
    }

    const classes = await this.classRepository.find({
      where: { advisorId },
      relations: ['major', 'major.department', 'major.department.faculty', 'advisor', 'advisor.user', 'students'],
      order: { classCode: 'ASC' }
    });

    return {
      success: true,
      data: classes.map(classEntity => ({
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
            departmentName: classEntity.major.department.departmentName,
            faculty: classEntity.major.department.faculty ? {
              id: classEntity.major.department.faculty.id,
              facultyCode: classEntity.major.department.faculty.facultyCode,
              facultyName: classEntity.major.department.faculty.facultyName
            } : null
          } : null
        } : null,
        advisor: classEntity.advisor ? {
          id: classEntity.advisor.id,
          instructorCode: classEntity.advisor.instructorCode,
          fullName: classEntity.advisor.user?.fullName || null
        } : null,
        status: classEntity.status,
        createdAt: classEntity.createdAt,
        updatedAt: classEntity.updatedAt
      })),
      total: classes.length
    };
  }
}
