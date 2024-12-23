import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as compression from 'compression';
import * as bodyParser from 'body-parser';
import * as timeout from 'connect-timeout';
import { RequestGuard } from './common/utils/guard';
import { TransformationInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filter/filter';
import { ValidationPipe, Logger } from '@nestjs/common';
import { environment } from './common/config/environment';
import mongoose from 'mongoose';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Middlewares
  app.use(timeout(30 * 60 * 1000)); // Timeout after 30 minutes
  app.use(helmet()); // Secure your app by setting HTTP headers
  app.use(compression()); // Compress responses
  app.use(bodyParser.json({ limit: '900mb' })); // Body parser configuration
  app.use(bodyParser.urlencoded({ limit: '900mb', extended: true })); // Body parser configuration

  // Guards
  app.useGlobalGuards(new RequestGuard());

  // Interceptors
  app.useGlobalInterceptors(new TransformationInterceptor(app.get(Reflector)));

  // Filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Set API version prefix
  app.setGlobalPrefix('/api/v1');

  // Global validation pipes configuration
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Automatically remove properties that do not have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are provided
      transform: true, // Automatically transform payloads to DTOs
    }),
  );

  // MongoDB connection setup
  const dbUri = environment.DATABASE.URL;
  if (!dbUri) {
    logger.error('Database connection URL is not defined');
    throw new Error('Database connection URL is not defined');
  }

  mongoose.connection.on('connected', () => {
    logger.log('Database connected successfully');
  });

  mongoose.connection.on('error', (err) => {
    logger.error(`Database connection error: ${err}`);
  });

  // Connect to MongoDB
  await mongoose.connect(dbUri);

  // Port configuration
  const port = environment.PROJECT_PORT || 3000; // Default to 3000 if not defined
  await app.listen(port, () => logger.log(`Project running on port: ${port}`));
}

bootstrap();
