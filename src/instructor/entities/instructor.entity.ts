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
import { Department } from '../../organization/entities/department.entity';
import { Faculty } from '../../organization/entities/faculty.entity';
import { Class } from '../../organization/entities/class.entity';

@Entity('instructors')
export class Instructor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'instructor_code', unique: true, length: 20 })
  instructorCode: string;

  @Column({ name: 'department_id' })
  departmentId: number;

  @Column({ length: 50, nullable: true })
  degree?: string;

  @Column({ name: 'academic_title', length: 50, nullable: true })
  academicTitle?: string;

  @Column({ type: 'text', nullable: true })
  specialization?: string;

  @Column({ name: 'years_of_experience', default: 0 })
  yearsOfExperience: number;

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

  @ManyToOne(() => Department, (department) => department.instructors)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @OneToMany(() => Faculty, (faculty) => faculty.dean)
  facultiesAsDean: Faculty[];

  @OneToMany(() => Department, (department) => department.head)
  departmentsAsHead: Department[];

  @OneToMany(() => Class, (classEntity) => classEntity.advisor)
  classesAsAdvisor: Class[];
}
