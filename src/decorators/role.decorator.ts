import { UseGuards } from '@nestjs/common';
import { RoleGuard } from 'src/guards/role.guard';

export function RestricTo(...roles: string[]) {
  return UseGuards(new RoleGuard(roles));
}
