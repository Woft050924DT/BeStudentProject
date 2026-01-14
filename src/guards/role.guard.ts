import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user) {
      throw new ForbiddenException('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
    }
    
    if (!user.roles || !Array.isArray(user.roles) || user.roles.length === 0) {
      throw new ForbiddenException(
        `Bạn không có quyền truy cập. Yêu cầu một trong các role: ${requiredRoles.join(', ')}. ` +
        `Role hiện tại của bạn: không có role.`
      );
    }
    
    const hasRequiredRole = requiredRoles.some((role) => user.roles.includes(role));
    
    if (!hasRequiredRole) {
      throw new ForbiddenException(
        `Bạn không có quyền truy cập. Yêu cầu một trong các role: ${requiredRoles.join(', ')}. ` +
        `Role hiện tại của bạn: ${user.roles.join(', ')}.`
      );
    }
    
    return true;
  }
}
