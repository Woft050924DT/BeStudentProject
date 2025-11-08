import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { DefenseCouncil } from './defense-council.entity';
import { Instructor } from '../../instructor/entities/instructor.entity';

@Entity('council_members')
@Unique(['defenseCouncilId', 'instructorId'])
export class CouncilMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'defense_council_id' })
  defenseCouncilId: number;

  @Column({ name: 'instructor_id' })
  instructorId: number;

  @Column({ length: 50 })
  role: string; // Chairman, Secretary, Member, Reviewer

  @Column({ name: 'order_number', default: 1 })
  orderNumber: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => DefenseCouncil, (defenseCouncil) => defenseCouncil.councilMembers)
  @JoinColumn({ name: 'defense_council_id' })
  defenseCouncil: DefenseCouncil;

  @ManyToOne(() => Instructor)
  @JoinColumn({ name: 'instructor_id' })
  instructor: Instructor;
}

