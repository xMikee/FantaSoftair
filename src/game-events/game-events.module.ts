import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameEventsController } from './game-events.controller';
import { GameEventsService } from './game-events.service';
import { GameEvent } from '../database/entities/game-event.entity';
import { Event } from '../database/entities/event.entity';
import { Player } from '../database/entities/player.entity';
import { User } from '../database/entities/user.entity';
import { UserPlayer } from '../database/entities/user-player.entity';
import { UserEventScore } from '../database/entities/user-event-score.entity';
import { EventScore } from '../database/entities/event-score.entity';
import { AuthModule } from '../auth/auth.module';
import { EventScoringModule } from '../event-scoring/event-scoring.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GameEvent, Event, Player, User, UserPlayer, UserEventScore, EventScore]),
    AuthModule,
    EventScoringModule
  ],
  controllers: [GameEventsController],
  providers: [GameEventsService],
  exports: [GameEventsService],
})
export class GameEventsModule {}