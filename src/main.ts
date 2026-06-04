import { NestFactory } from '@nestjs/core';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerService } from './shared/swagger.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import express, { urlencoded, json } from 'express';
import expressBasicAuth from 'express-basic-auth';
import { join } from 'path';
import { ValidationError } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();

  app.useGlobalPipes(new ValidationPipe({
    exceptionFactory: (errors: ValidationError[]) => {
      const customError = errors.map((elem) => {
        const propertyName = (elem.property.replace('_', ' '));
        if (elem.constraints.isString) {
          return `${propertyName} must be a valid text`;
        } else {
          return (elem.constraints[Object.keys(elem.constraints)[0]] || 'Data not valid').replace('_', ' ');
        }
      });
      return new BadRequestException(customError);
    }
  }));

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  const config = app.get<ConfigService>(ConfigService);
  if (
    config.get('NODE_ENV') == 'production' &&
    config.get('CLOUDWATCH_LOGS') == 'true'
  ) {
    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  }

  if (
    config.get('NODE_ENV') == 'production' ||
    config.get('SWAGGER_AUTH') == 'true'
  ) {
    app.use(
      ['/api', '/api-json'],
      expressBasicAuth({
        challenge: true,
        users: { smd: 'smd123!@#' },
      }),
    );
  }

  const documentConfig = new DocumentBuilder()
    .setTitle(`Flavor Haus API (${process.env.NODE_ENV || 'development'})`)
    .setDescription('Flavor Haus API is open for development and testing purposes.')
    .addBearerAuth()
    .setVersion('3.0')
    .build();
  new SwaggerService('api', app, documentConfig).init();

  app.getHttpAdapter().get('/', (req, res) => {
    res.status(200).json({ healthStatus: 'Excellent' });
  });

  app.enableCors();
  app.disable('x-powered-by');
  app.disable('etag');
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: false, limit: '50mb' }));

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');

  await app.listen(process.env.PORT || config.get('GATEWAY_PORT'), '0.0.0.0');
}
bootstrap();
