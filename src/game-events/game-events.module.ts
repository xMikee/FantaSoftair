import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameEventsController } from './game-events.controller';
import { GameEventsService } from './game-events.service';
import { GameEvent } from '../database/entities/game-event.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GameEvent]),
    AuthModule
  ],
  controllers: [GameEventsController],
  providers: [GameEventsService],
  exports: [GameEventsService],
})
export class GameEventsModule {}