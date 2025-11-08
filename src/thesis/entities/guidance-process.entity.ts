import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ThesisRound } from './thesis-round.entity';

@Entity('guidance_processes')
export class GuidanceProcess {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'thesis_round_id' })
  thesisRoundId: number;

  @Column({ name: 'week_number' })
  weekNumber: number;

  @Column({ name: 'phase_name', length: 255 })
  phaseName: string;

  @Column({ name: 'work_description', type: 'text', nullable: true })
  workDescription?: string;

  @Column({ name: 'expected_outcome', type: 'text', nullable: true })
  expectedOutcome?: string;

  @Column({ default: true })
  status: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => ThesisRound, (thesisRound) => thesisRound.guidanceProcesses)
  @JoinColumn({ name: 'thesis_round_id' })
  thesisRound: ThesisRound;
}

