import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get<string>('DB_USERNAME', 'root'),
        password: configService.get<string>('DB_PASSWORD', ''),
        database: configService.get<string>('DB_NAME', 'fanta_softair'),
        entities: [User, Player, Event, GameEvent, EventScore, UserEventScore, UserPlayer],
        migrations: ['dist/database/migrations/*.js'],
        migrationsTableName: 'typeorm_migrations',
        synchronize: false,
        logging: configService.get<string>('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Player, Event, GameEvent, EventScore, UserEventScore, UserPlayer]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}