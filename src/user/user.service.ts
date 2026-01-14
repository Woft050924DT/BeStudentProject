import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './user.entity';
import { UserRole } from '../models/enum/userRole.enum';
import { CreateUserDto } from './interface/create-user.dto';
import { UpdateUserDto } from './interface/update-user.dto';
import { UserRoleAssignment } from './entities/usser-role-assignment.entity';
import { UserRoleDefinition } from './entities/user-role-definition.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(UserRoleAssignment)
    private readonly userRoleAssignmentRepository: Repository<UserRoleAssignment>,
    @InjectRepository(UserRoleDefinition)
    private readonly userRoleDefinitionRepository: Repository<UserRoleDefinition>,
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
    void assignedBy;
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

    // Tạo user mới
    const user = await this.create({
      username,
      email,
      password,
      fullName: fullName ?? username,
      gender,
      dateOfBirth,
      phone,
      address,
      status: true,
    });

    const userRole = role || UserRole.STUDENT;
    await this.setPrimaryRole(user.id, userRole);

    return user;
  }

  private toRoleCode(role: UserRole): string {
    return role.toUpperCase();
  }

  async setPrimaryRole(userId: number, role: UserRole): Promise<void> {
    const roleCode = this.toRoleCode(role);

    let roleDef = await this.userRoleDefinitionRepository.findOne({
      where: { roleCode },
    });

    if (!roleDef) {
      roleDef = await this.userRoleDefinitionRepository.save(
        this.userRoleDefinitionRepository.create({
          roleCode,
          roleName: roleCode,
          status: true,
        }),
      );
    }

    await this.userRoleAssignmentRepository.update({ userId, status: true }, { status: false });

    await this.userRoleAssignmentRepository.save(
      this.userRoleAssignmentRepository.create({
        userId,
        roleId: roleDef.id,
        status: true,
      }),
    );
  }

  // Cập nhật role cho user
  async updateUserRole(userId: number, role: UserRole): Promise<Users | null> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    await this.setPrimaryRole(userId, role);
    return this.findById(userId);
  }

  // Lấy danh sách roles của user từ bảng user_role_assignments
  async getUserRoles(userId: number): Promise<string[]> {
    const activeAssignments = await this.userRoleAssignmentRepository.find({
      where: { userId, status: true },
      relations: ['role'],
    });

    return activeAssignments
      .map((a) => a.role?.roleCode)
      .filter((code): code is string => Boolean(code))
      .map((code) => code.toLowerCase());
  }

  // Lấy thông tin chi tiết role của user
  async getUserRoleDetail(userId: number): Promise<{ role: string; assignedAt: Date } | null> {
    const assignment = await this.userRoleAssignmentRepository.findOne({
      where: { userId, status: true },
      relations: ['role'],
      order: { createdAt: 'DESC' },
    });

    if (!assignment || !assignment.role?.roleCode) return null;

    return {
      role: assignment.role.roleCode,
      assignedAt: assignment.createdAt,
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
    const roleDef = await this.userRoleDefinitionRepository.findOne({
      where: { roleCode: this.toRoleCode(role) },
    });
    if (!roleDef) return [];

    const assignments = await this.userRoleAssignmentRepository.find({
      where: { roleId: roleDef.id, status: true },
    });

    const userIds = assignments.map((a) => a.userId);
    if (userIds.length === 0) return [];

    return this.userRepository.find({
      where: userIds.map((id) => ({ id })),
      order: { createdAt: 'DESC' },
    });
  }
}
