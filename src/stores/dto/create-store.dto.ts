import { IsString, IsOptional, IsBoolean, MinLength } from 'class-validator';

export class CreateStoreDto {
  @IsString()
  @MinLength(3, { message: 'El nombre de la tienda debe tener al menos 3 letras' })
  name: string;


  
  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}



