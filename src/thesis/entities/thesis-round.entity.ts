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
import { ThesisType } from './thesis-type.entity';
import { Department } from '../../organization/entities/department.entity';
import { Faculty } from '../../organization/entities/faculty.entity';
import { ProposedTopic } from './proposed-topic.entity';
import { TopicRegistration } from './topic-registration.entity';
import { ThesisRoundClass } from './thesis-round-class.entity';
import { InstructorAssignment } from './instructor-assignment.entity';
import { Thesis } from './thesis.entity';
import { GuidanceProcess } from './guidance-process.entity';
import { DefenseCouncil } from './defense-council.entity';

@Entity('thesis_rounds')
export class ThesisRound {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'round_code', unique: true, length: 20 })
  roundCode: string;

  @Column({ name: 'round_name', length: 255 })
  roundName: string;

  @Column({ name: 'thesis_type_id' })
  thesisTypeId: number;

  @Column({ name: 'department_id', nullable: true })
  departmentId?: number;

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

  @Column({ 
    length: 50, 
    default: 'Preparing',
    transformer: {
      to: (value: string) => value,
      from: (value: string) => value
    }
  })
  status: string; // Preparing, In Progress, Completed

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => ThesisType)
  @JoinColumn({ name: 'thesis_type_id' })
  thesisType: ThesisType;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department?: Department;

  @ManyToOne(() => Faculty, { nullable: true })
  @JoinColumn({ name: 'faculty_id' })
  faculty?: Faculty;

  @OneToMany(() => ProposedTopic, (proposedTopic) => proposedTopic.thesisRound)
  proposedTopics: ProposedTopic[];

  @OneToMany(() => TopicRegistration, (topicRegistration) => topicRegistration.thesisRound)
  topicRegistrations: TopicRegistration[];

  @OneToMany(() => ThesisRoundClass, (thesisRoundClass) => thesisRoundClass.thesisRound)
  thesisRoundClasses: ThesisRoundClass[];

  @OneToMany(() => InstructorAssignment, (instructorAssignment) => instructorAssignment.thesisRound)
  instructorAssignments: InstructorAssignment[];

  @OneToMany(() => Thesis, (thesis) => thesis.thesisRound)
  theses: Thesis[];

  @OneToMany(() => GuidanceProcess, (guidanceProcess) => guidanceProcess.thesisRound)
  guidanceProcesses: GuidanceProcess[];

  @OneToMany(() => DefenseCouncil, (defenseCouncil) => defenseCouncil.thesisRound)
  defenseCouncils: DefenseCouncil[];
}
