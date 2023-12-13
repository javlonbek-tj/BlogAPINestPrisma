import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoryDto } from './dto';

@Controller('categories')
export class CategoriesController {
  constructor(private categoryService: CategoriesService) {}

  @Post()
  create(@Body() dto: CategoryDto) {
    return this.categoryService.create(dto);
  }

  @Get()
  allCategories() {
    return this.categoryService.allCategories();
  }

  @Get('/:id')
  oneCategory(@Param('id') id: string) {
    return this.categoryService.oneCategory(id);
  }

  @Put('/:id')
  updateCategory(@Param('id') id: string, @Body() dto: CategoryDto) {
    return this.categoryService.updateCategory(id, dto);
  }

  @Delete('/:id')
  deleteCategory(@Param('id') id: string) {
    return this.categoryService.deleteCategory(id);
  }
}
