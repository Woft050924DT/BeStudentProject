import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { DefenseAssignment } from './defense-assignment.entity';
import { Instructor } from '../../instructor/entities/instructor.entity';

@Entity('defense_results')
@Unique(['defenseAssignmentId', 'instructorId'])
export class DefenseResult {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'defense_assignment_id' })
  defenseAssignmentId: number;

  @Column({ name: 'instructor_id' })
  instructorId: number;

  @Column({ name: 'defense_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
  defenseScore?: number;

  @Column({ type: 'text', nullable: true })
  comments?: string;

  @Column({ type: 'text', nullable: true })
  suggestions?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => DefenseAssignment, (defenseAssignment) => defenseAssignment.defenseResults)
  @JoinColumn({ name: 'defense_assignment_id' })
  defenseAssignment: DefenseAssignment;

  @ManyToOne(() => Instructor)
  @JoinColumn({ name: 'instructor_id' })
  instructor: Instructor;
}

