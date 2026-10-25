import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { User } from '../users/user.entity'; // Asegúrate de ajustar la ruta según la estructura de tus carpetas

@Module({
  // Importamos también la entidad User para que TypeORM cree el UserRepository en este módulo
  imports: [TypeOrmModule.forFeature([Order, User])],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}