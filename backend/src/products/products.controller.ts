import { Controller, Get, Post, Put, Delete, Param, Query, Body } from '@nestjs/common';
import { ProductsService } from './products.service.js';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(@Query('category') category?: string, @Query('search') search?: string) {
    const products = await this.productsService.findAll({ category, search });
    return { success: true, count: products.length, data: products };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const product = await this.productsService.findOne(id);
    return { success: true, data: product };
  }
}
