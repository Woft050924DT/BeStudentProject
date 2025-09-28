import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';

export enum ApprovalStatus {
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  PENDING = 'Pending'
}

export class ApproveTopicDto {
  @IsNotEmpty({ message: 'Trạng thái phê duyệt không được để trống' })
  @IsEnum(ApprovalStatus, { message: 'Trạng thái phê duyệt không hợp lệ' })
  status: ApprovalStatus;

  @IsOptional()
  @IsString({ message: 'Lý do từ chối phải là chuỗi' })
  rejectionReason?: string;
}
