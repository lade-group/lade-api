import {
  IsString,
  IsInt,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
} from 'class-validator';
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

  // Campos adicionales para logística
  @ApiPropertyOptional({
    example: '20 toneladas',
    description: 'Capacidad de carga del vehículo',
  })
  @IsOptional()
  @IsString()
  capacity?: string;

  @ApiPropertyOptional({
    example: 'Diesel',
    description: 'Tipo de combustible',
  })
  @IsOptional()
  @IsString()
  fuelType?: string;

  @ApiPropertyOptional({
    example: 'INS-123456',
    description: 'Número de seguro',
  })
  @IsOptional()
  @IsString()
  insuranceNumber?: string;

  @ApiPropertyOptional({
    example: '2024-12-31T00:00:00.000Z',
    description: 'Fecha de vencimiento del seguro',
  })
  @IsOptional()
  @IsDateString()
  insuranceExpiry?: string;

  @ApiPropertyOptional({
    example: '2024-12-31T00:00:00.000Z',
    description: 'Fecha de vencimiento del registro',
  })
  @IsOptional()
  @IsDateString()
  registrationExpiry?: string;

  @ApiPropertyOptional({
    example: '2024-01-15T00:00:00.000Z',
    description: 'Fecha del último mantenimiento',
  })
  @IsOptional()
  @IsDateString()
  lastMaintenance?: string;

  @ApiPropertyOptional({
    example: '2024-06-15T00:00:00.000Z',
    description: 'Fecha del próximo mantenimiento programado',
  })
  @IsOptional()
  @IsDateString()
  nextMaintenance?: string;

  @ApiPropertyOptional({
    example: 50000.5,
    description: 'Kilometraje actual del vehículo',
  })
  @IsOptional()
  @IsNumber()
  mileage?: number;

  @ApiPropertyOptional({
    example: 'Vehículo en excelente estado',
    description: 'Notas adicionales sobre el vehículo',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
