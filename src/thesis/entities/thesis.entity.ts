import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Student } from '../../student/entities/student.entity';
import { Instructor } from '../../instructor/entities/instructor.entity';
import { ThesisRound } from './thesis-round.entity';
import { TopicRegistration } from './topic-registration.entity';
import { WeeklyReport } from './weekly-report.entity';
import { SupervisionComment } from './supervision-comment.entity';
import { ReviewAssignment } from './review-assignment.entity';
import { DefenseAssignment } from './defense-assignment.entity';

@Entity('theses')
export class Thesis {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'thesis_code', unique: true, length: 50 })
  thesisCode: string;

  @Column({ name: 'topic_title', length: 500 })
  topicTitle: string;

  @Column({ name: 'student_id' })
  studentId: number;

  @Column({ name: 'supervisor_id' })
  supervisorId: number;

  @Column({ name: 'thesis_round_id' })
  thesisRoundId: number;

  @Column({ name: 'topic_registration_id' })
  topicRegistrationId: number;

  @Column({ name: 'topic_description', type: 'text', nullable: true })
  topicDescription?: string;

  @Column({ type: 'text', nullable: true })
  objectives?: string;

  @Column({ type: 'text', nullable: true })
  requirements?: string;

  @Column({ name: 'technologies_used', type: 'text', nullable: true })
  technologiesUsed?: string;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate?: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate?: Date;

  @Column({ name: 'outline_file', nullable: true })
  outlineFile?: string;

  @Column({ name: 'final_report_file', nullable: true })
  finalReportFile?: string;

  @Column({ name: 'supervision_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
  supervisionScore?: number;

  @Column({ name: 'review_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
  reviewScore?: number;

  @Column({ name: 'defense_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
  defenseScore?: number;

  @Column({ name: 'final_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
  finalScore?: number;

  @Column({ length: 20, nullable: true })
  grade?: string; // Excellent, Good, Fair, Average, Poor

  @Column({ name: 'defense_eligible', default: false })
  defenseEligible: boolean;

  @Column({ 
    length: 50, 
    default: 'In Progress',
    transformer: {
      to: (value: string) => value,
      from: (value: string) => value
    }
  })
  status: string; // In Progress, Completed, Suspended

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Student, (student) => student.theses)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Instructor, (instructor) => instructor.supervisedTheses)
  @JoinColumn({ name: 'supervisor_id' })
  supervisor: Instructor;

  @ManyToOne(() => ThesisRound, (thesisRound) => thesisRound.theses)
  @JoinColumn({ name: 'thesis_round_id' })
  thesisRound: ThesisRound;

  @ManyToOne(() => TopicRegistration, (topicRegistration) => topicRegistration.theses)
  @JoinColumn({ name: 'topic_registration_id' })
  topicRegistration: TopicRegistration;

  @OneToMany(() => WeeklyReport, (weeklyReport) => weeklyReport.thesis)
  weeklyReports: WeeklyReport[];

  @OneToMany(() => SupervisionComment, (supervisionComment) => supervisionComment.thesis)
  supervisionComments: SupervisionComment[];

  @OneToMany(() => ReviewAssignment, (reviewAssignment) => reviewAssignment.thesis)
  reviewAssignments: ReviewAssignment[];

  @OneToMany(() => DefenseAssignment, (defenseAssignment) => defenseAssignment.thesis)
  defenseAssignments: DefenseAssignment[];
}
