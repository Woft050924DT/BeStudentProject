import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Student } from '../../student/entities/student.entity';
import { Instructor } from '../../instructor/entities/instructor.entity';
import { ThesisRound } from './thesis-round.entity';
import { ProposedTopic } from './proposed-topic.entity';
import { Thesis } from './thesis.entity';

@Entity('topic_registrations')
export class TopicRegistration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'student_id' })
  studentId: number;

  @Column({ name: 'thesis_round_id' })
  thesisRoundId: number;

  @Column({ name: 'instructor_id' })
  instructorId: number;

  @Column({ name: 'proposed_topic_id', nullable: true })
  proposedTopicId?: number;

  @Column({ name: 'self_proposed_title', length: 500, nullable: true })
  selfProposedTitle?: string;

  @Column({ name: 'self_proposed_description', type: 'text', nullable: true })
  selfProposedDescription?: string;

  @Column({ name: 'selection_reason', type: 'text', nullable: true })
  selectionReason?: string;

  @Column({ 
    name: 'instructor_status', 
    length: 50, 
    default: 'Pending',
    transformer: {
      to: (value: string) => value,
      from: (value: string) => value
    }
  })
  instructorStatus: string; // Pending, Approved, Rejected

  @Column({ 
    name: 'head_status', 
    length: 50, 
    default: 'Pending',
    transformer: {
      to: (value: string) => value,
      from: (value: string) => value
    }
  })
  headStatus: string; // Pending, Approved, Rejected

  @Column({ name: 'instructor_rejection_reason', type: 'text', nullable: true })
  instructorRejectionReason?: string;

  @Column({ name: 'head_rejection_reason', type: 'text', nullable: true })
  headRejectionReason?: string;

  @Column({ name: 'registration_date', default: () => 'CURRENT_TIMESTAMP' })
  registrationDate: Date;

  @Column({ name: 'instructor_approval_date', nullable: true })
  instructorApprovalDate?: Date;

  @Column({ name: 'head_approval_date', nullable: true })
  headApprovalDate?: Date;

  // Relations
  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => ThesisRound)
  @JoinColumn({ name: 'thesis_round_id' })
  thesisRound: ThesisRound;

  @ManyToOne(() => Instructor)
  @JoinColumn({ name: 'instructor_id' })
  instructor: Instructor;

  @ManyToOne(() => ProposedTopic, { nullable: true })
  @JoinColumn({ name: 'proposed_topic_id' })
  proposedTopic?: ProposedTopic;

  @OneToMany(() => Thesis, (thesis) => thesis.topicRegistration)
  theses: Thesis[];
}
