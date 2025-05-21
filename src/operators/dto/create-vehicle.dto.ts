import { IsString, IsInt, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VehicleStatus } from '@prisma/client';

export class CreateVehicleDto {
  @ApiProperty({
    example: 'ABC1234',
    description: 'Número de placa de la unidad (único)',
  })
  @IsString()
  plate: string;

  @ApiProperty({ example: 'FH16', description: 'Modelo del vehículo' })
  @IsString()
  model: string;

  @ApiProperty({ example: 'Volvo', description: 'Marca del vehículo' })
  @IsString()
  brand: string;

  @ApiProperty({ example: '2021', description: 'Año del vehículo' })
  @IsString()
  year: string;

  @ApiProperty({
    example: 'Camión',
    description: 'Tipo de unidad (camión, remolque, etc.)',
  })
  @IsString()
  type: string;

  @ApiPropertyOptional({
    example: '1FTSW21P06EB12345',
    description: 'Número de identificación vehicular (VIN)',
  })
  @IsOptional()
  @IsString()
  vin?: string;

  @ApiProperty({
    example: 'team-uuid-456',
    description: 'ID del equipo al que pertenece la unidad',
  })
  @IsString()
  teamId: string;

  @ApiProperty({ enum: VehicleStatus, example: 'DISPONIBLE' })
  @IsEnum(VehicleStatus)
  status: VehicleStatus;

  @ApiProperty({
    example: 'url',
    description: 'URL generada por AWS',
  })
  @IsString()
  imageUrl: string;
}
