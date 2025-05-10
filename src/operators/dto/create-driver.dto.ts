import { IsString, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDriverDto {
  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre completo del conductor',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'LIC12345678',
    description: 'Número de licencia de conducir',
  })
  @IsString()
  license: string;

  @ApiProperty({ example: '5512345678', description: 'Teléfono del conductor' })
  @IsString()
  phone: string;

  @ApiPropertyOptional({
    example: 'juan.perez@email.com',
    description: 'Correo electrónico del conductor (opcional)',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    example: 'team-uuid-123',
    description: 'ID del equipo al que pertenece el conductor',
  })
  @IsString()
  teamId: string;
}
