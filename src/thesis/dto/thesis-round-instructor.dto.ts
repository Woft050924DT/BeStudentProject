import { IsNotEmpty, IsNumber, IsOptional, IsArray, IsBoolean, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AddInstructorToRoundDto {
  @IsNotEmpty({ message: 'instructorId không được để trống' })
  @IsNumber({}, { message: 'instructorId phải là số' })
  instructorId: number;

  @IsOptional()
  @IsNumber({}, { message: 'maxStudents phải là số' })
  @Min(1, { message: 'maxStudents phải lớn hơn 0' })
  maxStudents?: number; 
}

export class AddMultipleInstructorsDto {
  // Accept either an array of objects (`instructors`) or an array of ids (`instructorIds`).
  @IsOptional()
  @IsArray({ message: 'instructors phải là mảng' })
  @ValidateNested({ each: true })
  @Type(() => AddInstructorToRoundDto)
  instructors?: AddInstructorToRoundDto[];
  // Custom validation sẽ được thực hiện trong service để đảm bảo ít nhất một trong hai thuộc tính được cung cấp
}

export class UpdateInstructorInRoundDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxStudents?: number;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}

export class RemoveInstructorFromRoundDto {
  @IsNotEmpty({ message: 'instructorId không được để trống' })
  @IsNumber({}, { message: 'instructorId phải là số' })
  instructorId: number;
}

export class GetInstructorsInRoundDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  thesisRoundId?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  status?: boolean;
}

