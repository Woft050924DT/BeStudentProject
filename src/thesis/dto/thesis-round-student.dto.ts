import { IsNotEmpty, IsNumber, IsOptional, IsArray, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AddStudentToRoundDto {
  @IsNotEmpty({ message: 'studentId không được để trống' })
  @IsNumber({}, { message: 'studentId phải là số' })
  studentId: number;

  @IsOptional()
  @IsBoolean()
  eligible?: boolean;

  @IsOptional()
  notes?: string;
}

export class AddMultipleStudentsToRoundDto {
  @IsNotEmpty({ message: 'students không được để trống' })
  @IsArray({ message: 'students phải là mảng' })
  @ValidateNested({ each: true })
  @Type(() => AddStudentToRoundDto)
  students: AddStudentToRoundDto[];
}
