import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStoreDto } from './dto/create-store.dto';
import { Store } from './entities/store.entity';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private storesRepository: Repository<Store>,
  ) {}

  // Guarda una nueva tienda en la base de datos
  create(createStoreDto: CreateStoreDto) {
    const newStore = this.storesRepository.create(createStoreDto);
    return this.storesRepository.save(newStore);
  }

  // Devuelve la lista de todas las tiendas registradas
  findAll() {
    return this.storesRepository.find();
  }
}