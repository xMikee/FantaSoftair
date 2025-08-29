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
  @ApiOperation({ summary: 'Login user by name' })
  @ApiResponse({ status: 200, description: 'User login successful' })
  @ApiResponse({ status: 401, description: 'User not found' })
  async loginUser(@Body() body: { userName: string }) {
    return this.authService.loginUser(body.userName);
  }

  // Password management endpoints removed

  @Post('get-all-users')
  @ApiOperation({ summary: 'Get all users (admin only)' })
  @ApiResponse({ status: 200, description: 'All users retrieved' })
  @ApiResponse({ status: 401, description: 'Invalid admin password' })
  async getAllUsers(@Body() body: { adminPassword: string }) {
    if (body.adminPassword !== 'admin123') {
      throw new UnauthorizedException('Password admin non corretta');
    }
    return this.authService.getAllUsers();
  }
}