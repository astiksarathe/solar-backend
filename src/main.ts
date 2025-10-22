import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Express } from 'express';
import { Request, Response } from 'express';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

let app: Express | null = null;

async function createNestApp(): Promise<Express> {
  const server = express();
  const adapter = new ExpressAdapter(server);

  const nestApp = await NestFactory.create(AppModule, adapter);

  // Set global prefix (optional, but can help with routing)
  // nestApp.setGlobalPrefix('api');

  // Enable CORS
  nestApp.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // enable global request validation using class-validator DTOs
  nestApp.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  await nestApp.init();
  return server;
} // For local development
async function bootstrap() {
  const nestApp = await NestFactory.create(AppModule);

  // Enable CORS
  nestApp.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // enable global request validation using class-validator DTOs
  nestApp.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  await nestApp.listen(process.env.PORT ?? 3000);
}

// For Vercel serverless
export default async function handler(
  req: Request,
  res: Response,
): Promise<void> {
  if (!app) {
    app = await createNestApp();
  }
  app(req, res);
}

// Run locally if not in serverless environment
if (require.main === module) {
  void bootstrap();
}
