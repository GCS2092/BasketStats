import type { Metadata } from 'next';
import { Inter, Roboto } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers/Providers';
import MainLayout from '@/components/layout/MainLayout';
import OnboardingProvider from '@/components/onboarding/OnboardingProvider';
import { LogoAnimationProvider } from '@/contexts/LogoAnimationContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
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
              <MainLayout>
                {children}
              </MainLayout>
            </OnboardingProvider>
          </LogoAnimationProvider>
        </Providers>
      </body>
    </html>
  );
}

