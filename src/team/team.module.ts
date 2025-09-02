import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { User } from '../database/entities/user.entity';
import { Player } from '../database/entities/player.entity';
import { UserPlayer } from '../database/entities/user-player.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Player, UserPlayer])],
  controllers: [TeamController],
  providers: [TeamService],
  exports: [TeamService],
})
export class TeamModule {}