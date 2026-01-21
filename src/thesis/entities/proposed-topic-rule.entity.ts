import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ProposedTopic } from './proposed-topic.entity';

@Entity('proposed_topic_rules')
export class ProposedTopicRule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'proposed_topic_id', unique: true })
  proposedTopicId: number;

  @Column({ name: 'group_mode', length: 20, default: 'BOTH' })
  groupMode: string;

  @Column({ name: 'min_members', type: 'int', default: 1 })
  minMembers: number;

  @Column({ name: 'max_members', type: 'int', default: 4 })
  maxMembers: number;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => ProposedTopic, (topic) => topic.rules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'proposed_topic_id' })
  proposedTopic: ProposedTopic;
}
