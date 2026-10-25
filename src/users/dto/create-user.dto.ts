import { IsEmail, IsString, MinLength, IsNumber, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Debe ser un correo válido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsNumber()
  storeId: number;

  @IsOptional()
  @IsString()
  role?: string;
}