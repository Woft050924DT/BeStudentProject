import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Message } from './message.entity';
import { Users } from '../../user/user.entity';

@Entity('message_mentions')
@Unique(['messageId', 'mentionedUserId'])
export class MessageMention {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'message_id' })
  messageId: number;

  @Column({ name: 'mentioned_user_id' })
  mentionedUserId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Message, (message) => message.mentions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'message_id' })
  message: Message;

  @ManyToOne(() => Users)
  @JoinColumn({ name: 'mentioned_user_id' })
  mentionedUser: Users;
}

