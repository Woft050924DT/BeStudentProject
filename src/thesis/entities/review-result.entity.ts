import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { ReviewAssignment } from './review-assignment.entity';

@Entity('review_results')
@Unique(['reviewAssignmentId'])
export class ReviewResult {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'review_assignment_id' })
  reviewAssignmentId: number;

  @Column({ name: 'review_content', type: 'text', nullable: true })
  reviewContent?: string;

  @Column({ name: 'topic_evaluation', type: 'text', nullable: true })
  topicEvaluation?: string;

  @Column({ name: 'result_evaluation', type: 'text', nullable: true })
  resultEvaluation?: string;

  @Column({ name: 'improvement_suggestions', type: 'text', nullable: true })
  improvementSuggestions?: string;

  @Column({ name: 'review_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
  reviewScore?: number;

  @Column({ name: 'defense_approval', default: false })
  defenseApproval: boolean;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason?: string;

  @Column({ name: 'review_date', type: 'date', default: () => 'CURRENT_DATE' })
  reviewDate: Date;

  @Column({ name: 'review_file', nullable: true })
  reviewFile?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @OneToOne(() => ReviewAssignment, (reviewAssignment) => reviewAssignment.reviewResult)
  @JoinColumn({ name: 'review_assignment_id' })
  reviewAssignment: ReviewAssignment;
}

