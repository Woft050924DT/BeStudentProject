import { IsString, IsNotEmpty, IsNumber, IsOptional, Length } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 10)
  departmentCode: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  departmentName: string;

  @IsNumber()
  facultyId: number;

  @IsOptional()
  @IsNumber()
  headId?: number;

  @IsOptional()
  @IsString()
  description?: string;
}
