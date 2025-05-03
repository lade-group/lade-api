// utils/prisma-error.util.ts
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

export function handlePrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2000':
        throw new BadRequestException('Input value is too long for the field.');
      case 'P2001':
        throw new NotFoundException('The requested record was not found.');
      case 'P2002':
        throw new ConflictException('Unique constraint failed on the field.');
      case 'P2003':
        throw new BadRequestException('Foreign key constraint failed.');
      case 'P2004':
        throw new ForbiddenException('A constraint failed on the database.');
      case 'P2005':
        throw new BadRequestException('Invalid value for the field.');
      case 'P2006':
        throw new BadRequestException('Missing required field.');
      case 'P2007':
        throw new BadRequestException('Data validation error.');
      case 'P2008':
        throw new InternalServerErrorException('Failed to parse the query.');
      case 'P2009':
        throw new BadRequestException('Invalid input.');
      case 'P2010':
        throw new BadRequestException('Raw query failed.');
      case 'P2011':
        throw new BadRequestException('Null constraint violation.');
      case 'P2012':
        throw new BadRequestException('Missing required value.');
      case 'P2013':
        throw new BadRequestException('Missing required argument.');
      case 'P2014':
        throw new BadRequestException('Relation violation.');
      case 'P2015':
        throw new NotFoundException('Record not found.');
      case 'P2016':
        throw new BadRequestException('Query interpretation error.');
      case 'P2017':
        throw new BadRequestException('Relation records not connected.');
      case 'P2018':
        throw new BadRequestException('Required connected records not found.');
      case 'P2019':
        throw new BadRequestException('Input error.');
      case 'P2020':
        throw new BadRequestException('Value out of range.');
      case 'P2021':
        throw new BadRequestException('Table does not exist.');
      case 'P2022':
        throw new BadRequestException('Column does not exist.');
      case 'P2023':
        throw new BadRequestException('Inconsistent column data.');
      case 'P2024':
        throw new InternalServerErrorException(
          'Timed out fetching a new connection.',
        );
      case 'P2025':
        throw new NotFoundException('Record not found.');
      case 'P2026':
        throw new InternalServerErrorException('Unsupported feature.');
      case 'P2027':
        throw new InternalServerErrorException('Multiple errors occurred.');
      case 'P2028':
        throw new InternalServerErrorException('Transaction API error.');
      case 'P2030':
        throw new BadRequestException('Field does not exist.');
      case 'P2031':
        throw new BadRequestException('Invalid JSON value.');
      case 'P2033':
        throw new BadRequestException('Invalid argument.');
      case 'P2034':
        throw new InternalServerErrorException('Transaction failed.');
      default:
        throw new InternalServerErrorException('An unexpected error occurred.');
    }
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    throw new BadRequestException('Validation error.');
  } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    throw new InternalServerErrorException('Unknown database error.');
  } else {
    throw new InternalServerErrorException('An unexpected error occurred.');
  }
}
