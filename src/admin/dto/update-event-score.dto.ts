import { IsNumber, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEventScoreDto {
  @ApiProperty({ description: 'ID del giocatore' })
  @IsNumber()
  playerId: number;

  @ApiProperty({ description: 'ID dell\'evento di gioco' })
  @IsNumber()
  gameEventId: number;

  @ApiProperty({ description: 'Punti da assegnare (possono essere negativi)' })
  @IsNumber()
  points: number;

  @ApiProperty({ description: 'Descrizione opzionale dell\'evento', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}