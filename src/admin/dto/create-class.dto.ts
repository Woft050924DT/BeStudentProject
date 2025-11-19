import { IsString, IsNotEmpty, IsNumber, IsOptional, Length, Min } from 'class-validator';

export class CreateClassDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 20)
  classCode: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  className: string;

  @IsNumber()
  @IsNotEmpty()
  majorId: number;

  @IsOptional()
  @IsString()
  @Length(1, 10)
  academicYear?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  studentCount?: number;

  @IsOptional()
  @IsNumber()
  advisorId?: number;

  @IsOptional()
  status?: boolean;
}

