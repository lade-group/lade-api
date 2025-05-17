import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UserBaseDto {
  @ApiProperty({ example: 'Juan', description: 'Nombre' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Carlos', required: false })
  @IsString()
  @IsOptional()
  middle_name?: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  @IsNotEmpty()
  father_last_name: string;

  @ApiProperty({ example: 'García' })
  @IsString()
  @IsNotEmpty()
  mother_last_name: string;

  @ApiProperty({ example: '5523456789' })
  @IsInt()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'juan.perez@example.com' })
  @IsEmail()
  email: string;

  
}
