import { CanActivate, ExecutionContext } from '@nestjs/common';

export class RoleGuard implements CanActivate {
  constructor(private readonly allowedRoles: string[]) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    console.log(this.allowedRoles);

    if (!request.user) {
      console.log(1);
      return false;
    }
    console.log(request.user);

    return this.allowedRoles.includes(request.user.role.value);
  }
}
