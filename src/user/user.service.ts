import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './user.entity';
import { UserRole } from '../models/enum/userRole.enum';
import { CreateUserDto } from './interface/create-user.dto';
import { UpdateUserDto } from './interface/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
  ) {}

  async createUser(email: string, password: string): Promise<Users> {
    const user = this.userRepository.create({ email, password });
    return this.userRepository.save(user);
  }

  async getAllUser(): Promise<Users[]> {
    return this.userRepository.find();
  }
  async findById(id: number): Promise<Users | null> {
    return this.userRepository.findOne({ where: { id } });
  }
  async findByEmail(email: string): Promise<Users | null> {
    return this.userRepository.findOne({ where: { email } });
  }
  async findByUsername(username: string): Promise<Users | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async create(userData: Partial<Users>): Promise<Users> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async update(id: number, userData: Partial<Users>): Promise<Users | null> {
    await this.userRepository.update(id, userData);
    return this.findById(id);
  }

  // Tạo tài khoản mới với role
  async createUserWithRole(createUserDto: CreateUserDto, assignedBy?: number): Promise<Users> {
    const { username, email, password, fullName, gender, dateOfBirth, phone, address, role } = createUserDto;

    // Kiểm tra username đã tồn tại
    const existingUsername = await this.findByUsername(username);
    if (existingUsername) {
      throw new ConflictException('Username đã được sử dụng');
    }

    // Kiểm tra email đã tồn tại (nếu có)
    if (email) {
      const existingEmail = await this.findByEmail(email);
      if (existingEmail) {
        throw new ConflictException('Email đã được sử dụng');
      }
    }

    // Tạo user mới với role trực tiếp
    const userRole = role || UserRole.STUDENT;
    const user = await this.create({
      username,
      email,
      password,
      fullName,
      gender,
      dateOfBirth,
      phone,
      address,
      role: userRole.toUpperCase(), // Lưu role trực tiếp vào trường role
      status: true,
    });

    return user;
  }

  // Cập nhật role cho user
  async updateUserRole(userId: number, role: UserRole): Promise<Users | null> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    await this.userRepository.update(userId, { role: role.toUpperCase() });
    return this.findById(userId);
  }

  // Lấy danh sách roles của user từ trường role trực tiếp
  async getUserRoles(userId: number): Promise<string[]> {
    const user = await this.findById(userId);
    if (!user || !user.role) return [];
    
    return [user.role.toLowerCase()];
  }

  // Lấy thông tin chi tiết role của user
  async getUserRoleDetail(userId: number): Promise<{ role: string; assignedAt: Date } | null> {
    const user = await this.findById(userId);
    if (!user) return null;
    
    return {
      role: user.role || 'STUDENT',
      assignedAt: user.createdAt, // Sử dụng createdAt làm assignedAt
    };
  }

  // Cập nhật thông tin user
  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<Users | null> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    await this.userRepository.update(id, updateUserDto);
    return this.findById(id);
  }

  // Cập nhật role cho user (thay thế cho deactivate/activate)
  async changeUserRole(userId: number, newRole: UserRole): Promise<Users | null> {
    return this.updateUserRole(userId, newRole);
  }

  // Lấy danh sách user với roles
  async getAllUsersWithRoles(): Promise<Users[]> {
    return this.userRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  // Lấy user theo role
  async getUsersByRole(role: UserRole): Promise<Users[]> {
    return this.userRepository.find({
      where: { role: role.toUpperCase() },
      order: { createdAt: 'DESC' },
    });
  }
}
