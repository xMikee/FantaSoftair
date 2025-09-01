import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThanOrEqual } from 'typeorm';
import { GameEvent } from '../database/entities/game-event.entity';
import { CreateGameEventDto } from './dto/create-game-event.dto';
import { UpdateGameEventDto } from './dto/update-game-event.dto';

@Injectable()
export class GameEventsService {
  constructor(
    @InjectRepository(GameEvent)
    private gameEventsRepository: Repository<GameEvent>,
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
}