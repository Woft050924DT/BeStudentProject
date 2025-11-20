import { IsOptional, IsNumber, IsString, IsBoolean, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class GetStudentsDto {
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
  classId?: number;

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
  search?: string; // Tìm kiếm theo mã sinh viên, tên, email

  @IsOptional()
  @IsString()
  academicStatus?: string; // Lọc theo trạng thái học tập (Active, On Leave, Withdrawn)

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  admissionYear?: number; // Lọc theo năm nhập học

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  status?: boolean; // Lọc theo trạng thái

  @IsOptional()
  @IsString()
  sortBy?: string = 'studentCode'; // studentCode, fullName, createdAt, gpa, admissionYear

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}

