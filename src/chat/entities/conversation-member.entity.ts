import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { Conversation } from './conversation.entity';
import { Users } from '../../user/user.entity';
import { Message } from './message.entity';

@Entity('conversation_members')
@Unique(['conversationId', 'userId'])
@Index(['userId', 'isActive'])
@Index(['conversationId', 'isActive'])
@Index(['userId', 'unreadCount'])
export class ConversationMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'conversation_id' })
  conversationId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ length: 20, default: 'MEMBER' })
  role: string; // ADMIN, MEMBER

  @Column({ nullable: true })
  nickname?: string; // Biệt danh trong nhóm

  @Column({ name: 'joined_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  joinedAt: Date;

  @Column({ name: 'left_at', type: 'timestamp', nullable: true })
  leftAt?: Date; // NULL nếu đang trong nhóm

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_muted', default: false })
  isMuted: boolean; // Tắt thông báo

  @Column({ name: 'is_pinned', default: false })
  isPinned: boolean; // Ghim hội thoại

  @Column({ name: 'last_read_message_id', nullable: true })
  lastReadMessageId?: number; // ID tin nhắn cuối đã đọc

  @Column({ name: 'unread_count', default: 0 })
  unreadCount: number; // Số tin nhắn chưa đọc

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Conversation, (conversation) => conversation.conversationMembers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @ManyToOne(() => Users)
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @ManyToOne(() => Message, { nullable: true })
  @JoinColumn({ name: 'last_read_message_id' })
  lastReadMessage?: Message;
}

