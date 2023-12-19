import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ROLE_ALREADY_EXISTS_ERROR,
  ROLE_NOT_FOUND_ERROR,
} from './role.constants';
import { CreateRoleDto, UpdateRoleDto } from './dto';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  async createRole(dto: CreateRoleDto) {
    const isRoleExists = await this.prisma.role.findUnique({
      where: { value: dto.value },
    });
    if (isRoleExists) {
      throw new BadRequestException(ROLE_ALREADY_EXISTS_ERROR);
    }
    return this.prisma.role.create({
      data: {
        ...dto,
      },
    });
  }

  getRoles() {
    return this.prisma.role.findMany();
  }

  async getRoleByValue(value: string) {
    const role = await this.prisma.role.findUnique({ where: { value } });
    if (!role) {
      throw new NotFoundException(ROLE_NOT_FOUND_ERROR);
    }
    return role;
  }

  async updateRole(roleId: string, dto: UpdateRoleDto) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException(ROLE_NOT_FOUND_ERROR);
    }
    return this.prisma.role.update({ where: { id: roleId }, data: { ...dto } });
  }

  async deleteRole(roleId: string) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException(ROLE_NOT_FOUND_ERROR);
    }
    return this.prisma.role.delete({ where: { id: roleId } });
  }
}
