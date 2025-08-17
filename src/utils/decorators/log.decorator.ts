import { SetMetadata } from '@nestjs/common';
import { LogAction, LogEntity } from '@prisma/client';

export interface LogOptions {
  action: LogAction;
  entity: LogEntity;
  entityIdParam?: string; // Nombre del parámetro que contiene el entityId
  metadata?: (result: any, req: any) => Record<string, any>;
}

export const LOG_KEY = 'log';

export const Log = (options: LogOptions) => SetMetadata(LOG_KEY, options);
