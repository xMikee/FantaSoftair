import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly ADMIN_PASSWORD = 'admin123';

  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  authenticate(password: string) {
    if (!password) {
      throw new UnauthorizedException('Password richiesta');
    }

    if (password !== this.ADMIN_PASSWORD) {
      throw new UnauthorizedException('Password non corretta');
    }

    return {
      success: true,
      message: 'Autenticazione riuscita'
    };
  }

  validatePassword(password: string): boolean {
    return password === this.ADMIN_PASSWORD;
  }

  async loginUser(userName: string, password: string) {
    const user = await this.usersRepository.findOne({
      where: { name: userName }
    });

    if (!user) {
      throw new UnauthorizedException('Utente non trovato');
    }

    // If user has no password set, allow login (for backward compatibility)
    // Otherwise, validate the password
    if (user.password && user.password !== password) {
      throw new UnauthorizedException('Password non corretta');
    }

    const payload = { userId: user.id, userName: user.name };
    const accessToken = this.jwtService.sign(payload);

    return {
      success: true,
      message: 'Login effettuato con successo',
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        credits: user.credits,
        hasPassword: !!user.password
      }
    };
  }

  async setUserPassword(userId: number, newPassword: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new UnauthorizedException('Utente non trovato');
    }

    user.password = newPassword;
    await this.usersRepository.save(user);

    return {
      success: true,
      message: 'Password impostata con successo'
    };
  }

  async validateUserToken(payload: any): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { id: payload.userId }
    });
    
    if (!user) {
      throw new UnauthorizedException('Token non valido');
    }
    
    return user;
  }

  async getAllUserPasswords() {
    const users = await this.usersRepository.find({
      select: ['id', 'name', 'password'],
      order: { name: 'ASC' }
    });

    return {
      success: true,
      users: users.map(user => ({
        id: user.id,
        name: user.name,
        password: user.password || 'Nessuna password'
      }))
    };
  }
}