'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import Header from '@/components/layout/Header';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useAuthSync } from '@/hooks/useAuth';

export default function AdminStatsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  
  useAuthSync();

  // Vérifier si l'utilisateur est admin
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [session, status, router]);

  // Récupérer les statistiques utilisateurs
  const { data: userStats, isLoading: userStatsLoading } = useQuery({
    queryKey: ['admin-user-stats'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/stats/users');
      return response.data;
    },
    enabled: !!session && session.user?.role === 'ADMIN' && activeTab === 'users',
  });

  // Récupérer les statistiques posts
  const { data: postStats, isLoading: postStatsLoading } = useQuery({
    queryKey: ['admin-post-stats'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/stats/posts');
      return response.data;
    },
    enabled: !!session && session.user?.role === 'ADMIN' && activeTab === 'posts',
  });

  // Récupérer les statistiques d'activité
  const { data: activityStats, isLoading: activityStatsLoading } = useQuery({
    queryKey: ['admin-activity-stats'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/stats/activity?days=30');
      return response.data;
    },
    enabled: !!session && session.user?.role === 'ADMIN' && activeTab === 'activity',
  });

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'ADMIN') {
    return null;
  }

  const tabs = [
    { id: 'users', label: 'Utilisateurs', icon: '👥' },
    { id: 'posts', label: 'Posts', icon: '📝' },
    { id: 'activity', label: 'Activité', icon: '📊' },
  ];

  const isLoading = userStatsLoading || postStatsLoading || activityStatsLoading;

  return (
    <div className="min-h-screen bg-neutral-100">
      <Header />
      
      <div className="flex">
        <AdminSidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />

        <div className="flex-1 lg:ml-64">
          <div className="p-6">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-neutral-800 mb-2">
                    📊 Statistiques détaillées
                  </h1>
                  <p className="text-neutral-600">
                    Analyses approfondies de la plateforme
                  </p>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 bg-white rounded-lg shadow-sm border border-neutral-200"
                >
                  <span className="text-xl">☰</span>
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 mb-6">
              <div className="flex border-b border-neutral-200">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors
                      ${activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                      }
                    `}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contenu des onglets */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Statistiques utilisateurs */}
                {activeTab === 'users' && userStats && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white rounded-lg shadow-sm p-6 border border-neutral-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-neutral-600">Total utilisateurs</p>
                            <p className="text-2xl font-bold text-neutral-900">{userStats.totalUsers}</p>
                          </div>
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">👥</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg shadow-sm p-6 border border-neutral-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-neutral-600">Utilisateurs vérifiés</p>
                            <p className="text-2xl font-bold text-neutral-900">{userStats.verifiedUsers}</p>
                          </div>
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">✅</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className="text-sm text-green-600">
                            {userStats.verificationRate}% de vérification
                          </span>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg shadow-sm p-6 border border-neutral-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-neutral-600">Répartition par rôle</p>
                            <div className="mt-2 space-y-1">
                              {userStats.usersByRole?.map((role: any) => (
                                <div key={role.role} className="flex justify-between text-sm">
                                  <span className="text-neutral-600">
                                    {role.role === 'PLAYER' ? 'Joueurs' :
                                     role.role === 'RECRUITER' ? 'Recruteurs' :
                                     role.role === 'ADMIN' ? 'Admins' : role.role}
                                  </span>
                                  <span className="font-semibold text-neutral-900">
                                    {role._count.role}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Statistiques posts */}
                {activeTab === 'posts' && postStats && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white rounded-lg shadow-sm p-6 border border-neutral-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-neutral-600">Total posts</p>
                            <p className="text-2xl font-bold text-neutral-900">{postStats.totalPosts}</p>
                          </div>
                          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">📝</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg shadow-sm p-6 border border-neutral-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-neutral-600">Posts publiés</p>
                            <p className="text-2xl font-bold text-neutral-900">{postStats.publishedPosts}</p>
                          </div>
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">✅</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Top utilisateurs */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-neutral-200">
                      <h3 className="text-lg font-bold text-neutral-800 mb-4">Top utilisateurs (par nombre de posts)</h3>
                      <div className="space-y-3">
                        {postStats.topUsers?.map((user: any, index: number) => (
                          <div key={user.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-semibold">
                                  {user.fullName?.charAt(0) || 'U'}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-neutral-800">{user.fullName || 'Utilisateur'}</p>
                                <p className="text-sm text-neutral-500">#{index + 1}</p>
                              </div>
                            </div>
                            <span className="text-lg font-bold text-primary">
                              {user._count.posts} posts
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Statistiques d'activité */}
                {activeTab === 'activity' && activityStats && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-white rounded-lg shadow-sm p-6 border border-neutral-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-neutral-600">Nouveaux utilisateurs</p>
                            <p className="text-2xl font-bold text-neutral-900">{activityStats.newUsers}</p>
                          </div>
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">👥</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className="text-sm text-neutral-500">
                            {activityStats.period}
                          </span>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg shadow-sm p-6 border border-neutral-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-neutral-600">Nouveaux posts</p>
                            <p className="text-2xl font-bold text-neutral-900">{activityStats.newPosts}</p>
                          </div>
                          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">📝</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg shadow-sm p-6 border border-neutral-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-neutral-600">Nouveaux clubs</p>
                            <p className="text-2xl font-bold text-neutral-900">{activityStats.newClubs}</p>
                          </div>
                          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">🏢</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg shadow-sm p-6 border border-neutral-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-neutral-600">Nouveaux événements</p>
                            <p className="text-2xl font-bold text-neutral-900">{activityStats.newEvents}</p>
                          </div>
                          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">📅</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
