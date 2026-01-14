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
import { Faculty } from './faculty.entity';
import { Instructor } from '../../instructor/entities/instructor.entity';
import { Major } from './major.entity';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'department_code', unique: true, length: 10 })
  departmentCode: string;

  @Column({ name: 'department_name', length: 255 })
  departmentName: string;

  @Column({ name: 'faculty_id' })
  facultyId: number;

  @Column({ name: 'head_id', nullable: true })
  headId?: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: true })
  status: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Faculty, (faculty) => faculty.departments)
  @JoinColumn({ name: 'faculty_id' })
  faculty: Faculty;

  @ManyToOne(() => Instructor, { nullable: true })
  @JoinColumn({ name: 'head_id' })
  head?: Instructor;

  @OneToMany(() => Major, (major) => major.department)
  majors: Major[];

  @OneToMany(() => Instructor, (instructor) => instructor.department)
  instructors: Instructor[];
}
