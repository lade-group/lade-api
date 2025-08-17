import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoutePointStatus } from '@prisma/client';

export class CreateRoutePointDto {
  @ApiProperty({ description: 'Nombre del punto de ruta' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'ID de la dirección' })
  @IsString()
  @IsNotEmpty()
  addressId: string;

  @ApiProperty({ description: 'Latitud de las coordenadas' })
  @IsNumber()
  coordsLat: number;

  @ApiProperty({ description: 'Longitud de las coordenadas' })
  @IsNumber()
  coordsLng: number;

  @ApiProperty({ description: 'ID del cliente' })
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @ApiPropertyOptional({
    description: 'Estado del punto de ruta',
    enum: RoutePointStatus,
  })
  @IsOptional()
  @IsEnum(RoutePointStatus)
  status?: RoutePointStatus;
}
