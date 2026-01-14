import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ThesisGroup } from './thesis-group.entity';
import { Student } from '../../student/entities/student.entity';

@Entity('thesis_group_invitations')
export class ThesisGroupInvitation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'thesis_group_id' })
  thesisGroupId: number;

  @Column({ name: 'invited_student_id' })
  invitedStudentId: number;

  @Column({ name: 'invited_by' })
  invitedBy: number;

  @Column({ name: 'invitation_message', type: 'text', nullable: true })
  invitationMessage?: string;

  @Column({ length: 20, default: 'PENDING' })
  status: string;

  @Column({ name: 'sent_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  sentAt: Date;

  @Column({ name: 'responded_at', type: 'timestamp', nullable: true })
  respondedAt?: Date;

  @Column({ name: 'response_message', type: 'text', nullable: true })
  responseMessage?: string;

  @Column({
    name: 'expires_at',
    type: 'timestamp',
    default: () => "(CURRENT_TIMESTAMP + INTERVAL '7 days')",
  })
  expiresAt: Date;

  @ManyToOne(() => ThesisGroup, (group) => group.invitations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'thesis_group_id' })
  group: ThesisGroup;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'invited_student_id' })
  invitedStudent: Student;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'invited_by' })
  inviter: Student;
}
