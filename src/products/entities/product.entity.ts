import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('products') // Así se llamará la tabla en tu base de datos MySQL
export class Product {
  @PrimaryGeneratedColumn()
  id: number; // El ID autoincrementable que MySQL genera

  @Column({ length: 100 })
  name: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number; // Para manejar los precios con dos decimales

  @Column('int')
  stock: number;

  @Column('int')
  storeId: number;

  @CreateDateColumn()
  createdAt: Date; // Guarda automáticamente la fecha y hora de creación

  @Column({ default: true })
  isActive: boolean; // Controla si el producto está a la venta o retirado

  @UpdateDateColumn()
  updatedAt: Date; // TypeORM actualizará esta fecha automáticamente cada vez que modifiques el precio o stock

  @Column({ default: 'General' })
  category: string;
}