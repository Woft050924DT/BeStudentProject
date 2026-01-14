import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ThesisRound } from './thesis-round.entity';

@Entity('thesis_types')
export class ThesisType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'type_code', unique: true, length: 20 })
  typeCode: string;

  @Column({ name: 'type_name', length: 100 })
  typeName: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'has_review', default: true })
  hasReview: boolean;

  @Column({ name: 'has_defense', default: true })
  hasDefense: boolean;

  @Column({ name: 'reviewer_count', default: 1 })
  reviewerCount: number;

  @Column({ default: true })
  status: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => ThesisRound, (thesisRound) => thesisRound.thesisType)
  thesisRounds: ThesisRound[];
}
