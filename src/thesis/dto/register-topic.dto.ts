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