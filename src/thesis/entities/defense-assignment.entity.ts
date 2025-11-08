import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
} from 'typeorm';
import { DefenseCouncil } from './defense-council.entity';
import { Thesis } from './thesis.entity';
import { DefenseResult } from './defense-result.entity';

@Entity('defense_assignments')
@Unique(['defenseCouncilId', 'thesisId'])
export class DefenseAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'defense_council_id' })
  defenseCouncilId: number;

  @Column({ name: 'thesis_id' })
  thesisId: number;

  @Column({ name: 'defense_order', nullable: true })
  defenseOrder?: number;

  @Column({ name: 'defense_time', type: 'time', nullable: true })
  defenseTime?: string;

  @Column({ 
    length: 50, 
    default: 'Pending Defense',
    transformer: {
      to: (value: string) => value,
      from: (value: string) => value
    }
  })
  status: string; // Pending Defense, In Defense, Completed

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => DefenseCouncil, (defenseCouncil) => defenseCouncil.defenseAssignments)
  @JoinColumn({ name: 'defense_council_id' })
  defenseCouncil: DefenseCouncil;

  @ManyToOne(() => Thesis, (thesis) => thesis.defenseAssignments)
  @JoinColumn({ name: 'thesis_id' })
  thesis: Thesis;

  @OneToMany(() => DefenseResult, (defenseResult) => defenseResult.defenseAssignment)
  defenseResults: DefenseResult[];
}

