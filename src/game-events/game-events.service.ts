import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThanOrEqual } from 'typeorm';
import { GameEvent } from '../database/entities/game-event.entity';
import { Event } from '../database/entities/event.entity';
import { Player } from '../database/entities/player.entity';
import { User } from '../database/entities/user.entity';
import { UserPlayer } from '../database/entities/user-player.entity';
import { CreateGameEventDto } from './dto/create-game-event.dto';
import { UpdateGameEventDto } from './dto/update-game-event.dto';
import { EventScoringService } from '../event-scoring/event-scoring.service';

@Injectable()
export class GameEventsService {
  constructor(
    @InjectRepository(GameEvent)
    private gameEventsRepository: Repository<GameEvent>,
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    @InjectRepository(Player)
    private playersRepository: Repository<Player>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserPlayer)
    private userPlayersRepository: Repository<UserPlayer>,
    private eventScoringService: EventScoringService,
  ) {}

  async create(createGameEventDto: CreateGameEventDto): Promise<GameEvent> {
    const gameEvent = this.gameEventsRepository.create({
      ...createGameEventDto,
      date: new Date(createGameEventDto.date),
    });
    return this.gameEventsRepository.save(gameEvent);
  }

  async findAll(): Promise<GameEvent[]> {
    return this.gameEventsRepository.find({
      where: { active: true },
      order: { date: 'ASC' }
    });
  }

  async findUpcoming(): Promise<GameEvent[]> {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    return this.gameEventsRepository.find({
      where: { 
        active: true,
        date: MoreThan(now)
      },
      order: { date: 'ASC' }
    });
  }

  async findPast(): Promise<GameEvent[]> {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    
    return this.gameEventsRepository.find({
      where: { 
        active: true,
        date: LessThanOrEqual(now)
      },
      order: { date: 'DESC' }
    });
  }

  async findOne(id: number): Promise<GameEvent> {
    const gameEvent = await this.gameEventsRepository.findOne({
      where: { id, active: true }
    });
    
    if (!gameEvent) {
      throw new NotFoundException(`Evento con ID ${id} non trovato`);
    }
    
    return gameEvent;
  }

  async update(id: number, updateGameEventDto: UpdateGameEventDto): Promise<GameEvent> {
    const gameEvent = await this.findOne(id);
    
    if (updateGameEventDto.date) {
      updateGameEventDto.date = new Date(updateGameEventDto.date).toISOString();
    }
    
    Object.assign(gameEvent, updateGameEventDto);
    return this.gameEventsRepository.save(gameEvent);
  }

  async remove(id: number): Promise<void> {
    const gameEvent = await this.findOne(id);
    gameEvent.active = false;
    await this.gameEventsRepository.save(gameEvent);
  }

  async removeCompletely(id: number): Promise<void> {
    const result = await this.gameEventsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Evento con ID ${id} non trovato`);
    }
  }

  /**
   * Chiude l'evento corrente: trasferisce currentPoints -> yearlyPoints e azzera currentPoints
   * Sistema Fantasy Football: come chiusura di una giornata
   */
  async closeCurrentEvent(eventId?: number, eventName?: string): Promise<{ 
    message: string; 
    playersUpdated: number; 
    teamsRecalculated: number; 
  }> {
    // 1. Se è specificato un eventId, marca l'evento come chiuso
    if (eventId) {
      const gameEvent = await this.gameEventsRepository.findOne({
        where: { id: eventId, active: true }
      });
      
      if (gameEvent) {
        gameEvent.closed = true;
        await this.gameEventsRepository.save(gameEvent);
      }
    }

    // 2. Trasferisce currentPoints -> yearlyPoints per tutti i giocatori
    const players = await this.playersRepository.find();
    
    let playersUpdated = 0;
    for (const player of players) {
      if (player.currentPoints !== 0) {
        console.log(`Transferring player ${player.name}: ${player.currentPoints} current -> ${player.yearlyPoints} yearly (will become ${player.yearlyPoints + player.currentPoints})`);
        player.yearlyPoints += player.currentPoints;
        player.currentPoints = 0;
        await this.playersRepository.save(player);
        playersUpdated++;
        console.log(`Player ${player.name} updated: yearlyPoints = ${player.yearlyPoints}, currentPoints = ${player.currentPoints}`);
      }
    }

    // 3. NON TOCCARE I totalPoints delle squadre - devono rimanere come sono!
    // I totalPoints vengono calcolati dinamicamente dalla classifica basandosi sui yearlyPoints
    let teamsRecalculated = 0;

    // 4. Registra la chiusura della giornata nello storico
    const dayClosureName = eventName || 'Giornata Chiusa';
    
    // Trova il primo giocatore per creare un evento di sistema
    const firstPlayer = players.length > 0 ? players[0] : null;
    if (firstPlayer) {
      const dayClosureEvent = this.eventsRepository.create({
        playerId: firstPlayer.id,
        points: 0,
        description: `🏁 CHIUSURA GIORNATA: ${dayClosureName} - ${playersUpdated} giocatori aggiornati, classifica generale mantenuta`,
      });
      await this.eventsRepository.save(dayClosureEvent);
    }

    return {
      message: `Evento chiuso con successo! Giornata: ${dayClosureName}. Tutti i punti sono stati trasferiti nello storico annuale. La classifica generale mantiene i punti accumulati.`,
      playersUpdated,
      teamsRecalculated
    };
  }

  /**
   * Ottiene la classifica dei migliori giocatori dell'anno (basata su yearlyPoints)
   */
  async getBestPlayersRanking(limit: number = 10): Promise<Array<{
    id: number;
    name: string;
    position: string;
    yearlyPoints: number;
    ownerName?: string;
  }>> {
    const players = await this.playersRepository
      .createQueryBuilder('player')
      .leftJoin('player.userPlayers', 'userPlayer')
      .leftJoin('userPlayer.user', 'owner')
      .select([
        'player.id',
        'player.name', 
        'player.position',
        'player.yearlyPoints',
        'owner.name'
      ])
      .where('player.yearlyPoints > 0')
      .orderBy('player.yearlyPoints', 'DESC')
      .limit(limit)
      .getMany();

    return players.map(player => ({
      id: player.id,
      name: player.name,
      position: player.position || 'N/A',
      yearlyPoints: player.yearlyPoints,
      ownerName: ''
    }));
  }

  /**
   * Ottiene la classifica dei peggiori giocatori dell'anno (basata su yearlyPoints)
   */
  async getWorstPlayersRanking(limit: number = 10): Promise<Array<{
    id: number;
    name: string;
    position: string;
    yearlyPoints: number;
    ownerName?: string;
  }>> {
    const players = await this.playersRepository
      .createQueryBuilder('player')
      .leftJoin('player.userPlayers', 'userPlayer')
      .leftJoin('userPlayer.user', 'owner')
      .select([
        'player.id',
        'player.name',
        'player.position', 
        'player.yearlyPoints',
        'owner.name'
      ])
      .where('player.yearlyPoints < 0')
      .orderBy('player.yearlyPoints', 'ASC')
      .limit(limit)
      .getMany();

    return players.map(player => ({
      id: player.id,
      name: player.name,
      position: player.position || 'N/A',
      yearlyPoints: player.yearlyPoints,
      ownerName: ''
    }));
  }
}