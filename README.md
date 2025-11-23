# 🏀 BasketStats - Plateforme pour Basketteurs

Plateforme PWA complète pour basketteurs (pros & amateurs) et recruteurs : profils détaillés, vidéos highlights, recherche avancée, messagerie temps réel et processus de recrutement.

## 🎯 Fonctionnalités principales

- ✅ **Authentification** : Email/password + OAuth Google/Facebook (optionnel)
- ✅ **Profils joueurs** : Bio, stats, poste, vidéos highlights, disponibilité
- ✅ **Upload vidéos** : Stockage local + génération automatique thumbnails
- ✅ **Feed social** : Posts photo/vidéo, likes, commentaires
- ✅ **Recherche avancée** : Filtres multi-critères (poste, taille, niveau, région)
- ✅ **Messagerie temps réel** : WebSocket via Socket.IO
- ✅ **Recrutement** : Demandes, shortlist, dashboard recruteur
- ✅ **Notifications** : Push natif Web Push API
- ✅ **PWA** : Installation sur mobile/desktop, mode offline partiel
- ✅ **Admin** : Modération, validation profils certifiés

## 🛠️ Stack technique

### Frontend
- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** + Headless UI
- **React Query** (TanStack Query)
- **NextAuth.js** (authentification)
- **PWA** (next-pwa)
- **Socket.IO Client** (messagerie)

### Backend
- **NestJS** + TypeScript
- **Prisma ORM** → PostgreSQL
- **JWT** (auth)
- **Socket.IO** (WebSocket)
- **Sharp** (génération thumbnails)
- **Multer** (upload fichiers)

### Base de données
- **PostgreSQL** (base: `basketapp`)
- Extensions: `uuid-ossp`, `pg_trgm` (recherche floue)

## 📋 Prérequis

- **Node.js** 18+ ([télécharger](https://nodejs.org))
- **PostgreSQL** 14+ avec interface graphique (déjà installé)
- **npm** ou **yarn**

## 🚀 Installation

### 1. Cloner/vérifier le projet

Vous êtes déjà dans `C:\BasketStats`

### 2. Créer la base de données PostgreSQL

Ouvrez votre interface PostgreSQL (pgAdmin, DBeaver, etc.) et créez la base :

```sql
CREATE DATABASE basketapp;
```

### 3. Configurer les variables d'environnement

#### Backend (`backend/.env`)

```env
# Database
DATABASE_URL="postgresql://VOTRE_USER:VOTRE_PASSWORD@localhost:5432/basketapp"

# JWT
JWT_SECRET="votre_secret_super_securise_changez_moi"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="votre_refresh_secret_changez_moi"
JWT_REFRESH_EXPIRES_IN="7d"

# Upload
UPLOAD_DIR="uploads"
MAX_FILE_SIZE=104857600
ALLOWED_VIDEO_FORMATS="mp4,webm,mov,avi"
ALLOWED_IMAGE_FORMATS="jpg,jpeg,png,webp"

# Server
PORT=4000
FRONTEND_URL="http://localhost:3000"

# Optionnel: Web Push (générer avec `npm run generate-vapid`)
VAPID_PUBLIC_KEY=""
VAPID_PRIVATE_KEY=""
VAPID_SUBJECT="mailto:admin@basketstats.com"
```

#### Frontend (`frontend/.env.local`)

```env
# API
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_WS_URL="http://localhost:4000"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre_nextauth_secret_changez_moi"

# Optionnel: OAuth (activez si besoin)
# GOOGLE_CLIENT_ID=""
# GOOGLE_CLIENT_SECRET=""
# FACEBOOK_CLIENT_ID=""
# FACEBOOK_CLIENT_SECRET=""
```

### 4. Installer les dépendances

```bash
# Backend
cd backend
npm install

# Frontend (dans un autre terminal)
cd ../frontend
npm install
```

### 5. Initialiser la base de données

```bash
cd backend
npm run prisma:migrate
npm run prisma:seed  # Données de test (optionnel)
```

### 6. Démarrer l'application

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```
→ API disponible sur http://localhost:4000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev    # ⚠️ Commande correcte (pas start:dev)
```
→ App disponible sur http://localhost:3000

## 📁 Structure du projet

```
BasketStats/
├── backend/                    # API NestJS
│   ├── prisma/
│   │   ├── schema.prisma      # Schéma base de données
│   │   └── migrations/        # Historique migrations
│   ├── src/
│   │   ├── auth/              # Module authentification
│   │   ├── users/             # Gestion utilisateurs
│   │   ├── players/           # Profils joueurs
│   │   ├── videos/            # Upload & streaming vidéos
│   │   ├── posts/             # Feed social
│   │   ├── messages/          # Messagerie (Socket.IO)
│   │   ├── notifications/     # Notifications
│   │   ├── recruit/           # Demandes recrutement
│   │   ├── search/            # Recherche avancée
│   │   ├── upload/            # Service upload
│   │   └── main.ts
│   └── package.json
│
├── frontend/                   # PWA Next.js
│   ├── src/
│   │   ├── app/               # App Router pages
│   │   │   ├── (auth)/        # Pages auth
│   │   │   ├── feed/          # Feed principal
│   │   │   ├── players/       # Profils joueurs
│   │   │   ├── search/        # Recherche
│   │   │   ├── messages/      # Messagerie
│   │   │   └── dashboard/     # Dashboard recruteur
│   │   ├── components/        # Composants UI
│   │   ├── lib/               # Utils & config
│   │   └── styles/
│   ├── public/
│   │   ├── manifest.json      # PWA manifest
│   │   └── icons/
│   └── package.json
│
├── uploads/                    # Stockage local (dev)
│   ├── videos/
│   ├── thumbnails/
│   └── avatars/
│
└── shared/                     # Types partagés (optionnel)
```

## 🎨 Design System

### Palette de couleurs

```css
--primary: #0B3D91      /* Deep blue */
--accent: #FF6B35       /* Orange */
--neutral: #F7F7F8      /* Light gray */
--text: #111827         /* Dark text */
--success: #10B981
--error: #EF4444
```

### Typographie
- **Headings**: Inter
- **Body**: Roboto
- **Base size**: 16px

## 🔐 Sécurité

- ✅ Mots de passe hashés (bcrypt)
- ✅ JWT + Refresh tokens
- ✅ HTTPS recommandé en prod
- ✅ Rate limiting sur endpoints sensibles
- ✅ Validation des uploads (taille, format)
- ✅ Sanitization des inputs
- ✅ CORS configuré

## 📱 PWA

L'application est installable sur :
- ✅ Android (Chrome, Edge)
- ✅ iOS 16+ (Safari)
- ✅ Desktop (Chrome, Edge)

Mode offline partiel : cache des pages visitées, brouillons de posts.

## 🧪 Tests

```bash
# Backend
cd backend
npm run test           # Tests unitaires
npm run test:e2e       # Tests e2e

# Frontend
cd frontend
npm run test
npm run test:e2e       # Playwright
```

## 📦 Déploiement

### Frontend (Vercel - gratuit)

```bash
cd frontend
vercel deploy
```

### Backend (Railway/Render - gratuit)

1. Créer un projet sur Railway/Render
2. Connecter le repo GitHub
3. Ajouter les variables d'environnement
4. Créer une base PostgreSQL managée
5. Déployer !

### Migration stockage vidéos (optionnel)

Pour scaler, migrer vers **Cloudinary** (gratuit 25GB) :

1. Créer compte Cloudinary
2. Ajouter les variables d'environnement :
```env
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```
3. Le code s'adapte automatiquement (déjà prévu)

## 🐛 Troubleshooting

### Erreur connexion PostgreSQL

```bash
# Vérifier que PostgreSQL est démarré
# Windows: Services → PostgreSQL
# Vérifier la DATABASE_URL dans backend/.env
```

### Port déjà utilisé

```bash
# Changer le port dans backend/.env (PORT=4001)
# Changer dans frontend/.env.local (NEXT_PUBLIC_API_URL)
```

### Erreur upload vidéos

```bash
# Vérifier que le dossier uploads/ existe
mkdir uploads\videos uploads\thumbnails uploads\avatars
```

## 📞 Support

- Documentation complète : voir `/docs` (à venir)
- Issues: GitHub Issues
- Contact: admin@basketstats.com

## 📄 Licence

MIT

---

**Développé avec ❤️ pour la communauté basket**

