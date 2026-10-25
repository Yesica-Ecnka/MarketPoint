import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StoresModule } from './stores/stores.module';
import { Prospect } from './prospects/prospect.entity';
import { ProspectsModule } from './prospects/prospects.module'; // <-- Módulo importado

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql', 
      url: 'contraseña de la base de datos', 
      autoLoadEntities: true,
      synchronize: true,
      timezone: 'Z',
      ssl: {
        rejectUnauthorized: false,
      },
      entities: [Prospect],
    }),
    ProductsModule,
    OrdersModule,
    AuthModule,
    UsersModule,
    StoresModule,
    ProspectsModule, // <-- Módulo registrado
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}