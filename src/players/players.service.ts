import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Player } from '../database/entities/player.entity';
import { UserPlayer } from '../database/entities/user-player.entity';
import { User } from '../database/entities/user.entity';

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player)
    private playersRepository: Repository<Player>,
    @InjectRepository(UserPlayer)
    private userPlayersRepository: Repository<UserPlayer>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

    private async updateOwnerTotalPoints(ownerId: number): Promise<void> {
        if (!ownerId) return;

        console.log(`Updating total points for user ${ownerId}...`);

        // Calcolo dei punti totali del giocatore usando la nuova struttura
        const result = await this.userPlayersRepository
            .createQueryBuilder('userPlayer')
            .leftJoin('userPlayer.player', 'player')
            .select('COALESCE(SUM(player.currentPoints), 0)', 'totalPoints')
            .where('userPlayer.userId = :ownerId', { ownerId })
            .andWhere('userPlayer.selectedForLineup = :selected', { selected: true })
            .getRawOne<{ totalPoints: string }>();

        const totalPoints = Number(result?.totalPoints ?? 0);
        console.log(`Calculated total points: ${totalPoints} for user ${ownerId}`);

        // Aggiornamento del campo total_points nella tabella users
        await this.usersRepository.update(ownerId, { totalPoints });

        console.log(`Updated total points: ${totalPoints} for user ${ownerId}`);
    }


    async findAll(available?: boolean, userId?: number): Promise<Player[]> {
    if (available) {
      // In un sistema fantasy, tutti i giocatori sono sempre disponibili per l'acquisto
      // Ogni squadra può acquistare qualsiasi giocatore indipendentemente dal fatto che sia già posseduto da altri
      return this.playersRepository.find({ order: { baseValue: 'DESC' } });
    } else if (userId) {
      // Trova tutti i giocatori posseduti da un utente specifico
      return this.userPlayersRepository
        .createQueryBuilder('userPlayer')
        .leftJoinAndSelect('userPlayer.player', 'player')
        .where('userPlayer.userId = :userId', { userId })
        .orderBy('player.baseValue', 'DESC')
        .getMany()
        .then(userPlayers => userPlayers.map(up => ({
          ...up.player,
          selectedForLineup: up.selectedForLineup || false,
          isInFormation: up.isInFormation || false
        })));
    }
    
    return this.playersRepository.find({ order: { baseValue: 'DESC' } });
  }

  async getTemplatePlayersForMarket(): Promise<Player[]> {
    // Tutti i giocatori sono ora template/master data - nessuno ha un owner diretto
    return this.playersRepository.find({
      order: { baseValue: 'DESC' }
    });
  }

  async findOne(id: number): Promise<Player> {
    return this.playersRepository.findOne({ where: { id } });
  }

  // Metodo deprecato - ora usiamo la tabella UserPlayer per gestire l'ownership

  async updatePoints(id: number, points: number): Promise<void> {
    const player = await this.playersRepository.findOne({ where: { id } });
    if (!player) {
      throw new Error('Player not found');
    }

    // Ora tutti i giocatori sono template/master - aggiorna il giocatore master
    await this.playersRepository.increment({ id }, 'currentPoints', points);
    
    // Aggiorna i punti totali di tutti gli utenti che possiedono questo giocatore
    const ownerships = await this.userPlayersRepository.find({
      where: { playerId: id }
    });
    
    const ownerIds = [...new Set(ownerships.map(up => up.userId))];
    for (const ownerId of ownerIds) {
      await this.updateOwnerTotalPoints(ownerId);
    }
  }

  // NUOVO METODO PER SISTEMA FANTASY: funziona come updatePoints ma per il nuovo sistema
  async updateCurrentPoints(id: number, points: number): Promise<void> {
    console.log(`Adding ${points} points to player ${id} (Fantasy System)`);
    
    const player = await this.playersRepository.findOne({ where: { id } });
    if (!player) {
      throw new Error('Player not found');
    }

    // Aggiorna il giocatore master
    await this.playersRepository.increment({ id }, 'currentPoints', points);
    console.log(`Updated player ${player.name} by ${points} points`);
  }

  async resetOwnership(): Promise<void> {
    // Rimuovi tutte le associazioni user-player
    await this.userPlayersRepository.clear();
  }

  async resetPoints(): Promise<void> {
    await this.playersRepository
      .createQueryBuilder()
      .update()
      .set({ currentPoints: 0 })
      .execute();
  }

  async countByOwner(ownerId: number): Promise<number> {
    return this.userPlayersRepository.count({ where: { userId: ownerId } });
  }

  async updateLineupSelection(playerId: number, userId: number, selected: boolean): Promise<void> {
    const userPlayer = await this.userPlayersRepository.findOne({
      where: { playerId, userId }
    });
    
    if (!userPlayer) {
      throw new Error('Player not found in user team');
    }

    await this.userPlayersRepository.update(userPlayer.id, { selectedForLineup: selected });
    await this.updateOwnerTotalPoints(userId);
  }

  async getSelectedLineup(userId: number): Promise<Player[]> {
    return this.userPlayersRepository
      .createQueryBuilder('userPlayer')
      .leftJoinAndSelect('userPlayer.player', 'player')
      .where('userPlayer.userId = :userId', { userId })
      .andWhere('userPlayer.selectedForLineup = :selected', { selected: true })
      .getMany()
      .then(userPlayers => userPlayers.map(up => up.player));
  }

  async countSelectedByOwner(ownerId: number): Promise<number> {
    return this.userPlayersRepository.count({ 
      where: { userId: ownerId, selectedForLineup: true } 
    });
  }

  async resetLineupSelections(userId?: number): Promise<void> {
    if (userId) {
      await this.userPlayersRepository.update(
        { userId }, 
        { selectedForLineup: false }
      );
      await this.updateOwnerTotalPoints(userId);
    } else {
      await this.userPlayersRepository.update({}, { selectedForLineup: false });
      
      const users = await this.userPlayersRepository
        .createQueryBuilder('userPlayer')
        .select('DISTINCT userPlayer.userId', 'userId')
        .getRawMany();
      
      for (const user of users) {
        await this.updateOwnerTotalPoints(user.userId);
      }
    }
  }

    async getTopPlayer(): Promise<Player> {
        return this.playersRepository
            .createQueryBuilder('player')
            .select([
                'player.id',
                'player.name', 
                'player.currentPoints',
                'player.baseValue',
                'player.position'
            ])
            .orderBy('player.currentPoints', 'DESC')
            .limit(1)
            .getOne();
    }
}