import { IsEmail, IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsOptional()
  dateOfBirth?: Date;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}