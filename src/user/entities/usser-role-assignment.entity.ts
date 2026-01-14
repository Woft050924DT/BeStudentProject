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
import { UserRoleDefinition } from './user-role-definition.entity';

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



  @ManyToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @ManyToOne(() => UserRoleDefinition, (role) => role.assignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: UserRoleDefinition;
}
