'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import apiClient from '@/lib/api/client';

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t('auth.loginError'));
      } else if (result?.ok) {
        // Vérifier le statut d'abonnement via l'API
        try {
          const response = await apiClient.get('/subscriptions/can-access-dashboard');
          const { canAccess } = response.data;
          
          if (!canAccess) {
            // Rediriger vers la page de sélection de plan si pas d'abonnement
            router.push('/welcome');
          } else {
            // Rediriger vers le dashboard normal
            router.push('/feed');
          }
        } catch (apiError) {
          console.error('Erreur lors de la vérification de l\'abonnement:', apiError);
          // En cas d'erreur, rediriger vers la page de bienvenue par sécurité
          router.push('/welcome');
        }
      }
    } catch (err) {
      setError(t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header avec logo */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6">
              <span className="text-4xl">🏀</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">
              {t('auth.login')}
            </h1>
            <p className="text-lg text-blue-100">
              {t('auth.loginSubtitle')}
            </p>
          </div>

          {/* Formulaire de connexion */}
          <div className="px-8 py-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.email')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder={t('auth.emailPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.password')}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder={t('auth.passwordPlaceholder')}
                />
              </div>

              <div className="flex items-center justify-between">
                <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
                  {t('auth.forgotPassword')}
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? t('auth.loggingIn') : t('auth.login')}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {t('auth.noAccount')}{' '}
                <Link href="/auth/signup" className="text-blue-600 font-medium hover:underline">
                  {t('auth.createAccount')}
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
                ← {t('auth.backToHome')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

