import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('stores')
export class Store {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string; // Nombre de la empresa o sucursal

  @Column({ nullable: true })
  address: string; // Dirección física

  @Column({ default: true })
  isActive: boolean; // Para suspender tiendas si no pagan la suscripción

  @CreateDateColumn()
  createdAt: Date;
}