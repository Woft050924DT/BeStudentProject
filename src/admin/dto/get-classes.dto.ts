import { IsOptional, IsNumber, IsString, IsBoolean, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class GetClassesDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  majorId?: number;

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
  search?: string; // Tìm kiếm theo mã lớp, tên lớp

  @IsOptional()
  @IsString()
  academicYear?: string; // Lọc theo khóa học (K19, K20...)

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  advisorId?: number; // Lọc theo cố vấn học tập

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  status?: boolean; // Lọc theo trạng thái

  @IsOptional()
  @IsString()
  sortBy?: string = 'classCode'; // classCode, className, createdAt, studentCount

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}

