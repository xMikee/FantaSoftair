import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { User } from '../database/entities/user.entity';
import { Player } from '../database/entities/player.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Player])],
  controllers: [TeamController],
  providers: [TeamService],
  exports: [TeamService],
})
export class TeamModule {}