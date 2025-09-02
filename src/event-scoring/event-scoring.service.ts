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
      eventScore.points = points;
      eventScore.description = description;
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
    // Get user's selected players at the time of calculation
    const selectedUserPlayers = await this.userPlayerRepository.find({
      where: { userId: userId, selectedForLineup: true },
      relations: ['player']
    });
    
    const selectedPlayers = selectedUserPlayers.map(up => up.player);

    // Get event scores for these players for this game event
    const playerIds = selectedPlayers.map(p => p.id);
    let totalPoints = 0;

    if (playerIds.length > 0) {
      const eventScores = await this.eventScoreRepository
        .createQueryBuilder('es')
        .where('es.playerId IN (:...playerIds)', { playerIds })
        .andWhere('es.gameEventId = :gameEventId', { gameEventId })
        .getMany();

      totalPoints = eventScores.reduce((sum, score) => sum + score.points, 0);
    }

    // Create formation snapshot
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