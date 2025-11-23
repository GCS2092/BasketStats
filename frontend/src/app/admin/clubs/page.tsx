'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import Header from '@/components/layout/Header';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useAuthSync } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function AdminClubsContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'ALL'>('ALL');

  useAuthSync();

  // Récupérer les clubs selon le filtre
  const { data: clubs, isLoading, error } = useQuery({
    queryKey: ['admin-clubs', statusFilter],
    queryFn: async () => {
      try {
        if (statusFilter === 'ALL') {
          // Essayer d'abord les endpoints admin
          try {
            const [pending, approved, rejected, suspended] = await Promise.all([
              apiClient.get('/clubs/admin/status/PENDING').then(r => r.data).catch(() => []),
              apiClient.get('/clubs/admin/status/APPROVED').then(r => r.data).catch(() => []),
              apiClient.get('/clubs/admin/status/REJECTED').then(r => r.data).catch(() => []),
              apiClient.get('/clubs/admin/status/SUSPENDED').then(r => r.data).catch(() => []),
            ]);
            return [...pending, ...approved, ...rejected, ...suspended];
          } catch (e) {
            // Fallback : récupérer tous les clubs
            console.warn('Endpoints admin non disponibles, utilisation du fallback');
            const response = await apiClient.get('/clubs');
            return response.data;
          }
        } else {
          try {
            const response = await apiClient.get(`/clubs/admin/status/${statusFilter}`);
            return response.data;
          } catch (e) {
            // Fallback : filtrer côté client
            const response = await apiClient.get('/clubs');
            return response.data.filter((c: any) => c.status === statusFilter);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des clubs:', error);
        return [];
      }
    },
    enabled: !!session && session.user?.role === 'ADMIN',
  });

  // Mutation pour approuver un club
  const approveClubMutation = useMutation({
    mutationFn: async (clubId: string) => {
      const response = await apiClient.post(`/clubs/${clubId}/approve`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-clubs'] });
      alert('✅ Club approuvé avec succès !');
    },
    onError: (error: any) => {
      console.error('Erreur lors de l\'approbation:', error);
      alert(`❌ Erreur: ${error.response?.data?.message || error.message}`);
    },
  });

  // Mutation pour rejeter un club
  const rejectClubMutation = useMutation({
    mutationFn: async ({ clubId, reason }: { clubId: string; reason?: string }) => {
      const response = await apiClient.post(`/clubs/${clubId}/reject`, { reason });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-clubs'] });
      alert('⚠️ Club rejeté.');
    },
    onError: (error: any) => {
      console.error('Erreur lors du rejet:', error);
      alert(`❌ Erreur: ${error.response?.data?.message || error.message}`);
    },
  });

  // Mutation pour suspendre un club
  const suspendClubMutation = useMutation({
    mutationFn: async (clubId: string) => {
      const response = await apiClient.post(`/clubs/${clubId}/suspend`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-clubs'] });
      alert('🚫 Club suspendu.');
    },
    onError: (error: any) => {
      console.error('Erreur lors de la suspension:', error);
      alert(`❌ Erreur: ${error.response?.data?.message || error.message}`);
    },
  });

  const handleApprove = (clubId: string, clubName: string) => {
    if (confirm(`Êtes-vous sûr de vouloir approuver le club "${clubName}" ?`)) {
      approveClubMutation.mutate(clubId);
    }
  };

  const handleReject = (clubId: string, clubName: string) => {
    const reason = prompt(`Raison du rejet pour "${clubName}" (optionnel):`);
    if (reason !== null) {
      rejectClubMutation.mutate({ clubId, reason });
    }
  };

  const handleSuspend = (clubId: string, clubName: string) => {
    if (confirm(`Êtes-vous sûr de vouloir suspendre le club "${clubName}" ?`)) {
      suspendClubMutation.mutate(clubId);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      SUSPENDED: 'bg-gray-100 text-gray-800',
    };
    
    const labels = {
      PENDING: 'En attente',
      APPROVED: 'Approuvé',
      REJECTED: 'Rejeté',
      SUSPENDED: 'Suspendu',
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Debug : afficher les clubs dans la console
  console.log('Clubs chargés:', clubs);
  console.log('Nombre de clubs:', clubs?.length);
  console.log('Erreur:', error);

  return (
    <div className="flex min-h-screen bg-neutral-100">
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header />
        
        <main className="flex-1 p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800">🏢 Gestion des Clubs</h1>
              <p className="text-sm sm:text-base text-neutral-600 mt-1">
                Approuver, rejeter et gérer les demandes de clubs
              </p>
            </div>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-white shadow-sm border border-neutral-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4 border border-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Total clubs</p>
                  <p className="text-2xl font-bold text-neutral-900">{clubs?.length || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🏢</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border border-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">En attente</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {clubs?.filter((c: any) => c.status === 'PENDING').length || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">⏳</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border border-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Approuvés</p>
                  <p className="text-2xl font-bold text-green-600">
                    {clubs?.filter((c: any) => c.status === 'APPROVED').length || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border border-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Suspendus</p>
                  <p className="text-2xl font-bold text-red-600">
                    {clubs?.filter((c: any) => c.status === 'SUSPENDED').length || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🚫</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filtres */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-neutral-200 mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'ALL' 
                    ? 'bg-primary text-white' 
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                Tous ({clubs?.length || 0})
              </button>
              <button
                onClick={() => setStatusFilter('PENDING')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'PENDING' 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                En attente ({clubs?.filter((c: any) => c.status === 'PENDING').length || 0})
              </button>
              <button
                onClick={() => setStatusFilter('APPROVED')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'APPROVED' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                Approuvés ({clubs?.filter((c: any) => c.status === 'APPROVED').length || 0})
              </button>
              <button
                onClick={() => setStatusFilter('REJECTED')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'REJECTED' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                Rejetés ({clubs?.filter((c: any) => c.status === 'REJECTED').length || 0})
              </button>
              <button
                onClick={() => setStatusFilter('SUSPENDED')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'SUSPENDED' 
                    ? 'bg-gray-500 text-white' 
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                Suspendus ({clubs?.filter((c: any) => c.status === 'SUSPENDED').length || 0})
              </button>
            </div>
          </div>

          {/* Message d'erreur si problème API */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="text-red-600 text-xl">⚠️</div>
                <div>
                  <h3 className="font-semibold text-red-800 mb-2">Erreur de chargement</h3>
                  <p className="text-sm text-red-700 mb-2">
                    Impossible de charger les clubs depuis l&apos;API admin.
                  </p>
                  <p className="text-sm text-red-700">
                    Le backend doit être redémarré pour que les nouvelles routes soient disponibles.
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                  >
                    🔄 Recharger la page
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Liste des clubs */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Club
                    </th>
                    <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Localisation
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Responsable
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {clubs?.filter((club: any) => statusFilter === 'ALL' || club.status === statusFilter).map((club: any) => (
                    <tr key={club.id} className="hover:bg-neutral-50">
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-xs sm:text-sm">
                              {club.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-2 sm:ml-4">
                            <div className="text-sm font-medium text-neutral-900">
                              {club.name}
                            </div>
                            <div className="text-xs sm:text-sm text-neutral-500">
                              {club.shortName || club.league || 'Non spécifié'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900">{club.city}</div>
                        <div className="text-xs text-neutral-500">{club.country}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(club.status)}
                      </td>
                      <td className="hidden md:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900">
                          {club.responsibleUser?.fullName || 'Non spécifié'}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {club.responsibleUser?.email || ''}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex flex-wrap gap-2 justify-end">
                          <button
                            onClick={() => router.push(`/admin/clubs/${club.id}`)}
                            className="text-blue-600 hover:text-blue-900 text-xs px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 transition-colors"
                          >
                            👁️ Détails
                          </button>
                          {club.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApprove(club.id, club.name)}
                                disabled={approveClubMutation.isPending}
                                className="text-green-600 hover:text-green-900 text-xs px-2 py-1 rounded bg-green-50 hover:bg-green-100 transition-colors"
                              >
                                ✅ Approuver
                              </button>
                              <button
                                onClick={() => handleReject(club.id, club.name)}
                                disabled={rejectClubMutation.isPending}
                                className="text-red-600 hover:text-red-900 text-xs px-2 py-1 rounded bg-red-50 hover:bg-red-100 transition-colors"
                              >
                                ❌ Rejeter
                              </button>
                            </>
                          )}
                          {club.status === 'APPROVED' && (
                            <button
                              onClick={() => handleSuspend(club.id, club.name)}
                              disabled={suspendClubMutation.isPending}
                              className="text-yellow-600 hover:text-yellow-900 text-xs px-2 py-1 rounded bg-yellow-50 hover:bg-yellow-100 transition-colors"
                            >
                              🚫 Suspendre
                            </button>
                          )}
                          {club.status === 'SUSPENDED' && (
                            <button
                              onClick={() => handleApprove(club.id, club.name)}
                              disabled={approveClubMutation.isPending}
                              className="text-green-600 hover:text-green-900 text-xs px-2 py-1 rounded bg-green-50 hover:bg-green-100 transition-colors"
                            >
                              ✅ Réactiver
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {(!clubs || clubs.length === 0) && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏢</div>
                <p className="text-neutral-500 text-lg mb-2">Aucun club trouvé</p>
                <p className="text-neutral-400 text-sm">
                  {statusFilter === 'ALL' 
                    ? 'Aucun club n\'a été créé pour le moment'
                    : `Aucun club avec le statut "${statusFilter}"`
                  }
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminClubsPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN" redirectTo="/">
      <AdminClubsContent />
    </ProtectedRoute>
  );
}
