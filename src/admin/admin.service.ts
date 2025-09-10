import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Player } from '../database/entities/player.entity';
import { Event } from '../database/entities/event.entity';
import { UserPlayer } from '../database/entities/user-player.entity';
import { PlayersService } from '../players/players.service';
import { EventsService } from '../events/events.service';
import { GameEventsService } from '../game-events/game-events.service';
import { EventScoringService } from '../event-scoring/event-scoring.service';
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
    @InjectRepository(UserPlayer)
    private userPlayersRepository: Repository<UserPlayer>,
    private playersService: PlayersService,
    private eventsService: EventsService,
    public gameEventsService: GameEventsService,
    private eventScoringService: EventScoringService,
  ) {}

  async updateScore(playerId: number, points: number, description?: string, gameEventId?: number) {
    try {
      // Verifica che sia specificato un gameEventId (no più giocate generiche)
      if (!gameEventId) {
        throw new Error('È obbligatorio selezionare un evento per registrare il punteggio. Non sono più consentite giocate generiche.');
      }

      // Verifica che l'evento esista e non sia chiuso
      const gameEvent = await this.gameEventsService.findOne(gameEventId);
      if (gameEvent.closed) {
        throw new Error('Non è possibile aggiornare punteggi per una giornata già chiusa.');
      }

      // NUOVO SISTEMA: Salva il punteggio nella tabella event_scores per le classifiche storiche
      await this.eventScoringService.updatePlayerEventScore(
        playerId, 
        gameEventId, 
        points, 
        description || 'Punteggio evento'
      );

      // SISTEMA LEGACY: Aggiorna anche currentPoints per compatibilità
      await this.playersService.updateCurrentPoints(playerId, points);
      
      // Mantieni storico degli eventi per riferimento con gameEventId
      await this.eventsService.create(playerId, points, `[${gameEvent.name}] ${description || 'Punteggio evento'}`);

      // Ricalcola i punti totali delle squadre
      await this.recalculateAllTeamPoints();

      return {
        success: true,
        message: `Punteggio aggiornato: ${points > 0 ? '+' : ''}${points} punti per ${gameEvent.name}`
      };
    } catch (error) {
      console.error('Error in updateScore:', error);
      throw error;
    }
  }

  async updateEventScore(playerId: number, gameEventId: number, points: number, description?: string) {
    // Questa funzione ora è solo un wrapper per updateScore
    return this.updateScore(playerId, points, description, gameEventId);
  }

  async resetSystem(type: 'market' | 'scores' | 'all') {
    try {
      switch (type) {
        case 'market':
          await this.playersService.resetOwnership();
          await this.usersRepository
            .createQueryBuilder()
            .update()
            .set({ credits: 80 })
            .execute();
          break;
          
        case 'scores':
          await this.playersService.resetPoints();
          await this.eventsService.deleteAll();
          // Clear all event scores
          const gameEvents = await this.gameEventsService.findAll();
          for (const gameEvent of gameEvents) {
            await this.eventScoringService.deleteEventScores(gameEvent.id);
          }
          break;
          
        case 'all':
          await this.eventsService.deleteAll();
          await this.playersService.resetPoints();
          await this.playersService.resetOwnership();
          // Clear all event scores
          const allGameEvents = await this.gameEventsService.findAll();
          for (const gameEvent of allGameEvents) {
            await this.eventScoringService.deleteEventScores(gameEvent.id);
          }
          await this.usersRepository
            .createQueryBuilder()
            .update()
            .set({ credits: 80, totalPoints: 0 })
            .execute();
          break;
          
        default:
          throw new Error(`Invalid reset type: ${type}`);
      }

      return {
        success: true,
        message: 'Reset completato!'
      };
    } catch (error) {
      console.error('Error in resetSystem:', error);
      throw error;
    }
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

    // Rimuovi eventuali assegnazioni esistenti per questi giocatori
    await this.userPlayersRepository.delete({ playerId: In(playerIds) });

    // Crea nuove associazioni
    const userPlayers = playerIds.map(playerId => 
      this.userPlayersRepository.create({
        userId: user.id,
        playerId,
        selectedForLineup: false,
        isInFormation: false
      })
    );

    await this.userPlayersRepository.save(userPlayers);

    return {
      success: true,
      message: `${playerIds.length} giocatori assegnati al team ${teamName}`
    };
  }

  async getAllGameEventsForAdmin() {
    // Per l'admin, restituisci solo eventi attivi e non chiusi per la selezione nelle dropdown di punteggio
    return this.gameEventsService.findAll().then(events => 
      events.filter(event => !event.closed)
    );
  }

  async getAllGameEventsForDayClosure() {
    // Per la chiusura giornata, mostra solo eventi attivi e non ancora chiusi
    return this.gameEventsService.findAll().then(events => 
      events.filter(event => !event.closed)
    );
  }

  async getEventBasedRankings() {
    return this.eventScoringService.getAllUsersRanking();
  }

  async getUserEventHistory(userId: number) {
    return this.eventScoringService.getEventScoresForUser(userId);
  }

  async closeCurrentEvent(eventId?: number, eventName?: string) {
    return this.gameEventsService.closeCurrentEvent(eventId, eventName);
  }

  async getBestPlayersRanking(limit: number = 10) {
    return this.gameEventsService.getBestPlayersRanking(limit);
  }

  async getWorstPlayersRanking(limit: number = 10) {
    return this.gameEventsService.getWorstPlayersRanking(limit);
  }

  // Ricalcola i punti totali di tutte le squadre basandosi sui punti totali accumulati (currentPoints + yearlyPoints)
  private async recalculateAllTeamPoints(): Promise<void> {
    console.log('Recalculating all team points (Fantasy System)...');
    
    const users = await this.usersRepository.find();
    
    for (const user of users) {
      // Calcola i punti totali ACCUMULATI dei giocatori selezionati per la formazione
      const result = await this.userPlayersRepository
        .createQueryBuilder('userPlayer')
        .leftJoin('userPlayer.player', 'player')
        .select('COALESCE(SUM(player.currentPoints + player.yearlyPoints), 0)', 'totalPoints')
        .where('userPlayer.userId = :ownerId', { ownerId: user.id })
        .andWhere('userPlayer.selectedForLineup = :selected', { selected: true })
        .getRawOne<{ totalPoints: string }>();

      const totalPoints = Number(result?.totalPoints ?? 0);
      
      // Aggiorna sempre i punti totali dell'utente (possono essere negativi)
      user.totalPoints = totalPoints;
      await this.usersRepository.save(user);
      console.log(`Updated team ${user.name}: ${totalPoints} points`);
    }
    
    console.log('All team points recalculated successfully');
  }

  private generateRandomPassword(): string {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  }
}