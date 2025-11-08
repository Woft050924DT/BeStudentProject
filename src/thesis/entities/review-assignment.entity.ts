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
import { Thesis } from './thesis.entity';
import { Instructor } from '../../instructor/entities/instructor.entity';
import { ReviewResult } from './review-result.entity';

@Entity('review_assignments')
@Unique(['thesisId', 'reviewerId'])
export class ReviewAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'thesis_id' })
  thesisId: number;

  @Column({ name: 'reviewer_id' })
  reviewerId: number;

  @Column({ name: 'review_order', default: 1 })
  reviewOrder: number; // Reviewer 1, 2, ...

  @Column({ name: 'assignment_date', type: 'date', default: () => 'CURRENT_DATE' })
  assignmentDate: Date;

  @Column({ name: 'review_deadline', type: 'date', nullable: true })
  reviewDeadline?: Date;

  @Column({ 
    length: 50, 
    default: 'Pending Review',
    transformer: {
      to: (value: string) => value,
      from: (value: string) => value
    }
  })
  status: string; // Pending Review, Completed

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Thesis, (thesis) => thesis.reviewAssignments)
  @JoinColumn({ name: 'thesis_id' })
  thesis: Thesis;

  @ManyToOne(() => Instructor)
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: Instructor;

  @OneToOne(() => ReviewResult, (reviewResult) => reviewResult.reviewAssignment)
  reviewResult?: ReviewResult;
}

