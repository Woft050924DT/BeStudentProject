import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Department } from './department.entity';
import { Instructor } from '../../instructor/entities/instructor.entity';

@Entity('faculties')
export class Faculty {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'faculty_code', unique: true, length: 10 })
  facultyCode: string;

  @Column({ name: 'faculty_name', length: 255 })
  facultyName: string;

  @Column({ name: 'dean_id', nullable: true })
  deanId?: number;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ length: 15, nullable: true })
  phone?: string;

  @Column({ length: 100, nullable: true })
  email?: string;

  @Column({ default: true })
  status: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => Department, (department) => department.faculty)
  departments: Department[];

  @ManyToOne(() => Instructor, { nullable: true })
  @JoinColumn({ name: 'dean_id' })
  dean?: Instructor;
}
