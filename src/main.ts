import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import validateEnv from './common/env-validation';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  validateEnv();
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Enable CORS
  app.enableCors({
    credentials: true,
    origin: config.get<string>('CLIENT_URL'),
  });

  // Set global prefix
  app.setGlobalPrefix('/api/v1');

  // Use Helmet middleware
  app.use(helmet());

  // Use Compression middleware
  app.use(compression());

  // Use global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  // Start the application
  await app.listen(config.get<number>('PORT') || 3002);
}

bootstrap();
