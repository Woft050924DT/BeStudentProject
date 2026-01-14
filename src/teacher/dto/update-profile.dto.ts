import { IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  code: string;

  @IsString()
  fullName: string;

  @IsString()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  position: string;

  @IsString()
  degree: string;

  @IsString()
  department: string;

  @IsString()
  joinDate: string;
}
