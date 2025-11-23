'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import Header from '@/components/layout/Header';
import NavigationBreadcrumb from '@/components/common/NavigationBreadcrumb';
import ElegantQuickNavigation from '@/components/common/ElegantQuickNavigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import SubscriptionLimitsWarning, { SubscriptionLimitsDashboard } from '@/components/subscription/SubscriptionLimitsWarning';
import Link from 'next/link';
import { useAuthSync } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  useAuthSync();

  const isRecruiter = session?.user?.role === 'RECRUITER';

  // Vérifier l'abonnement avant d'afficher le dashboard
  const { data: subscriptionCheck, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['subscription-check'],
    queryFn: async () => {
      console.log('🔍 [DASHBOARD] Vérification de l\'abonnement...');
      const response = await apiClient.get('/subscriptions/can-access-dashboard');
      console.log('🔍 [DASHBOARD] Réponse abonnement:', response.data);
      return response.data;
    },
    enabled: !!session,
    retry: 1,
  });

  // Récupérer les analytics recruteur
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['recruiter-dashboard'],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/recruiter/dashboard');
      return response.data;
    },
    enabled: !!session && isRecruiter && subscriptionCheck?.canAccess,
  });

  // Rediriger vers la page d'abonnement si pas d'accès
  useEffect(() => {
    if (subscriptionCheck && !subscriptionCheck.canAccess) {
      console.log('❌ [DASHBOARD] Pas d\'abonnement actif, redirection vers /subscription');
      router.push('/subscription');
    }
  }, [subscriptionCheck, router]);

  if (subscriptionLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de l'abonnement...</p>
        </div>
      </div>
    );
  }

  if (!isRecruiter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès non autorisé</h1>
          <p className="text-gray-600 mb-4">Cette page est réservée aux recruteurs.</p>
          <button
            onClick={() => router.push('/feed')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retour au feed
          </button>
        </div>
      </div>
    );
  }

  // Si pas d'abonnement, ne rien afficher (redirection en cours)
  if (subscriptionCheck && !subscriptionCheck.canAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirection vers les abonnements...</p>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const myPlayers = dashboardData?.myPlayers || [];
  const recentActivity = dashboardData?.recentActivity || [];

  return (
    <ProtectedRoute requiredRole="RECRUITER" requiresVerification={true} redirectTo="/feed">
      <SubscriptionGuard>
        <div className="min-h-screen bg-neutral-100">
        <Header />
      
      {/* Navigation rapide élégante élégante */}
      <ElegantQuickNavigation currentPage="/dashboard" />

      <main className="container-custom py-6">
        <div className="max-w-7xl mx-auto">
          {/* Avertissement des limites d'abonnement */}
          <SubscriptionLimitsWarning />
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">📊 Tableau de bord recruteur</h1>
            <p className="text-neutral-600">
              Suivez vos statistiques et gérez vos joueurs
            </p>

            {/* Limites d'abonnement dans le dashboard */}
            <div className="mt-6">
              <SubscriptionLimitsDashboard />
            </div>
            
            {/* Actions rapides */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
              <Link href="/formations" className="btn btn-primary w-full sm:w-auto">
                🏀 Gérer formations
              </Link>
              <Link href="/players" className="btn btn-secondary w-full sm:w-auto">
                🔍 Rechercher joueurs
              </Link>
              <Link href="/my-players" className="btn btn-secondary w-full sm:w-auto">
                ⭐ Mes joueurs
              </Link>
            </div>
          </div>

          {/* Statistiques principales */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total offres */}
            <div className="card p-6 border-l-4 border-l-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-600 text-sm">Offres envoyées</p>
                  <p className="text-3xl font-bold mt-1">{stats.sentOffers || 0}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Offres acceptées */}
            <div className="card p-6 border-l-4 border-l-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-600 text-sm">Offres acceptées</p>
                  <p className="text-3xl font-bold mt-1 text-green-600">{stats.acceptedOffers || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* En attente */}
            <div className="card p-6 border-l-4 border-l-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-600 text-sm">En attente</p>
                  <p className="text-3xl font-bold mt-1 text-yellow-600">{stats.pendingOffers || 0}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Taux de conversion */}
            <div className="card p-6 border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-600 text-sm">Taux de conversion</p>
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
            {/* Mes joueurs */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">⭐ Mes joueurs ({myPlayers.length})</h2>
                <Link href="/my-players" className="text-purple-600 hover:underline text-sm font-semibold">
                  Voir tout →
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
                  <p>Aucun joueur pour le moment</p>
                  <Link href="/players" className="btn btn-secondary mt-4">
                    Rechercher des joueurs
                  </Link>
                </div>
              )}
            </div>

            {/* Activité récente */}
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-6">🔔 Activité récente</h2>

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
                          Offre envoyée à{' '}
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
                            {activity.status === 'ACCEPTED' && '✓ Acceptée'}
                            {activity.status === 'PENDING' && '⏳ En attente'}
                            {activity.status === 'REJECTED' && '✗ Refusée'}
                          </span>
                          <span className="text-xs text-neutral-500">
                            {new Date(activity.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  <p>Aucune activité récente</p>
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
