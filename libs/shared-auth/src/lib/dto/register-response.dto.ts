import { IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponseDto {
  @ApiProperty({ type: String, example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  id!: string;

  @ApiProperty({ type: String, example: 'user@example.com' })
  @IsString()
  email!: string;
}
