'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { useTransition } from 'react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (newLocale: string) => {
    startTransition(() => {
      // Remplacer la locale dans l'URL
      const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
      router.replace(newPathname);
    });
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => switchLocale('fr')}
        disabled={isPending}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          locale === 'fr'
            ? 'bg-primary text-white'
            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
        } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        FR
      </button>
      <button
        onClick={() => switchLocale('en')}
        disabled={isPending}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          locale === 'en'
            ? 'bg-primary text-white'
            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
        } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        EN
      </button>
    </div>
  );
}

