import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Pages publiques qui ne nécessitent pas d'authentification
  const publicPages = [
    '/',
    '/auth/login',
    '/auth/signup',
    '/welcome',
    '/payment/success',
    '/payment/cancel',
    '/api'
  ];

  // Vérifier si c'est une page publique
  if (publicPages.some(page => pathname.startsWith(page))) {
    return NextResponse.next();
  }

  // Vérifier si l'utilisateur est authentifié
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    // Rediriger vers la page de connexion si pas de token
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Pour les pages protégées, la vérification d'abonnement sera faite côté client
  // car le middleware ne peut pas faire d'appels API asynchrones
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};