import { IsOptional, IsString } from 'class-validator';
import { UpdateHeadProfileDto } from '../../thesis/dto/head-profile.dto';

export class UpdateTeacherProfileDto extends UpdateHeadProfileDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  joinDate?: string;
}
