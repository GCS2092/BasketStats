import type { Metadata } from 'next';
import { Inter, Roboto } from 'next/font/google';
import { Providers } from '@/components/providers/Providers';
import { LogoAnimationProvider } from '@/contexts/LogoAnimationContext';
import OnboardingProvider from '@/components/onboarding/OnboardingProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: false, // Désactiver le préchargement pour éviter les warnings
});

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
  preload: false, // Désactiver le préchargement pour éviter les warnings
});

export const metadata: Metadata = {
  title: 'BasketStats - Plateforme pour Basketteurs',
  description: 'Plateforme de recrutement et networking pour basketteurs professionnels et amateurs',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'BasketStats',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

// Root layout - DOIT contenir la structure HTML complète avec DOCTYPE
// Next.js génère automatiquement le DOCTYPE quand il y a un tag <html>
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${roboto.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="font-body bg-neutral-100 text-neutral-900">
        <Providers>
          <LogoAnimationProvider>
            <OnboardingProvider>
              {children}
            </OnboardingProvider>
          </LogoAnimationProvider>
        </Providers>
      </body>
    </html>
  );
}
