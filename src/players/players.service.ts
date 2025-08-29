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

  async findOne(id: number): Promise<Player> {
    return this.playersRepository.findOne({ where: { id } });
  }

  async updateOwner(id: number, ownerId: number | null): Promise<void> {
    await this.playersRepository.update(id, { ownerId });
  }

  async updatePoints(id: number, points: number): Promise<void> {
    await this.playersRepository.increment({ id }, 'currentPoints', points);
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
    await this.playersRepository.update(playerId, { selectedForLineup: selected });
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
  }
}