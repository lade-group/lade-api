import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { UserBaseDto } from './user-base.dto';

export class CreateUserDto extends UserBaseDto {
  @ApiProperty({ example: 'MySecurePass123!' })
  @IsString()
  @MinLength(6)
  password: string;
}
