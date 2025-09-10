import { Body, Controller, Post, Get, Param } from '@nestjs/common';
import { TeamService } from './team.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

export class TeamLoginDto {
  teamName: string;
  password: string;
}

export class UpdateFormationDto {
  teamId: number;
  playerIds: number[];
}

@ApiTags('Team')
@Controller('api/team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login to team with password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async loginToTeam(@Body() teamLoginDto: TeamLoginDto) {
    return this.teamService.loginToTeam(teamLoginDto.teamName, teamLoginDto.password);
  }

  @Get('formation/:teamId')
  @ApiOperation({ summary: 'Get team formation' })
  @ApiResponse({ status: 200, description: 'Team formation retrieved' })
  @ApiResponse({ status: 401, description: 'Team not found' })
  async getTeamFormation(@Param('teamId') teamId: number) {
    return this.teamService.getTeamFormation(teamId);
  }

  @Post('formation')
  @ApiOperation({ summary: 'Update team formation (8 players)' })
  @ApiResponse({ status: 200, description: 'Formation updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid formation' })
  @ApiResponse({ status: 401, description: 'Team not found' })
  async updateFormation(@Body() updateFormationDto: UpdateFormationDto) {
    return this.teamService.updateFormation(
      updateFormationDto.teamId,
      updateFormationDto.playerIds
    );
  }

  @Get('password/:teamName')
  @ApiOperation({ summary: 'Get team password (Admin only - for distribution)' })
  @ApiResponse({ status: 200, description: 'Password retrieved' })
  @ApiResponse({ status: 401, description: 'Team not found' })
  async getTeamPassword(@Param('teamName') teamName: string) {
    const password = await this.teamService.getTeamPassword(teamName);
    return { teamName, password };
  }

  @Post('password/reset/:teamName')
  @ApiOperation({ summary: 'Reset team password (Admin only)' })
  @ApiResponse({ status: 200, description: 'New password generated' })
  @ApiResponse({ status: 401, description: 'Team not found' })
  async resetTeamPassword(@Param('teamName') teamName: string) {
    const newPassword = await this.teamService.resetTeamPassword(teamName);
    return { teamName, newPassword, message: 'Password resettata con successo' };
  }

  @Get('formation/status')
  @ApiOperation({ summary: 'Check if formation can be modified' })
  @ApiResponse({ status: 200, description: 'Formation status retrieved' })
  async getFormationStatus() {
    return this.teamService.getFormationStatus();
  }
}