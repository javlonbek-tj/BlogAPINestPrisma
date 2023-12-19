import {
  Body,
  Controller,
  Patch,
  Param,
  Post,
  Get,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto, UpdateRoleDto } from './dto';
import { RestricTo } from 'src/decorators/role.decorator';
import { JwtAuthGuard } from 'src/guards/jwt.guard';

@RestricTo('ADMIN')
@Controller('roles')
export class RoleController {
  constructor(private roleService: RoleService) {}

  @Post()
  create(@Body() dto: CreateRoleDto) {
    return this.roleService.createRole(dto);
  }

  @Get()
  getRoles() {
    return this.roleService.getRoles();
  }

  @Get('/:value')
  getRoleByValue(@Param('value') value: string) {
    return this.roleService.getRoleByValue(value);
  }

  @Patch('/:id')
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.roleService.updateRole(id, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/:id')
  delete(@Param('id') id: string) {
    this.roleService.deleteRole(id);
  }
}
