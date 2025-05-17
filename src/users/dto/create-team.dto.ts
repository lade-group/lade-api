import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAddressDto } from '@/geolocation/dto/create-address.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTeamDto {
  @ApiProperty({ example: 'Lade' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'imagen' })
  @IsOptional()
  @IsString()
  logo: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address: CreateAddressDto;

  @IsString()
  userId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  invites?: string[];
}
