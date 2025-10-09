import { IsNotEmpty, IsOptional, IsString, IsNumber, IsBoolean, MaxLength, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateThesisRoundDto {
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
  thesisTypeId: number;

  @IsOptional()
  @IsNumber()
  departmentId?: number;

  @IsOptional()
  @IsNumber()
  facultyId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  academicYear?: string;

  @IsOptional()
  @IsNumber()
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
}

export class UpdateThesisRoundDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  roundName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  academicYear?: string;

  @IsOptional()
  @IsNumber()
  semester?: number;

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
  status?: string;
}

export class GetThesisRoundsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  thesisTypeId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  departmentId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  facultyId?: number;

  @IsOptional()
  @IsString()
  status?: string;
}
