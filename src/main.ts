import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as compression from 'compression';
import * as bodyParser from 'body-parser';
import * as timeout from 'connect-timeout';
import { RequestGuard } from './common/utils/guard';
import { TransformationInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filter/filter';
import { ValidationPipe } from '@nestjs/common';
import { environment } from './common/config/environment';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(timeout(30 * 60 * 1000));
  app.use(helmet());
  app.use(compression());
  app.use(bodyParser.json({ limit: '900mb' }));
  app.use(bodyParser.urlencoded({ limit: '900mb', extended: true }));

    // guard
    app.useGlobalGuards(new RequestGuard());

      // interceptors
  app.useGlobalInterceptors(new TransformationInterceptor(app.get(Reflector)));

    // filters
    app.useGlobalFilters(new HttpExceptionFilter());


      // prefix
  app.setGlobalPrefix('/api/v1');

  // pipeline validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = environment.PROJECT_PORT.PORT || 3000
  await app.listen(port, ()=>console.log(`project running on port: ${port}`)
  );
}
bootstrap();
