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
        // En production, accepter le frontend Vercel
        const frontendUrl = process.env.FRONTEND_URL;
        const isDevelopment = process.env.NODE_ENV !== 'production';
        
        // Liste des origines autorisées
        const allowedOrigins: string[] = [];
        
        if (frontendUrl) {
          // Ajouter l'URL exacte
          allowedOrigins.push(frontendUrl);
          // Ajouter avec/sans trailing slash
          allowedOrigins.push(frontendUrl.replace(/\/$/, ''));
          allowedOrigins.push(frontendUrl.endsWith('/') ? frontendUrl : `${frontendUrl}/`);
          // Accepter tous les sous-domaines Vercel si c'est un domaine Vercel
          if (frontendUrl.includes('vercel.app')) {
            allowedOrigins.push(/^https:\/\/.*\.vercel\.app$/);
          }
        }
        
        // En développement, accepter toutes les origines locales et réseau local
        const isLocalOrigin = !origin || 
            origin.includes('localhost') || 
            origin.includes('127.0.0.1') || 
            origin.match(/^http:\/\/192\.168\.\d+\.\d+:\d+$/) ||
            origin.match(/^http:\/\/10\.\d+\.\d+\.\d+:\d+$/) ||
            origin.match(/^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+:\d+$/);
        
        // Vérifier si l'origine est autorisée
        const isAllowedOrigin = origin && (
          allowedOrigins.includes(origin) ||
          allowedOrigins.some(pattern => {
            if (pattern instanceof RegExp) {
              return pattern.test(origin);
            }
            return false;
          })
        );
        
        // Accepter les origines autorisées ou locales en développement
        if (isDevelopment && isLocalOrigin) {
          callback(null, true);
        } else if (isAllowedOrigin) {
          callback(null, true);
        } else if (!origin && isDevelopment) {
          // Permettre les requêtes sans origin en développement (Postman, etc.)
          callback(null, true);
        } else {
          // En production, log pour debug
          if (!isDevelopment) {
            console.log(`🚫 CORS bloqué: origin="${origin}", FRONTEND_URL="${frontendUrl}"`);
          }
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

  // Railway et autres plateformes cloud définissent automatiquement PORT
  const port = process.env.PORT || 3001;
  const networkIP = getLocalNetworkIP();
  
  await app.listen(port, '0.0.0.0'); // ← ÉCOUTER SUR TOUTES LES INTERFACES (nécessaire pour Railway)

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

