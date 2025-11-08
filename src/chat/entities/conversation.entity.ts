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
import { ConversationType } from './conversation-type.entity';
import { Users } from '../../user/user.entity';
import { Thesis } from '../../thesis/entities/thesis.entity';
import { ConversationMember } from './conversation-member.entity';
import { Message } from './message.entity';

@Entity('conversations')
@Index(['conversationTypeId'])
@Index(['thesisId'])
@Index(['lastMessageAt'])
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'conversation_type_id' })
  conversationTypeId: number;

  @Column({ name: 'conversation_name', length: 255, nullable: true })
  conversationName?: string; // Tên nhóm (NULL nếu là chat riêng)

  @Column({ name: 'conversation_avatar', nullable: true })
  conversationAvatar?: string; // Ảnh đại diện nhóm

  @Column({ name: 'created_by_id' })
  createdById: number; // Người tạo

  @Column({ name: 'thesis_id', nullable: true })
  thesisId?: number; // Liên kết đến đề tài (nếu là THESIS_GROUP)

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'last_message_at', type: 'timestamp', nullable: true })
  lastMessageAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => ConversationType, (conversationType) => conversationType.conversations)
  @JoinColumn({ name: 'conversation_type_id' })
  conversationType: ConversationType;

  @ManyToOne(() => Users)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: Users;

  @ManyToOne(() => Thesis, { nullable: true })
  @JoinColumn({ name: 'thesis_id' })
  thesis?: Thesis;

  @OneToMany(() => ConversationMember, (conversationMember) => conversationMember.conversation)
  conversationMembers: ConversationMember[];

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];
}

