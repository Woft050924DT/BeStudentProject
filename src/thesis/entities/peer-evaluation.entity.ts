import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Thesis } from './thesis.entity';
import { Student } from '../../student/entities/student.entity';

@Entity('peer_evaluations')
@Unique(['thesisId', 'evaluatorId', 'evaluatedId', 'evaluationRound'])
export class PeerEvaluation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'thesis_id' })
  thesisId: number;

  @Column({ name: 'evaluator_id' })
  evaluatorId: number;

  @Column({ name: 'evaluated_id' })
  evaluatedId: number;

  @Column({ name: 'evaluation_round', type: 'int', default: 1 })
  evaluationRound: number;

  @Column({ name: 'teamwork_score', type: 'decimal', precision: 4, scale: 2, nullable: true })
  teamworkScore?: number;

  @Column({ name: 'responsibility_score', type: 'decimal', precision: 4, scale: 2, nullable: true })
  responsibilityScore?: number;

  @Column({ name: 'technical_skill_score', type: 'decimal', precision: 4, scale: 2, nullable: true })
  technicalSkillScore?: number;

  @Column({ name: 'communication_score', type: 'decimal', precision: 4, scale: 2, nullable: true })
  communicationScore?: number;

  @Column({ name: 'contribution_score', type: 'decimal', precision: 4, scale: 2, nullable: true })
  contributionScore?: number;

  @Column({ name: 'average_score', type: 'decimal', precision: 4, scale: 2, nullable: true })
  averageScore?: number;

  @Column({ type: 'text', nullable: true })
  strengths?: string;

  @Column({ type: 'text', nullable: true })
  weaknesses?: string;

  @Column({ type: 'text', nullable: true })
  suggestions?: string;

  @Column({ name: 'is_anonymous', type: 'boolean', default: true })
  isAnonymous: boolean;

  @Column({ name: 'evaluation_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  evaluationDate: Date;

  @ManyToOne(() => Thesis, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'thesis_id' })
  thesis: Thesis;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'evaluator_id' })
  evaluator: Student;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'evaluated_id' })
  evaluated: Student;
}
