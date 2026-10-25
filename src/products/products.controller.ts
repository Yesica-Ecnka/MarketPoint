import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AuthGuard } from '@nestjs/passport'; 

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() createProductDto: CreateProductDto, @Request() req: any) {
    const tenantId = req.user.storeId; 
    const productoSeguro = { ...createProductDto, storeId: tenantId };
    return this.productsService.create(productoSeguro);
  }

  @Get()
  findAll(@Request() req: any) {
    let user = null;
    const authHeader = req.headers?.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const payloadBase64 = token.split('.')[1];
        user = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf8'));
      } catch (error) {}
    }
    
    return this.productsService.findAll(user);
  }

  // Ahora solicitamos el usuario para filtrar las mermas por tenant
  @UseGuards(AuthGuard('jwt'))
  @Get('movements/all')
  getAllMovements(@Request() req: any) {
    return this.productsService.getAllMovements(req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('categories/list')
  getCategories() {
    return this.productsService.getCategories();
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('categories')
  createCategory(@Body('name') name: string) {
    return this.productsService.createCategory(name);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('categories/:id/toggle-status')
  toggleCategoryStatus(@Param('id') id: string) {
    return this.productsService.toggleCategoryStatus(+id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: Partial<CreateProductDto>) {
    return this.productsService.update(+id, updateData);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/toggle-status')
  toggleStatus(@Param('id') id: string) {
    return this.productsService.toggleProductStatus(+id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/adjust-stock')
  adjustStock(@Param('id') id: string, @Body() body: { quantity: number, reason: string, operation: 'add' | 'subtract' }) {
    return this.productsService.adjustStock(+id, body.quantity, body.reason, body.operation);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/movements')
  getMovements(@Param('id') id: string) {
    return this.productsService.getMovements(+id);
  }
}