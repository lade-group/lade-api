import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LogService } from '@/common/services/log.service';
import { LOG_KEY, LogOptions } from '@/utils/decorators/log.decorator';

@Injectable()
export class LogInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly logService: LogService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const logOptions = this.reflector.get<LogOptions>(
      LOG_KEY,
      context.getHandler(),
    );

    if (!logOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (result) => {
        try {
          // Obtener el entityId del parámetro especificado o del resultado
          let entityId = logOptions.entityIdParam
            ? request.params[logOptions.entityIdParam]
            : result?.id || result?.team?.id || result?.teamId;

          // Si no hay entityId, intentar obtenerlo del body
          if (!entityId && request.body) {
            entityId = request.body.id || request.body.teamId;
          }

          // Obtener el teamId del usuario actual o del resultado
          let teamId = user.teamId || result?.teamId || result?.team?.id;

          // Si no hay teamId, intentar obtenerlo del body
          if (!teamId && request.body) {
            teamId = request.body.teamId;
          }

          if (entityId && teamId) {
                         // Generar metadata personalizada si se proporciona
             let metadata: Record<string, any> = {};
             if (logOptions.metadata) {
               metadata = logOptions.metadata(result, request);
             } else {
               // Metadata por defecto
               metadata = {
                 method: request.method,
                 url: request.url,
                 userAgent: request.headers['user-agent'],
                 ip: request.ip,
               };

               // Agregar datos específicos según la acción
               if (logOptions.action === 'UPDATE' && request.body) {
                 metadata.changes = request.body;
               } else if (logOptions.action === 'CREATE' && result) {
                 metadata.createdData = result;
               }
             }

            await this.logService.createLog({
              action: logOptions.action,
              entity: logOptions.entity,
              entityId,
              userId: user.userId,
              teamId,
              metadata,
            });
          }
        } catch (error) {
          console.error('Error in log interceptor:', error);
          // No lanzar error para no interrumpir el flujo principal
        }
      }),
    );
  }
}
