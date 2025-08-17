import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from 'docs/swagger.config';
import { ConsoleLogger } from '@nestjs/common';
import { LogInterceptor } from './utils/interceptors/log.interceptor';
import { checkS3EnvironmentVariables } from './config/env-check';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      colors: true,
      prefix: 'Lade',
      logLevels: ['log', 'verbose'],
    }),
  });

  app.enableCors({
    origin: '*',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  if (process.env.NODE_ENV !== 'production') {
    setupSwagger(app);
  }

  // Configurar interceptor global de logs
  const logInterceptor = app.get(LogInterceptor);
  app.useGlobalInterceptors(logInterceptor);

  // Verificar variables de entorno de S3
  checkS3EnvironmentVariables();

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
