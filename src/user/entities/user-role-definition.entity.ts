import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { UserRoleAssignment } from './usser-role-assignment.entity';

@Entity('user_roles')
export class UserRoleDefinition {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'role_code', unique: true, length: 20 })
  roleCode: string;

  @Column({ name: 'role_name', length: 100 })
  roleName: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: true })
  status: boolean;

  // Relations
  @OneToMany(() => UserRoleAssignment, (assignment) => assignment.role)
  assignments: UserRoleAssignment[];
}
