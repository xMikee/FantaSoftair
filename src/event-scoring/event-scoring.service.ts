import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventScore } from '../database/entities/event-score.entity';
import { UserEventScore } from '../database/entities/user-event-score.entity';
import { Player } from '../database/entities/player.entity';
import { GameEvent } from '../database/entities/game-event.entity';
import { User } from '../database/entities/user.entity';
import { UserPlayer } from '../database/entities/user-player.entity';

@Injectable()
export class EventScoringService {
  constructor(
    @InjectRepository(EventScore)
    private eventScoreRepository: Repository<EventScore>,
    @InjectRepository(UserEventScore)
    private userEventScoreRepository: Repository<UserEventScore>,
    @InjectRepository(Player)
    private playerRepository: Repository<Player>,
    @InjectRepository(GameEvent)
    private gameEventRepository: Repository<GameEvent>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserPlayer)
    private userPlayerRepository: Repository<UserPlayer>,
  ) {}

  async updatePlayerEventScore(
    playerId: number, 
    gameEventId: number, 
    points: number, 
    description?: string
  ): Promise<EventScore> {
    // Check if score already exists for this player and event
    let eventScore = await this.eventScoreRepository.findOne({
      where: { playerId, gameEventId }
    });

    if (eventScore) {
      // Somma i punti invece di sovrascriverli
      eventScore.points += points;
      eventScore.description = `${eventScore.description} + ${description || 'Punteggio aggiuntivo'}`;
    } else {
      eventScore = this.eventScoreRepository.create({
        playerId,
        gameEventId,
        points,
        description: description || 'Punteggio evento'
      });
    }

    const savedEventScore = await this.eventScoreRepository.save(eventScore);

    // Recalculate all user scores for this game event
    await this.recalculateEventScores(gameEventId);

    return savedEventScore;
  }

  async recalculateEventScores(gameEventId: number): Promise<void> {
    // Get all users
    const users = await this.userRepository.find();

    for (const user of users) {
      await this.calculateUserEventScore(user.id, gameEventId);
    }
  }

  async calculateUserEventScore(userId: number, gameEventId: number): Promise<UserEventScore> {
    console.log(`Calcolando punteggio per squadra ${userId} nell'evento ${gameEventId}`);
    
    // Get ALL user's players (not just selected for lineup) to include all in event scoring
    const allUserPlayers = await this.userPlayerRepository.find({
      where: { userId: userId },
      relations: ['player']
    });
    
    console.log(`Squadra ${userId} ha ${allUserPlayers.length} giocatori totali`);
    
    const allPlayers = allUserPlayers.map(up => up.player);
    const selectedPlayers = allUserPlayers.filter(up => up.selectedForLineup).map(up => up.player);

    console.log(`Squadra ${userId} ha ${selectedPlayers.length} giocatori in formazione`);

    // Get event scores for ALL players of this team for this game event
    const playerIds = allPlayers.map(p => p.id);
    let totalPoints = 0;
    let teamEventScores = [];

    if (playerIds.length > 0) {
      teamEventScores = await this.eventScoreRepository
        .createQueryBuilder('es')
        .leftJoinAndSelect('es.player', 'player')
        .where('es.playerId IN (:...playerIds)', { playerIds })
        .andWhere('es.gameEventId = :gameEventId', { gameEventId })
        .getMany();

      totalPoints = teamEventScores.reduce((sum, score) => sum + score.points, 0);
      
      console.log(`Squadra ${userId}: ${teamEventScores.length} giocatori con punteggi, totale: ${totalPoints} punti`);
      
      if (teamEventScores.length > 0) {
        console.log(`Dettaglio punteggi:`, teamEventScores.map(es => `${es.player.name}: ${es.points}`).join(', '));
      }
    }

    // Create formation snapshot (only selected players for formation display)
    const formationSnapshot = JSON.stringify(
      selectedPlayers.map(p => ({
        id: p.id,
        name: p.name,
        position: p.position
      }))
    );

    // Check if user event score already exists
    let userEventScore = await this.userEventScoreRepository.findOne({
      where: { userId, gameEventId }
    });

    if (userEventScore) {
      userEventScore.totalPoints = totalPoints;
      userEventScore.formationSnapshot = formationSnapshot;
    } else {
      userEventScore = this.userEventScoreRepository.create({
        userId,
        gameEventId,
        totalPoints,
        formationSnapshot
      });
    }

    return await this.userEventScoreRepository.save(userEventScore);
  }

  async getUserTotalPoints(userId: number): Promise<number> {
    // IMPORTANTE: Questo metodo deve restituire la somma di TUTTI gli eventi (chiusi e non)
    // per calcolare correttamente i totalPoints delle squadre quando si chiude un evento
    const result = await this.userEventScoreRepository
      .createQueryBuilder('ues')
      .select('COALESCE(SUM(ues.totalPoints), 0)', 'totalPoints')
      .where('ues.userId = :userId', { userId })
      .getRawOne<{ totalPoints: string }>();

    return Number(result?.totalPoints ?? 0);
  }

  async getUserActiveEventPoints(userId: number): Promise<number> {
    // Questo metodo restituisce solo i punti degli eventi NON chiusi (per la classifica)
    const result = await this.userEventScoreRepository
      .createQueryBuilder('ues')
      .leftJoin('ues.gameEvent', 'ge')
      .select('COALESCE(SUM(ues.totalPoints), 0)', 'totalPoints')
      .where('ues.userId = :userId', { userId })
      .andWhere('ge.closed IS NULL OR ge.closed = false')
      .getRawOne<{ totalPoints: string }>();

    return Number(result?.totalPoints ?? 0);
  }

  async getAllUsersRanking(): Promise<Array<{userId: number, userName: string, totalPoints: number}>> {
    // Get all users first to ensure everyone is included even without points
    const allUsers = await this.userRepository.find({ 
      select: ['id', 'name'],
      order: { name: 'ASC' }
    });

    // Create ranking using only active event points (non-closed events)
    const results: Array<{userId: number, userName: string, totalPoints: number}> = [];
    
    for (const user of allUsers) {
      const activeEventPoints = await this.getUserActiveEventPoints(user.id);
      results.push({
        userId: user.id,
        userName: user.name,
        totalPoints: activeEventPoints
      });
    }

    // Sort by total points descending, then by name ascending for ties
    return results.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      return a.userName.localeCompare(b.userName);
    });
  }

  async getEventScoresForUser(userId: number): Promise<Array<{
    gameEventId: number;
    eventName: string;
    eventDate: Date;
    points: number;
    formationSnapshot: string;
  }>> {
    const results = await this.userEventScoreRepository
      .createQueryBuilder('ues')
      .leftJoin('ues.gameEvent', 'ge')
      .select([
        'ues.gameEventId as gameEventId',
        'ge.name as eventName',
        'ge.date as eventDate',
        'ues.totalPoints as points',
        'ues.formationSnapshot as formationSnapshot'
      ])
      .where('ues.userId = :userId', { userId })
      .orderBy('ge.date', 'DESC')
      .getRawMany();

    return results;
  }

  async deleteEventScores(gameEventId: number): Promise<void> {
    // Delete all user event scores for this game event
    await this.userEventScoreRepository.delete({ gameEventId });
    
    // Delete all event scores for this game event
    await this.eventScoreRepository.delete({ gameEventId });
  }
}