import { Body, Controller, Post, UseGuards, Get, Res, Req } from '@nestjs/common';
import { AdminService } from './admin.service';
import { UpdateScoreDto } from './dto/update-score.dto';
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
      updateScoreDto.description
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
}