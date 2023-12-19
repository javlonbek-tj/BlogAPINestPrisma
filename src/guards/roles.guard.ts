import { CanActivate, ExecutionContext } from '@nestjs/common';

class RolesGuard implements CanActivate {
  constructor(private readonly allowedRoles: string[]) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (!request.user) {
      return false;
    }
    return this.allowedRoles.includes(request.user.role);
  }
}

export const Roles = (...roles: string[]) => new RolesGuard(roles);
