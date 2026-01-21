import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Instructor } from '../../instructor/entities/instructor.entity';
import { ThesisRound } from './thesis-round.entity';
import { ProposedTopic } from './proposed-topic.entity';
import { Thesis } from './thesis.entity';
import { ThesisGroup } from './thesis-group.entity';

@Entity('topic_registrations')
export class TopicRegistration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'thesis_group_id' })
  thesisGroupId: number;

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

  @Column({ name: 'applied_group_mode', length: 20, nullable: true })
  appliedGroupMode?: string;

  @Column({ name: 'applied_min_members', type: 'int', nullable: true })
  appliedMinMembers?: number;

  @Column({ name: 'applied_max_members', type: 'int', nullable: true })
  appliedMaxMembers?: number;

  @Column({ name: 'rule_override_by', length: 20, nullable: true })
  ruleOverrideBy?: string;

  @Column({ name: 'rule_override_reason', type: 'text', nullable: true })
  ruleOverrideReason?: string;

  @Column({
    name: 'instructor_status',
    length: 50,
    default: 'PENDING',
  })
  instructorStatus: string;

  @Column({
    name: 'head_status',
    length: 50,
    default: 'PENDING',
  })
  headStatus: string;

  @Column({ name: 'instructor_rejection_reason', type: 'text', nullable: true })
  instructorRejectionReason?: string;

  @Column({ name: 'head_rejection_reason', type: 'text', nullable: true })
  headRejectionReason?: string;

  @Column({ name: 'head_override_group_mode', length: 20, nullable: true })
  headOverrideGroupMode?: string;

  @Column({ name: 'head_override_min_members', type: 'int', nullable: true })
  headOverrideMinMembers?: number;

  @Column({ name: 'head_override_max_members', type: 'int', nullable: true })
  headOverrideMaxMembers?: number;

  @Column({ name: 'head_override_reason', type: 'text', nullable: true })
  headOverrideReason?: string;

  @Column({ name: 'registration_date', default: () => 'CURRENT_TIMESTAMP' })
  registrationDate: Date;

  @Column({ name: 'instructor_approval_date', nullable: true })
  instructorApprovalDate?: Date;

  @Column({ name: 'head_approval_date', nullable: true })
  headApprovalDate?: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => ThesisGroup, (group) => group.topicRegistrations)
  @JoinColumn({ name: 'thesis_group_id' })
  thesisGroup: ThesisGroup;

  @ManyToOne(() => ThesisRound)
  @JoinColumn({ name: 'thesis_round_id' })
  thesisRound: ThesisRound;

  @ManyToOne(() => Instructor)
  @JoinColumn({ name: 'instructor_id' })
  instructor: Instructor;

  @ManyToOne(() => ProposedTopic, { nullable: true })
  @JoinColumn({ name: 'proposed_topic_id' })
  proposedTopic?: ProposedTopic;

  @OneToOne(() => Thesis, (thesis) => thesis.topicRegistration)
  thesis?: Thesis;
}
