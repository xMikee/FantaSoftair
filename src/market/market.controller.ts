import { Body, Controller, Post, Get, UseGuards, Request } from '@nestjs/common';
import { MarketService } from './market.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('Market')
@Controller('api/market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Post('admin/buy-player')
  @UseGuards(AdminGuard)
  @ApiHeader({
    name: 'admin-password',
    description: 'Admin password for authentication',
    required: true,
  })
  @ApiOperation({ summary: 'Buy a player for a team (Admin only)' })
  @ApiResponse({ status: 200, description: 'Player purchased successfully for the team' })
  @ApiResponse({ status: 400, description: 'Invalid purchase request' })
  @ApiResponse({ status: 401, description: 'Admin authentication required' })
  async buyPlayerForTeam(@Body() body: { teamId: number; playerId: number }) {
    return this.marketService.buyPlayerForTeam(body.teamId, body.playerId);
  }

  @Post('admin/sell-player')
  @UseGuards(AdminGuard)
  @ApiHeader({
    name: 'admin-password',
    description: 'Admin password for authentication',
    required: true,
  })
  @ApiOperation({ summary: 'Sell a player from a team (Admin only)' })
  @ApiResponse({ status: 200, description: 'Player sold successfully from the team' })
  @ApiResponse({ status: 400, description: 'Invalid sell request' })
  @ApiResponse({ status: 401, description: 'Admin authentication required' })
  async sellPlayerFromTeam(@Body() body: { teamId: number; playerId: number }) {
    return this.marketService.sellPlayerFromTeam(body.teamId, body.playerId);
  }

  @Get('ranking')
  @ApiOperation({ summary: 'Get user ranking (legacy - based on real-time points)' })
  @ApiResponse({ status: 200, description: 'User ranking with points and team size' })
  async getRanking() {
    return this.marketService.getRanking();
  }

  @Get('event-ranking')
  @ApiOperation({ summary: 'Get event-based user ranking (fantasy football style)' })
  @ApiResponse({ status: 200, description: 'Event-based user ranking with locked scores per event' })
  async getEventBasedRanking() {
    return this.marketService.getEventBasedRanking();
  }

  @Get('best-players')
  @ApiOperation({ summary: 'Get best players ranking based on yearly accumulated points' })
  @ApiResponse({ status: 200, description: 'Best players ranking retrieved successfully' })
  async getBestPlayers() {
    return this.marketService.getBestPlayersRanking();
  }

  @Get('worst-players')  
  @ApiOperation({ summary: 'Get worst players ranking based on yearly accumulated points' })
  @ApiResponse({ status: 200, description: 'Worst players ranking retrieved successfully' })
  async getWorstPlayers() {
    return this.marketService.getWorstPlayersRanking();
  }
}