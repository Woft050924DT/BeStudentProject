import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ThesisRound } from './thesis-round.entity';

@Entity('thesis_round_rules')
export class ThesisRoundRule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'thesis_round_id', unique: true })
  thesisRoundId: number;

  @Column({ name: 'default_group_mode', length: 20, default: 'BOTH' })
  defaultGroupMode: string;

  @Column({ name: 'default_min_members', type: 'int', default: 1 })
  defaultMinMembers: number;

  @Column({ name: 'default_max_members', type: 'int', default: 1 })
  defaultMaxMembers: number;

  @Column({ name: 'allow_instructor_override', type: 'boolean', default: true })
  allowInstructorOverride: boolean;

  @Column({ name: 'allow_head_override', type: 'boolean', default: true })
  allowHeadOverride: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => ThesisRound, (round) => round.rules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'thesis_round_id' })
  thesisRound: ThesisRound;
}
