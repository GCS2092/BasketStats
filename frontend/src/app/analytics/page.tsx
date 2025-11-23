'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import { useAuthSync } from '@/hooks/useAuth';

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('week');
  useAuthSync();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  // Récupérer les analytics du profil
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['profile-analytics', session?.user?.id, period],
    queryFn: async () => {
      const response = await apiClient.get(`/analytics/profile/${session?.user?.id}?period=${period}`);
      return response.data;
    },
    enabled: !!session?.user?.id,
  });

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = analyticsData || {};
  const isRecruiter = session?.user?.role === 'RECRUITER';

  // Si recruteur, rediriger vers dashboard recruteur
  if (isRecruiter) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <Header />

      <main className="container-custom py-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="card p-6 mb-6 border-l-4 border-l-blue-500 bg-blue-50">
            <h1 className="text-3xl font-bold mb-2">📊 Mes statistiques</h1>
            <p className="text-neutral-700">
              Découvrez qui consulte votre profil et suivez votre visibilité
            </p>
          </div>

          {/* Filtres période */}
          <div className="card p-6 mb-6">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Période :</span>
              <button
                onClick={() => setPeriod('week')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  period === 'week'
                    ? 'bg-primary text-white'
                    : 'bg-neutral-200 hover:bg-neutral-300'
                }`}
              >
                7 derniers jours
              </button>
              <button
                onClick={() => setPeriod('month')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  period === 'month'
                    ? 'bg-primary text-white'
                    : 'bg-neutral-200 hover:bg-neutral-300'
                }`}
              >
                30 derniers jours
              </button>
              <button
                onClick={() => setPeriod('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  period === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-neutral-200 hover:bg-neutral-300'
                }`}
              >
                Tout
              </button>
            </div>
          </div>

          {/* Statistiques principales */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Total vues */}
            <div className="card p-6 border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-600 text-sm">Vues totales</p>
                  <p className="text-4xl font-bold mt-1 text-blue-600">{stats.totalViews || 0}</p>
                  <p className="text-sm text-neutral-500 mt-2">Nombre total de consultations de votre profil</p>
                </div>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Visiteurs uniques */}
            <div className="card p-6 border-l-4 border-l-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-600 text-sm">Visiteurs uniques</p>
                  <p className="text-4xl font-bold mt-1 text-green-600">{stats.uniqueViewers || 0}</p>
                  <p className="text-sm text-neutral-500 mt-2">Nombre de personnes différentes</p>
                </div>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Top visiteurs */}
          {stats.topViewers && stats.topViewers.length > 0 && (
            <div className="card p-6 mb-8">
              <h2 className="text-xl font-bold mb-6">👀 Qui consulte votre profil ?</h2>
              <div className="space-y-4">
                {stats.topViewers.map((viewer: any, index: number) => (
                  <div key={viewer.id || index} className="flex items-center gap-4 p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0">
                      {viewer.avatarUrl ? (
                        <img
                          src={viewer.avatarUrl}
                          alt=""
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-xl">
                          {viewer.role === 'RECRUITER' ? '🔍' : '🏀'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/players/${viewer.id}`}
                          className="font-semibold hover:text-primary truncate"
                        >
                          {viewer.fullName || 'Visiteur anonyme'}
                        </Link>
                        {viewer.role === 'RECRUITER' && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                            RECRUTEUR
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-600">
                        {viewer.viewCount} vue{viewer.viewCount > 1 ? 's' : ''}
                      </p>
                    </div>
                    {viewer.role === 'RECRUITER' && viewer.id && (
                      <Link
                        href={`/messages?userId=${viewer.id}`}
                        className="btn btn-sm bg-primary text-white"
                      >
                        💬 Contacter
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vues par jour */}
          {stats.viewsByDay && stats.viewsByDay.length > 0 && (
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-6">📈 Évolution des vues (7 derniers jours)</h2>
              <div className="space-y-2">
                {stats.viewsByDay.map((day: any) => {
                  const maxViews = Math.max(...stats.viewsByDay.map((d: any) => parseInt(d.views)));
                  const percentage = (parseInt(day.views) / maxViews) * 100;
                  
                  return (
                    <div key={day.date} className="flex items-center gap-4">
                      <div className="w-24 text-sm text-neutral-600">
                        {new Date(day.date).toLocaleDateString('fr-FR', { 
                          day: 'numeric', 
                          month: 'short' 
                        })}
                      </div>
                      <div className="flex-1 bg-neutral-200 rounded-full h-8 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-primary h-full flex items-center justify-end pr-3 transition-all duration-500"
                          style={{ width: `${Math.max(percentage, 10)}%` }}
                        >
                          <span className="text-white font-semibold text-sm">{day.views}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Message si pas de données */}
          {stats.totalViews === 0 && (
            <div className="card p-12 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-2">Aucune vue pour le moment</h3>
              <p className="text-neutral-600 mb-6">
                Améliorez votre profil pour attirer plus de visiteurs !
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/profile" className="btn btn-primary">
                  Compléter mon profil
                </Link>
                <Link href="/feed" className="btn btn-secondary">
                  Partager du contenu
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

