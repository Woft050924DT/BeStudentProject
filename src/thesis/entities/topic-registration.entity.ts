import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Student } from '../../student/entities/student.entity';
import { Instructor } from '../../instructor/entities/instructor.entity';
import { ThesisRound } from './thesis-round.entity';
import { ProposedTopic } from './proposed-topic.entity';

@Entity('topic_registrations')
export class TopicRegistration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  studentId: number;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column()
  thesisRoundId: number;

  @ManyToOne(() => ThesisRound)
  @JoinColumn({ name: 'thesisRoundId' })
  thesisRound: ThesisRound;

  @Column()
  instructorId: number;

  @ManyToOne(() => Instructor)
  @JoinColumn({ name: 'instructorId' })
  instructor: Instructor;

  @Column({ nullable: true })
  proposedTopicId: number;

  @ManyToOne(() => ProposedTopic, { nullable: true })
  @JoinColumn({ name: 'proposedTopicId' })
  proposedTopic: ProposedTopic;

  @Column({ type: 'varchar', length: 500, nullable: true })
  selfProposedTitle: string;

  @Column({ type: 'text', nullable: true })
  selfProposedDescription: string;

  @Column({ type: 'text', nullable: true })
  selectionReason: string;

  @Column({ type: 'varchar', length: 50, default: 'Pending' })
  instructorStatus: string;

  @Column({ type: 'varchar', length: 50, default: 'Pending' })
  headStatus: string;

  @Column({ type: 'text', nullable: true })
  instructorRejectionReason: string;

  @Column({ type: 'text', nullable: true })
  headRejectionReason: string;

  @CreateDateColumn()
  registrationDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  instructorApprovalDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  headApprovalDate: Date;
}
