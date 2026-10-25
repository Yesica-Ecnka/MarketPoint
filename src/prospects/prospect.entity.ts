import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('prospects')
export class Prospect {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  businessName: string;

  @Column({ nullable: true })
  contactName: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  category: string;

  @Column({ type: 'text', nullable: true })
  comments: string;

  @Column({ default: 'pending' }) // Estados: pending, contacted, approved
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}