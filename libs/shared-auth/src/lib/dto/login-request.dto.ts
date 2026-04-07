import { IsEmail, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class LoginRequestDto {
  @ApiProperty({ type: String, example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ type: String, example: 'password123' })
  @IsString()
  password!: string;
}
