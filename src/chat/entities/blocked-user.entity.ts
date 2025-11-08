import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Users } from '../../user/user.entity';

@Entity('blocked_users')
@Unique(['blockerId', 'blockedId'])
export class BlockedUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'blocker_id' })
  blockerId: number; // Người chặn

  @Column({ name: 'blocked_id' })
  blockedId: number; // Người bị chặn

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @CreateDateColumn({ name: 'blocked_at' })
  blockedAt: Date;

  // Relations
  @ManyToOne(() => Users)
  @JoinColumn({ name: 'blocker_id' })
  blocker: Users;

  @ManyToOne(() => Users)
  @JoinColumn({ name: 'blocked_id' })
  blocked: Users;
}

