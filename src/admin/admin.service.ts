import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Player } from '../database/entities/player.entity';
import { Event } from '../database/entities/event.entity';
import { PlayersService } from '../players/players.service';
import { EventsService } from '../events/events.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Player)
    private playersRepository: Repository<Player>,
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    private playersService: PlayersService,
    private eventsService: EventsService,
  ) {}

  async updateScore(playerId: number, points: number, description?: string) {
    await this.playersService.updatePoints(playerId, points);
    await this.eventsService.create(playerId, points, description);

    return {
      success: true,
      message: `Punteggio aggiornato: ${points > 0 ? '+' : ''}${points} punti!`
    };
  }

  async resetSystem(type: 'market' | 'scores' | 'all') {
    switch (type) {
      case 'market':
        await this.playersService.resetOwnership();
        await this.usersRepository.update({}, { credits: 1000 });
        break;
        
      case 'scores':
        await this.playersService.resetPoints();
        await this.eventsService.deleteAll();
        break;
        
      case 'all':
        await this.eventsService.deleteAll();
        await this.playersService.resetPoints();
        await this.playersService.resetOwnership();
        await this.usersRepository.update({}, { credits: 1000, totalPoints: 0 });
        break;
    }

    return {
      success: true,
      message: 'Reset completato!'
    };
  }
}