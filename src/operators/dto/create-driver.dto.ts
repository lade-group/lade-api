import { IsEnum, IsString, ValidateNested } from 'class-validator';
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
}
