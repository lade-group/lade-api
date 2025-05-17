import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { UserBaseDto } from './user-base.dto';

export class CreateGoogleUserDto extends UserBaseDto {
  @ApiProperty({
    example: 'https://lh3.googleusercontent.com/photo.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  profileImage?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  isGoogleAccount?: boolean;
}
