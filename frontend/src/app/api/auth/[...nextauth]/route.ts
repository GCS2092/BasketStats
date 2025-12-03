import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
// Temporairement désactivé pour résoudre l'erreur HTTP 500
// import Google from 'next-auth/providers/google';
// import Facebook from 'next-auth/providers/facebook';
import axios from 'axios';

// Configuration NextAuth v5 (Auth.js) - Compatible avec Next.js 14 App Router
const authConfig = {
  providers: [
    // Google OAuth - TEMPORAIREMENT DÉSACTIVÉ
    // Google({
    //   clientId: process.env.GOOGLE_CLIENT_ID || '',
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    // }),
    // Facebook OAuth - TEMPORAIREMENT DÉSACTIVÉ
    // Facebook({
    //   clientId: process.env.FACEBOOK_CLIENT_ID || '',
    //   clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
    // }),
    // Email & Password
    Credentials({
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
    async signIn({ user, account }) {
      // OAuth temporairement désactivé - cette partie ne sera pas appelée
      // Si c'est une connexion OAuth (Google/Facebook)
      // if (account?.provider === 'google' || account?.provider === 'facebook') {
      //   try {
      //     // Appeler notre backend pour créer/connecter l'utilisateur
      //     const response = await axios.post(
      //       `${process.env.NEXT_PUBLIC_API_URL}/auth/oauth`,
      //       {
      //         email: user.email,
      //         fullName: user.name,
      //         avatarUrl: user.image,
      //         provider: account.provider,
      //         // PAS de rôle spécifié = PLAYER par défaut côté backend
      //       },
      //     );

      //     const { user: backendUser, accessToken, refreshToken } = response.data;

      //     // Ajouter les tokens à l'objet user
      //     user.id = backendUser.id;
      //     user.role = backendUser.role;
      //     user.verified = backendUser.verified;
      //     (user as any).accessToken = accessToken;
      //     (user as any).refreshToken = refreshToken;

      //     return true;
      //   } catch (error: any) {
      //     console.error('Erreur OAuth backend:', error.response?.data || error.message);
      //     return false;
      //   }
      // }
      return true;
    },
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

// Vérifier que NEXTAUTH_SECRET est configuré en production
if (process.env.NODE_ENV === 'production' && !process.env.NEXTAUTH_SECRET) {
  console.error('❌ [NextAuth] NEXTAUTH_SECRET n\'est pas configuré en production!');
}

// NextAuth v5 - Syntaxe correcte pour Next.js 14 App Router
let handlers: { GET: any; POST: any };

try {
  // Vérifier les variables d'environnement avant d'initialiser NextAuth
  console.log('🔍 [NextAuth] Initialisation...');
  console.log('🔍 [NextAuth] NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✅ Configuré' : '❌ MANQUANT');
  console.log('🔍 [NextAuth] NEXTAUTH_URL:', process.env.NEXTAUTH_URL || '❌ MANQUANT');
  console.log('🔍 [NextAuth] NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL || '❌ MANQUANT');
  
  handlers = NextAuth(authConfig);
  console.log('✅ [NextAuth] Initialisé avec succès');
} catch (error: any) {
  console.error('❌ [NextAuth] Erreur lors de l\'initialisation:', error);
  console.error('❌ [NextAuth] Stack:', error?.stack);
  throw error;
}

// Wrapper pour gérer les erreurs et logger les problèmes
async function handleAuthRequest(
  handler: (req: Request) => Promise<Response>,
  req: Request,
  method: string,
): Promise<Response> {
  try {
    console.log(`🔍 [NextAuth] ${method} request reçue`);
    const response = await handler(req);
    console.log(`✅ [NextAuth] ${method} response status:`, response.status);
    return response;
  } catch (error: any) {
    console.error(`❌ [NextAuth] Erreur dans ${method} handler:`, error);
    console.error('❌ [NextAuth] Stack:', error?.stack);
    console.error('❌ [NextAuth] Message:', error?.message);
    
    // Retourner une réponse JSON valide
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        message: error?.message || 'Une erreur est survenue lors de l\'authentification',
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }
}

// Export des handlers avec gestion d'erreur
export async function GET(req: Request) {
  return handleAuthRequest(handlers.GET, req, 'GET');
}

export async function POST(req: Request) {
  return handleAuthRequest(handlers.POST, req, 'POST');
}
