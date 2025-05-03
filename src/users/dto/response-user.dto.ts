import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  father_last_name: string;

  @ApiProperty({ required: false })
  middle_name?: string | null;

  @ApiProperty()
  mother_last_name: string;

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt: Date;

  @ApiProperty({ description: 'Última fecha de actualización' })
  updatedAt: Date;
}
