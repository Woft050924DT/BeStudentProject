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

@Entity('message_reactions')
@Unique(['messageId', 'userId'])
@Index(['messageId'])
@Index(['userId'])
export class MessageReaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'message_id' })
  messageId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'reaction_type', length: 20 })
  reactionType: string; // like, love, haha, etc.

  @Column({ name: 'reaction_icon', length: 10, nullable: true })
  reactionIcon?: string; // Emoji icon

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Message, (message) => message.reactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'message_id' })
  message: Message;

  @ManyToOne(() => Users)
  @JoinColumn({ name: 'user_id' })
  user: Users;
}

