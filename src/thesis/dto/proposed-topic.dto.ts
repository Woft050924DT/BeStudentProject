import { IsNotEmpty, IsString, IsNumber, MaxLength, IsOptional } from 'class-validator';

export class CreateProposedTopicDto {
  @IsNotEmpty({ message: 'Mã đề tài không được để trống' })
  @IsString({ message: 'Mã đề tài phải là chuỗi' })
  @MaxLength(50, { message: 'Mã đề tài không được vượt quá 50 ký tự' })
  topicCode: string;

  @IsNotEmpty({ message: 'Tiêu đề đề tài không được để trống' })
  @IsString({ message: 'Tiêu đề đề tài phải là chuỗi' })
  @MaxLength(500, { message: 'Tiêu đề đề tài không được vượt quá 500 ký tự' })
  topicTitle: string;

  @IsNotEmpty({ message: 'ID giảng viên không được để trống' })
  @IsNumber({}, { message: 'ID giảng viên phải là số' })
  instructorId: number;

  @IsNotEmpty({ message: 'ID đợt luận văn không được để trống' })
  @IsNumber({}, { message: 'ID đợt luận văn phải là số' })
  thesisRoundId: number;

  @IsOptional()
  @IsString({ message: 'Mô tả đề tài phải là chuỗi' })
  topicDescription?: string;

  @IsOptional()
  @IsString({ message: 'Mục tiêu phải là chuỗi' })
  objectives?: string;

  @IsOptional()
  @IsString({ message: 'Yêu cầu sinh viên phải là chuỗi' })
  studentRequirements?: string;

  @IsOptional()
  @IsString({ message: 'Công nghệ sử dụng phải là chuỗi' })
  technologiesUsed?: string;

  @IsOptional()
  @IsString({ message: 'Tài liệu tham khảo phải là chuỗi' })
  topicReferences?: string;
}
