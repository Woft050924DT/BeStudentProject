import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Instructor } from './entities/instructor.entity';
import { Users } from '../user/user.entity';
import { Department } from '../organization/entities/department.entity';
import { CreateInstructorDto } from '../admin/dto/create-instructor.dto';

@Injectable()
export class InstructorService {
  constructor(
    @InjectRepository(Instructor)
    private readonly instructorRepository: Repository<Instructor>,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
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

    // Check if user exists
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
}
