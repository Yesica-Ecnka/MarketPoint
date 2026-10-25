import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProspectsController } from './prospects.controller';
import { ProspectsService } from './prospects.service';
import { Prospect } from './prospect.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Prospect])],
  controllers: [ProspectsController],
  providers: [ProspectsService],
})
export class ProspectsModule {}