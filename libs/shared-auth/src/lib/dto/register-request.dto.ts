import { IsEmail, IsString, MinLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class RegisterRequestDto {
  @ApiProperty({ type: String, example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ type: String, example: 'password123' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ type: String, example: 'John' })
  @IsString()
  firstName!: string;

  @ApiProperty({ type: String, example: 'Doe' })
  @IsString()
  lastName!: string;
}
