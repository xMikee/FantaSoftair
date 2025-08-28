import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthDto {
  @ApiProperty({ description: 'Admin password' })
  @IsNotEmpty()
  @IsString()
  password: string;
}