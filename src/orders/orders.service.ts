import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/user.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource
  ) {}

  async crearOrden(orderData: any, userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const item of orderData.items) {
        // 1. Buscamos el producto para conocer su stock real en este momento
        const producto = await queryRunner.manager.findOne(Product, {
          where: { id: item.productId }
        });

        if (!producto) {
          throw new BadRequestException(`Producto no encontrado: ${item.name}`);
        }

        // 2. Validamos estrictamente que alcance el inventario
        if (producto.stock < item.quantity) {
          throw new BadRequestException(`Stock insuficiente para "${producto.name}". Disponibles: ${producto.stock}, Solicitados: ${item.quantity}.`);
        }

        // 3. Restamos de forma segura y guardamos
        producto.stock -= item.quantity;
        await queryRunner.manager.save(producto);
      }

      const nuevaOrden = queryRunner.manager.create(Order, {
        ...orderData,
        userId: userId || null
      });
      const ordenGuardada = await queryRunner.manager.save(nuevaOrden);

      if (userId) {
        const user = await queryRunner.manager.findOneBy(User, { id: userId });
        if (user) {
          const puntosGanados = Math.floor(Number(orderData.total || 0));
          const puntosUsados = orderData.puntosUsados ? Number(orderData.puntosUsados) : 0;
          
          // Restamos los puntos que usó en el carrito y sumamos los nuevos
          user.rewardPoints = (user.rewardPoints || 0) - puntosUsados + puntosGanados;
          
          // Seguro para evitar puntos negativos en caso de alteraciones
          if (user.rewardPoints < 0) user.rewardPoints = 0;

          await queryRunner.manager.save(user);
        }
      }

      await queryRunner.commitTransaction();
      return ordenGuardada;

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  obtenerOrdenesPorTienda(storeId: number) {
    return this.ordersRepository.find({ 
      where: { storeId }, 
      order: { createdAt: 'DESC' } 
    });
  }

  obtenerMisOrdenes(userId: number) {
    return this.ordersRepository.find({ 
      where: { userId }, 
      order: { createdAt: 'DESC' } 
    });
  }
}