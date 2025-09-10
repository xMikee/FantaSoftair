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
import { UserEventScore } from '../database/entities/user-event-score.entity';
import { EventScore } from '../database/entities/event-score.entity';

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
    @InjectRepository(UserEventScore)
    private userEventScoreRepository: Repository<UserEventScore>,
    @InjectRepository(EventScore)
    private eventScoreRepository: Repository<EventScore>,
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

  async getNextEvent(): Promise<GameEvent | null> {
    const now = new Date();
    
    return this.gameEventsRepository.findOne({
      where: { 
        active: true,
        date: MoreThan(now)
      },
      order: { date: 'ASC' }
    });
  }

  async canModifyFormation(): Promise<{ canModify: boolean; reason?: string; nextEvent?: GameEvent; hoursUntilBlock?: number }> {
    const nextEvent = await this.getNextEvent();
    
    if (!nextEvent) {
      return { 
        canModify: true, 
        reason: "Nessun evento programmato" 
      };
    }

    const now = new Date();
    const eventDate = new Date(nextEvent.date);
    const twelveHoursBeforeEvent = new Date(eventDate.getTime() - (12 * 60 * 60 * 1000));
    const hoursUntilEvent = Math.max(0, Math.floor((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60)));
    const hoursUntilBlock = Math.max(0, Math.floor((twelveHoursBeforeEvent.getTime() - now.getTime()) / (1000 * 60 * 60)));

    // Se mancano più di 12 ore all'evento, si può modificare
    if (now < twelveHoursBeforeEvent) {
      return { 
        canModify: true, 
        nextEvent,
        hoursUntilBlock,
        reason: `Formazione modificabile ancora per ${hoursUntilBlock} ore (evento "${nextEvent.name}" in ${hoursUntilEvent} ore)` 
      };
    }

    // Se mancano meno di 12 ore all'evento, la formazione è bloccata
    // Controlla se ci sono eventi precedenti non chiusi (influenza il messaggio)
    const previousEvents = await this.gameEventsRepository.find({
      where: { 
        active: true,
        date: LessThanOrEqual(now),
        closed: false
      },
      order: { date: 'DESC' }
    });

    let reason: string;
    if (previousEvents.length > 0) {
      const lastUnClosedEvent = previousEvents[0];
      reason = `Formazione bloccata: mancano solo ${hoursUntilEvent} ore all'evento "${nextEvent.name}" e l'evento precedente "${lastUnClosedEvent.name}" non è ancora chiuso`;
    } else {
      reason = `Formazione bloccata: mancano solo ${hoursUntilEvent} ore all'evento "${nextEvent.name}" (meno di 12 ore richieste)`;
    }

    return { 
      canModify: false, 
      nextEvent,
      reason
    };
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
   * Salva anche gli snapshot delle classifiche dell'evento
   */
  async closeCurrentEvent(eventId?: number, eventName?: string): Promise<{ 
    message: string; 
    playersUpdated: number; 
    teamsRecalculated: number; 
  }> {
    // 1. Se è specificato un eventId, marca l'evento come chiuso e salva gli snapshot delle classifiche
    if (eventId) {
      const gameEvent = await this.gameEventsRepository.findOne({
        where: { id: eventId, active: true }
      });
      
      if (gameEvent) {
        // Salva gli snapshot delle classifiche prima di chiudere l'evento
        await this.saveEventRankingsSnapshot(eventId);
        
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

  /**
   * Ottiene la classifica completa di tutti i giocatori ordinati per punteggio totale
   */
  async getAllPlayersRanking(): Promise<Array<{
    id: number;
    name: string;
    position: string;
    currentPoints: number;
    yearlyPoints: number;
    totalPoints: number;
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
        'player.currentPoints',
        'player.yearlyPoints',
        'owner.name'
      ])
      .where('player.name != :adminName', { adminName: 'ADMIN' })
      .orderBy('(player.currentPoints + player.yearlyPoints)', 'DESC')
      .getMany();

    return players.map(player => ({
      id: player.id,
      name: player.name,
      position: player.position || 'N/A',
      currentPoints: player.currentPoints || 0,
      yearlyPoints: player.yearlyPoints || 0,
      totalPoints: (player.currentPoints || 0) + (player.yearlyPoints || 0),
      ownerName: player.userPlayers && player.userPlayers.length > 0 && player.userPlayers[0].user 
        ? player.userPlayers[0].user.name 
        : 'Svincolato'
    }));
  }

  /**
   * Ottieni storico degli eventi terminati con informazioni di base
   * Mostra solo eventi che hanno effettivamente punteggi assegnati
   */
  async getHistory(): Promise<Array<{
    id: number;
    name: string;
    date: Date;
    closed: boolean;
    playersCount?: number;
    teamsCount?: number;
  }>> {
    const closedEvents = await this.gameEventsRepository.find({
      where: { active: true, closed: true },
      order: { date: 'DESC' }
    });

    const historyData = [];
    for (const event of closedEvents) {
      // Conta solo se ci sono effettivamente punteggi
      const playersCount = await this.eventScoreRepository.count({
        where: { gameEventId: event.id }
      });
      
      const teamsCount = await this.userEventScoreRepository.count({
        where: { gameEventId: event.id }
      });

      // Mostra l'evento nello storico solo se ha almeno alcuni punteggi
      if (playersCount > 0 || teamsCount > 0) {
        historyData.push({
          id: event.id,
          name: event.name,
          date: event.date,
          closed: event.closed,
          playersCount,
          teamsCount
        });
      }
    }

    return historyData;
  }

  /**
   * Ottieni classifica squadre per un evento specifico
   * Se non ci sono punteggi squadre ma ci sono punteggi giocatori, calcola al volo
   */
  async getEventTeamRankings(eventId: number): Promise<Array<{
    position: number;
    userId: number;
    username: string;
    teamName: string;
    totalPoints: number;
    formationSnapshot?: any;
  }>> {
    console.log(`Cercando classifica squadre per evento ${eventId}`);
    
    // Controlla se ci sono UserEventScore per questo evento
    const teamScores = await this.userEventScoreRepository
      .createQueryBuilder('ues')
      .leftJoinAndSelect('ues.user', 'user')
      .where('ues.gameEventId = :eventId', { eventId })
      .getMany();

    console.log(`Trovati ${teamScores.length} punteggi squadre già calcolati per evento ${eventId}`);

    // Se ci sono punteggi squadre già calcolati, usali
    if (teamScores.length > 0) {
      return teamScores
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .map((score, index) => ({
          position: index + 1,
          userId: score.userId,
          username: score.user?.name || 'Sconosciuto',
          teamName: score.user?.name || 'Sconosciuto',
          totalPoints: score.totalPoints,
          formationSnapshot: score.formationSnapshot ? JSON.parse(score.formationSnapshot) : null
        }));
    }

    // Se non ci sono punteggi squadre, controlla se ci sono punteggi giocatori
    const playerScoresCount = await this.eventScoreRepository.count({
      where: { gameEventId: eventId }
    });

    console.log(`Trovati ${playerScoresCount} punteggi giocatori per evento ${eventId}`);

    // Se ci sono punteggi giocatori ma non squadre, calcola al volo
    if (playerScoresCount > 0) {
      console.log(`Calcolando punteggi squadre al volo per evento ${eventId}`);
      
      // Calcola i punteggi per tutti gli utenti per questo evento
      await this.eventScoringService.recalculateEventScores(eventId);
      
      // Ora riprova a recuperare i punteggi squadre
      const recalculatedTeamScores = await this.userEventScoreRepository
        .createQueryBuilder('ues')
        .leftJoinAndSelect('ues.user', 'user')
        .where('ues.gameEventId = :eventId', { eventId })
        .getMany();

      return recalculatedTeamScores
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .map((score, index) => ({
          position: index + 1,
          userId: score.userId,
          username: score.user?.name || 'Sconosciuto',
          teamName: score.user?.name || 'Sconosciuto',
          totalPoints: score.totalPoints,
          formationSnapshot: score.formationSnapshot ? JSON.parse(score.formationSnapshot) : null
        }));
    }

    // Se non ci sono né punteggi squadre né giocatori, restituisci array vuoto
    console.log(`Nessun punteggio trovato per evento ${eventId}`);
    return [];
  }

  /**
   * Ottieni classifiche salvate negli snapshot per un evento chiuso
   */
  async getEventRankingsFromSnapshot(eventId: number): Promise<{
    teamRankings: any[];
    playerRankings: any[];
  }> {
    const eventScore = await this.userEventScoreRepository.findOne({
      where: { gameEventId: eventId }
    });

    if (!eventScore) {
      return { teamRankings: [], playerRankings: [] };
    }

    return {
      teamRankings: eventScore.teamRankingSnapshot ? JSON.parse(eventScore.teamRankingSnapshot) : [],
      playerRankings: eventScore.playerRankingSnapshot ? JSON.parse(eventScore.playerRankingSnapshot) : []
    };
  }

  /**
   * Metodo di debug per controllare lo stato dei dati per un evento
   */
  async debugEventStatus(eventId: number): Promise<any> {
    console.log(`🔍 Debug status per evento ${eventId}`);
    
    try {
      // 1. Controlla se l'evento esiste
      const gameEvent = await this.gameEventsRepository.findOne({
        where: { id: eventId }
      });
      
      // 2. Conta punteggi nella tabella event_scores
      const eventScoresCount = await this.eventScoreRepository.count({
        where: { gameEventId: eventId }
      });
      
      // 3. Recupera i primi 5 punteggi event_scores per questo evento
      const sampleEventScores = await this.eventScoreRepository.find({
        where: { gameEventId: eventId },
        relations: ['player'],
        take: 5,
        order: { points: 'DESC' }
      });
      
      // 4. Conta record nella tabella user_event_scores
      const userEventScoresCount = await this.userEventScoreRepository.count({
        where: { gameEventId: eventId }
      });
      
      // 5. Recupera i primi 5 record user_event_scores per questo evento
      const sampleUserEventScores = await this.userEventScoreRepository.find({
        where: { gameEventId: eventId },
        relations: ['user'],
        take: 5,
        order: { totalPoints: 'DESC' }
      });
      
      // 6. Controlla se ci sono snapshot salvati
      const eventScoreWithSnapshot = await this.userEventScoreRepository.findOne({
        where: { gameEventId: eventId },
        select: ['id', 'teamRankingSnapshot', 'playerRankingSnapshot']
      });
      
      return {
        evento: {
          id: eventId,
          nome: gameEvent?.name || 'Non trovato',
          chiuso: gameEvent?.closed || false,
          esistente: !!gameEvent
        },
        punteggi_giocatori: {
          totale_record: eventScoresCount,
          esempi: sampleEventScores.map(es => ({
            giocatore: es.player?.name || 'Sconosciuto',
            punti: es.points,
            descrizione: es.description
          }))
        },
        punteggi_squadre: {
          totale_record: userEventScoresCount,
          esempi: sampleUserEventScores.map(ues => ({
            squadra: ues.user?.name || 'Sconosciuta',
            punti_totali: ues.totalPoints,
            ha_formation_snapshot: !!ues.formationSnapshot
          }))
        },
        snapshot: {
          presente: !!(eventScoreWithSnapshot?.teamRankingSnapshot || eventScoreWithSnapshot?.playerRankingSnapshot),
          team_ranking_size: eventScoreWithSnapshot?.teamRankingSnapshot ? JSON.parse(eventScoreWithSnapshot.teamRankingSnapshot).length : 0,
          player_ranking_size: eventScoreWithSnapshot?.playerRankingSnapshot ? JSON.parse(eventScoreWithSnapshot.playerRankingSnapshot).length : 0
        }
      };
    } catch (error) {
      console.error(`Errore nel debug per evento ${eventId}:`, error);
      return {
        errore: error.message,
        evento_id: eventId
      };
    }
  }

  /**
   * Metodo per ricostruire completamente i punteggi di un evento
   */
  async rebuildEventScores(eventId: number): Promise<any> {
    console.log(`🔧 Ricostruendo punteggi per evento ${eventId}`);
    
    try {
      // Prima ricalcola tutti i punteggi utente
      await this.eventScoringService.recalculateEventScores(eventId);
      
      // Poi ricalcola gli snapshot
      await this.saveEventRankingsSnapshot(eventId);
      
      // Ottieni le statistiche finali
      const debug = await this.debugEventStatus(eventId);
      
      return {
        success: true,
        message: `Punteggi ricostruiti per evento ${eventId}`,
        debug
      };
    } catch (error) {
      console.error(`Errore nella ricostruzione punteggi per evento ${eventId}:`, error);
      return {
        success: false,
        message: `Errore nella ricostruzione: ${error.message}`,
        eventId
      };
    }
  }

  /**
   * Ottieni classifica giocatori per un evento specifico
   */
  async getEventPlayerRankings(eventId: number): Promise<Array<{
    position: number;
    playerId: number;
    playerName: string;
    playerPosition: string;
    points: number;
    description?: string;
    ownerName?: string;
  }>> {
    console.log(`Cercando classifica completa giocatori per evento ${eventId}`);
    
    // Prima ottieni TUTTI i giocatori (escluso admin)
    const allPlayers = await this.playersRepository
      .createQueryBuilder('player')
      .leftJoin('player.userPlayers', 'userPlayer')
      .leftJoin('userPlayer.user', 'owner')
      .addSelect(['owner.name'])
      .where('player.name != :adminName AND player.id != 1', { adminName: 'ADMIN' })
      .getMany();

    console.log(`Trovati ${allPlayers.length} giocatori totali`);

    // Poi ottieni i punteggi per questo evento specifico
    const eventScores = await this.eventScoreRepository.find({
      where: { gameEventId: eventId }
    });

    console.log(`Trovati ${eventScores.length} punteggi per evento ${eventId}`);

    // Crea la mappa dei punteggi per ogni giocatore
    const scoresMap = new Map<number, { points: number; description: string }>();
    eventScores.forEach(score => {
      scoresMap.set(score.playerId, {
        points: score.points,
        description: score.description || ''
      });
    });

    // Combina tutti i giocatori con i loro punteggi (0 se non hanno punteggi)
    const playerRankings = allPlayers.map(player => {
      const eventScore = scoresMap.get(player.id);
      return {
        playerId: player.id,
        playerName: player.name,
        playerPosition: player.position || 'N/A',
        points: eventScore?.points || 0,
        description: eventScore?.description || 'Nessun punteggio',
        ownerName: player.userPlayers?.length > 0 && player.userPlayers[0].user 
          ? player.userPlayers[0].user.name 
          : 'Svincolato'
      };
    });

    // Ordina per punteggio decrescente, poi per nome
    playerRankings.sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      return a.playerName.localeCompare(b.playerName);
    });

    // Aggiungi la posizione
    const rankedPlayers = playerRankings.map((player, index) => ({
      position: index + 1,
      ...player
    }));

    console.log(`Classifica completa creata: ${rankedPlayers.length} giocatori`);
    console.log(`Top 3: ${rankedPlayers.slice(0, 3).map(p => `${p.playerName}: ${p.points}`).join(', ')}`);

    return rankedPlayers;
  }

  /**
   * Salva gli snapshot delle classifiche per un evento specifico
   */
  private async saveEventRankingsSnapshot(eventId: number): Promise<void> {
    try {
      console.log(`🏁 Iniziando salvataggio snapshot per evento ${eventId}`);
      
      // Prima controlla se ci sono punteggi nella tabella event_scores
      const eventScoresCount = await this.eventScoreRepository.count({
        where: { gameEventId: eventId }
      });
      console.log(`📊 Trovati ${eventScoresCount} punteggi giocatori nella tabella event_scores per evento ${eventId}`);
      
      // Se non ci sono punteggi specifici per l'evento, non possiamo creare snapshot
      if (eventScoresCount === 0) {
        console.log(`⚠️ Nessun punteggio specifico trovato per evento ${eventId} nella tabella event_scores. Skip salvataggio snapshot.`);
        console.log(`💡 Suggerimento: Assicurati che i punteggi vengano salvati tramite updatePlayerEventScore quando aggiungi punteggi.`);
        return;
      }
      
      // Prima assicurati che i punteggi siano calcolati per tutti gli utenti per questo evento
      console.log(`🔄 Ricalcolando punteggi utenti per evento ${eventId}`);
      await this.eventScoringService.recalculateEventScores(eventId);
      
      // Ottieni le classifiche attuali (solo per questo evento specifico)
      console.log(`📈 Caricando classifiche per evento ${eventId}`);
      const teamRankings = await this.getEventTeamRankings(eventId);
      const playerRankings = await this.getEventPlayerRankings(eventId);

      console.log(`🏆 Team rankings: ${teamRankings.length} squadre`);
      console.log(`⚽ Player rankings: ${playerRankings.length} giocatori`);

      // Debug: mostra i primi 3 elementi di ogni classifica
      if (teamRankings.length > 0) {
        console.log(`🥇 Top 3 squadre:`, teamRankings.slice(0, 3).map(t => `${t.teamName}: ${t.totalPoints} punti`));
      }
      if (playerRankings.length > 0) {
        console.log(`⭐ Top 3 giocatori:`, playerRankings.slice(0, 3).map(p => `${p.playerName}: ${p.points} punti`));
      }

      if (teamRankings.length === 0 && playerRankings.length === 0) {
        console.log(`❌ Nessuna classifica generata per evento ${eventId}, skip salvataggio snapshot`);
        return;
      }

      // Trova tutti i record UserEventScore per questo evento
      let userEventScores = await this.userEventScoreRepository.find({
        where: { gameEventId: eventId }
      });

      console.log(`📋 Trovati ${userEventScores.length} record UserEventScore per evento ${eventId}`);

      // Se non ci sono record UserEventScore, creali per tutti gli utenti
      if (userEventScores.length === 0) {
        const allUsers = await this.usersRepository.find();
        console.log(`👥 Creando record UserEventScore per ${allUsers.length} utenti`);
        
        for (const user of allUsers) {
          await this.eventScoringService.calculateUserEventScore(user.id, eventId);
        }
        
        // Ricarica i record dopo averli creati
        userEventScores = await this.userEventScoreRepository.find({
          where: { gameEventId: eventId }
        });
        console.log(`✅ Creati ${userEventScores.length} nuovi record UserEventScore`);
      }

      // Salva gli snapshot in batch per efficienza
      const teamRankingSnapshotJson = JSON.stringify(teamRankings);
      const playerRankingSnapshotJson = JSON.stringify(playerRankings);

      console.log(`💾 Salvando snapshot nel database...`);
      const updateResult = await this.userEventScoreRepository
        .createQueryBuilder()
        .update()
        .set({
          teamRankingSnapshot: teamRankingSnapshotJson,
          playerRankingSnapshot: playerRankingSnapshotJson
        })
        .where('gameEventId = :eventId', { eventId })
        .execute();

      console.log(`✅ Snapshot delle classifiche salvato per evento ${eventId}`);
      console.log(`   - ${userEventScores.length} record UserEventScore aggiornati`);
      console.log(`   - ${teamRankings.length} squadre nella classifica`);
      console.log(`   - ${playerRankings.length} giocatori nella classifica`);
      console.log(`   - Affected rows: ${updateResult.affected}`);
    } catch (error) {
      console.error(`❌ Errore nel salvataggio degli snapshot per evento ${eventId}:`, error);
      throw error;
    }
  }
}