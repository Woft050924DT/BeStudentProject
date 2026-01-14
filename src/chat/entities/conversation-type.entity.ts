import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { Conversation } from './conversation.entity';

@Entity('conversation_types')
export class ConversationType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'type_code', unique: true, length: 20 })
  typeCode: string; // PRIVATE, GROUP, THESIS_GROUP

  @Column({ name: 'type_name', length: 100 })
  typeName: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: true })
  status: boolean;

  // Relations
  @OneToMany(() => Conversation, (conversation) => conversation.conversationType)
  conversations: Conversation[];
}

