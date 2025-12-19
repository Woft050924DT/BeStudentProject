import { IsOptional, IsString, IsEmail, MaxLength, IsNumber, Min } from 'class-validator';

export class UpdateHeadProfileDto {
  // Mã giảng viên
  @IsOptional()
  @IsString()
  @MaxLength(20)
  instructorCode?: string;

  // Họ và tên
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fullName?: string;

  // Email
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  // Số điện thoại
  @IsOptional()
  @IsString()
  @MaxLength(15)
  phone?: string;

  // Chức danh (academic title)
  @IsOptional()
  @IsString()
  @MaxLength(50)
  academicTitle?: string;

  // Học vị
  @IsOptional()
  @IsString()
  @MaxLength(50)
  degree?: string;

  // Chuyên môn
  @IsOptional()
  @IsString()
  specialization?: string;

  // Số năm kinh nghiệm
  @IsOptional()
  @IsNumber()
  @Min(0)
  yearsOfExperience?: number;
}
