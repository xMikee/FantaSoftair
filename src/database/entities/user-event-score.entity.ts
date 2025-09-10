import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';
import { GameEvent } from './game-event.entity';

@Entity('user_event_scores')
@Index(['userId', 'gameEventId'], { unique: true })
export class UserEventScore {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'game_event_id' })
  gameEventId: number;

  @Column({ default: 0, name: 'total_points' })
  totalPoints: number;

  @Column({ type: 'text', nullable: true, name: 'formation_snapshot' })
  formationSnapshot: string;

  @Column({ type: 'text', nullable: true, name: 'team_ranking_snapshot' })
  teamRankingSnapshot: string;

  @Column({ type: 'text', nullable: true, name: 'player_ranking_snapshot' })
  playerRankingSnapshot: string;

  @CreateDateColumn({ name: 'calculated_at' })
  calculatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => GameEvent)
  @JoinColumn({ name: 'game_event_id' })
  gameEvent: GameEvent;
}