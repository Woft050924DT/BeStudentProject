import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Message } from './message.entity';

@Entity('message_attachments')
@Index(['messageId'])
export class MessageAttachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'message_id' })
  messageId: number;

  @Column({ name: 'file_name', length: 255 })
  fileName: string;

  @Column({ name: 'file_path', length: 500 })
  filePath: string;

  @Column({ name: 'file_type', length: 50, nullable: true })
  fileType?: string; // image/jpeg, application/pdf, etc.

  @Column({ name: 'file_size', type: 'bigint', nullable: true })
  fileSize?: number; // Kích thước file (bytes)

  @Column({ name: 'thumbnail_path', length: 500, nullable: true })
  thumbnailPath?: string; // Ảnh thumbnail cho hình/video

  @Column({ nullable: true })
  duration?: number; // Thời lượng cho audio/video (seconds)

  @Column({ nullable: true })
  width?: number; // Chiều rộng hình ảnh

  @Column({ nullable: true })
  height?: number; // Chiều cao hình ảnh

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Message, (message) => message.attachments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'message_id' })
  message: Message;
}

