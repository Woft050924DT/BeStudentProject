import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Instructor } from '../../instructor/entities/instructor.entity';
import { ThesisRound } from './thesis-round.entity';

@Entity('proposed_topics')
export class ProposedTopic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  topicCode: string;

  @Column({ type: 'varchar', length: 500 })
  topicTitle: string;

  @Column()
  instructorId: number;

  @ManyToOne(() => Instructor)
  @JoinColumn({ name: 'instructorId' })
  instructor: Instructor;

  @Column()
  thesisRoundId: number;

  @ManyToOne(() => ThesisRound)
  @JoinColumn({ name: 'thesisRoundId' })
  thesisRound: ThesisRound;

  @Column({ type: 'text', nullable: true })
  topicDescription: string;

  @Column({ type: 'text', nullable: true })
  objectives: string;

  @Column({ type: 'text', nullable: true })
  studentRequirements: string;

  @Column({ type: 'text', nullable: true })
  technologiesUsed: string;

  @Column({ type: 'text', nullable: true })
  topicReferences: string;

  @Column({ type: 'boolean', default: false })
  isTaken: boolean;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
