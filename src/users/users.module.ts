import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller'; // Importamos el nuevo controlador
import { User } from './user.entity'; // Ruta corregida

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController], // Registramos el controlador aquí
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}