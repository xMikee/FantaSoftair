import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';
import { Player } from './player.entity';

@Entity('user_players')
@Index(['userId', 'playerId'], { unique: true })
export class UserPlayer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'player_id' })
  playerId: number;

  @Column({ default: false, name: 'selected_for_lineup' })
  selectedForLineup: boolean;

  @Column({ default: false, name: 'is_in_formation' })
  isInFormation: boolean;

  @CreateDateColumn({ name: 'purchase_date' })
  purchaseDate: Date;

  @ManyToOne(() => User, user => user.userPlayers)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Player, player => player.userPlayers)
  @JoinColumn({ name: 'player_id' })
  player: Player;
}