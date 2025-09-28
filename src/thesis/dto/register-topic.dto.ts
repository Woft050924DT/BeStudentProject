import { IsNotEmpty, IsOptional, IsString, IsNumber, MaxLength, IsEnum } from 'class-validator';

export class RegisterTopicDto {
  @IsNotEmpty({ message: 'ID sinh viên không được để trống' })
  @IsNumber({}, { message: 'ID sinh viên phải là số' })
  studentId: number;

  @IsNotEmpty({ message: 'ID đợt luận văn không được để trống' })
  @IsNumber({}, { message: 'ID đợt luận văn phải là số' })
  thesisRoundId: number;

  @IsNotEmpty({ message: 'ID giảng viên hướng dẫn không được để trống' })
  @IsNumber({}, { message: 'ID giảng viên hướng dẫn phải là số' })
  instructorId: number;

  @IsOptional()
  @IsNumber({}, { message: 'ID đề tài đề xuất phải là số' })
  proposedTopicId?: number;

  @IsOptional()
  @IsString({ message: 'Tiêu đề đề tài tự đề xuất phải là chuỗi' })
  @MaxLength(500, { message: 'Tiêu đề đề tài không được vượt quá 500 ký tự' })
  selfProposedTitle?: string;

  @IsOptional()
  @IsString({ message: 'Mô tả đề tài tự đề xuất phải là chuỗi' })
  selfProposedDescription?: string;

  @IsOptional()
  @IsString({ message: 'Lý do chọn đề tài phải là chuỗi' })
  selectionReason?: string;
}
