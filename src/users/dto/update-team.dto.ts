import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';

export enum TeamStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export class UpdateTeamDto {
  @ApiProperty({ description: 'Nombre del equipo', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Logo del equipo', required: false })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiProperty({
    description: 'Estado del equipo',
    enum: TeamStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(TeamStatus)
  status?: TeamStatus;
}
