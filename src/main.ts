import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { ApiAlias } from './config/api-alias.config';
import '@aikidosec/firewall';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.enableCors({
    origin: (origin, callback) => {
        const allowedOrigins = ['https://200.48.199.90:8202', 'https://10.6.26.16:8202'];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
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

  console.log('Inicializando API con CORS:', {
    origin: ['https://200.48.199.90:8202', 'https://10.6.26.16:8202']
  });
  await app.listen(process.env.SERVER_PORT, () => {
    console.log('Server listening on port ' + process.env.SERVER_PORT);
  });
}
bootstrap();
