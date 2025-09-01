import { Controller, Get } from '@nestjs/common';
import { EventsService } from './events.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Events')
@Controller('api/events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'Get recent events' })
  @ApiResponse({ status: 200, description: 'List of recent events' })
  async findRecent() {
    return this.eventsService.findRecent();
  }
}