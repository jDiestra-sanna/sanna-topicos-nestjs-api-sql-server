import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { ApiAlias } from './config/api-alias.config';
import * as express from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';
import '@aikidosec/firewall';

async function bootstrap() {
  const expressApp = express();
  expressApp.disable('x-powered-by');
  const adapter = new ExpressAdapter(expressApp);

  const app = await NestFactory.create(AppModule, adapter);
  
  const expressInstance = app.getHttpAdapter().getInstance()
  expressInstance.set('trust proxy', true)

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.enableCors({
    origin: ['https://topicare.doctormas.com.pe', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: 'Content-Disposition'
  });

  app.setGlobalPrefix(ApiAlias.v1);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('SANNA')
    .setDescription('SANNA TOPICOS API')
    .setVersion('1.0')
    .addTag('sanna')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.SERVER_PORT, () => {
    console.log('Server listening on port ' + process.env.SERVER_PORT);
  });
}
bootstrap();
