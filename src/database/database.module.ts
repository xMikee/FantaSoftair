import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Player } from './entities/player.entity';
import { Event } from './entities/event.entity';
import { GameEvent } from './entities/game-event.entity';
import { EventScore } from './entities/event-score.entity';
import { UserEventScore } from './entities/user-event-score.entity';
import { UserPlayer } from './entities/user-player.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'fanta_softair',
      entities: [User, Player, Event, GameEvent, EventScore, UserEventScore, UserPlayer],
      synchronize: false,
      logging: false,
    }),
    TypeOrmModule.forFeature([User, Player, Event, GameEvent, EventScore, UserEventScore, UserPlayer]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}