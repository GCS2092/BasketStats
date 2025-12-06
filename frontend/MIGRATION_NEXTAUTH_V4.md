# 🔄 Migration vers NextAuth v4 (Stable)

## Pourquoi migrer ?

- ✅ **Stable et éprouvé** : NextAuth v4 est la version stable, largement utilisée
- ✅ **Compatible Next.js 14** : Fonctionne parfaitement avec Next.js 14 App Router
- ✅ **Moins de bugs** : Version mature, moins de problèmes
- ✅ **Documentation complète** : Beaucoup plus de ressources disponibles

## Étapes de Migration

### 1. Installer NextAuth v4

```bash
cd frontend
npm uninstall next-auth
npm install next-auth@^4.24.5
```

### 2. Modifier le fichier route.ts

Le fichier `src/app/api/auth/[...nextauth]/route.ts` doit être remplacé par :

```typescript
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email et mot de passe requis');
        }

        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            {
              email: credentials.email,
              password: credentials.password,
            },
          );

          const { user, accessToken, refreshToken } = response.data;

          if (user && accessToken) {
            return {
              id: user.id,
              email: user.email,
              name: user.fullName,
              image: user.avatarUrl,
              role: user.role,
              verified: user.verified,
              accessToken,
              refreshToken,
            };
          }

          return null;
        } catch (error: any) {
          console.error('Erreur auth:', error.response?.data || error.message);
          throw new Error(error.response?.data?.message || 'Échec de connexion');
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 jours
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        token.role = (user as any).role;
        token.verified = (user as any).verified;
        token.id = user.id;
        token.provider = account?.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).verified = token.verified as boolean;
        (session as any).accessToken = token.accessToken as string;
        (session as any).refreshToken = token.refreshToken as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-key-for-development-only',
  debug: process.env.NODE_ENV === 'development',
};

// Export des handlers pour Next.js 14 App Router
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### 3. Vérifier les types

Le fichier `src/types/next-auth.d.ts` devrait déjà fonctionner avec v4.

### 4. Tester localement

```bash
npm run dev
```

Testez la connexion sur `http://localhost:3000/auth/login`

### 5. Déployer

```bash
git add .
git commit -m "Migration NextAuth v5 beta vers v4 stable"
git push origin main
```

## Différences principales

| Aspect | NextAuth v5 beta | NextAuth v4 |
|--------|------------------|-------------|
| Import | `import NextAuth from 'next-auth'` | `import NextAuth, { NextAuthOptions } from 'next-auth'` |
| Providers | `Credentials({...})` | `CredentialsProvider({...})` |
| Export | `export const { GET, POST } = handlers` | `export { handler as GET, handler as POST }` |
| Configuration | `authConfig` | `authOptions: NextAuthOptions` |

## Avantages de v4

- ✅ Stable et testé en production
- ✅ Documentation complète
- ✅ Communauté active
- ✅ Moins de breaking changes
- ✅ Compatible avec Next.js 14

