'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { signOut } from 'next-auth/react';

function WelcomePageContent() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setUserInfo(JSON.parse(user));
    }
  }, []);

  const handleStartPayment = () => {
    setIsLoading(true);
    router.push('/subscription?newUser=true');
  };

  const handleLogout = async () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    await signOut({ redirect: false });
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6">
              <span className="text-4xl">🏀</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              {t('welcome.title')}
            </h1>
            <p className="text-xl text-blue-100">
              {t('welcome.subtitle')}
            </p>
          </div>

          <div className="px-8 py-12">
            {userInfo && (
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  {t('welcome.greeting', { name: userInfo.fullName || userInfo.email })} 👋
                </h2>
                <p className="text-gray-600">
                  {t('welcome.accountCreated')}
                </p>
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{t('welcome.features.analytics.title')}</h3>
                <p className="text-sm text-gray-600">{t('welcome.features.analytics.desc')}</p>
              </div>

              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{t('welcome.features.recruitment.title')}</h3>
                <p className="text-sm text-gray-600">{t('welcome.features.recruitment.desc')}</p>
              </div>

              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{t('welcome.features.social.title')}</h3>
                <p className="text-sm text-gray-600">{t('welcome.features.social.desc')}</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="text-2xl">💡</span>
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-blue-800 mb-2">
                    {t('welcome.ready.title')}
                  </h3>
                  <p className="text-blue-700">
                    {t('welcome.ready.desc')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleStartPayment}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading ? t('common.loading') : '🚀 ' + t('welcome.choosePlan')}
              </button>

              <button
                onClick={handleLogout}
                className="bg-gray-200 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-300 transition-all duration-200"
              >
                {t('auth.logout')}
              </button>
            </div>

            <div className="mt-8 text-center text-sm text-gray-500">
              <p>
                {t('welcome.info')}
                <br />
                <span className="font-medium">{t('welcome.support')}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WelcomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    }>
      <WelcomePageContent />
    </Suspense>
  );
}

