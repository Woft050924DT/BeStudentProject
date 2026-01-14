import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ThesisRound } from './thesis-round.entity';
import { Instructor } from '../../instructor/entities/instructor.entity';
import { CouncilMember } from './council-member.entity';
import { DefenseAssignment } from './defense-assignment.entity';

@Entity('defense_councils')
export class DefenseCouncil {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'council_code', unique: true, length: 50 })
  councilCode: string;

  @Column({ name: 'council_name', length: 255 })
  councilName: string;

  @Column({ name: 'thesis_round_id' })
  thesisRoundId: number;

  @Column({ name: 'chairman_id' })
  chairmanId: number;

  @Column({ name: 'secretary_id', nullable: true })
  secretaryId?: number;

  @Column({ name: 'defense_date', type: 'date', nullable: true })
  defenseDate?: Date;

  @Column({ name: 'start_time', type: 'time', nullable: true })
  startTime?: string;

  @Column({ name: 'end_time', type: 'time', nullable: true })
  endTime?: string;

  @Column({ length: 255, nullable: true })
  venue?: string;

  @Column({ 
    length: 50, 
    default: 'Preparing',
    transformer: {
      to: (value: string) => value,
      from: (value: string) => value
    }
  })
  status: string; // Preparing, In Progress, Completed

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => ThesisRound, (thesisRound) => thesisRound.defenseCouncils)
  @JoinColumn({ name: 'thesis_round_id' })
  thesisRound: ThesisRound;

  @ManyToOne(() => Instructor)
  @JoinColumn({ name: 'chairman_id' })
  chairman: Instructor;

  @ManyToOne(() => Instructor, { nullable: true })
  @JoinColumn({ name: 'secretary_id' })
  secretary?: Instructor;

  @OneToMany(() => CouncilMember, (councilMember) => councilMember.defenseCouncil)
  councilMembers: CouncilMember[];

  @OneToMany(() => DefenseAssignment, (defenseAssignment) => defenseAssignment.defenseCouncil)
  defenseAssignments: DefenseAssignment[];
}

