import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prospect } from './prospect.entity';

@Injectable()
export class ProspectsService {
  constructor(
    @InjectRepository(Prospect)
    private prospectsRepository: Repository<Prospect>,
  ) {}

  async create(createData: any) {
    const nuevoProspecto = this.prospectsRepository.create({
      businessName: createData.nombreEmpresa,
      contactName: createData.nombreContacto,
      email: createData.correo,
      phone: createData.telefono,
      category: createData.categoria,
      comments: createData.comentarios
    });
    return await this.prospectsRepository.save(nuevoProspecto);
  }

  findAll() {
    return this.prospectsRepository.find({ order: { createdAt: 'DESC' } });
  }

  async updateStatus(id: number, status: string) {
    await this.prospectsRepository.update(id, { status });
    return this.prospectsRepository.findOneBy({ id });
  }
}