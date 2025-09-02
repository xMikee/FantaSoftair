import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Player } from '../database/entities/player.entity';
import { UserPlayer } from '../database/entities/user-player.entity';
import { UsersService } from '../users/users.service';
import { PlayersService } from '../players/players.service';
import { EventScoringService } from '../event-scoring/event-scoring.service';
import { GameEventsService } from '../game-events/game-events.service';

@Injectable()
export class MarketService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Player)
    private playersRepository: Repository<Player>,
    @InjectRepository(UserPlayer)
    private userPlayersRepository: Repository<UserPlayer>,
    private usersService: UsersService,
    private playersService: PlayersService,
    private eventScoringService: EventScoringService,
    private gameEventsService: GameEventsService,
  ) {}

  async buyPlayerForTeam(targetUserId: number, playerId: number) {
    const user = await this.usersService.findOne(targetUserId);
    if (!user) {
      throw new BadRequestException('Utente non trovato');
    }

    const player = await this.playersRepository.findOne({
      where: { id: playerId }
    });
    
    if (!player) {
      throw new BadRequestException('Giocatore non trovato');
    }

    const existingUserPlayer = await this.userPlayersRepository.findOne({
      where: { userId: targetUserId, playerId: playerId }
    });

    if (existingUserPlayer) {
      throw new BadRequestException('Giocatore già presente nella squadra');
    }

    if (user.credits < player.baseValue) {
      throw new BadRequestException('Crediti insufficienti per questa squadra');
    }

    const teamSize = await this.userPlayersRepository.count({
      where: { userId: targetUserId }
    });
    if (teamSize >= 11) {
      throw new BadRequestException('Squadra completa (11 giocatori max)');
    }

    const userPlayer = this.userPlayersRepository.create({
      userId: targetUserId,
      playerId: playerId,
      selectedForLineup: false,
      isInFormation: false
    });

    await this.userPlayersRepository.save(userPlayer);
    await this.usersService.adjustCredits(targetUserId, -player.baseValue);

    return {
      success: true,
      message: `Giocatore acquistato con successo per ${user.name}!`,
      playerName: player.name,
      teamName: user.name,
      cost: player.baseValue
    };
  }

  async sellPlayerFromTeam(targetUserId: number, playerId: number) {
    const userPlayer = await this.userPlayersRepository.findOne({
      where: { userId: targetUserId, playerId: playerId },
      relations: ['player']
    });

    if (!userPlayer) {
      throw new BadRequestException('Giocatore non trovato nella squadra specificata');
    }

    const user = await this.usersService.findOne(targetUserId);
    if (!user) {
      throw new BadRequestException('Utente non trovato');
    }

    const sellValue = Math.floor(userPlayer.player.baseValue * 0.8);

    await this.userPlayersRepository.remove(userPlayer);
    await this.usersService.adjustCredits(targetUserId, sellValue);

    return {
      success: true,
      message: `Giocatore ${userPlayer.player.name} venduto dalla squadra ${user.name} per ${sellValue} crediti!`,
      playerName: userPlayer.player.name,
      teamName: user.name,
      sellValue: sellValue
    };
  }

  async getRanking() {
    // CLASSIFICA GENERALE: Usa i total_points dal database che sono già aggiornati
    // Se necessario, calcola dinamicamente i punti sommando i yearlyPoints dei giocatori in formazione
    const result = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoin('user.userPlayers', 'userPlayer')
      .select('user.id', 'id')
      .addSelect('user.name', 'name')
      .addSelect('user.credits', 'credits')
      .addSelect('user.totalPoints', 'total_points')
      .addSelect('COUNT(userPlayer.id)', 'team_size')
      .addSelect('COUNT(CASE WHEN userPlayer.isInFormation = :inFormation THEN 1 END)', 'lineup_size')
      .setParameter('inFormation', true)
      .groupBy('user.id')
      .addGroupBy('user.name')
      .addGroupBy('user.credits')
      .addGroupBy('user.totalPoints')
      .getRawMany();
    
    // Sort by total points descending, then by name ascending for ties
    return result.sort((a, b) => {
      if (b.total_points !== a.total_points) {
        return b.total_points - a.total_points;
      }
      return a.name.localeCompare(b.name);
    });
  }

  async getEventBasedRanking() {
    // NUOVO SISTEMA FANTASY: Usa direttamente i totalPoints delle squadre
    const result = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoin('user.userPlayers', 'userPlayer')
      .select('user.id', 'id')
      .addSelect('user.name', 'name')
      .addSelect('user.credits', 'credits')
      .addSelect('user.totalPoints', 'total_points')
      .addSelect('COUNT(userPlayer.id)', 'team_size')
      .addSelect('COUNT(CASE WHEN userPlayer.selectedForLineup = :selected THEN 1 END)', 'lineup_size')
      .setParameter('selected', true)
      .groupBy('user.id')
      .addGroupBy('user.name')
      .addGroupBy('user.credits')
      .addGroupBy('user.totalPoints')
      .orderBy('user.totalPoints', 'DESC')
      .getRawMany();

    return result;
  }

  async getBestPlayersRanking(limit: number = 10) {
    return this.gameEventsService.getBestPlayersRanking(limit);
  }

  async getWorstPlayersRanking(limit: number = 10) {
    return this.gameEventsService.getWorstPlayersRanking(limit);
  }
}