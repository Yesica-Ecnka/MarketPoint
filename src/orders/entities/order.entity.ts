import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  userId: number; // ID del cliente (Opcional si compra como invitado)

  @Column({ nullable: true })
  storeId: number; // ID de la tienda que vende

  @Column({ nullable: true })
  guestEmail: string; // Correo para rastrear el pedido si es invitado

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column({ default: 'Pendiente' })
  status: string;

  @Column('json')
  items: any; // Guardaremos el detalle de los productos en formato JSON

  @CreateDateColumn()
  createdAt: Date;
}