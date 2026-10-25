import { IsString, IsNumber, Min, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0.01, { message: 'El precio mínimo debe ser mayor a 0' })
  price: number;

  @IsNumber()
  @Min(0, { message: 'El stock no puede ser negativo' })
  stock: number;
  
  @IsOptional()
  @IsNumber()
  storeId?: number;

  // Campo agregado para permitir la categoría enviada desde el formulario de inventario
  @IsString()
  @IsOptional()
  category?: string;
}