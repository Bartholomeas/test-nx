import type { Response } from 'express';

import { Injectable, Logger } from '@nestjs/common';

import type { LoginRequestDto } from '../dto/login-request.dto';
import type { LoginResponseDto } from '../dto/login-response.dto';
import type { RegisterRequestDto } from '../dto/register-request.dto';
import type { RegisterResponseDto } from '../dto/register-response.dto';
import type { UserProfileResponseDto } from '../dto/user-profile-response.dto';

@Injectable()
export class BaseAuthService {
  protected readonly logger = new Logger(this.constructor.name);

  login(dto: LoginRequestDto, res: Response): LoginResponseDto {
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

    return {
      accessToken: tempAccessToken,
      refreshToken: tempRefreshToken,
      expiresIn,
    };
  }

  register(dto: RegisterRequestDto): RegisterResponseDto {
    this.logger.log(`Register request received for email: ${dto.email}`);

    return {
      id: crypto.randomUUID(),
      email: dto.email,
    };
  }

  logout(res: Response): void {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
  }

  getProfile(): UserProfileResponseDto {
    return {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'user@example.com',
      name: 'John Doe',
      role: 'admin',
    };
  }
}
