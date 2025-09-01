import { IsString, IsDateString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGameEventDto {
  @ApiProperty({ description: 'Nome dell\'evento' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Data dell\'evento' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Descrizione dell\'evento', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Stato dell\'evento', default: true, required: false })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}