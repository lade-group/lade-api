import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from 'docs/swagger.config';
import { ConsoleLogger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    logger: new ConsoleLogger({
      colors: true,
      prefix: 'Lade',
      logLevels: ['log', 'verbose'],
    }),
  });

  if (process.env.NODE_ENV !== 'production') {
    setupSwagger(app);
  }

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
