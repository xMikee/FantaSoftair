import { Body, Controller, Post, UseGuards, Get, Res, Req, Param } from '@nestjs/common';
import { AdminService } from './admin.service';
import { UpdateScoreDto } from './dto/update-score.dto';
import { UpdateEventScoreDto } from './dto/update-event-score.dto';
import { ResetSystemDto } from './dto/reset-system.dto';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { FastifyReply, FastifyRequest } from 'fastify';
import { readFileSync } from 'fs';
import { join } from 'path';

@ApiTags('Admin')
@Controller('api')
@UseGuards(AdminGuard)
@ApiHeader({
  name: 'admin-password',
  description: 'Admin password for authentication',
  required: true,
})
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('admin')
  @ApiOperation({ summary: 'Serve admin page (Admin only)' })
  @ApiResponse({ status: 200, description: 'Admin page served' })
  @ApiResponse({ status: 401, description: 'Admin authentication required' })
  async getAdminPage(@Res() res: FastifyReply) {
    const adminHtmlPath = join(process.cwd(), 'public', 'admin.html.backup');
    const htmlContent = readFileSync(adminHtmlPath, 'utf-8');
    
    res.type('text/html');
    return res.send(htmlContent);
  }

  @Post('update-score')
  @ApiOperation({ summary: 'Update player score (Admin only)' })
  @ApiResponse({ status: 200, description: 'Score updated successfully' })
  @ApiResponse({ status: 401, description: 'Admin authentication required' })
  async updateScore(@Body() updateScoreDto: UpdateScoreDto) {
    return this.adminService.updateScore(
      updateScoreDto.playerId,
      updateScoreDto.points,
      updateScoreDto.description,
      updateScoreDto.gameEventId
    );
  }

  @Post('update-event-score')
  @ApiOperation({ summary: 'Update player score for specific event (Admin only)' })
  @ApiResponse({ status: 200, description: 'Event score updated successfully' })
  @ApiResponse({ status: 401, description: 'Admin authentication required' })
  async updateEventScore(@Body() updateEventScoreDto: UpdateEventScoreDto) {
    return this.adminService.updateEventScore(
      updateEventScoreDto.playerId,
      updateEventScoreDto.gameEventId,
      updateEventScoreDto.points,
      updateEventScoreDto.description
    );
  }

  @Post('reset')
  @ApiOperation({ summary: 'Reset system data (Admin only)' })
  @ApiResponse({ status: 200, description: 'System reset successfully' })
  @ApiResponse({ status: 401, description: 'Admin authentication required' })
  async resetSystem(@Body() resetSystemDto: ResetSystemDto) {
    return this.adminService.resetSystem(resetSystemDto.type);
  }

  @Post('generate-passwords')
  @ApiOperation({ summary: 'Generate team passwords (Admin only)' })
  @ApiResponse({ status: 200, description: 'Passwords generated successfully' })
  @ApiResponse({ status: 401, description: 'Admin authentication required' })
  async generateTeamPasswords() {
    return this.adminService.generateTeamPasswords();
  }

  @Post('assign-players')
  @ApiOperation({ summary: 'Assign players to team (Admin only)' })
  @ApiResponse({ status: 200, description: 'Players assigned successfully' })
  @ApiResponse({ status: 401, description: 'Admin authentication required' })
  async assignPlayersToTeam(@Body() body: { teamName: string; playerIds: number[] }) {
    return this.adminService.assignPlayersToTeam(body.teamName, body.playerIds);
  }

  @Get('admin-eventi')
  @ApiOperation({ summary: 'Get all game events for admin management' })
  @ApiResponse({ status: 200, description: 'List of all game events' })
  @ApiResponse({ status: 401, description: 'Admin authentication required' })
  async getAllGameEvents() {
    // Per l'admin, mostra eventi attivi e non chiusi per il punteggio
    return this.adminService.getAllGameEventsForAdmin();
  }

  @Get('admin-eventi-chiusura')
  @ApiOperation({ summary: 'Get all events available for day closure' })
  @ApiResponse({ status: 200, description: 'List of events available for closure' })
  @ApiResponse({ status: 401, description: 'Admin authentication required' })
  async getAllGameEventsForDayClosure() {
    // Per la chiusura giornata, mostra solo eventi non chiusi
    return this.adminService.getAllGameEventsForDayClosure();
  }

  @Post('admin-eventi')
  @ApiOperation({ summary: 'Create new game event (Admin only)' })
  @ApiResponse({ status: 201, description: 'Game event created successfully' })
  @ApiResponse({ status: 401, description: 'Admin authentication required' })
  async createGameEvent(@Body() body: { name: string; date: string; description?: string }) {
    return this.adminService.gameEventsService.create(body);
  }

  @Post('admin-eventi/:id')
  @ApiOperation({ summary: 'Update game event (Admin only)' })
  @ApiResponse({ status: 200, description: 'Game event updated successfully' })
  @ApiResponse({ status: 401, description: 'Admin authentication required' })
  async updateGameEvent(@Param('id') id: string, @Body() body: { name?: string; date?: string; description?: string; active?: boolean }) {
    return this.adminService.gameEventsService.update(+id, body);
  }

  @Post('admin-eventi/:id/delete')
  @ApiOperation({ summary: 'Delete game event (Admin only)' })
  @ApiResponse({ status: 200, description: 'Game event deleted successfully' })
  @ApiResponse({ status: 401, description: 'Admin authentication required' })
  async deleteGameEvent(@Param('id') id: string) {
    await this.adminService.gameEventsService.remove(+id);
    return { message: 'Evento eliminato con successo' };
  }

  @Get('event-rankings')
  @ApiOperation({ summary: 'Get event-based rankings (Admin only)' })
  @ApiResponse({ status: 200, description: 'Event-based rankings retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Admin authentication required' })
  async getEventBasedRankings() {
    return this.adminService.getEventBasedRankings();
  }

  @Get('user-event-history/:userId')
  @ApiOperation({ summary: 'Get user event history (Admin only)' })
  @ApiResponse({ status: 200, description: 'User event history retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Admin authentication required' })
  async getUserEventHistory(@Param('userId') userId: string) {
    return this.adminService.getUserEventHistory(+userId);
  }

  @Post('close-current-event')
  @ApiOperation({ summary: 'Close current event - transfer currentPoints to yearlyPoints and reset currentPoints (Admin only)' })
  @ApiResponse({ status: 200, description: 'Event closed successfully' })
  @ApiResponse({ status: 401, description: 'Admin authentication required' })
  async closeCurrentEvent(@Body() body?: { eventId?: number; eventName?: string }) {
    return this.adminService.closeCurrentEvent(body?.eventId, body?.eventName);
  }


}