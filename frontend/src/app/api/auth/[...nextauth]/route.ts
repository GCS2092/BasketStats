import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';

// Configuration NextAuth v4 (Stable) - Compatible avec Next.js 14 App Router
export const authOptions = {
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
    strategy: 'jwt' as const,
    maxAge: 7 * 24 * 60 * 60, // 7 jours
  },
  callbacks: {
    async jwt({ token, user, account }: any) {
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
    async session({ session, token }: any) {
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

// Export des handlers pour Next.js 14 App Router (NextAuth v4)
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };