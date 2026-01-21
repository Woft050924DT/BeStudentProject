import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Thesis } from './thesis.entity';
import { Student } from '../../student/entities/student.entity';

@Entity('thesis_tasks')
export class ThesisTask {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'thesis_id' })
  thesisId: number;

  @Column({ name: 'task_name', length: 255 })
  taskName: string;

  @Column({ name: 'task_description', type: 'text', nullable: true })
  taskDescription?: string;

  @Column({ name: 'assigned_to', nullable: true })
  assignedTo?: number;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate?: Date;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate?: Date;

  @Column({ name: 'completed_date', type: 'date', nullable: true })
  completedDate?: Date;

  @Column({ length: 50, default: 'PENDING' })
  status: string;

  @Column({ length: 20, default: 'MEDIUM' })
  priority: string;

  @Column({ name: 'progress_percentage', type: 'int', default: 0 })
  progressPercentage: number;

  @Column({ name: 'attachment_file', nullable: true })
  attachmentFile?: string;

  @Column({ name: 'created_by', nullable: true })
  createdBy?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Thesis, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'thesis_id' })
  thesis: Thesis;

  @ManyToOne(() => Student, { nullable: true })
  @JoinColumn({ name: 'assigned_to' })
  assignee?: Student;

  @ManyToOne(() => Student, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator?: Student;
}
