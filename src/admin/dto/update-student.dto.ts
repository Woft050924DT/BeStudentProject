import { IsString, IsNumber, IsOptional, IsBoolean, Length, Min, Max } from 'class-validator';

export class UpdateStudentDto {
  @IsOptional()
  @IsNumber()
  classId?: number;

  @IsOptional()
  @IsNumber()
  admissionYear?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(4)
  gpa?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  creditsEarned?: number;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  academicStatus?: string; // Active, On Leave, Withdrawn

  @IsOptional()
  @IsString()
  cvFile?: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}

