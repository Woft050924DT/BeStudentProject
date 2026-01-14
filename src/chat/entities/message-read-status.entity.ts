import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { Message } from './message.entity';
import { Users } from '../../user/user.entity';

@Entity('message_read_status')
@Unique(['messageId', 'userId'])
@Index(['messageId'])
@Index(['userId'])
export class MessageReadStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'message_id' })
  messageId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @CreateDateColumn({ name: 'read_at' })
  readAt: Date;

  // Relations
  @ManyToOne(() => Message, (message) => message.readStatuses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'message_id' })
  message: Message;

  @ManyToOne(() => Users)
  @JoinColumn({ name: 'user_id' })
  user: Users;
}

