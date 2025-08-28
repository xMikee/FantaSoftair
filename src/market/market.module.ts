import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketController } from './market.controller';
import { MarketService } from './market.service';
import { User } from '../database/entities/user.entity';
import { Player } from '../database/entities/player.entity';
import { UsersModule } from '../users/users.module';
import { PlayersModule } from '../players/players.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Player]),
    UsersModule,
    PlayersModule,
    AuthModule,
  ],
  controllers: [MarketController],
  providers: [MarketService],
})
export class MarketModule {}