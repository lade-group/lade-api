// dto/create-client.dto.ts
import { IsEmail, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { ContactDto } from './create-contact.dto';
import { CreateAddressDto } from '@/geolocation/dto/create-address.dto';

export class CreateClientDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsString()
  rfc: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsString()
  cfdiUse: string;

  @ApiProperty()
  @IsString()
  taxRegime: string;

  @ApiProperty()
  @IsString()
  zipCode: string;

  @ApiProperty()
  @IsString()
  teamId: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address: CreateAddressDto;

  @ApiProperty({ type: [ContactDto] })
  @ValidateNested({ each: true })
  @Type(() => ContactDto)
  contacts: ContactDto[];
}
