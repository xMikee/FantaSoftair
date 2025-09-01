import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SellPlayerDto {
  @ApiProperty({ description: 'User ID who wants to sell the player' })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({ description: 'Player ID to sell' })
  @IsNotEmpty()
  @IsNumber()
  playerId: number;
}