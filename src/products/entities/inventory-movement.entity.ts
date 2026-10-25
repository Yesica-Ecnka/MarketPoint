import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('inventory_movements')
export class InventoryMovement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productId: number;

  @Column()
  type: 'IN' | 'OUT' | 'PRICE'; // Se añade PRICE

  @Column('int')
  quantity: number;

  @Column('varchar', { length: 255 })
  reason: string;

  @CreateDateColumn()
  createdAt: Date;
}