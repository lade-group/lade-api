import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RouteStatus } from '@prisma/client';

export class UpdateRouteStopDto {
  @ApiPropertyOptional({ description: 'ID del punto de ruta' })
  @IsOptional()
  @IsString()
  pointId?: string;

  @ApiPropertyOptional({ description: 'Orden de la parada en la ruta' })
  @IsOptional()
  @IsNumber()
  order?: number;
}

export class UpdateRouteDto {
  @ApiPropertyOptional({ description: 'Nombre de la ruta' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Código único de la ruta' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'Empresa asociada a la ruta' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({ description: 'ID del cliente' })
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiPropertyOptional({ description: 'Estado de la ruta', enum: RouteStatus })
  @IsOptional()
  @IsEnum(RouteStatus)
  status?: RouteStatus;

  @ApiPropertyOptional({
    description: 'Lista de paradas de la ruta',
    type: [UpdateRouteStopDto],
  })
  @IsOptional()
  @IsArray()
  stops?: UpdateRouteStopDto[];
}
