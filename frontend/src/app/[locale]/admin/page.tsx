'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import Header from '@/components/layout/Header';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useAuthSync } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function AdminDashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  useAuthSync();

  // Récupérer les statistiques du dashboard
  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/dashboard');
      return response.data;
    },
    enabled: !!session && session.user?.role === 'ADMIN',
  });

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'ADMIN') {
    router.push('/feed');
    return null;
  }

  const stats = dashboardStats?.overview || {};

  return (
    <div className="min-h-screen bg-neutral-100">
      <Header />
      
      <div className="flex">
        {/* Sidebar Admin */}
        <AdminSidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />

        {/* Contenu principal */}
        <div className="flex-1 lg:ml-64">
          <div className="p-4 sm:p-6">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800 mb-2">
                🛡️ Tableau de bord Admin
              </h1>
              <p className="text-sm sm:text-base text-neutral-600">
                Gestion et supervision de la plateforme BasketStats
              </p>
            </div>

            {/* Statistiques générales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-neutral-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-neutral-600">Utilisateurs total</p>
                    <p className="text-xl sm:text-2xl font-bold text-neutral-900">{stats.totalUsers || 0}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg sm:text-2xl">👥</span>
                  </div>
                </div>
                <div className="mt-3 sm:mt-4">
                  <span className="text-xs sm:text-sm text-green-600">
                    {stats.verifiedUsers || 0} vérifiés ({stats.verificationRate || 0}%)
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-neutral-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Joueurs</p>
                    <p className="text-2xl font-bold text-neutral-900">{stats.totalPlayers || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🏀</span>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-neutral-600">
                    Joueurs actifs
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-neutral-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Recruteurs</p>
                    <p className="text-2xl font-bold text-neutral-900">{stats.totalRecruiters || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🔍</span>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-neutral-600">
                    Recruteurs actifs
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-neutral-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Posts</p>
                    <p className="text-2xl font-bold text-neutral-900">{stats.totalPosts || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📝</span>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-neutral-600">
                    Contenus publiés
                  </span>
                </div>
              </div>
            </div>

            {/* Statistiques secondaires */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-neutral-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Clubs</p>
                    <p className="text-2xl font-bold text-neutral-900">{stats.totalClubs || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🏢</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-neutral-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Événements</p>
                    <p className="text-2xl font-bold text-neutral-900">{stats.totalEvents || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📅</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-neutral-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Nouveaux (7j)</p>
                    <p className="text-2xl font-bold text-neutral-900">{stats.recentUsers || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🆕</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-neutral-200">
              <h2 className="text-xl font-bold text-neutral-800 mb-4">Actions rapides</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => router.push('/admin/users')}
                  className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <span className="text-2xl">👥</span>
                  <div className="text-left">
                    <p className="font-semibold text-blue-900">Gérer les utilisateurs</p>
                    <p className="text-sm text-blue-700">Vérifier, modifier, supprimer</p>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/admin/posts')}
                  className="flex items-center gap-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                >
                  <span className="text-2xl">📝</span>
                  <div className="text-left">
                    <p className="font-semibold text-orange-900">Modérer les posts</p>
                    <p className="text-sm text-orange-700">Approuver, rejeter</p>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/admin/reports')}
                  className="flex items-center gap-3 p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <span className="text-2xl">🚨</span>
                  <div className="text-left">
                    <p className="font-semibold text-red-900">Signalements</p>
                    <p className="text-sm text-red-700">Traiter les rapports</p>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/admin/stats')}
                  className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <span className="text-2xl">📊</span>
                  <div className="text-left">
                    <p className="font-semibold text-green-900">Statistiques</p>
                    <p className="text-sm text-green-700">Analyses détaillées</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute requiredRole="ADMIN" redirectTo="/">
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
