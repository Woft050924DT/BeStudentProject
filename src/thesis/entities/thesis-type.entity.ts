import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('thesis_types')
export class ThesisType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  typeCode: string;

  @Column({ type: 'varchar', length: 100 })
  typeName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  hasReview: boolean;

  @Column({ type: 'boolean', default: true })
  hasDefense: boolean;

  @Column({ type: 'int', default: 1 })
  reviewerCount: number;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
