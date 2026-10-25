import { Controller, Post, Body, Get, Patch, Param } from '@nestjs/common';
import { ProspectsService } from './prospects.service';

@Controller('prospects')
export class ProspectsController {
  constructor(private readonly prospectsService: ProspectsService) {}

  @Post()
  create(@Body() createData: any) {
    return this.prospectsService.create(createData);
  }

  @Get()
  findAll() {
    return this.prospectsService.findAll();
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.prospectsService.updateStatus(Number(id), status);
  }
}