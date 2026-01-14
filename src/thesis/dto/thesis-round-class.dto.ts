import { IsNotEmpty, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AddClassToRoundDto {
  @IsNotEmpty({ message: 'classId không được để trống' })
  @IsNumber({}, { message: 'classId phải là số' })
  classId: number;
}

export class AddMultipleClassesToRoundDto {
  @IsNotEmpty({ message: 'classes không được để trống' })
  @IsArray({ message: 'classes phải là mảng' })
  @ValidateNested({ each: true })
  @Type(() => AddClassToRoundDto)
  classes: AddClassToRoundDto[];
}
