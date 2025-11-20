import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { ThesisRound } from './thesis-round.entity';
import { Instructor } from '../../instructor/entities/instructor.entity';

@Entity('instructor_assignments')
@Unique(['thesisRoundId', 'instructorId'])
export class InstructorAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'thesis_round_id' })
  thesisRoundId: number;

  @Column({ name: 'instructor_id' })
  instructorId: number;

  @Column({
    name: 'supervision_quota',
    default: 0,
    comment: 'Số lượng sinh viên tối đa mà giảng viên có thể hướng dẫn',
  })
  supervisionQuota: number;

  @Column({
    name: 'current_load',
    default: 0,
    comment: 'Số lượng sinh viên hiện tại đang hướng dẫn',
  })
  currentLoad: number;

  @Column({ type: 'text', nullable: true, comment: 'Ghi chú về phân công' })
  notes?: string;

  @Column({
    name: 'added_by',
    nullable: true,
    comment: 'ID của người thêm giảng viên vào đợt',
  })
  addedBy?: number;

  @Column({ default: true, comment: 'Trạng thái hoạt động của phân công' })
  status: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => ThesisRound, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'thesis_round_id' })
  thesisRound: ThesisRound;

  @ManyToOne(() => Instructor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'instructor_id' })
  instructor: Instructor;
}
