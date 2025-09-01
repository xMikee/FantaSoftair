import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Player } from '../database/entities/player.entity';
import * as crypto from 'crypto';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Player)
    private playersRepository: Repository<Player>,
  ) {}

  async loginToTeam(teamName: string, password: string) {
    const user = await this.usersRepository.findOne({ 
      where: { name: teamName },
      relations: ['players']
    });

    if (!user) {
      throw new UnauthorizedException('Team non trovato');
    }

    if (!user.teamPassword) {
      const randomPassword = this.generateRandomPassword();
      user.teamPassword = randomPassword;
      await this.usersRepository.save(user);
      throw new UnauthorizedException(`Password generata automaticamente: ${randomPassword}. Riprova con questa password.`);
    }

    if (user.teamPassword !== password) {
      throw new UnauthorizedException('Password errata');
    }

    return {
      success: true,
      teamName: user.name,
      credits: user.credits,
      totalPoints: user.totalPoints,
      players: user.players.map(player => ({
        id: player.id,
        name: player.name,
        position: player.position,
        currentPoints: player.currentPoints,
        isInFormation: player.isInFormation || false
      }))
    };
  }

  async getTeamFormation(teamId: number) {
    const user = await this.usersRepository.findOne({
      where: { id: teamId },
      relations: ['players']
    });

    if (!user) {
      throw new UnauthorizedException('Team non trovato');
    }

    const formation = user.players.filter(player => player.isInFormation);
    
    return {
      teamName: user.name,
      formation: formation.map(player => ({
        id: player.id,
        name: player.name,
        position: player.position,
        currentPoints: player.currentPoints
      })),
      formationCount: formation.length
    };
  }

  async updateFormation(teamId: number, playerIds: number[]) {
    if (playerIds.length !== 8) {
      throw new BadRequestException('La formazione deve contenere esattamente 8 giocatori');
    }

    const user = await this.usersRepository.findOne({
      where: { id: teamId },
      relations: ['players']
    });

    if (!user) {
      throw new UnauthorizedException('Team non trovato');
    }

    // Reset formazione esistente
    await this.playersRepository.update(
      { owner: { id: teamId } },
      { isInFormation: false }
    );

    // Imposta nuova formazione
    const validPlayers = await this.playersRepository.find({
      where: { 
        id: In(playerIds),
        owner: { id: teamId }
      }
    });

    if (validPlayers.length !== 8) {
      throw new BadRequestException('Alcuni giocatori selezionati non appartengono alla tua squadra');
    }

    await this.playersRepository.update(
      { id: In(playerIds) },
      { isInFormation: true }
    );

    return {
      success: true,
      message: 'Formazione aggiornata con successo',
      formation: validPlayers.map(player => ({
        id: player.id,
        name: player.name,
        position: player.position
      }))
    };
  }

  async getTeamPassword(teamName: string): Promise<string> {
    const user = await this.usersRepository.findOne({ 
      where: { name: teamName }
    });

    if (!user) {
      throw new UnauthorizedException('Team non trovato');
    }

    if (!user.teamPassword) {
      const randomPassword = this.generateRandomPassword();
      user.teamPassword = randomPassword;
      await this.usersRepository.save(user);
      return randomPassword;
    }

    return user.teamPassword;
  }

  async resetTeamPassword(teamName: string): Promise<string> {
    const user = await this.usersRepository.findOne({ 
      where: { name: teamName }
    });

    if (!user) {
      throw new UnauthorizedException('Team non trovato');
    }

    const newPassword = this.generateRandomPassword();
    user.teamPassword = newPassword;
    await this.usersRepository.save(user);
    
    return newPassword;
  }

  private generateRandomPassword(): string {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  }
}