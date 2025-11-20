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
import { Instructor } from '../../instructor/entities/instructor.entity';
import { ThesisRound } from './thesis-round.entity';
import { TopicRegistration } from './topic-registration.entity';

@Entity('proposed_topics')
export class ProposedTopic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'topic_code', length: 50 })
  topicCode: string;

  @Column({ name: 'topic_title', length: 500 })
  topicTitle: string;

  @Column({ name: 'instructor_id' })
  instructorId: number;

  @Column({ name: 'thesis_round_id' })
  thesisRoundId: number;

  @Column({ name: 'topic_description', type: 'text', nullable: true })
  topicDescription?: string;

  @Column({ type: 'text', nullable: true })
  objectives?: string;

  @Column({ name: 'student_requirements', type: 'text', nullable: true })
  studentRequirements?: string;

  @Column({ name: 'technologies_used', type: 'text', nullable: true })
  technologiesUsed?: string;

  @Column({ name: 'topic_references', type: 'text', nullable: true })
  topicReferences?: string;

  @Column({ name: 'is_taken', default: false })
  isTaken: boolean;

  @Column({ default: true })
  status: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Instructor)
  @JoinColumn({ name: 'instructor_id' })
  instructor: Instructor;

  @ManyToOne(() => ThesisRound)
  @JoinColumn({ name: 'thesis_round_id' })
  thesisRound: ThesisRound;

  @OneToMany(
    () => TopicRegistration,
    (topicRegistration) => topicRegistration.proposedTopic,
  )
  topicRegistrations: TopicRegistration[];
}
