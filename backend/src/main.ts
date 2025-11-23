import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { join } from 'path';
import * as os from 'os';

// Fonction pour obtenir l'IP du réseau local
function getLocalNetworkIP(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      // Ignorer les interfaces internes et non-IPv4
      if (iface.family === 'IPv4' && !iface.internal) {
        // Priorité aux adresses 192.168.x.x, 10.x.x.x, 172.16-31.x.x
        if (iface.address.startsWith('192.168.') || 
            iface.address.startsWith('10.') ||
            iface.address.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)) {
          return iface.address;
        }
      }
    }
  }
  // Si aucune IP réseau trouvée, retourner la première IPv4 non-interne
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: {
      origin: (origin, callback) => {
        // En développement, accepter toutes les origines locales et réseau local
        if (!origin || 
            origin.includes('localhost') || 
            origin.includes('127.0.0.1') || 
            origin.match(/^http:\/\/192\.168\.\d+\.\d+:\d+$/) ||
            origin.match(/^http:\/\/10\.\d+\.\d+\.\d+:\d+$/) ||
            origin.match(/^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+:\d+$/)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
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
  const networkIP = getLocalNetworkIP();
  
  await app.listen(port, '0.0.0.0'); // ← ÉCOUTER SUR TOUTES LES INTERFACES

  console.log(`\n🚀 Backend NestJS démarré sur :`);
  console.log(`   Local:   http://localhost:${port}`);
  console.log(`   Réseau:  http://${networkIP}:${port}`);
  console.log(`📚 API disponible sur http://${networkIP}:${port}/api`);
  console.log(`🔌 WebSocket (Socket.IO) disponible sur ws://${networkIP}:${port}`);
  console.log(`\n💡 Pour accéder depuis un autre appareil sur le réseau:`);
  console.log(`   Frontend: http://${networkIP}:3000`);
  console.log(`   Backend:  http://${networkIP}:${port}\n`);
}

bootstrap();

