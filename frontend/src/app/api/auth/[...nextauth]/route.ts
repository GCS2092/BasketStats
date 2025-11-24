import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import axios from 'axios';
import { NextRequest } from 'next/server';

export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      profile(profile) {
        return {
          id: profile.sub,
          email: profile.email,
          name: profile.name,
          image: profile.picture,
          provider: 'google',
        };
      },
    }),
    // Facebook OAuth
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
      profile(profile) {
        return {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          image: profile.picture?.data?.url,
          provider: 'facebook',
        };
      },
    }),
    // Email & Password
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
    async signIn({ user, account }) {
      // Si c'est une connexion OAuth (Google/Facebook)
      if (account?.provider === 'google' || account?.provider === 'facebook') {
        try {
          // Appeler notre backend pour créer/connecter l'utilisateur
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/oauth`,
            {
              email: user.email,
              fullName: user.name,
              avatarUrl: user.image,
              provider: account.provider,
              // PAS de rôle spécifié = PLAYER par défaut côté backend
            },
          );

          const { user: backendUser, accessToken, refreshToken } = response.data;

          // Ajouter les tokens à l'objet user
          user.id = backendUser.id;
          user.role = backendUser.role;
          user.verified = backendUser.verified;
          user.accessToken = accessToken;
          user.refreshToken = refreshToken;

          return true;
        } catch (error: any) {
          console.error('Erreur OAuth backend:', error.response?.data || error.message);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.role = user.role;
        token.verified = user.verified;
        token.id = user.id;
        token.provider = account?.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.verified = token.verified as boolean;
        session.accessToken = token.accessToken as string;
        session.refreshToken = token.refreshToken as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-key-for-development-only',
};

// Créer le handler NextAuth
const handler = NextAuth(authOptions);

// Helper pour créer une requête compatible avec NextAuth v4
function createNextAuthRequest(
  request: NextRequest,
  nextauthPath: string[]
): any {
  // Créer un objet qui simule une requête Express/Next.js Pages Router
  const url = new URL(request.url);
  
  return {
    method: request.method,
    url: request.url,
    headers: Object.fromEntries(request.headers.entries()),
    query: {
      nextauth: nextauthPath,
    },
    body: null, // Sera rempli pour POST
    cookies: Object.fromEntries(
      request.cookies.getAll().map(c => [c.name, c.value])
    ),
  };
}

// Wrapper functions pour compatibilité Next.js 14 App Router
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ nextauth: string[] }> | { nextauth: string[] } }
) {
  try {
    // Gérer params qui peut être une Promise (Next.js 15) ou un objet (Next.js 14)
    const resolvedParams = params instanceof Promise ? await params : params;
    const nextauthPath = resolvedParams.nextauth || [];
    
    // Créer une requête compatible avec NextAuth v4
    const nextAuthRequest = createNextAuthRequest(request, nextauthPath);
    
    // Appeler NextAuth avec la requête modifiée
    const response = await handler(nextAuthRequest);
    
    // NextAuth devrait toujours retourner une Response
    if (response && response instanceof Response) {
      return response;
    }
    
    // Fallback si NextAuth retourne quelque chose d'inattendu
    console.warn('NextAuth returned non-Response:', typeof response);
    return new Response(JSON.stringify({ error: 'Unexpected response from NextAuth' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('NextAuth GET Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal Server Error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ nextauth: string[] }> | { nextauth: string[] } }
) {
  try {
    // Gérer params qui peut être une Promise (Next.js 15) ou un objet (Next.js 14)
    const resolvedParams = params instanceof Promise ? await params : params;
    const nextauthPath = resolvedParams.nextauth || [];
    
    // Lire le body pour les requêtes POST
    let body = null;
    try {
      body = await request.text();
    } catch (e) {
      // Body peut être vide ou déjà lu
    }
    
    // Créer une requête compatible avec NextAuth v4
    const nextAuthRequest = createNextAuthRequest(request, nextauthPath);
    nextAuthRequest.body = body;
    
    // Appeler NextAuth avec la requête modifiée
    const response = await handler(nextAuthRequest);
    
    // NextAuth devrait toujours retourner une Response
    if (response && response instanceof Response) {
      return response;
    }
    
    // Fallback si NextAuth retourne quelque chose d'inattendu
    console.warn('NextAuth returned non-Response:', typeof response);
    return new Response(JSON.stringify({ error: 'Unexpected response from NextAuth' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('NextAuth POST Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal Server Error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

