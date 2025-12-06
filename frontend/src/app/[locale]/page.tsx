'use client';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';
import BasketballNews from '@/components/news/BasketballNews';
import NBAScores from '@/components/news/NBAScores';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<'news' | 'scores'>('news');

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/feed');
    }
  }, [status, router]);

  // Gérer l'onglet actif depuis l'URL au chargement
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'scores' || tab === 'news') {
        setActiveTab(tab);
      }
    }
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="gradient-primary text-white">
        <div className="container-custom py-12 md:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {t('home.title')}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 text-neutral-100">
              {t('home.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth/signup" className="btn-accent text-lg px-8 py-3">
                {t('home.createAccount')}
              </Link>
              <Link href="/auth/login" className="btn bg-white text-primary hover:bg-neutral-100 text-lg px-8 py-3">
                {t('home.login')}
              </Link>
              <div className="mt-2 sm:mt-0">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Actualités et Scores avec onglets */}
      <section className="py-8 md:py-12 bg-white">
        <div className="container-custom">
          {/* Onglets */}
          <div className="mb-6">
            <div className="flex space-x-1 bg-neutral-200 rounded-lg p-1 max-w-md mx-auto">
              <button
                onClick={() => {
                  setActiveTab('news');
                  router.push('/?tab=news', { scroll: false });
                }}
                className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors text-sm ${
                  activeTab === 'news'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-neutral-600 hover:text-primary'
                }`}
              >
                📰 {t('home.newsTab')}
              </button>
              <button
                onClick={() => {
                  setActiveTab('scores');
                  router.push('/?tab=scores', { scroll: false });
                }}
                className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors text-sm ${
                  activeTab === 'scores'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-neutral-600 hover:text-primary'
                }`}
              >
                🏀 {t('home.matchesTab')}
              </button>
            </div>
          </div>

          {/* Contenu selon l'onglet actif */}
          {activeTab === 'news' && (
            <div className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold text-center mb-6">{t('home.latestNews')}</h2>
              <BasketballNews />
            </div>
          )}

          {activeTab === 'scores' && (
            <div className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold text-center mb-6">{t('home.recentScores')}</h2>
              <NBAScores />
            </div>
          )}
        </div>
      </section>

      {/* Section Fonctionnalités en bas */}
      <section className="py-16 bg-neutral-50">
        <div className="container-custom">
          <h2 className="text-2xl font-bold text-center mb-8">
            {t('home.features')}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-4xl mb-4">👤</div>
              <h3 className="text-lg font-bold mb-2">{t('home.profileTitle')}</h3>
              <p className="text-neutral-600 text-sm">{t('home.profileDesc')}</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-4xl mb-4">🎬</div>
              <h3 className="text-lg font-bold mb-2">{t('home.videosTitle')}</h3>
              <p className="text-neutral-600 text-sm">{t('home.videosDesc')}</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-bold mb-2">{t('home.searchTitle')}</h3>
              <p className="text-neutral-600 text-sm">{t('home.searchDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-accent text-white py-16">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t('home.ctaTitle')}
          </h2>
          <p className="text-xl mb-8">
            {t('home.ctaDesc')}
          </p>
          <Link href="/auth/signup" className="btn bg-white text-accent hover:bg-neutral-100 text-lg px-8 py-3">
            {t('home.ctaButton')}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-300 py-8">
        <div className="container-custom text-center">
          <p>&copy; 2025 Bball Connect. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}


