import { Role } from '@mono-repo-backend/shared-types';
import { IsEmail, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class UserProfileResponseDto {
  @ApiProperty({ type: String, example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  id!: string;

  @ApiProperty({ type: String, example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ type: String, example: 'John Doe' })
  @IsString()
  name!: string;

  @ApiProperty({ type: String, example: 'user', enum: Role })
  @IsString()
  role!: string;
}
