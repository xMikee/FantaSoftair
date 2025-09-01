import { Controller, Get, Query, Post, Body, BadRequestException, Param, UseGuards, Request } from '@nestjs/common';
import { PlayersService } from './players.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Players')
@Controller('api/players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get()
  @ApiOperation({ summary: 'Get players with optional filters' })
  @ApiResponse({ status: 200, description: 'List of players' })
  @ApiQuery({ name: 'available', required: false, description: 'Show only available players' })
  @ApiQuery({ name: 'userId', required: false, description: 'Show players owned by specific user' })
  async findAll(
    @Query('available') available?: string,
    @Query('userId') userId?: string
  ) {
    const isAvailable = available === 'true';
    const userIdNum = userId ? parseInt(userId) : undefined;
    
    return this.playersService.findAll(isAvailable, userIdNum);
  }

  @Post('lineup')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update player lineup selection' })
  @ApiResponse({ status: 200, description: 'Lineup updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateLineup(@Request() req, @Body() body: { playerIds: number[] }) {
    const { playerIds } = body;
    const userId = req.user.id;

    if (!Array.isArray(playerIds)) {
      throw new BadRequestException('playerIds deve essere un array');
    }

    if (playerIds.length > 8) {
      throw new BadRequestException('Massimo 8 giocatori possono essere schierati');
    }

    // Reset all selections for this user
    await this.playersService.resetLineupSelections(userId);

    // Set selected players
    for (const playerId of playerIds) {
      await this.playersService.updateLineupSelection(playerId, true);
    }

    return {
      success: true,
      message: `Formazione aggiornata: ${playerIds.length}/8 giocatori schierati`
    };
  }

  @Get('lineup/:userId')
  @ApiOperation({ summary: 'Get selected lineup for a user' })
  @ApiResponse({ status: 200, description: 'Selected lineup' })
  async getLineup(@Param('userId') userId: string) {
    const userIdNum = parseInt(userId);
    if (!userIdNum) {
      throw new BadRequestException('userId non valido');
    }
    
    return this.playersService.getSelectedLineup(userIdNum);
  }

  @Get('top-player')
    async getTopPlayer() {
      return this.playersService.getTopPlayer();
  }
}