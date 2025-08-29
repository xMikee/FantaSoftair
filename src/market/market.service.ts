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

  async buyPlayerForTeam(targetUserId: number, playerId: number) {
    const user = await this.usersService.findOne(targetUserId);
    if (!user) {
      throw new BadRequestException('Utente non trovato');
    }

    const originalPlayer = await this.playersRepository.findOne({
      where: { id: playerId }
    });
    
    if (!originalPlayer) {
      throw new BadRequestException('Giocatore non trovato');
    }

    const existingPlayer = await this.playersRepository.findOne({
      where: { name: originalPlayer.name, ownerId: targetUserId }
    });

    if (existingPlayer) {
      throw new BadRequestException('Giocatore già presente nella squadra');
    }

    if (user.credits < originalPlayer.baseValue) {
      throw new BadRequestException('Crediti insufficienti per questa squadra');
    }

    const teamSize = await this.playersService.countByOwner(targetUserId);
    if (teamSize >= 11) {
      throw new BadRequestException('Squadra completa (11 giocatori max)');
    }

    const newPlayer = this.playersRepository.create({
      name: originalPlayer.name,
      baseValue: originalPlayer.baseValue,
      currentPoints: originalPlayer.currentPoints,
      ownerId: targetUserId,
      selectedForLineup: false,
      isInFormation: false,
      position: originalPlayer.position
    });

    await this.playersRepository.save(newPlayer);
    await this.usersService.adjustCredits(targetUserId, -originalPlayer.baseValue);

    return {
      success: true,
      message: `Giocatore acquistato con successo per ${user.name}!`,
      playerName: originalPlayer.name,
      teamName: user.name,
      cost: originalPlayer.baseValue
    };
  }

  async sellPlayerFromTeam(targetUserId: number, playerId: number) {
    const player = await this.playersRepository.findOne({
      where: { id: playerId, ownerId: targetUserId }
    });

    if (!player) {
      throw new BadRequestException('Giocatore non trovato nella squadra specificata');
    }

    const user = await this.usersService.findOne(targetUserId);
    if (!user) {
      throw new BadRequestException('Utente non trovato');
    }

    const sellValue = Math.floor(player.baseValue * 0.8);

    await this.playersService.updateOwner(playerId, null);
    await this.usersService.adjustCredits(targetUserId, sellValue);

    return {
      success: true,
      message: `Giocatore ${player.name} venduto dalla squadra ${user.name} per ${sellValue} crediti!`,
      playerName: player.name,
      teamName: user.name,
      sellValue: sellValue
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