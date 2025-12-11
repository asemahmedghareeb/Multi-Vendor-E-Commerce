import { config } from 'dotenv';
config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppConfig } from './config/app.config';
import { ConsoleLogger } from '@nestjs/common';

async function bootstrap() {
  initializeTransactionalContext();

  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      // json: true,
      colors: true,
    }),
  });

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle(`(${AppConfig.AppName} API Docs)`)
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

  }

  // app.use('/payment/webhook/stripe', express.raw({ type: 'application/json' }));

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
