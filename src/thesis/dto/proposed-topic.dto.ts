import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  MaxLength,
} from 'class-validator';
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

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxStudents?: number; // Trường này được frontend gửi nhưng không được lưu vào entity

  @IsOptional()
  @IsString()
  notes?: string; // Trường này được frontend gửi nhưng không được lưu vào entity
}

export class UpdateProposedTopicDto {
  @IsNumber()
  topicId: number; // ID đề tài, bắt buộc

  @IsNumber()
  instructorId: number; // ID giảng viên, bắt buộc

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

export class SearchProposedTopicDto {
  @IsOptional()
  @IsString()
  query?: string; // từ khóa tìm kiếm
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
