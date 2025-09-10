import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { UserPlayer } from './user-player.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ default: 80 })
  credits: number;

  @Column({ default: 0, name: 'total_points' })
  totalPoints: number;

  @Column({ nullable: true, name: 'team_password' })
  teamPassword: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => UserPlayer, userPlayer => userPlayer.user)
  userPlayers: UserPlayer[];
}