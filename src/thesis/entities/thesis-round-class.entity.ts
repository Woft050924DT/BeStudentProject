import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ThesisRound } from './thesis-round.entity';
import { Class } from '../../organization/entities/class.entity';

@Entity('thesis_round_classes')
export class ThesisRoundClass {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'thesis_round_id' })
  thesisRoundId: number;

  @Column({ name: 'class_id' })
  classId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => ThesisRound, (thesisRound) => thesisRound.thesisRoundClasses)
  @JoinColumn({ name: 'thesis_round_id' })
  thesisRound: ThesisRound;

  @ManyToOne(() => Class)
  @JoinColumn({ name: 'class_id' })
  class: Class;
}
