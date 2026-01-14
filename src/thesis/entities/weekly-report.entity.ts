import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { Thesis } from './thesis.entity';
import { Student } from '../../student/entities/student.entity';
import { WeeklyReportIndividualContribution } from './weekly-report-individual-contribution.entity';

@Entity('weekly_reports')
@Unique(['thesisId', 'weekNumber'])
export class WeeklyReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'thesis_id' })
  thesisId: number;

  @Column({ name: 'week_number' })
  weekNumber: number;

  @Column({ name: 'report_date', type: 'date', default: () => 'CURRENT_DATE' })
  reportDate: Date;

  @Column({ name: 'work_completed', type: 'text', nullable: true })
  workCompleted?: string;

  @Column({ name: 'results_achieved', type: 'text', nullable: true })
  resultsAchieved?: string;

  @Column({ name: 'difficulties_encountered', type: 'text', nullable: true })
  difficultiesEncountered?: string;

  @Column({ name: 'next_week_plan', type: 'text', nullable: true })
  nextWeekPlan?: string;

  @Column({ name: 'attachment_file', nullable: true })
  attachmentFile?: string;

  @Column({ name: 'submitted_by' })
  submittedBy: number;

  @Column({ name: 'student_status', length: 50, default: 'SUBMITTED' })
  studentStatus: string;

  @Column({ name: 'instructor_status', length: 50, default: 'PENDING' })
  instructorStatus: string;

  @Column({ name: 'instructor_feedback', type: 'text', nullable: true })
  instructorFeedback?: string;

  @Column({ name: 'weekly_score', type: 'decimal', precision: 4, scale: 2, nullable: true })
  weeklyScore?: number;

  @Column({ name: 'feedback_date', type: 'timestamp', nullable: true })
  feedbackDate?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Thesis, (thesis) => thesis.weeklyReports)
  @JoinColumn({ name: 'thesis_id' })
  thesis: Thesis;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'submitted_by' })
  submitter: Student;

  @OneToMany(
    () => WeeklyReportIndividualContribution,
    (contribution) => contribution.weeklyReport,
  )
  individualContributions: WeeklyReportIndividualContribution[];
}

