import { IsNotEmpty, IsOptional, IsString, IsNumber, IsBoolean, MaxLength } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class RegisterTopicDto {
  @IsNotEmpty()
  @IsNumber()
  thesisRoundId: number;

  @IsNotEmpty()
  @IsNumber()
  instructorId: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  studentCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  thesisRoundName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  topicTitle?: string;

  @IsOptional()
  @IsNumber()
  classId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  classCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  status?: string;

  @IsOptional()
  @IsNumber()
  proposedTopicId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  selfProposedTitle?: string;

  @IsOptional()
  @IsString()
  selfProposedDescription?: string;

  @IsOptional()
  @IsString()
  selectionReason?: string;
}

export class ApproveTopicRegistrationDto {
  @IsNotEmpty()
  @IsNumber()
  registrationId: number;

  @IsNotEmpty()
  @IsBoolean()
  approved: boolean;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

export class GetStudentRegistrationsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  thesisRoundId?: number;

  @IsOptional()
  @IsString()
  status?: string; // Pending, Approved, Rejected
}

export class GetMyRegistrationsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;
}

export class ApproveTopicRegistrationByHeadDto {
  @IsNotEmpty()
  @IsNumber()
  registrationId: number;

  @IsNotEmpty()
  @IsBoolean()
  approved: boolean;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

export class GetRegistrationsForHeadApprovalDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  thesisRoundId?: number;

  @IsOptional()
  @IsString()
  status?: string; // Pending, Approved, Rejected (chỉ filter theo headStatus)

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;
}

export class GetAllStudentRegistrationsForHeadDto {
  @IsOptional()
  @Transform(({ value }) => value ? Number(value) : undefined)
  @IsNumber()
  thesisRoundId?: number;

  @IsOptional()
  @IsString()
  instructorStatus?: string; // Pending, Approved, Rejected (filter theo instructorStatus)

  @IsOptional()
  @IsString()
  headStatus?: string; // Pending, Approved, Rejected (filter theo headStatus)

  @IsOptional()
  @Transform(({ value }) => value ? Number(value) : 1)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Transform(({ value }) => value ? Number(value) : 10)
  @IsNumber()
  limit?: number;
}