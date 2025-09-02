import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../database/entities/user.entity';
import { Player } from '../database/entities/player.entity';
import { Event } from '../database/entities/event.entity';
import { UserPlayer } from '../database/entities/user-player.entity';
import { PlayersModule } from '../players/players.module';
import { EventsModule } from '../events/events.module';
import { GameEventsModule } from '../game-events/game-events.module';
import { EventScoringModule } from '../event-scoring/event-scoring.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Player, Event, UserPlayer]),
    PlayersModule,
    EventsModule,
    GameEventsModule,
    EventScoringModule,
    AuthModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}