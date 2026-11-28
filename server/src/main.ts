import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: (process.env.ALLOWED_ORIGINS || '').split(','),
      methods: '*',
      allowedHeaders: '*',
    },
    logger: ['log', 'error', 'warn', 'debug'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.setGlobalPrefix('api');

  app.enableVersioning();
  app.enableShutdownHooks();

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Eaves API')
      .setDescription('API for managing eaves')
      .setVersion('1.0')
      .addTag('eaves')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Informe o token JWT de acesso',
        },
        'JWT-auth',
      )
      .build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory);
    Logger.log(`Swagger disponível em: ${await app.getUrl()}/api`, 'Bootstrap');
  }

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
