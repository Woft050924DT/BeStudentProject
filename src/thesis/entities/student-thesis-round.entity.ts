import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { ThesisRound } from './thesis-round.entity';
import { Student } from '../../student/entities/student.entity';

@Entity('student_thesis_rounds')
@Unique(['thesisRoundId', 'studentId'])
export class StudentThesisRound {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'thesis_round_id' })
  thesisRoundId: number;

  @Column({ name: 'student_id' })
  studentId: number;

  @Column({ default: true, comment: 'Đủ điều kiện tham gia' })
  eligible: boolean;

  @Column({ type: 'text', nullable: true, comment: 'Ghi chú' })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => ThesisRound, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'thesis_round_id' })
  thesisRound: ThesisRound;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;
}
