import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Conversation } from './conversation.entity';
import { Users } from '../../user/user.entity';

@Entity('typing_status')
@Unique(['conversationId', 'userId'])
export class TypingStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'conversation_id' })
  conversationId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'is_typing', default: true })
  isTyping: boolean;

  @CreateDateColumn({ name: 'started_at' })
  startedAt: Date;

  // Relations
  @ManyToOne(() => Conversation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @ManyToOne(() => Users)
  @JoinColumn({ name: 'user_id' })
  user: Users;
}

