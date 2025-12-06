# 🌍 Installation du Système de Traduction i18n (FR/EN)

## ✅ Ce qui a été fait

### 1. Installation et Configuration
- ✅ Package `next-intl` installé
- ✅ Configuration dans `next.config.js`
- ✅ Middleware créé pour la détection de langue
- ✅ Structure `[locale]` créée

### 2. Fichiers de Traduction
- ✅ `messages/fr.json` - Traductions françaises
- ✅ `messages/en.json` - Traductions anglaises
- ✅ Structure organisée par sections (common, navigation, home, auth, etc.)

### 3. Composants
- ✅ `LanguageSwitcher` - Composant pour changer de langue
- ✅ Layout avec `NextIntlClientProvider`
- ✅ Routing configuré avec `next-intl`

### 4. Pages Migrées
- ✅ Page d'accueil (`/[locale]/page.tsx`) avec traductions
- ✅ Header avec sélecteur de langue
- ✅ Navigation WhatsApp mise à jour

## 📋 Ce qui reste à faire

### Routes à déplacer dans `[locale]`
Toutes les routes doivent être déplacées de `src/app/` vers `src/app/[locale]/` :

- [ ] `feed/page.tsx` → `[locale]/feed/page.tsx`
- [ ] `players/page.tsx` → `[locale]/players/page.tsx`
- [ ] `players/[id]/page.tsx` → `[locale]/players/[id]/page.tsx`
- [ ] `clubs/page.tsx` → `[locale]/clubs/page.tsx`
- [ ] `events/page.tsx` → `[locale]/events/page.tsx`
- [ ] `messages/page.tsx` → `[locale]/messages/page.tsx`
- [ ] `notifications/page.tsx` → `[locale]/notifications/page.tsx`
- [ ] `auth/login/page.tsx` → `[locale]/auth/login/page.tsx`
- [ ] `auth/signup/page.tsx` → `[locale]/auth/signup/page.tsx`
- [ ] `admin/*` → `[locale]/admin/*`
- [ ] Et toutes les autres routes...

### Composants à mettre à jour
- [ ] Remplacer tous les `Link` de `next/link` par `Link` de `@/i18n/routing`
- [ ] Remplacer tous les `useRouter` de `next/navigation` par `useRouter` de `@/i18n/routing`
- [ ] Ajouter `useTranslations()` dans tous les composants qui affichent du texte
- [ ] Extraire tous les textes hardcodés vers les fichiers de traduction

## 🚀 Utilisation

### Dans un composant client
```tsx
'use client';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function MyComponent() {
  const t = useTranslations();
  
  return (
    <div>
      <h1>{t('home.title')}</h1>
      <Link href="/feed">{t('navigation.feed')}</Link>
    </div>
  );
}
```

### Dans un composant serveur
```tsx
import { useTranslations } from 'next-intl';

export default async function MyServerComponent({ params }: { params: { locale: string } }) {
  const t = await useTranslations();
  
  return <h1>{t('home.title')}</h1>;
}
```

### Navigation
```tsx
import { Link, useRouter } from '@/i18n/routing';

// Le Link et useRouter de next-intl gèrent automatiquement la locale
<Link href="/feed">Feed</Link>
router.push('/feed'); // Ajoute automatiquement /fr ou /en
```

## 📝 Structure des traductions

Les traductions sont organisées par section dans `messages/fr.json` et `messages/en.json` :

```json
{
  "common": { ... },
  "navigation": { ... },
  "home": { ... },
  "auth": { ... },
  "feed": { ... },
  "players": { ... },
  ...
}
```

## ⚠️ Notes importantes

1. **Routes API** : Les routes API (`/api/*`) ne doivent PAS être dans `[locale]`
2. **Middleware** : Le middleware redirige automatiquement vers `/fr` ou `/en`
3. **Locale par défaut** : Français (`fr`) est la langue par défaut
4. **URLs** : Toutes les URLs incluront maintenant la locale (`/fr/feed`, `/en/feed`)

## 🔄 Migration progressive

La migration peut être faite progressivement :
1. Déplacer les routes une par une
2. Mettre à jour les composants au fur et à mesure
3. Tester chaque page après migration

## 📚 Documentation

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Next.js Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization)

