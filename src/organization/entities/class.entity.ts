import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Major } from './major.entity';
import { Instructor } from '../../instructor/entities/instructor.entity';
import { Student } from '../../student/entities/student.entity';

@Entity('classes')
export class Class {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'class_code', unique: true, length: 20 })
  classCode: string;

  @Column({ name: 'class_name', length: 255 })
  className: string;

  @Column({ name: 'major_id' })
  majorId: number;

  @Column({ name: 'academic_year', length: 10, nullable: true })
  academicYear?: string;

  @Column({ name: 'student_count', default: 0 })
  studentCount: number;

  @Column({ name: 'advisor_id', nullable: true })
  advisorId?: number;

  @Column({ default: true })
  status: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Major, (major) => major.classes)
  @JoinColumn({ name: 'major_id' })
  major: Major;

  @ManyToOne(() => Instructor, { nullable: true })
  @JoinColumn({ name: 'advisor_id' })
  advisor?: Instructor;

  @OneToMany(() => Student, (student) => student.classEntity)
  students: Student[];
}
