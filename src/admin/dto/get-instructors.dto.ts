import { IsOptional, IsNumber, IsString, IsBoolean, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class GetInstructorsDto {
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
  departmentId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  facultyId?: number;

  @IsOptional()
  @IsString()
  search?: string; // Tìm kiếm theo mã giảng viên, tên, email

  @IsOptional()
  @IsString()
  degree?: string; // Lọc theo học vị

  @IsOptional()
  @IsString()
  academicTitle?: string; // Lọc theo chức danh

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  status?: boolean; // Lọc theo trạng thái

  @IsOptional()
  @IsString()
  sortBy?: string = 'instructorCode'; // instructorCode, fullName, createdAt, yearsOfExperience

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}

