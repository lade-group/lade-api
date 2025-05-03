import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
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

  @IsInt()
  userId: number;
}
