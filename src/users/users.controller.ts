import { Controller, Post, Body, Get, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req: any) {
    return this.usersService.findByEmail(req.user.email);
  }

  @Patch(':id/role')
  updateRole(@Param('id') id: string, @Body('role') role: string) {
    return this.usersService.updateRole(+id, role);
  }

  @Patch(':id/password')
  updatePassword(@Param('id') id: string, @Body('password') password: string) {
    return this.usersService.updatePassword(+id, password);
  }

  // Nuevo endpoint para suspender o activar a un inquilino
  @Patch(':id/toggle-status')
  toggleStatus(@Param('id') id: string) {
    return this.usersService.toggleStatus(+id); // Asegúrate de agregar toggleStatus(id: number) en tu users.service.ts
  }
}