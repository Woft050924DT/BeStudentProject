import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Users } from '../user.entity';
import { UserRole } from './user-role-definition.entity';

@Entity('user_role_assignments')
export class UserRoleAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'role_id' })
  roleId: number;

  @Column({ default: true })
  status: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' }) // THIẾU TRƯỜNG NÀY
  updatedAt: Date;

  // THIẾU RELATIONS
  @ManyToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @ManyToOne(() => UserRole, (role) => role.assignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: UserRole;
}