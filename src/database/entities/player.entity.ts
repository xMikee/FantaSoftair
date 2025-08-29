import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Event } from './event.entity';

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

  @Column({ nullable: true, name: 'owner_id' })
  ownerId: number;

  @Column({ default: false, name: 'selected_for_lineup' })
  selectedForLineup: boolean;

  @Column({ default: false, name: 'is_in_formation' })
  isInFormation: boolean;

  @Column({ nullable: true })
  position: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, user => user.players, { nullable: true })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @OneToMany(() => Event, event => event.player)
  events: Event[];
}