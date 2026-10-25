import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';
import { Store } from './entities/store.entity'; // Importamos la entidad

@Module({
  // Registramos la entidad para que TypeORM la administre
  imports: [TypeOrmModule.forFeature([Store])], 
  controllers: [StoresController],
  providers: [StoresService],
})
export class StoresModule {}