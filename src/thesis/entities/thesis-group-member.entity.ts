import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ThesisGroup } from './thesis-group.entity';
import { Student } from '../../student/entities/student.entity';

@Entity('thesis_group_members')
export class ThesisGroupMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'thesis_group_id' })
  thesisGroupId: number;

  @Column({ name: 'thesis_round_id' })
  thesisRoundId: number;

  @Column({ name: 'student_id' })
  studentId: number;

  @Column({ length: 20, default: 'MEMBER' })
  role: string;

  @Column({ name: 'join_method', length: 20, default: 'CREATOR' })
  joinMethod: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'joined_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  joinedAt: Date;

  @Column({ name: 'left_at', type: 'timestamp', nullable: true })
  leftAt?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ManyToOne(() => ThesisGroup, (group) => group.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'thesis_group_id' })
  group: ThesisGroup;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;
}
