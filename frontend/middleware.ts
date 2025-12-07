import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ne pas appliquer i18n aux routes API, _next, _vercel, et fichiers statiques
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/_vercel/') ||
    pathname.includes('.') // Fichiers statiques (images, fonts, etc.)
  ) {
    return NextResponse.next();
  }

  // Redirection explicite de la racine vers la locale par défaut
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = `/${routing.defaultLocale}`;
    return NextResponse.redirect(url);
  }

  // Appliquer le middleware i18n pour les autres routes
  return intlMiddleware(request);
}

export const config = {
  // Match toutes les routes sauf les fichiers statiques et les routes système
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};
