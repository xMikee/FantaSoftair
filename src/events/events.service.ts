import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../database/entities/event.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
  ) {}

  async findRecent(limit: number = 50) {
    return this.eventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.player', 'player')
      .select([
        'event.id',
        'event.date',
        'event.points',
        'event.description',
        'player.name'
      ])
      .orderBy('event.date', 'DESC')
      .limit(limit)
      .getMany()
      .then(events => 
        events.map(event => ({
          id: event.id,
          date: event.date,
          points: event.points,
          description: event.description,
          player_name: event.player.name
        }))
      );
  }

  async create(playerId: number, points: number, description?: string): Promise<Event> {
    const event = this.eventsRepository.create({
      playerId,
      points,
      description: description || 'Evento registrato dall\'admin'
    });
    
    return this.eventsRepository.save(event);
  }

  async deleteAll(): Promise<void> {
    await this.eventsRepository
      .createQueryBuilder()
      .delete()
      .execute();
  }
}