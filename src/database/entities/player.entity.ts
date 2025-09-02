import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { Event } from './event.entity';
import { UserPlayer } from './user-player.entity';

@Entity('players')
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: 100, name: 'base_value' })
  baseValue: number;

  @Column({ default: 0, name: 'current_points' })
  currentPoints: number;

  @Column({ default: 0, name: 'yearly_points' })
  yearlyPoints: number;

  @Column({ nullable: true })
  position: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Event, event => event.player)
  events: Event[];

  @OneToMany(() => UserPlayer, userPlayer => userPlayer.player)
  userPlayers: UserPlayer[];
}