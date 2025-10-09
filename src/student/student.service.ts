import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}

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
}
