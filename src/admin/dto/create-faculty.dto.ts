import { IsString, IsNotEmpty, IsOptional, IsEmail, Length } from 'class-validator';

export class CreateFacultyDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 10)
  facultyCode: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  facultyName: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  deanId?: number;
}
