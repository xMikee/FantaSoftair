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

    // Generate password if not exists
    if (!user.teamPassword) {
      const crypto = await import('crypto');
      const randomPassword = crypto.randomBytes(4).toString('hex').toUpperCase();
      user.teamPassword = randomPassword;
      await this.usersRepository.save(user);
      throw new UnauthorizedException(`Password generata automaticamente: ${randomPassword}. Riprova con questa password.`);
    }

    // Verify password
    if (user.teamPassword !== password) {
      throw new UnauthorizedException('Password errata');
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
        credits: user.credits
      }
    };
  }

  // Password management removed - not needed for this application

  async validateUserToken(payload: any): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { id: payload.userId }
    });
    
    if (!user) {
      throw new UnauthorizedException('Token non valido');
    }
    
    return user;
  }

  async getAllUsers() {
    const users = await this.usersRepository.find({
      select: ['id', 'name'],
      order: { name: 'ASC' }
    });

    return {
      success: true,
      users: users.map(user => ({
        id: user.id,
        name: user.name
      }))
    };
  }

  async getAllPasswords() {
    const users = await this.usersRepository.find({
      select: ['id', 'name', 'teamPassword'],
      order: { name: 'ASC' }
    });

    // Generate passwords for users who don't have one
    const crypto = await import('crypto');
    const updatedUsers = [];

    for (const user of users) {
      if (!user.teamPassword) {
        const randomPassword = crypto.randomBytes(4).toString('hex').toUpperCase();
        user.teamPassword = randomPassword;
        await this.usersRepository.save(user);
      }
      updatedUsers.push({
        id: user.id,
        name: user.name,
        password: user.teamPassword
      });
    }

    return {
      success: true,
      users: updatedUsers
    };
  }
}