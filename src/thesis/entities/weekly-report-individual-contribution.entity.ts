import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { WeeklyReport } from './weekly-report.entity';
import { Student } from '../../student/entities/student.entity';

@Entity('weekly_report_individual_contributions')
@Unique(['weeklyReportId', 'studentId'])
export class WeeklyReportIndividualContribution {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'weekly_report_id' })
  weeklyReportId: number;

  @Column({ name: 'student_id' })
  studentId: number;

  @Column({ name: 'individual_work', type: 'text', nullable: true })
  individualWork?: string;

  @Column({ name: 'individual_results', type: 'text', nullable: true })
  individualResults?: string;

  @Column({ name: 'hours_spent', type: 'decimal', precision: 6, scale: 2, nullable: true })
  hoursSpent?: number;

  @Column({ name: 'self_evaluation', type: 'text', nullable: true })
  selfEvaluation?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => WeeklyReport, (report) => report.individualContributions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'weekly_report_id' })
  weeklyReport: WeeklyReport;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;
}
