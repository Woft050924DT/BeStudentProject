import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ThesisType } from './thesis-type.entity';
import { Department } from '../../organization/entities/department.entity';
import { Faculty } from '../../organization/entities/faculty.entity';
import { ProposedTopic } from './proposed-topic.entity';
import { TopicRegistration } from './topic-registration.entity';

@Entity('thesis_rounds')
export class ThesisRound {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  roundCode: string;

  @Column({ type: 'varchar', length: 255 })
  roundName: string;

  @Column()
  thesisTypeId: number;

  @ManyToOne(() => ThesisType)
  @JoinColumn({ name: 'thesisTypeId' })
  thesisType: ThesisType;

  @Column({ nullable: true })
  departmentId: number;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @Column({ nullable: true })
  facultyId: number;

  @ManyToOne(() => Faculty, { nullable: true })
  @JoinColumn({ name: 'facultyId' })
  faculty: Faculty;

  @Column({ type: 'varchar', length: 20, nullable: true })
  academicYear: string;

  @Column({ type: 'int', nullable: true })
  semester: number;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'date', nullable: true })
  topicProposalDeadline: Date;

  @Column({ type: 'date', nullable: true })
  registrationDeadline: Date;

  @Column({ type: 'date', nullable: true })
  reportSubmissionDeadline: Date;

  @Column({ type: 'text', nullable: true })
  guidanceProcess: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'varchar', length: 50, default: 'Preparing' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ProposedTopic, proposedTopic => proposedTopic.thesisRound)
  proposedTopics: ProposedTopic[];

  @OneToMany(() => TopicRegistration, topicRegistration => topicRegistration.thesisRound)
  topicRegistrations: TopicRegistration[];
}
