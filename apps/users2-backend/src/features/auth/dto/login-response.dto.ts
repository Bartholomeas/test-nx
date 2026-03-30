import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from "class-validator";

export class LoginResponseDto {
  @ApiProperty({
    type: String,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  accessToken!: string;

  @ApiProperty({
    type: String,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  refreshToken!: string;

  @ApiProperty({ type: Number, example: 3600 })
  @IsNumber()
  expiresIn!: number;
}
