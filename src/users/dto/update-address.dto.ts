import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateAddressDto {
  @ApiProperty({ description: 'Calle', required: false })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiProperty({ description: 'Número exterior', required: false })
  @IsOptional()
  @IsString()
  exterior_number?: string;

  @ApiProperty({ description: 'Número interior', required: false })
  @IsOptional()
  @IsString()
  interior_number?: string;

  @ApiProperty({ description: 'Colonia', required: false })
  @IsOptional()
  @IsString()
  neighborhood?: string;

  @ApiProperty({ description: 'Ciudad', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ description: 'Estado', required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ description: 'País', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ description: 'Código postal', required: false })
  @IsOptional()
  @IsString()
  postal_code?: string;
}
