import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateScoreDto {
  @ApiProperty({ description: 'Player ID to update score for' })
  @IsNotEmpty()
  @IsNumber()
  playerId: number;

  @ApiProperty({ description: 'Points to add (can be negative)' })
  @IsNotEmpty()
  @IsNumber()
  points: number;

  @ApiProperty({ description: 'Description of the event', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Game Event ID (optional, if not provided will use generic event)', required: false })
  @IsOptional()
  @IsNumber()
  gameEventId?: number;
}