import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoryDto } from './dto';
import {
  CATEGORY_ALREADY_EXISTS_ERROR,
  CATEGORY_NOT_FOUND_ERROR,
} from './categories.constants';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}
  async create({ title }: CategoryDto) {
    const isCategoryExist = await this.prisma.category.findUnique({
      where: { title },
    });
    if (isCategoryExist) {
      throw new BadRequestException(CATEGORY_ALREADY_EXISTS_ERROR);
    }
    return this.prisma.category.create({
      data: {
        title,
      },
    });
  }

  allCategories() {
    return this.prisma.category.findMany();
  }

  async oneCategory(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new BadRequestException(CATEGORY_NOT_FOUND_ERROR);
    }
    return category;
  }

  async updateCategory(id: string, { title }: CategoryDto) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new BadRequestException(CATEGORY_NOT_FOUND_ERROR);
    }
    const categoryExists = await this.prisma.category.findUnique({
      where: { title },
    });
    if (categoryExists) {
      throw new BadRequestException(CATEGORY_ALREADY_EXISTS_ERROR);
    }
    return this.prisma.category.update({
      where: { id },
      data: {
        title,
      },
    });
  }

  async deleteCategory(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new BadRequestException(CATEGORY_NOT_FOUND_ERROR);
    }
    return this.prisma.category.delete({ where: { id } });
  }
}
