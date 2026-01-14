import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Thesis } from './thesis.entity';
import { Student } from '../../student/entities/student.entity';

@Entity('thesis_members')
export class ThesisMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'thesis_id' })
  thesisId: number;

  @Column({ name: 'student_id' })
  studentId: number;

  @Column({ length: 20 })
  role: string;

  @Column({ name: 'contribution_description', type: 'text', nullable: true })
  contributionDescription?: string;

  @Column({
    name: 'individual_contribution_score',
    type: 'decimal',
    precision: 4,
    scale: 2,
    nullable: true,
  })
  individualContributionScore?: number;

  @Column({
    name: 'peer_evaluation_score',
    type: 'decimal',
    precision: 4,
    scale: 2,
    nullable: true,
  })
  peerEvaluationScore?: number;

  @Column({
    name: 'supervisor_individual_score',
    type: 'decimal',
    precision: 4,
    scale: 2,
    nullable: true,
  })
  supervisorIndividualScore?: number;

  @Column({ name: 'final_score', type: 'decimal', precision: 4, scale: 2, nullable: true })
  finalScore?: number;

  @Column({ length: 20, nullable: true })
  grade?: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'evaluation_notes', type: 'text', nullable: true })
  evaluationNotes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Thesis, (thesis) => thesis.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'thesis_id' })
  thesis: Thesis;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;
}
