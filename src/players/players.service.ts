import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Player } from '../database/entities/player.entity';

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player)
    private playersRepository: Repository<Player>,
  ) {}

    private async updateOwnerTotalPoints(ownerId: number): Promise<void> {
        if (!ownerId) return;

        console.log(`Updating total points for user ${ownerId}...`);

        // Calcolo dei punti totali del giocatore
        const result = await this.playersRepository
            .createQueryBuilder('player')
            .select('COALESCE(SUM(player.currentPoints), 0)', 'totalPoints')
            .where('player.ownerId = :ownerId', { ownerId })
            .andWhere('player.selectedForLineup = :selected', { selected: true })
            .getRawOne<{ totalPoints: string }>();

        const totalPoints = Number(result?.totalPoints ?? 0);
        console.log(`Calculated total points: ${totalPoints} for user ${ownerId}`);

        // Aggiornamento del campo total_points nella tabella users
        const updateResult = await this.playersRepository.manager
            .createQueryBuilder()
            .update('users')
            .set({ totalPoints })
            .where('id = :ownerId', { ownerId })
            .execute();

        console.log(`Update result for user ${ownerId}:`, updateResult);
    }


    async findAll(available?: boolean, userId?: number): Promise<Player[]> {
    const queryBuilder = this.playersRepository.createQueryBuilder('player');
    
    if (available) {
      queryBuilder.where('player.ownerId IS NULL');
    } else if (userId) {
      queryBuilder.where('player.ownerId = :userId', { userId });
    }
    
    queryBuilder.orderBy('player.baseValue', 'DESC');
    
    return queryBuilder.getMany();
  }

  async getTemplatePlayersForMarket(): Promise<Player[]> {
    return this.playersRepository.find({
      where: { ownerId: null }
    });
  }

  async findOne(id: number): Promise<Player> {
    return this.playersRepository.findOne({ where: { id } });
  }

  async updateOwner(id: number, ownerId: number | null): Promise<void> {
    await this.playersRepository.update(id, { ownerId });
  }

  async updatePoints(id: number, points: number): Promise<void> {
    const player = await this.playersRepository.findOne({ where: { id } });
    if (!player) {
      throw new Error('Player not found');
    }

    // If it's a template player (no owner), update all players with the same name
    if (!player.ownerId) {
      await this.playersRepository.increment({ name: player.name }, 'currentPoints', points);
      
      // Update total points for all owners of players with this name  
      const ownedPlayers = await this.playersRepository
        .createQueryBuilder('player')
        .where('player.name = :name', { name: player.name })
        .andWhere('player.ownerId IS NOT NULL')
        .getMany();
      
      const ownerIds = [...new Set(ownedPlayers.map(p => p.ownerId))];
      for (const ownerId of ownerIds) {
        if (ownerId) {
          await this.updateOwnerTotalPoints(ownerId);
        }
      }
    } else {
      // If it's an owned player, update just this player
      await this.playersRepository.increment({ id }, 'currentPoints', points);
      await this.updateOwnerTotalPoints(player.ownerId);
    }
  }

  async resetOwnership(): Promise<void> {
    await this.playersRepository
      .createQueryBuilder()
      .update()
      .set({ ownerId: null })
      .execute();
  }

  async resetPoints(): Promise<void> {
    await this.playersRepository
      .createQueryBuilder()
      .update()
      .set({ currentPoints: 0 })
      .execute();
  }

  async countByOwner(ownerId: number): Promise<number> {
    return this.playersRepository.count({ where: { ownerId } });
  }

  async updateLineupSelection(playerId: number, selected: boolean): Promise<void> {
    const player = await this.playersRepository.findOne({ where: { id: playerId } });
    if (!player) {
      throw new Error('Player not found');
    }

    await this.playersRepository.update(playerId, { selectedForLineup: selected });
    
    if (player.ownerId) {
      await this.updateOwnerTotalPoints(player.ownerId);
    }
  }

  async getSelectedLineup(userId: number): Promise<Player[]> {
    return this.playersRepository.find({
      where: { ownerId: userId, selectedForLineup: true }
    });
  }

  async countSelectedByOwner(ownerId: number): Promise<number> {
    return this.playersRepository.count({ 
      where: { ownerId, selectedForLineup: true } 
    });
  }

  async resetLineupSelections(userId?: number): Promise<void> {
    const whereCondition = userId ? { ownerId: userId } : {};
    await this.playersRepository.update(whereCondition, { selectedForLineup: false });
    
    if (userId) {
      await this.updateOwnerTotalPoints(userId);
    } else {
      const users = await this.playersRepository
        .createQueryBuilder('player')
        .select('DISTINCT player.ownerId', 'ownerId')
        .where('player.ownerId IS NOT NULL')
        .getRawMany();
      
      for (const user of users) {
        await this.updateOwnerTotalPoints(user.ownerId);
      }
    }
  }

    async getTopPlayer():Promise<Player> {
        return this.playersRepository
            .createQueryBuilder('player')
            .leftJoinAndSelect('player.owner','owner')
            .orderBy('player.currentPoints','DESC')
            .limit(1)
            .getOne()

    }
}