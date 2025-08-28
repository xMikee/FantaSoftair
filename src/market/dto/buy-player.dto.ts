import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BuyPlayerDto {
  @ApiProperty({ description: 'User ID who wants to buy the player' })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({ description: 'Player ID to buy' })
  @IsNotEmpty()
  @IsNumber()
  playerId: number;
}