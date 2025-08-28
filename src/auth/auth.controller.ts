import { Body, Controller, Post, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('authenticate')
  @ApiOperation({ summary: 'Authenticate admin user' })
  @ApiResponse({ status: 200, description: 'Authentication successful' })
  @ApiResponse({ status: 401, description: 'Invalid password' })
  authenticate(@Body() authDto: AuthDto) {
    return this.authService.authenticate(authDto.password);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user by name and password' })
  @ApiResponse({ status: 200, description: 'User login successful' })
  @ApiResponse({ status: 401, description: 'User not found or wrong password' })
  async loginUser(@Body() body: { userName: string, password?: string }) {
    return this.authService.loginUser(body.userName, body.password || '');
  }

  @Post('set-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set user password' })
  @ApiResponse({ status: 200, description: 'Password set successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async setPassword(@Request() req, @Body() body: { password: string }) {
    return this.authService.setUserPassword(req.user.id, body.password);
  }

  @Post('get-all-passwords')
  @ApiOperation({ summary: 'Get all user passwords (admin only)' })
  @ApiResponse({ status: 200, description: 'All passwords retrieved' })
  @ApiResponse({ status: 401, description: 'Invalid admin password' })
  async getAllPasswords(@Body() body: { adminPassword: string }) {
    if (body.adminPassword !== 'admin123') {
      throw new UnauthorizedException('Password admin non corretta');
    }
    return this.authService.getAllUserPasswords();
  }
}