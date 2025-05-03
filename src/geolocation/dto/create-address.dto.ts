import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty({ example: 'Montessori' })
  @IsNotEmpty()
  @IsString()
  street: string;

  @ApiProperty({ example: '125' })
  @IsNotEmpty()
  @IsString()
  exterior_number: string;

  @ApiProperty({ example: 'a', required: false })
  @IsOptional()
  @IsString()
  interior_number?: string;

  @ApiProperty({ example: 'El Baluarte' })
  @IsNotEmpty()
  @IsString()
  neighborhood: string;

  @ApiProperty({ example: 'Saltillo' })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({ example: 'Coahuila' })
  @IsNotEmpty()
  @IsString()
  state: string;

  @ApiProperty({ example: 'Mexico' })
  @IsNotEmpty()
  @IsString()
  country: string;

  @ApiProperty({ example: '25297' })
  @IsNotEmpty()
  @IsString()
  postal_code: string;
}
