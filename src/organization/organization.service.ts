import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faculty } from './entities/faculty.entity';
import { Department } from './entities/department.entity';
import { Major } from './entities/major.entity';
import { Class } from './entities/class.entity';
import { CreateFacultyDto } from '../admin/dto/create-faculty.dto';
import { CreateDepartmentDto } from '../admin/dto/create-department.dto';

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
      relations: ['faculty', 'head', 'majors', 'instructors'],
      order: { departmentName: 'ASC' }
    });
  }

  async getDepartmentsByFaculty(facultyId: number): Promise<Department[]> {
    return this.departmentRepository.find({
      where: { facultyId },
      relations: ['faculty', 'head', 'majors', 'instructors'],
      order: { departmentName: 'ASC' }
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
  async createClass(classData: Partial<Class>): Promise<Class> {
    const { classCode, majorId } = classData;
    
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

    const classEntity = this.classRepository.create(classData);
    return this.classRepository.save(classEntity);
  }
}
