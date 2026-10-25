import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { InventoryMovement } from './entities/inventory-movement.entity';
import { Category } from './entities/category.entity';
import { User } from '../users/user.entity'; // Importamos la entidad User

@Module({
  // Agregamos User al arreglo forFeature
  imports: [TypeOrmModule.forFeature([Product, InventoryMovement, Category, User])],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}