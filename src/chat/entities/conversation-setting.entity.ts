import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Conversation } from './conversation.entity';

@Entity('conversation_settings')
export class ConversationSetting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'conversation_id', unique: true })
  conversationId: number;

  @Column({ name: 'allow_member_invite', default: true })
  allowMemberInvite: boolean; // Cho phép thành viên mời người khác

  @Column({ name: 'allow_member_remove', default: false })
  allowMemberRemove: boolean; // Cho phép thành viên xóa người khác

  @Column({ name: 'allow_name_change', default: true })
  allowNameChange: boolean; // Cho phép đổi tên nhóm

  @Column({ name: 'allow_avatar_change', default: true })
  allowAvatarChange: boolean; // Cho phép đổi ảnh đại diện

  @Column({ name: 'require_admin_approval', default: false })
  requireAdminApproval: boolean; // Yêu cầu admin duyệt tin nhắn

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToOne(() => Conversation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;
}

