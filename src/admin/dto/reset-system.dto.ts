import { IsNotEmpty, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetSystemDto {
  @ApiProperty({ 
    description: 'Type of reset to perform',
    enum: ['market', 'scores', 'all']
  })
  @IsNotEmpty()
  @IsIn(['market', 'scores', 'all'])
  type: 'market' | 'scores' | 'all';
}