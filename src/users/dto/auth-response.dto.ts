import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './response-user.dto';

export class AuthResponseDto extends UserResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  hasTeams: boolean;
}
