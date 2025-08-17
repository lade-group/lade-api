import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRouteStopDto {
  @ApiProperty({ description: 'ID del punto de ruta' })
  @IsString()
  @IsNotEmpty()
  pointId: string;

  @ApiProperty({ description: 'Orden de la parada en la ruta' })
  @IsNumber()
  order: number;
}

export class CreateRouteDto {
  @ApiProperty({ description: 'Nombre de la ruta' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Código único de la ruta' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Empresa asociada a la ruta' })
  @IsString()
  @IsNotEmpty()
  company: string;

  @ApiProperty({ description: 'ID del cliente' })
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({
    description: 'Lista de paradas de la ruta',
    type: [CreateRouteStopDto],
  })
  @IsArray()
  stops: CreateRouteStopDto[];
}
