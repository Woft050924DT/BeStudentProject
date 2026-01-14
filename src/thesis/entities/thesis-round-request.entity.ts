import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Department } from '../../organization/entities/department.entity';
import { Faculty } from '../../organization/entities/faculty.entity';
import { ThesisType } from './thesis-type.entity';
import { Users } from '../../user/user.entity';

@Entity('thesis_round_requests')
export class ThesisRoundRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'round_code', length: 20 })
  roundCode: string;

  @Column({ name: 'round_name', length: 255 })
  roundName: string;

  @Column({ name: 'thesis_type_id' })
  thesisTypeId: number;

  @Column({ name: 'department_id' })
  departmentId: number;

  @Column({ name: 'faculty_id', nullable: true })
  facultyId?: number;

  @Column({ name: 'academic_year', length: 20, nullable: true })
  academicYear?: string;

  @Column({ 
    type: 'int', 
    nullable: true,
    transformer: {
      to: (value: number) => value,
      from: (value: number) => value
    }
  })
  semester?: number; // 1: Fall, 2: Spring, 3: Summer

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate?: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate?: Date;

  @Column({ name: 'topic_proposal_deadline', type: 'date', nullable: true })
  topicProposalDeadline?: Date;

  @Column({ name: 'registration_deadline', type: 'date', nullable: true })
  registrationDeadline?: Date;

  @Column({ name: 'report_submission_deadline', type: 'date', nullable: true })
  reportSubmissionDeadline?: Date;

  @Column({ name: 'guidance_process', type: 'text', nullable: true })
  guidanceProcess?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'request_reason', type: 'text', nullable: true })
  requestReason?: string;

  @Column({ name: 'requested_by_id' })
  requestedById: number;

  @Column({ 
    length: 50, 
    default: 'Pending',
    transformer: {
      to: (value: string) => value,
      from: (value: string) => value
    }
  })
  status: string; // Pending, Approved, Rejected

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason?: string;

  @Column({ name: 'approved_at', nullable: true })
  approvedAt?: Date;

  @Column({ name: 'rejected_at', nullable: true })
  rejectedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => ThesisType)
  @JoinColumn({ name: 'thesis_type_id' })
  thesisType: ThesisType;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @ManyToOne(() => Faculty, { nullable: true })
  @JoinColumn({ name: 'faculty_id' })
  faculty?: Faculty;

  @ManyToOne(() => Users)
  @JoinColumn({ name: 'requested_by_id' })
  requestedBy: Users;
}
