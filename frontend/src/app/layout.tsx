import { Providers } from '@/components/providers/Providers';
import { LogoAnimationProvider } from '@/contexts/LogoAnimationContext';
import OnboardingProvider from '@/components/onboarding/OnboardingProvider';
import MainLayout from '@/components/layout/MainLayout';

// Root layout - inclut les providers de base
// Le layout [locale] ajoute next-intl
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <LogoAnimationProvider>
        <OnboardingProvider>
          <MainLayout>
            {children}
          </MainLayout>
        </OnboardingProvider>
      </LogoAnimationProvider>
    </Providers>
  );
}
