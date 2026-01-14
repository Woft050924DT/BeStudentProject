import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Thesis } from './thesis.entity';
import { Instructor } from '../../instructor/entities/instructor.entity';

@Entity('supervision_comments')
@Unique(['thesisId', 'instructorId'])
export class SupervisionComment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'thesis_id' })
  thesisId: number;

  @Column({ name: 'instructor_id' })
  instructorId: number;

  @Column({ name: 'comment_content', type: 'text', nullable: true })
  commentContent?: string;

  @Column({ name: 'attitude_evaluation', type: 'text', nullable: true })
  attitudeEvaluation?: string;

  @Column({ name: 'capability_evaluation', type: 'text', nullable: true })
  capabilityEvaluation?: string;

  @Column({ name: 'result_evaluation', type: 'text', nullable: true })
  resultEvaluation?: string;

  @Column({ name: 'supervision_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
  supervisionScore?: number;

  @Column({ name: 'defense_approval', default: false })
  defenseApproval: boolean;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason?: string;

  @Column({ name: 'comment_date', type: 'date', default: () => 'CURRENT_DATE' })
  commentDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Thesis, (thesis) => thesis.supervisionComments)
  @JoinColumn({ name: 'thesis_id' })
  thesis: Thesis;

  @ManyToOne(() => Instructor)
  @JoinColumn({ name: 'instructor_id' })
  instructor: Instructor;
}

