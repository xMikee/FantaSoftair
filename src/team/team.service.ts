import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Player } from '../database/entities/player.entity';
import { UserPlayer } from '../database/entities/user-player.entity';
import { GameEventsService } from '../game-events/game-events.service';
import * as crypto from 'crypto';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Player)
    private playersRepository: Repository<Player>,
    @InjectRepository(UserPlayer)
    private userPlayersRepository: Repository<UserPlayer>,
    private gameEventsService: GameEventsService,
  ) {}

  async loginToTeam(teamName: string, password: string) {
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
      throw new UnauthorizedException(`Password generata automaticamente: ${randomPassword}. Riprova con questa password.`);
    }

    if (user.teamPassword !== password) {
      throw new UnauthorizedException('Password errata');
    }

    // Get user's players using the new structure
    const userPlayers = await this.userPlayersRepository.find({
      where: { userId: user.id },
      relations: ['player']
    });

    return {
      success: true,
      teamName: user.name,
      credits: user.credits,
      totalPoints: user.totalPoints,
      players: userPlayers.map(userPlayer => ({
        id: userPlayer.player.id,
        name: userPlayer.player.name,
        position: userPlayer.player.position,
        currentPoints: userPlayer.player.currentPoints,
        isInFormation: userPlayer.isInFormation || false
      }))
    };
  }

  async getTeamFormation(teamId: number) {
    const user = await this.usersRepository.findOne({
      where: { id: teamId }
    });

    if (!user) {
      throw new UnauthorizedException('Team non trovato');
    }

    const formationUserPlayers = await this.userPlayersRepository.find({
      where: { userId: teamId, isInFormation: true },
      relations: ['player']
    });
    
    return {
      teamName: user.name,
      formation: formationUserPlayers.map(userPlayer => ({
        id: userPlayer.player.id,
        name: userPlayer.player.name,
        position: userPlayer.player.position,
        currentPoints: userPlayer.player.currentPoints
      })),
      formationCount: formationUserPlayers.length
    };
  }

  async updateFormation(teamId: number, playerIds: number[]) {
    // Controlla se è possibile modificare la formazione
    const formationCheck = await this.gameEventsService.canModifyFormation();
    
    if (!formationCheck.canModify) {
      throw new BadRequestException(`Impossibile modificare la formazione: ${formationCheck.reason}`);
    }

    if (playerIds.length !== 8) {
      throw new BadRequestException('La formazione deve contenere esattamente 8 giocatori');
    }

    const user = await this.usersRepository.findOne({
      where: { id: teamId }
    });

    if (!user) {
      throw new UnauthorizedException('Team non trovato');
    }

    // Reset formazione esistente
    await this.userPlayersRepository.update(
      { userId: teamId },
      { isInFormation: false }
    );

    // Verifica che i giocatori appartengano al team
    const validUserPlayers = await this.userPlayersRepository.find({
      where: { 
        playerId: In(playerIds),
        userId: teamId
      },
      relations: ['player']
    });

    if (validUserPlayers.length !== 8) {
      throw new BadRequestException('Alcuni giocatori selezionati non appartengono alla tua squadra');
    }

    // Imposta nuova formazione
    await this.userPlayersRepository.update(
      { 
        playerId: In(playerIds),
        userId: teamId
      },
      { isInFormation: true }
    );

    return {
      success: true,
      message: 'Formazione aggiornata con successo',
      formation: validUserPlayers.map(userPlayer => ({
        id: userPlayer.player.id,
        name: userPlayer.player.name,
        position: userPlayer.player.position
      })),
      formationStatus: formationCheck
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

  async getFormationStatus() {
    return this.gameEventsService.canModifyFormation();
  }

  private generateRandomPassword(): string {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  }
}