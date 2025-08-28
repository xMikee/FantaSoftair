import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { UpdateScoreDto } from './dto/update-score.dto';
import { ResetSystemDto } from './dto/reset-system.dto';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';

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
}