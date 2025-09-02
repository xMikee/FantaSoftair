import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn, Index } from 'typeorm';
import { Player } from './player.entity';
import { GameEvent } from './game-event.entity';

@Entity('event_scores')
@Index(['playerId', 'gameEventId'], { unique: true })
export class EventScore {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'player_id' })
  playerId: number;

  @Column({ name: 'game_event_id' })
  gameEventId: number;

  @Column()
  points: number;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Player)
  @JoinColumn({ name: 'player_id' })
  player: Player;

  @ManyToOne(() => GameEvent)
  @JoinColumn({ name: 'game_event_id' })
  gameEvent: GameEvent;
}