// auth.decorator.ts
import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

export function Auth(...roles: string[]) {
  const decorators = [UseGuards(JwtAuthGuard), ApiBearerAuth()];

  if (roles.length) {
    decorators.push(UseGuards(RolesGuard));
    decorators.push(Roles(...roles));
  }

  return applyDecorators(...decorators);
}
