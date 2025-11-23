import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: {
      origin: true, // Accepter toutes les origines pour les images
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      exposedHeaders: ['Content-Range', 'X-Content-Range'],
    },
  });

  // Servir les fichiers statiques (uploads)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Sécurité avec Helmet (désactivé pour les uploads)
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // Validation globale des DTOs
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

  // Préfixe global pour l'API
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0'); // ← ÉCOUTER SUR TOUTES LES INTERFACES

  console.log(`\n🚀 Backend NestJS démarré sur :`);
  console.log(`   Local:   http://localhost:${port}`);
  console.log(`   Réseau:  http://192.168.1.118:${port}`);
  console.log(`📚 API disponible sur http://192.168.1.118:${port}/api`);
  console.log(`🔌 WebSocket (Socket.IO) disponible sur ws://192.168.1.118:${port}\n`);
}

bootstrap();

