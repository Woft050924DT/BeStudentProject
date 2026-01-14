import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Conversation } from './conversation.entity';
import { Users } from '../../user/user.entity';
import { MessageType } from './message-type.entity';
import { MessageAttachment } from './message-attachment.entity';
import { MessageReaction } from './message-reaction.entity';
import { MessageReadStatus } from './message-read-status.entity';
import { MessageMention } from './message-mention.entity';

@Entity('messages')
@Index(['conversationId', 'createdAt'])
@Index(['senderId'])
@Index(['parentMessageId'])
@Index(['isDeleted'])
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'conversation_id' })
  conversationId: number;

  @Column({ name: 'sender_id' })
  senderId: number;

  @Column({ name: 'message_type_id' })
  messageTypeId: number;

  @Column({ type: 'text', nullable: true })
  content?: string; // Nội dung tin nhắn

  @Column({ name: 'parent_message_id', nullable: true })
  parentMessageId?: number; // Tin nhắn trả lời (reply)

  @Column({ name: 'is_edited', default: false })
  isEdited: boolean;

  @Column({ name: 'is_deleted', default: false })
  isDeleted: boolean;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Conversation, (conversation) => conversation.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @ManyToOne(() => Users)
  @JoinColumn({ name: 'sender_id' })
  sender: Users;

  @ManyToOne(() => MessageType, (messageType) => messageType.messages)
  @JoinColumn({ name: 'message_type_id' })
  messageType: MessageType;

  @ManyToOne(() => Message, { nullable: true })
  @JoinColumn({ name: 'parent_message_id' })
  parentMessage?: Message;

  @OneToMany(() => MessageAttachment, (messageAttachment) => messageAttachment.message)
  attachments: MessageAttachment[];

  @OneToMany(() => MessageReaction, (messageReaction) => messageReaction.message)
  reactions: MessageReaction[];

  @OneToMany(() => MessageReadStatus, (messageReadStatus) => messageReadStatus.message)
  readStatuses: MessageReadStatus[];

  @OneToMany(() => MessageMention, (messageMention) => messageMention.message)
  mentions: MessageMention[];
}

