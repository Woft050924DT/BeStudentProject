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
import { Department } from './department.entity';
import { Class } from './class.entity';

@Entity('majors')
export class Major {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'major_code', unique: true, length: 10 })
  majorCode: string;

  @Column({ name: 'major_name', length: 255 })
  majorName: string;

  @Column({ name: 'department_id' })
  departmentId: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: true })
  status: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Department, (department) => department.majors)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @OneToMany(() => Class, (classEntity) => classEntity.major)
  classes: Class[];
}
