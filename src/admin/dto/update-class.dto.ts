import { IsString, IsNumber, IsOptional, IsBoolean, Length, Min } from 'class-validator';

export class UpdateClassDto {
  @IsOptional()
  @IsString()
  @Length(1, 255)
  className?: string;

  @IsOptional()
  @IsNumber()
  majorId?: number;

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
  @IsBoolean()
  status?: boolean;
}

