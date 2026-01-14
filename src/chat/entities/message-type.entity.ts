import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { Message } from './message.entity';

@Entity('message_types')
export class MessageType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'type_code', unique: true, length: 20 })
  typeCode: string; // TEXT, IMAGE, FILE, VIDEO, AUDIO, LINK, NOTIFICATION, STICKER

  @Column({ name: 'type_name', length: 100 })
  typeName: string;

  @Column({ length: 50, nullable: true })
  icon?: string;

  @Column({ default: true })
  status: boolean;

  // Relations
  @OneToMany(() => Message, (message) => message.messageType)
  messages: Message[];
}

