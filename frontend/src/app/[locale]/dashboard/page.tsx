'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from '@/i18n/routing';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import Header from '@/components/layout/Header';
import NavigationBreadcrumb from '@/components/common/NavigationBreadcrumb';
import ElegantQuickNavigation from '@/components/common/ElegantQuickNavigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import SubscriptionLimitsWarning, { SubscriptionLimitsDashboard } from '@/components/subscription/SubscriptionLimitsWarning';
import { Link } from '@/i18n/routing';
import { useAuthSync } from '@/hooks/useAuth';
import { useTranslations } from 'next-intl';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations();
  useAuthSync();

  const isRecruiter = session?.user?.role === 'RECRUITER';
  const isAdmin = session?.user?.role === 'ADMIN';

  const { data: subscriptionCheck, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['subscription-check'],
    queryFn: async () => {
      const response = await apiClient.get('/subscriptions/can-access-dashboard');
      return response.data;
    },
    enabled: !!session,
    retry: 1,
  });

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['recruiter-dashboard'],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/recruiter/dashboard');
      return response.data;
    },
    enabled: !!session && (isRecruiter || isAdmin) && (subscriptionCheck?.canAccess || isAdmin),
  });

  useEffect(() => {
    // Les admins ont toujours accès, pas besoin de vérifier l'abonnement
    if (subscriptionCheck && !subscriptionCheck.canAccess && !isAdmin) {
      router.push('/subscription');
    }
  }, [subscriptionCheck, router, isAdmin]);

  if (subscriptionLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('dashboard.checkingSubscription')}</p>
        </div>
      </div>
    );
  }

  // Permettre l'accès aux recruteurs ET aux admins
  if (!isRecruiter && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('dashboard.unauthorized')}</h1>
          <p className="text-gray-600 mb-4">{t('dashboard.recruitersOnly')}</p>
          <button
            onClick={() => router.push('/feed')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {t('dashboard.backToFeed')}
          </button>
        </div>
      </div>
    );
  }

  // Les admins ont toujours accès, pas besoin de vérifier l'abonnement
  if (subscriptionCheck && !subscriptionCheck.canAccess && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('dashboard.redirecting')}</p>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const myPlayers = dashboardData?.myPlayers || [];
  const recentActivity = dashboardData?.recentActivity || [];

  return (
    <ProtectedRoute requiredRole={isAdmin ? "ADMIN" : "RECRUITER"} requiresVerification={!isAdmin} redirectTo="/feed">
      <SubscriptionGuard>
        <div className="min-h-screen bg-neutral-100">
        <Header />
      
      <ElegantQuickNavigation currentPage="/dashboard" />

      <main className="container-custom py-6">
        <div className="max-w-7xl mx-auto">
          <SubscriptionLimitsWarning />
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">📊 {t('dashboard.title')}</h1>
            <p className="text-neutral-600">
              {t('dashboard.subtitle')}
            </p>

            <div className="mt-6">
              <SubscriptionLimitsDashboard />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
              <Link href="/formations" className="btn btn-primary w-full sm:w-auto">
                🏀 {t('dashboard.manageFormations')}
              </Link>
              <Link href="/players" className="btn btn-secondary w-full sm:w-auto">
                🔍 {t('dashboard.searchPlayers')}
              </Link>
              <Link href="/my-players" className="btn btn-secondary w-full sm:w-auto">
                ⭐ {t('dashboard.myPlayers')}
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card p-6 border-l-4 border-l-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-600 text-sm">{t('dashboard.sentOffers')}</p>
                  <p className="text-3xl font-bold mt-1">{stats.sentOffers || 0}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="card p-6 border-l-4 border-l-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-600 text-sm">{t('dashboard.acceptedOffers')}</p>
                  <p className="text-3xl font-bold mt-1 text-green-600">{stats.acceptedOffers || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="card p-6 border-l-4 border-l-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-600 text-sm">{t('dashboard.pendingOffers')}</p>
                  <p className="text-3xl font-bold mt-1 text-yellow-600">{stats.pendingOffers || 0}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="card p-6 border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-600 text-sm">{t('dashboard.conversionRate')}</p>
                  <p className="text-3xl font-bold mt-1 text-blue-600">{stats.conversionRate || 0}%</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">⭐ {t('dashboard.myPlayers')} ({myPlayers.length})</h2>
                <Link href="/my-players" className="text-purple-600 hover:underline text-sm font-semibold">
                  {t('dashboard.viewAll')} →
                </Link>
              </div>

              {myPlayers.length > 0 ? (
                <div className="space-y-4">
                  {myPlayers.slice(0, 5).map((request: any) => (
                    <div key={request.id} className="flex items-center gap-4 p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        {request.toUser.avatarUrl ? (
                          <img
                            src={request.toUser.avatarUrl}
                            alt=""
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          '🏀'
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/players/${request.toUserId}`} className="font-semibold hover:text-purple-600 truncate block">
                          {request.toUser.fullName}
                        </Link>
                        <p className="text-sm text-neutral-600 truncate">
                          {request.toUser.playerProfile?.position || '-'} • {request.toUser.playerProfile?.level || '-'}
                        </p>
                      </div>
                      <Link
                        href={`/messages?userId=${request.toUserId}`}
                        className="btn btn-sm bg-purple-100 text-purple-700 hover:bg-purple-200"
                      >
                        💬
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  <div className="text-4xl mb-2">⭐</div>
                  <p>{t('dashboard.noPlayers')}</p>
                  <Link href="/players" className="btn btn-secondary mt-4">
                    {t('dashboard.searchPlayers')}
                  </Link>
                </div>
              )}
            </div>

            <div className="card p-6">
              <h2 className="text-xl font-bold mb-6">🔔 {t('dashboard.recentActivity')}</h2>

              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.slice(0, 5).map((activity: any) => (
                    <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-b-0">
                      <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0">
                        {activity.toUser.avatarUrl ? (
                          <img
                            src={activity.toUser.avatarUrl}
                            alt=""
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          '👤'
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          {t('dashboard.offerSentTo')}{' '}
                          <Link href={`/players/${activity.toUserId}`} className="font-semibold hover:text-purple-600">
                            {activity.toUser.fullName}
                          </Link>
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              activity.status === 'ACCEPTED'
                                ? 'bg-green-100 text-green-700'
                                : activity.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {activity.status === 'ACCEPTED' && '✓ ' + t('dashboard.accepted')}
                            {activity.status === 'PENDING' && '⏳ ' + t('dashboard.pending')}
                            {activity.status === 'REJECTED' && '✗ ' + t('dashboard.rejected')}
                          </span>
                          <span className="text-xs text-neutral-500">
                            {new Date(activity.createdAt).toLocaleDateString(t('common.locale'))}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  <p>{t('dashboard.noActivity')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      </div>
      </SubscriptionGuard>
    </ProtectedRoute>
  );
}

