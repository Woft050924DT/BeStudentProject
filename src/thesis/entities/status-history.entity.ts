import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Users } from '../../user/user.entity';

@Entity('status_history')
@Index(['tableName', 'recordId'])
export class StatusHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'table_name', length: 50 })
  tableName: string; // Related table name: theses, topic_registrations, etc.

  @Column({ name: 'record_id' })
  recordId: number; // ID of the record in the related table

  @Column({ name: 'old_status', length: 100, nullable: true })
  oldStatus?: string;

  @Column({ name: 'new_status', length: 100, nullable: true })
  newStatus?: string;

  @Column({ name: 'changed_by_id', nullable: true })
  changedById?: number;

  @Column({ name: 'change_reason', type: 'text', nullable: true })
  changeReason?: string;

  @CreateDateColumn({ name: 'change_date' })
  changeDate: Date;

  // Relations
  @ManyToOne(() => Users, { nullable: true })
  @JoinColumn({ name: 'changed_by_id' })
  changedBy?: Users;
}

