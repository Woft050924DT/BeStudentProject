import { IsNotEmpty, IsNumber, IsOptional, IsArray, IsDateString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AssignReviewerDto {
  @IsNotEmpty({ message: 'thesisId không được để trống' })
  @IsNumber({}, { message: 'thesisId phải là số' })
  thesisId: number;

  @IsNotEmpty({ message: 'reviewerId không được để trống' })
  @IsNumber({}, { message: 'reviewerId phải là số' })
  reviewerId: number;

  @IsOptional()
  @IsNumber({}, { message: 'reviewOrder phải là số' })
  @Min(1, { message: 'reviewOrder phải lớn hơn 0' })
  reviewOrder?: number; // Thứ tự phản biện (1, 2, ...)

  @IsOptional()
  @IsDateString({}, { message: 'reviewDeadline phải là định dạng ngày hợp lệ' })
  reviewDeadline?: string; // Hạn phản biện
}

export class AssignMultipleReviewersDto {
  @IsNotEmpty({ message: 'assignments không được để trống' })
  @IsArray({ message: 'assignments phải là mảng' })
  @ValidateNested({ each: true })
  @Type(() => AssignReviewerDto)
  assignments: AssignReviewerDto[];
}

