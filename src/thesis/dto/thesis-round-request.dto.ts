import { IsNotEmpty, IsOptional, IsString, IsNumber, MaxLength, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class RequestOpenRoundDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  roundCode: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  roundName: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  thesisTypeId: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  departmentId: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  facultyId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  academicYear?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  semester?: number; // 1: Fall, 2: Spring, 3: Summer

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsDateString()
  topicProposalDeadline?: string;

  @IsOptional()
  @IsDateString()
  registrationDeadline?: string;

  @IsOptional()
  @IsDateString()
  reportSubmissionDeadline?: string;

  @IsOptional()
  @IsString()
  guidanceProcess?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  requestReason?: string;
}
