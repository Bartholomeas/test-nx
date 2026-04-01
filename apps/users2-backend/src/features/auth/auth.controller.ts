import { Response } from 'express';

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { LoginRequestDto } from './dto/login-request.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RegisterRequestDto } from './dto/register-request.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  @Post('login')
  @ApiOperation({ summary: 'Login' })
  @ApiResponse({ status: 200, type: LoginResponseDto })
  @ApiResponse({ status: 401, type: UnauthorizedException, description: 'Invalid credentials' })
  login(
    @Body() dto: LoginRequestDto,
    @Res({
      passthrough: true,
    })
    res: Response,
  ): LoginResponseDto {
    this.logger.log(`Login request received for email: ${dto.email}`);

    const tempAccessToken = crypto.randomUUID();
    const tempRefreshToken = crypto.randomUUID();
    const expiresIn = 3600;

    res.cookie('accessToken', tempAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: expiresIn * 1000,
    });
    res.cookie('refreshToken', tempRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    this.logger.log('LOGIN RESPONSE SENT.....');

    return {
      accessToken: 'token',
      refreshToken: 'refreshToken',
      expiresIn: 3600,
    };
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, type: RegisterResponseDto })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  register(@Body() dto: RegisterRequestDto): RegisterResponseDto {
    this.logger.log(`Register request received for email: ${dto.email}`);

    return {
      id: crypto.randomUUID(),
      email: dto.email,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout current user' })
  @ApiResponse({ status: 204, description: 'Logged out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  logout(@Res({ passthrough: true }) res: Response): void {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, type: UserProfileResponseDto })
  @ApiResponse({ status: 401, type: UnauthorizedException, description: 'Unauthorized' })
  getProfile(): UserProfileResponseDto {
    return {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'user@example.com',
      name: 'John Doe',
      role: 'admin',
    };
  }
}
