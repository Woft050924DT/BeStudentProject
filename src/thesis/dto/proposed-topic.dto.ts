import { IsNotEmpty, IsOptional, IsString, IsNumber, IsBoolean, MaxLength } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateProposedTopicDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  topicCode: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  topicTitle: string;

  @IsNotEmpty()
  @IsNumber()
  instructorId: number;

  @IsNotEmpty()
  @IsNumber()
  thesisRoundId: number;

  @IsOptional()
  @IsString()
  topicDescription?: string;

  @IsOptional()
  @IsString()
  objectives?: string;

  @IsOptional()
  @IsString()
  studentRequirements?: string;

  @IsOptional()
  @IsString()
  technologiesUsed?: string;

  @IsOptional()
  @IsString()
  topicReferences?: string;
}

export class UpdateProposedTopicDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  topicTitle?: string;

  @IsOptional()
  @IsString()
  topicDescription?: string;

  @IsOptional()
  @IsString()
  objectives?: string;

  @IsOptional()
  @IsString()
  studentRequirements?: string;

  @IsOptional()
  @IsString()
  technologiesUsed?: string;

  @IsOptional()
  @IsString()
  topicReferences?: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}

export class GetProposedTopicsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  thesisRoundId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  instructorId?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isTaken?: boolean;

  @IsOptional()
  @IsString()
  search?: string; // Tìm kiếm theo tiêu đề hoặc mô tả

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt'; // createdAt, topicTitle, instructorName

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
