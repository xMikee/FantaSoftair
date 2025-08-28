import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Player } from '../database/entities/player.entity';
import { UsersService } from '../users/users.service';
import { PlayersService } from '../players/players.service';

@Injectable()
export class MarketService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Player)
    private playersRepository: Repository<Player>,
    private usersService: UsersService,
    private playersService: PlayersService,
  ) {}

  async buyPlayer(userId: number, playerId: number) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new BadRequestException('Utente non trovato');
    }

    const player = await this.playersRepository.findOne({
      where: { id: playerId, ownerId: null }
    });
    
    if (!player) {
      throw new BadRequestException('Giocatore non disponibile');
    }

    if (user.credits < player.baseValue) {
      throw new BadRequestException('Crediti insufficienti');
    }

    const teamSize = await this.playersService.countByOwner(userId);
    if (teamSize >= 11) {
      throw new BadRequestException('Squadra completa (11 giocatori max)');
    }

    await this.playersService.updateOwner(playerId, userId);
    await this.usersService.adjustCredits(userId, -player.baseValue);

    return {
      success: true,
      message: 'Giocatore acquistato con successo!'
    };
  }

  async sellPlayer(userId: number, playerId: number) {
    const player = await this.playersRepository.findOne({
      where: { id: playerId, ownerId: userId }
    });

    if (!player) {
      throw new BadRequestException('Giocatore non trovato nella tua squadra');
    }

    const sellValue = Math.floor(player.baseValue * 0.8);

    await this.playersService.updateOwner(playerId, null);
    await this.usersService.adjustCredits(userId, sellValue);

    return {
      success: true,
      message: `Giocatore venduto per ${sellValue} crediti!`
    };
  }

  async getRanking() {
    const result = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoin('user.players', 'player')
      .leftJoin('user.players', 'selectedPlayer', 'selectedPlayer.selectedForLineup = :selected', { selected: true })
      .select('user.id', 'id')
      .addSelect('user.name', 'name')
      .addSelect('user.credits', 'credits')
      .addSelect('COALESCE(SUM(CASE WHEN selectedPlayer.selectedForLineup = :selected THEN selectedPlayer.currentPoints ELSE 0 END), 0)', 'total_points')
      .addSelect('COUNT(player.id)', 'team_size')
      .addSelect('COUNT(CASE WHEN selectedPlayer.selectedForLineup = :selected THEN 1 END)', 'lineup_size')
      .setParameter('selected', true)
      .groupBy('user.id')
      .addGroupBy('user.name')
      .orderBy('total_points', 'DESC')
      .getRawMany();

    return result;
  }
}