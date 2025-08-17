// dto/create-client.dto.ts
import {
  IsEmail,
  IsOptional,
  IsString,
  ValidateNested,
  IsNumber,
  IsEnum,
} from 'class-validator';
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
  name_related?: string;

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

  @ApiProperty({
    required: false,
    enum: ['ACTIVE', 'CANCELLED', 'DELETED'],
    default: 'ACTIVE',
  })
  @IsOptional()
  @IsEnum(['ACTIVE', 'CANCELLED', 'DELETED'])
  status?: 'ACTIVE' | 'CANCELLED' | 'DELETED';

  // Campos adicionales para logística y fletes
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  creditLimit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  preferredPaymentMethod?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  businessType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  specialRequirements?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address: CreateAddressDto;

  @ApiProperty({ type: [ContactDto] })
  @ValidateNested({ each: true })
  @Type(() => ContactDto)
  contacts: ContactDto[];
}
