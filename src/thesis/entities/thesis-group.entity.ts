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
import { Student } from '../../student/entities/student.entity';
import { ThesisGroupMember } from './thesis-group-member.entity';
import { ThesisGroupInvitation } from './thesis-group-invitation.entity';
import { TopicRegistration } from './topic-registration.entity';
import { Thesis } from './thesis.entity';

@Entity('thesis_groups')
export class ThesisGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'group_code', length: 20, unique: true })
  groupCode: string;

  @Column({ name: 'group_name', length: 255, nullable: true })
  groupName?: string;

  @Column({ name: 'thesis_round_id' })
  thesisRoundId: number;

  @Column({ name: 'group_type', length: 20, default: 'INDIVIDUAL' })
  groupType: string;

  @Column({ name: 'created_by' })
  createdBy: number;

  @Column({ name: 'min_members', type: 'int', default: 1 })
  minMembers: number;

  @Column({ name: 'max_members', type: 'int', default: 1 })
  maxMembers: number;

  @Column({ name: 'current_members', type: 'int', default: 0 })
  currentMembers: number;

  @Column({ length: 50, default: 'FORMING' })
  status: string;

  @Column({ name: 'locked_at', type: 'timestamp', nullable: true })
  lockedAt?: Date;

  @Column({ name: 'dissolved_at', type: 'timestamp', nullable: true })
  dissolvedAt?: Date;

  @Column({ name: 'dissolution_reason', type: 'text', nullable: true })
  dissolutionReason?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => ThesisRound, (round) => round.groups)
  @JoinColumn({ name: 'thesis_round_id' })
  thesisRound: ThesisRound;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'created_by' })
  creator: Student;

  @OneToMany(() => ThesisGroupMember, (member) => member.group)
  members: ThesisGroupMember[];

  @OneToMany(() => ThesisGroupInvitation, (invitation) => invitation.group)
  invitations: ThesisGroupInvitation[];

  @OneToMany(() => TopicRegistration, (registration) => registration.thesisGroup)
  topicRegistrations: TopicRegistration[];

  @OneToMany(() => Thesis, (thesis) => thesis.thesisGroup)
  theses: Thesis[];
}
