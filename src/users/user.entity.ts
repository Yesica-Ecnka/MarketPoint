import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; 

  @Column({ default: 'seller' })
  role: string; 

  @Column({ nullable: true })
  storeId: number; 

  @Column({ default: 0 })
  rewardPoints: number;

  // Nuevo campo para suspender/activar al inquilino (Tenant)
  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}