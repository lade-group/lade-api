import {
  IsEnum,
  IsString,
  ValidateNested,
  IsOptional,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { DriverStatus, ContactType } from '@prisma/client';
import { CreateAddressDto } from '@/geolocation/dto/create-address.dto';
import { ContactDto } from '@/customer/dto/create-contact.dto';

export class CreateDriverDto {
  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre completo del conductor',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'https://miapp.com/photo.jpg',
    description: 'Foto del conductor',
  })
  @IsString()
  photoUrl: string;

  @ApiProperty({ example: '1234567890', description: 'Número de licencia' })
  @IsString()
  licenseNumber: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address: CreateAddressDto;

  @ApiProperty({ type: [ContactDto] })
  @ValidateNested({ each: true })
  @Type(() => ContactDto)
  contacts: ContactDto[];

  @ApiProperty({ example: 'team-uuid-123', description: 'ID del equipo' })
  @IsString()
  teamId: string;

  @ApiProperty({ enum: DriverStatus, example: 'DISPONIBLE' })
  @IsEnum(DriverStatus)
  status: DriverStatus;

  // Campos adicionales para logística
  @ApiProperty({ required: false, example: 'CUPU800825HDFXXX01' })
  @IsOptional()
  @IsString()
  curp?: string;

  @ApiProperty({ required: false, example: 'CUPU800825XXX' })
  @IsOptional()
  @IsString()
  rfc?: string;

  @ApiProperty({ required: false, example: '1990-08-25' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiProperty({ required: false, example: '2025-12-31' })
  @IsOptional()
  @IsDateString()
  licenseExpiry?: string;

  @ApiProperty({ required: false, example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  medicalExpiry?: string;

  @ApiProperty({ required: false, example: 'María Pérez - 8441234567' })
  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @ApiProperty({ required: false, example: 'O+' })
  @IsOptional()
  @IsString()
  bloodType?: string;

  @ApiProperty({ required: false, example: 'Ninguna' })
  @IsOptional()
  @IsString()
  allergies?: string;

  @ApiProperty({
    required: false,
    example: 'Conductor experimentado en rutas largas',
  })
  @IsOptional()
  @IsString()
  specialNotes?: string;

  @ApiProperty({ required: false, example: '5 años' })
  @IsOptional()
  @IsString()
  experience?: string;

  @ApiProperty({
    required: false,
    example: 'Manejo de materiales peligrosos, Refrigeración',
  })
  @IsOptional()
  @IsString()
  certifications?: string;

  @ApiProperty({ required: false, example: 15000.0 })
  @IsOptional()
  @IsNumber()
  salary?: number;

  @ApiProperty({ required: false, example: 'Transferencia bancaria' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiProperty({ required: false, example: 'Banco: BBVA, Cuenta: 0123456789' })
  @IsOptional()
  @IsString()
  bankAccount?: string;
}
