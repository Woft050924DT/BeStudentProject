import { IsOptional, IsString, IsDateString, IsEmail, MaxLength } from 'class-validator';

export class UpdateTeacherInfoDto {
  // Mã giảng viên
  @IsOptional()
  @IsString()
  @MaxLength(20)
  code?: string; // Mã giảng viên

  // Họ và tên
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fullName?: string; // Họ và tên

  // Email
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string; // Email

  // Số điện thoại
  @IsOptional()
  @IsString()
  @MaxLength(15)
  phone?: string; // Số điện thoại

  // Chức vụ
  @IsOptional()
  @IsString()
  @MaxLength(50)
  position?: string; // Chức vụ (Giảng viên, Phó Giáo sư, Giáo sư, ...)

  // Học vị
  @IsOptional()
  @IsString()
  @MaxLength(50)
  degree?: string; // Học vị (Thạc sĩ, Tiến sĩ, ...)

  // Khoa/Bộ môn (có thể là ID hoặc mã bộ môn)
  @IsOptional()
  @IsString()
  department?: string; // Khoa/Bộ môn (có thể là ID hoặc departmentCode như "CNTT")

  // Ngày vào làm
  @IsOptional()
  @IsDateString()
  joinDate?: string; // Ngày vào làm (dd/mm/yyyy hoặc yyyy-mm-dd)
}

