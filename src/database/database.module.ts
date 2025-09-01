import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Player } from './entities/player.entity';
import { Event } from './entities/event.entity';
import { GameEvent } from './entities/game-event.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './data/fanta-softair.db',
      entities: [User, Player, Event, GameEvent],
      synchronize: false, // Keep false to use existing database
      logging: false,
    }),
    TypeOrmModule.forFeature([User, Player, Event, GameEvent]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}