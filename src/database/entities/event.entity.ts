import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Player } from './player.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'player_id' })
  playerId: number;

  @Column()
  points: number;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn({ name: 'date' })
  date: Date;

  @ManyToOne(() => Player, player => player.events)
  @JoinColumn({ name: 'player_id' })
  player: Player;
}