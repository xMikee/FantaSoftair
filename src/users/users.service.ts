import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      order: { name: 'ASC' }
    });
  }

  async findOne(id: number): Promise<User> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async updateCredits(id: number, credits: number): Promise<void> {
    await this.usersRepository.update(id, { credits });
  }

  async adjustCredits(id: number, amount: number): Promise<void> {
    await this.usersRepository.increment({ id }, 'credits', amount);
  }
}