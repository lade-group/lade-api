import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RoutePointStatus } from '@prisma/client';

export class UpdateRoutePointDto {
  @ApiPropertyOptional({
    description: 'Estado del punto de ruta',
    enum: RoutePointStatus,
  })
  @IsOptional()
  @IsEnum(RoutePointStatus)
  status?: RoutePointStatus;
}
