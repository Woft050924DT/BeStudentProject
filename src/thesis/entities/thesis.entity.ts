import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Instructor } from '../../instructor/entities/instructor.entity';
import { ThesisRound } from './thesis-round.entity';
import { TopicRegistration } from './topic-registration.entity';
import { WeeklyReport } from './weekly-report.entity';
import { SupervisionComment } from './supervision-comment.entity';
import { ReviewAssignment } from './review-assignment.entity';
import { DefenseAssignment } from './defense-assignment.entity';
import { ThesisGroup } from './thesis-group.entity';
import { ThesisMember } from './thesis-member.entity';

@Entity('theses')
export class Thesis {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'thesis_code', unique: true, length: 50 })
  thesisCode: string;

  @Column({ name: 'topic_title', length: 500 })
  topicTitle: string;

  @Column({ name: 'thesis_group_id' })
  thesisGroupId: number;

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

  @Column({ name: 'supervision_score', type: 'decimal', precision: 4, scale: 2, nullable: true })
  supervisionScore?: number;

  @Column({ name: 'review_score', type: 'decimal', precision: 4, scale: 2, nullable: true })
  reviewScore?: number;

  @Column({ name: 'defense_score', type: 'decimal', precision: 4, scale: 2, nullable: true })
  defenseScore?: number;

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
  @ManyToOne(() => ThesisGroup, (group) => group.theses)
  @JoinColumn({ name: 'thesis_group_id' })
  thesisGroup: ThesisGroup;

  @ManyToOne(() => Instructor, (instructor) => instructor.supervisedTheses)
  @JoinColumn({ name: 'supervisor_id' })
  supervisor: Instructor;

  @ManyToOne(() => ThesisRound, (thesisRound) => thesisRound.theses)
  @JoinColumn({ name: 'thesis_round_id' })
  thesisRound: ThesisRound;

  @OneToOne(() => TopicRegistration, (topicRegistration) => topicRegistration.thesis)
  @JoinColumn({ name: 'topic_registration_id' })
  topicRegistration: TopicRegistration;

  @OneToMany(() => ThesisMember, (member) => member.thesis)
  members: ThesisMember[];

  @OneToMany(() => WeeklyReport, (weeklyReport) => weeklyReport.thesis)
  weeklyReports: WeeklyReport[];

  @OneToMany(() => SupervisionComment, (supervisionComment) => supervisionComment.thesis)
  supervisionComments: SupervisionComment[];

  @OneToMany(() => ReviewAssignment, (reviewAssignment) => reviewAssignment.thesis)
  reviewAssignments: ReviewAssignment[];

  @OneToMany(() => DefenseAssignment, (defenseAssignment) => defenseAssignment.thesis)
  defenseAssignments: DefenseAssignment[];
}
