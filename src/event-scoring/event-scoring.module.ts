import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventScoringService } from './event-scoring.service';
import { EventScore } from '../database/entities/event-score.entity';
import { UserEventScore } from '../database/entities/user-event-score.entity';
import { Player } from '../database/entities/player.entity';
import { GameEvent } from '../database/entities/game-event.entity';
import { User } from '../database/entities/user.entity';
import { UserPlayer } from '../database/entities/user-player.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EventScore,
      UserEventScore,
      Player,
      GameEvent,
      User,
      UserPlayer
    ])
  ],
  providers: [EventScoringService],
  exports: [EventScoringService]
})
export class EventScoringModule {}