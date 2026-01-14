import { IsString, IsNumber, IsOptional, IsBoolean, Length } from 'class-validator';

export class UpdateInstructorDto {
  @IsOptional()
  @IsNumber()
  departmentId?: number;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  degree?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  academicTitle?: string;

  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsNumber()
  yearsOfExperience?: number;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}

