import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';
import { Player } from '../database/entities/player.entity';
import { UserPlayer } from '../database/entities/user-player.entity';
import { User } from '../database/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { GameEventsModule } from '../game-events/game-events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Player, UserPlayer, User]),
    AuthModule,
    GameEventsModule,
  ],
  controllers: [PlayersController],
  providers: [PlayersService],
  exports: [PlayersService],
})
export class PlayersModule {}