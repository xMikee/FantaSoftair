import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketController } from './market.controller';
import { MarketService } from './market.service';
import { User } from '../database/entities/user.entity';
import { Player } from '../database/entities/player.entity';
import { UserPlayer } from '../database/entities/user-player.entity';
import { UsersModule } from '../users/users.module';
import { PlayersModule } from '../players/players.module';
import { EventScoringModule } from '../event-scoring/event-scoring.module';
import { GameEventsModule } from '../game-events/game-events.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Player, UserPlayer]),
    UsersModule,
    PlayersModule,
    EventScoringModule,
    GameEventsModule,
    AuthModule,
  ],
  controllers: [MarketController],
  providers: [MarketService],
  exports: [MarketService],
})
export class MarketModule {}