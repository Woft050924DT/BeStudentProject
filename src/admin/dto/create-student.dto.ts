import { IsString, IsNotEmpty, IsNumber, IsOptional, Length } from 'class-validator';

export class CreateStudentDto {
  @IsNumber()
  userId: number;

  @IsString()
  @IsNotEmpty()
  @Length(2, 20)
  studentCode: string;

  @IsNumber()
  classId: number;

  @IsOptional()
  @IsNumber()
  admissionYear?: number;

  @IsOptional()
  @IsString()
  cvFile?: string;
}
