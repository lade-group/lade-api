import { IsEnum, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { ContactType } from '@prisma/client';

export class ContactDto {
  @ApiProperty({ enum: ContactType })
  @IsEnum(ContactType)
  type: ContactType;

  @ApiProperty()
  @IsString()
  value: string;
}
