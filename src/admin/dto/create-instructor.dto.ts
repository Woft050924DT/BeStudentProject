import { IsString, IsNotEmpty, IsNumber, IsOptional, Length } from 'class-validator';

export class CreateInstructorDto {
  @IsNumber()
  userId: number;

  @IsString()
  @IsNotEmpty()
  @Length(2, 20)
  instructorCode: string;

  @IsNumber()
  departmentId: number;

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
}
