import { IsEnum, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { UserRole } from '../../models/enum/userRole.enum';

export class AssignRoleDto {
  @IsNumber()
  userId: number;

  @IsEnum(UserRole)
  role: UserRole;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}
