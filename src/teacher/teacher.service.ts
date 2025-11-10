import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Instructor } from '../instructor/entities/instructor.entity';
import { Users } from '../user/user.entity';
import { Department } from '../organization/entities/department.entity';
import { UpdateTeacherInfoDto } from './dto/update-teacher-info.dto';

@Injectable()
export class TeacherService {
  constructor(
    @InjectRepository(Instructor)
    private readonly instructorRepository: Repository<Instructor>,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
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
}
