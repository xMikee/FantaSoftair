import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('game_events')
export class GameEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('datetime')
  date: Date;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ default: true })
  active: boolean;

  @Column({ default: false })
  closed: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}