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
import { Users } from '../../user/user.entity';
import { Class } from '../../organization/entities/class.entity';
import { TopicRegistration } from '../../thesis/entities/topic-registration.entity';
import { Thesis } from '../../thesis/entities/thesis.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'student_code', unique: true, length: 20 })
  studentCode: string;

  @Column({ name: 'class_id' })
  classId: number;

  @Column({ name: 'admission_year', nullable: true })
  admissionYear?: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  gpa?: number;

  @Column({ name: 'credits_earned', default: 0 })
  creditsEarned: number;

  @Column({ name: 'academic_status', default: 'Active', length: 50 })
  academicStatus: string;

  @Column({ name: 'cv_file', nullable: true })
  cvFile?: string;

  @Column({ default: true })
  status: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @ManyToOne(() => Class, (classEntity) => classEntity.students)
  @JoinColumn({ name: 'class_id' })
  classEntity: Class;

  @OneToMany(() => TopicRegistration, (topicRegistration) => topicRegistration.student)
  topicRegistrations: TopicRegistration[];

  @OneToMany(() => Thesis, (thesis) => thesis.student)
  theses: Thesis[];
}