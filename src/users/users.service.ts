import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(createUserDto: CreateUserDto) {
    const { email, password, storeId, role } = createUserDto;

    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('El correo ya está registrado en otra cuenta');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = this.usersRepository.create({
      email,
      password: hashedPassword,
      storeId,
      role: role || 'seller',
    });

    const savedUser = await this.usersRepository.save(newUser);
    const { password: _, ...userWithoutPassword } = savedUser;
    
    return userWithoutPassword;
  }

  async findAll() {
    const users = await this.usersRepository.find();
    return users.map(user => {
      const { password, ...result } = user as any;
      return result;
    });
  }

  async updateRole(id: number, role: string) {
    await this.usersRepository.update(id, { role });
    return { message: 'Rol actualizado exitosamente' };
  }

  // Única implementación de updatePassword
  async updatePassword(id: number, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.usersRepository.update(id, { password: hashedPassword });
    return { message: 'Contraseña actualizada exitosamente' };
  }

  async toggleStatus(id: number) {
    const user = await this.usersRepository.findOneBy({ id });
    
    if (!user) {
      throw new NotFoundException(`El usuario con ID ${id} no existe`);
    }

    // Invertimos el estado actual (si es true pasa a false, y viceversa)
    user.isActive = !user.isActive;
    await this.usersRepository.save(user);
    
    return { 
      message: `El inquilino ahora está ${user.isActive ? 'Activo' : 'Suspendido'}`, 
      isActive: user.isActive 
    };
  }
}
