import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Player } from '../database/entities/player.entity';
import { Event } from '../database/entities/event.entity';
import { PlayersService } from '../players/players.service';
import { EventsService } from '../events/events.service';
import * as crypto from 'crypto';

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

  async generateTeamPasswords() {
    const users = await this.usersRepository.find();
    const results = [];

    for (const user of users) {
      if (!user.teamPassword) {
        user.teamPassword = this.generateRandomPassword();
        await this.usersRepository.save(user);
      }
      results.push({
        teamName: user.name,
        password: user.teamPassword
      });
    }

    return {
      success: true,
      message: 'Password generate/aggiornate per tutti i team',
      passwords: results
    };
  }

  async assignPlayersToTeam(teamName: string, playerIds: number[]) {
    const user = await this.usersRepository.findOne({ where: { name: teamName } });
    if (!user) {
      throw new Error('Team non trovato');
    }

    await this.playersRepository.update(
      { id: In(playerIds) },
      { ownerId: user.id }
    );

    return {
      success: true,
      message: `${playerIds.length} giocatori assegnati al team ${teamName}`
    };
  }

  private generateRandomPassword(): string {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  }
}