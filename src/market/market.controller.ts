import { Body, Controller, Post, Get, UseGuards, Request } from '@nestjs/common';
import { MarketService } from './market.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Market')
@Controller('api')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Post('buy-player')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buy a player' })
  @ApiResponse({ status: 200, description: 'Player purchased successfully' })
  @ApiResponse({ status: 400, description: 'Invalid purchase request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async buyPlayer(@Request() req, @Body() body: { playerId: number }) {
    return this.marketService.buyPlayer(req.user.id, body.playerId);
  }

  @Post('sell-player')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sell a player' })
  @ApiResponse({ status: 200, description: 'Player sold successfully' })
  @ApiResponse({ status: 400, description: 'Invalid sell request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async sellPlayer(@Request() req, @Body() body: { playerId: number }) {
    return this.marketService.sellPlayer(req.user.id, body.playerId);
  }

  @Get('ranking')
  @ApiOperation({ summary: 'Get user ranking' })
  @ApiResponse({ status: 200, description: 'User ranking with points and team size' })
  async getRanking() {
    return this.marketService.getRanking();
  }
}