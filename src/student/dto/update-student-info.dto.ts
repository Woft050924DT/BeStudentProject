import { IsOptional, IsString, IsDateString, IsEmail, MaxLength, IsEnum } from 'class-validator';

export class UpdateStudentInfoDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  studentCode?: string; // Mã sinh viên

  @IsOptional()
  @IsString()
  @MaxLength(50)
  academicStatus?: string; // Tên trạng thái (Active, On Leave, Withdrawn)

  @IsOptional()
  @IsString()
  @MaxLength(255)
  fullName?: string; // Tên sinh viên

  @IsOptional()
  classId?: string | number; // Mã lớp (có thể là ID số hoặc mã lớp dạng string như "HTTT_K19")

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string; // Ngày sinh (dd/mm/yyyy)

  @IsOptional()
  @IsEnum(['Male', 'Female', 'Other'])
  gender?: string; // Giới tính

  @IsOptional()
  @IsString()
  @MaxLength(15)
  phone?: string; // Số điện thoại

  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string; // Email

  @IsOptional()
  @IsString()
  cvFile?: string; // CV giới thiệu (file path)
}

