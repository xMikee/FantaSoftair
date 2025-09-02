import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MarketService } from './market/market.service';

@ApiTags('Public API')
@Controller('api')
export class PublicApiController {
  constructor(
    private readonly marketService: MarketService,
  ) {}

  @Get('ranking')
  @ApiOperation({ summary: 'Get user ranking (public endpoint)' })
  @ApiResponse({ status: 200, description: 'User ranking with points and team size' })
  async getRanking() {
    return this.marketService.getRanking();
  }
}