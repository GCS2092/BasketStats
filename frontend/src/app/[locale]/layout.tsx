import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import MainLayout from '@/components/layout/MainLayout';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Locale layout - Ajoute next-intl et MainLayout
// Ne doit PAS contenir html/body car c'est déjà dans le root layout
// Mais doit mettre à jour le lang du html via un script ou laisser le root layout gérer
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <MainLayout>
        {children}
      </MainLayout>
    </NextIntlClientProvider>
  );
}

