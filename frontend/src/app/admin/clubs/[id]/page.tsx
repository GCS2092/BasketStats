'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import Header from '@/components/layout/Header';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useAuthSync } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function AdminClubDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'stats' | 'members' | 'teams' | 'events' | 'contracts'>('info');

  useAuthSync();

  const clubId = params.id as string;

  // Récupérer les détails du club
  const { data: club, isLoading: clubLoading } = useQuery({
    queryKey: ['admin-club-detail', clubId],
    queryFn: async () => {
      const response = await apiClient.get(`/clubs/${clubId}`);
      return response.data;
    },
  });

  // Récupérer les membres
  const { data: members = [] } = useQuery({
    queryKey: ['club-members', clubId],
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/clubs/${clubId}/members`);
        return response.data;
      } catch (error) {
        return [];
      }
    },
  });

  // Récupérer les équipes
  const { data: teams = [] } = useQuery({
    queryKey: ['club-teams', clubId],
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/clubs/${clubId}/teams`);
        return response.data;
      } catch (error) {
        return [];
      }
    },
  });

  // Récupérer les événements
  const { data: events = [] } = useQuery({
    queryKey: ['club-events', clubId],
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/events?clubId=${clubId}`);
        return response.data;
      } catch (error) {
        return [];
      }
    },
  });

  // Récupérer les contrats
  const { data: contracts = [] } = useQuery({
    queryKey: ['club-contracts', clubId],
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/clubs/${clubId}/contracts`);
        return response.data;
      } catch (error) {
        return [];
      }
    },
  });

  // Mutations
  const approveClubMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(`/clubs/${clubId}/approve`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-club-detail', clubId] });
      alert('✅ Club approuvé avec succès !');
    },
  });

  const rejectClubMutation = useMutation({
    mutationFn: async (reason?: string) => {
      const response = await apiClient.post(`/clubs/${clubId}/reject`, { reason });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-club-detail', clubId] });
      alert('⚠️ Club rejeté.');
    },
  });

  const suspendClubMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(`/clubs/${clubId}/suspend`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-club-detail', clubId] });
      alert('🚫 Club suspendu.');
    },
  });

  const handleApprove = () => {
    if (confirm(`Êtes-vous sûr de vouloir approuver le club "${club?.name}" ?`)) {
      approveClubMutation.mutate();
    }
  };

  const handleReject = () => {
    const reason = prompt(`Raison du rejet pour "${club?.name}" (optionnel):`);
    if (reason !== null) {
      rejectClubMutation.mutate(reason);
    }
  };

  const handleSuspend = () => {
    if (confirm(`Êtes-vous sûr de vouloir suspendre le club "${club?.name}" ?`)) {
      suspendClubMutation.mutate();
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
      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      PRESIDENT: 'bg-purple-100 text-purple-800',
      DIRECTOR: 'bg-blue-100 text-blue-800',
      COACH: 'bg-green-100 text-green-800',
      ASSISTANT: 'bg-yellow-100 text-yellow-800',
      PLAYER: 'bg-gray-100 text-gray-800',
      STAFF: 'bg-orange-100 text-orange-800',
      SCOUT: 'bg-indigo-100 text-indigo-800',
    };
    
    const labels = {
      PRESIDENT: 'Président',
      DIRECTOR: 'Directeur',
      COACH: 'Coach',
      ASSISTANT: 'Assistant',
      PLAYER: 'Joueur',
      STAFF: 'Staff',
      SCOUT: 'Scout',
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${badges[role as keyof typeof badges]}`}>
        {labels[role as keyof typeof labels]}
      </span>
    );
  };

  if (clubLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <div className="text-center">
          <div className="text-6xl mb-4">🏢</div>
          <h1 className="text-2xl font-bold text-neutral-800 mb-2">Club non trouvé</h1>
          <button
            onClick={() => router.push('/admin/clubs')}
            className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-neutral-100">
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header />
        
        <main className="flex-1 p-4 sm:p-6">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                  <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-neutral-800 truncate">{club.name}</h1>
                  <div className="flex flex-wrap gap-2">
                    {getStatusBadge(club.status)}
                    {club.verified && (
                      <span className="inline-flex px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                        ✓ Vérifié
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs sm:text-sm lg:text-base text-neutral-600">
                  Examen détaillé du club pour validation
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => router.push('/admin/clubs')}
                  className="px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-lg bg-white shadow-sm border border-neutral-200 hover:bg-neutral-50"
                >
                  ← Retour
                </button>
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg bg-white shadow-sm border border-neutral-200"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Actions admin */}
          {club.status === 'PENDING' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-800 mb-1 text-sm sm:text-base">⏳ Club en attente de validation</h3>
                  <p className="text-xs sm:text-sm text-yellow-700">
                    Examinez les informations ci-dessous avant de prendre une décision.
                  </p>
                </div>
                <div className="flex gap-2 sm:gap-3 flex-shrink-0">
                  <button
                    onClick={handleApprove}
                    disabled={approveClubMutation.isPending}
                    className="flex-1 sm:flex-none bg-green-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
                  >
                    ✅ Approuver
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={rejectClubMutation.isPending}
                    className="flex-1 sm:flex-none bg-red-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
                  >
                    ❌ Rejeter
                  </button>
                </div>
              </div>
            </div>
          )}

          {club.status === 'APPROVED' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-green-800 mb-1">✅ Club approuvé</h3>
                  <p className="text-sm text-green-700">
                    Ce club est actif et visible publiquement.
                  </p>
                </div>
                <button
                  onClick={handleSuspend}
                  disabled={suspendClubMutation.isPending}
                  className="bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-yellow-700 transition-colors disabled:opacity-50"
                >
                  🚫 Suspendre
                </button>
              </div>
            </div>
          )}

          {/* Statistiques rapides */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 border border-neutral-200">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary">{members.length}</div>
                <div className="text-xs sm:text-sm text-neutral-600 mt-1">Membres</div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 border border-neutral-200">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600">{teams.length}</div>
                <div className="text-xs sm:text-sm text-neutral-600 mt-1">Équipes</div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 border border-neutral-200">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">{events.length}</div>
                <div className="text-xs sm:text-sm text-neutral-600 mt-1">Événements</div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 border border-neutral-200">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-green-600">
                  {contracts.length}
                </div>
                <div className="text-xs sm:text-sm text-neutral-600 mt-1">Contrats</div>
              </div>
            </div>
          </div>

          {/* Onglets */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 mb-4 sm:mb-6">
            <div className="border-b border-neutral-200">
              <nav className="flex overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`px-3 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeTab === 'info'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-neutral-600 hover:text-neutral-800'
                  }`}
                >
                  📋 <span className="hidden sm:inline">Informations</span><span className="sm:hidden">Info</span>
                </button>
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`px-3 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeTab === 'stats'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-neutral-600 hover:text-neutral-800'
                  }`}
                >
                  📊 <span className="hidden sm:inline">Statistiques</span><span className="sm:hidden">Stats</span>
                </button>
                <button
                  onClick={() => setActiveTab('members')}
                  className={`px-3 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeTab === 'members'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-neutral-600 hover:text-neutral-800'
                  }`}
                >
                  👥 <span className="hidden sm:inline">Membres</span> ({members.length})
                </button>
                <button
                  onClick={() => setActiveTab('teams')}
                  className={`px-3 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeTab === 'teams'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-neutral-600 hover:text-neutral-800'
                  }`}
                >
                  🏀 <span className="hidden sm:inline">Équipes</span> ({teams.length})
                </button>
                <button
                  onClick={() => setActiveTab('events')}
                  className={`px-3 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeTab === 'events'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-neutral-600 hover:text-neutral-800'
                  }`}
                >
                  📅 <span className="hidden sm:inline">Événements</span> ({events.length})
                </button>
                <button
                  onClick={() => setActiveTab('contracts')}
                  className={`px-3 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeTab === 'contracts'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-neutral-600 hover:text-neutral-800'
                  }`}
                >
                  📄 <span className="hidden sm:inline">Contrats</span> ({contracts.length})
                </button>
              </nav>
            </div>

            <div className="p-3 sm:p-6">
              {/* ONGLET INFORMATIONS */}
              {activeTab === 'info' && (
                <div className="space-y-4 sm:space-y-6">
                  {/* Informations de base */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-neutral-800 mb-3 sm:mb-4 border-b border-neutral-200 pb-2">
                      📋 Informations de base
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-neutral-600">Nom complet</p>
                          <p className="text-sm sm:text-base text-neutral-900 font-medium break-words">{club.name}</p>
                        </div>
                        {club.shortName && (
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-neutral-600">Nom abrégé</p>
                            <p className="text-sm sm:text-base text-neutral-900">{club.shortName}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-neutral-600">Localisation</p>
                          <p className="text-sm sm:text-base text-neutral-900">{club.city}, {club.country}</p>
                        </div>
                        {club.founded && (
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-neutral-600">Année de fondation</p>
                            <p className="text-sm sm:text-base text-neutral-900">{club.founded}</p>
                          </div>
                        )}
                      </div>
                      <div className="space-y-3">
                        {club.league && (
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-neutral-600">Ligue</p>
                            <p className="text-sm sm:text-base text-neutral-900">{club.league}</p>
                          </div>
                        )}
                        {club.division && (
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-neutral-600">Division</p>
                            <p className="text-sm sm:text-base text-neutral-900">{club.division}</p>
                          </div>
                        )}
                        {club.arena && (
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-neutral-600">Stade/Salle</p>
                            <p className="text-sm sm:text-base text-neutral-900 break-words">{club.arena}</p>
                            {club.arenaCapacity && (
                              <p className="text-xs sm:text-sm text-neutral-600">Capacité: {club.arenaCapacity.toLocaleString()} places</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {club.description && (
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-neutral-800 mb-3 sm:mb-4 border-b border-neutral-200 pb-2">
                        📝 Description
                      </h3>
                      <p className="text-sm sm:text-base text-neutral-700 leading-relaxed break-words">{club.description}</p>
                    </div>
                  )}

                  {/* Contact */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-neutral-800 mb-3 sm:mb-4 border-b border-neutral-200 pb-2">
                      📞 Informations de contact
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {club.email && (
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-neutral-600">Email</p>
                          <a href={`mailto:${club.email}`} className="text-sm sm:text-base text-primary hover:underline break-all">{club.email}</a>
                        </div>
                      )}
                      {club.phone && (
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-neutral-600">Téléphone</p>
                          <a href={`tel:${club.phone}`} className="text-sm sm:text-base text-primary hover:underline">{club.phone}</a>
                        </div>
                      )}
                      {club.website && (
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-neutral-600">Site web</p>
                          <a href={club.website} target="_blank" rel="noopener noreferrer" className="text-sm sm:text-base text-primary hover:underline break-all">
                            {club.website}
                          </a>
                        </div>
                      )}
                      {club.responsibleUser && (
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-neutral-600">Responsable</p>
                          <p className="text-sm sm:text-base text-neutral-900 break-words">{club.responsibleUser.fullName || 'Non renseigné'}</p>
                          <p className="text-xs sm:text-sm text-neutral-600 break-all">{club.responsibleUser.email}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Informations officielles */}
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-4 border-b border-neutral-200 pb-2">
                      📜 Informations officielles
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {club.licenseNumber && (
                        <div>
                          <p className="text-sm font-medium text-neutral-600">Numéro de licence</p>
                          <p className="text-neutral-900 font-mono">{club.licenseNumber}</p>
                        </div>
                      )}
                      {club.federationId && (
                        <div>
                          <p className="text-sm font-medium text-neutral-600">ID Fédération</p>
                          <p className="text-neutral-900 font-mono">{club.federationId}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-neutral-600">Date de soumission</p>
                        <p className="text-neutral-900">
                          {club.submittedAt ? new Date(club.submittedAt).toLocaleString('fr-FR') : 'Non renseigné'}
                        </p>
                      </div>
                      {club.reviewedAt && (
                        <div>
                          <p className="text-sm font-medium text-neutral-600">Date de validation</p>
                          <p className="text-neutral-900">
                            {new Date(club.reviewedAt).toLocaleString('fr-FR')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Couleurs du club */}
                  {club.colors && club.colors.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-800 mb-4 border-b border-neutral-200 pb-2">
                        🎨 Couleurs du club
                      </h3>
                      <div className="flex gap-3">
                        {club.colors.map((color: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <div
                              className="w-12 h-12 rounded-lg border-2 border-neutral-300"
                              style={{ backgroundColor: color }}
                            ></div>
                            <span className="text-sm font-mono text-neutral-600">{color}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ONGLET STATISTIQUES */}
              {activeTab === 'stats' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-neutral-800 mb-4">📊 Statistiques du club</h3>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Membres */}
                    <div className="bg-neutral-50 rounded-lg p-6 border border-neutral-200">
                      <div className="text-center mb-4">
                        <div className="text-4xl font-bold text-primary">{members.length}</div>
                        <div className="text-sm text-neutral-600 mt-1">Membres total</div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-600">Présidents</span>
                          <span className="font-semibold">{members.filter((m: any) => m.role === 'PRESIDENT').length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-600">Directeurs</span>
                          <span className="font-semibold">{members.filter((m: any) => m.role === 'DIRECTOR').length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-600">Coachs</span>
                          <span className="font-semibold">{members.filter((m: any) => m.role === 'COACH').length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-600">Joueurs</span>
                          <span className="font-semibold">{members.filter((m: any) => m.role === 'PLAYER').length}</span>
                        </div>
                      </div>
                    </div>

                    {/* Équipes */}
                    <div className="bg-neutral-50 rounded-lg p-6 border border-neutral-200">
                      <div className="text-center mb-4">
                        <div className="text-4xl font-bold text-purple-600">{teams.length}</div>
                        <div className="text-sm text-neutral-600 mt-1">Équipes</div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-600">Équipe Pro</span>
                          <span className="font-semibold">{teams.filter((t: any) => t.category === 'PROFESSIONAL').length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-600">Espoirs</span>
                          <span className="font-semibold">
                            {teams.filter((t: any) => t.category === 'ESPOIRS_U21' || t.category === 'ESPOIRS_U19').length}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-600">Jeunes</span>
                          <span className="font-semibold">
                            {teams.filter((t: any) => ['JUNIOR_U17', 'JUNIOR_U15', 'MINIME_U13'].includes(t.category)).length}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-600">Féminines</span>
                          <span className="font-semibold">{teams.filter((t: any) => t.category === 'FEMININE').length}</span>
                        </div>
                      </div>
                    </div>

                    {/* Événements */}
                    <div className="bg-neutral-50 rounded-lg p-6 border border-neutral-200">
                      <div className="text-center mb-4">
                        <div className="text-4xl font-bold text-blue-600">{events.length}</div>
                        <div className="text-sm text-neutral-600 mt-1">Événements</div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-600">Matchs</span>
                          <span className="font-semibold">{events.filter((e: any) => e.type === 'MATCH').length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-600">Tryouts</span>
                          <span className="font-semibold">{events.filter((e: any) => e.type === 'TRYOUT').length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-600">Camps</span>
                          <span className="font-semibold">{events.filter((e: any) => e.type === 'TRAINING_CAMP').length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-600">Tournois</span>
                          <span className="font-semibold">{events.filter((e: any) => e.type === 'TOURNAMENT').length}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Informations financières */}
                  {club.budget && (
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-800 mb-4">💰 Informations financières</h3>
                      <div className="bg-neutral-50 rounded-lg p-6 border border-neutral-200">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-600">
                            {club.budget.toLocaleString('fr-FR')} €
                          </div>
                          <div className="text-sm text-neutral-600 mt-1">Budget annuel déclaré</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Activité récente */}
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-4">📈 Activité</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                        <span className="text-sm text-neutral-600">Créé le</span>
                        <span className="text-sm font-semibold text-neutral-900">
                          {new Date(club.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                        <span className="text-sm text-neutral-600">Dernière mise à jour</span>
                        <span className="text-sm font-semibold text-neutral-900">
                          {new Date(club.updatedAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                        <span className="text-sm text-neutral-600">Statut actuel</span>
                        <span>{getStatusBadge(club.status)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ONGLET STATISTIQUES */}
              {activeTab === 'stats' && (
                <div className="space-y-6">
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📊</div>
                    <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                      Statistiques détaillées
                    </h3>
                    <p className="text-neutral-600">
                      Les statistiques de matchs et performances seront affichées ici une fois que le club sera actif.
                    </p>
                  </div>
                </div>
              )}

              {/* ONGLET MEMBRES */}
              {activeTab === 'members' && (
                <div className="space-y-4">
                  {members.length > 0 ? (
                    members.map((member: any) => (
                      <div key={member.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                            {member.user.avatarUrl ? (
                              <img src={member.user.avatarUrl} alt={member.user.fullName} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              member.user.fullName?.charAt(0).toUpperCase() || 'U'
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-neutral-800">{member.user.fullName || 'Non renseigné'}</h4>
                            <p className="text-sm text-neutral-600">{member.user.email}</p>
                            <p className="text-xs text-neutral-500">
                              Membre depuis le {new Date(member.joinedAt).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        {getRoleBadge(member.role)}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">👥</div>
                      <p className="text-neutral-600">Aucun membre pour le moment</p>
                      <p className="text-sm text-neutral-500 mt-2">
                        Les membres seront ajoutés une fois le club approuvé
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ONGLET ÉQUIPES */}
              {activeTab === 'teams' && (
                <div className="space-y-4">
                  {teams.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {teams.map((team: any) => (
                        <div key={team.id} className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                          <h4 className="font-semibold text-neutral-800 mb-2">{team.name}</h4>
                          <p className="text-sm text-neutral-600 mb-3">{team.category}</p>
                          <div className="space-y-1 text-sm">
                            <p className="text-neutral-600">Saison: {team.season}</p>
                            {team.headCoach && (
                              <p className="text-neutral-600">Coach: {team.headCoach.fullName}</p>
                            )}
                            <p className="text-neutral-600">Joueurs: {team._count?.players || 0}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">🏀</div>
                      <p className="text-neutral-600">Aucune équipe créée</p>
                      <p className="text-sm text-neutral-500 mt-2">
                        Les équipes seront créées par le président une fois le club approuvé
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ONGLET ÉVÉNEMENTS */}
              {activeTab === 'events' && (
                <div className="space-y-4">
                  {events.length > 0 ? (
                    events.map((event: any) => (
                      <div key={event.id} className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-neutral-800 mb-1">{event.title}</h4>
                            <p className="text-sm text-neutral-600 mb-2">{event.type}</p>
                            <p className="text-sm text-neutral-600">
                              📅 {new Date(event.startDate).toLocaleDateString('fr-FR')}
                            </p>
                            <p className="text-sm text-neutral-600">
                              📍 {event.location}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            event.visibility === 'PUBLIC' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {event.visibility}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">📅</div>
                      <p className="text-neutral-600">Aucun événement organisé</p>
                      <p className="text-sm text-neutral-500 mt-2">
                        Les événements seront créés une fois le club actif
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ONGLET CONTRATS */}
              {activeTab === 'contracts' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-neutral-800">📄 Contrats du club</h3>
                    <div className="text-sm text-neutral-600">
                      {contracts.length} contrat{contracts.length > 1 ? 's' : ''}
                    </div>
                  </div>

                  {contracts.length > 0 ? (
                    <div className="space-y-3">
                      {contracts.map((contract: any) => (
                        <div key={contract.id} className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-neutral-800 text-sm sm:text-base">
                                  {contract.player?.fullName || 'Joueur inconnu'}
                                </h4>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  contract.status === 'SIGNED' ? 'bg-green-100 text-green-800' :
                                  contract.status === 'PENDING_PLAYER' ? 'bg-yellow-100 text-yellow-800' :
                                  contract.status === 'PENDING_CLUB' ? 'bg-blue-100 text-blue-800' :
                                  contract.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {contract.status === 'SIGNED' ? 'Signé' :
                                   contract.status === 'PENDING_PLAYER' ? 'En attente joueur' :
                                   contract.status === 'PENDING_CLUB' ? 'En attente club' :
                                   contract.status === 'DRAFT' ? 'Brouillon' :
                                   contract.status}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-neutral-600">
                                <div>
                                  <span className="font-medium">Type:</span> {contract.contractType}
                                </div>
                                <div>
                                  <span className="font-medium">Début:</span> {new Date(contract.startDate).toLocaleDateString('fr-FR')}
                                </div>
                                {contract.endDate && (
                                  <div>
                                    <span className="font-medium">Fin:</span> {new Date(contract.endDate).toLocaleDateString('fr-FR')}
                                  </div>
                                )}
                                {contract.salary && (
                                  <div>
                                    <span className="font-medium">Salaire:</span> {contract.salary.toLocaleString('fr-FR')} €
                                  </div>
                                )}
                              </div>

                              {contract.terms && (
                                <div className="mt-2">
                                  <p className="text-xs sm:text-sm text-neutral-600 line-clamp-2">
                                    {contract.terms}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2">
                              <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                                👁️ Voir
                              </button>
                              {contract.status === 'DRAFT' && (
                                <button className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                                  ✏️ Modifier
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">📄</div>
                      <p className="text-neutral-600">Aucun contrat créé</p>
                      <p className="text-sm text-neutral-500 mt-2">
                        Les contrats seront créés par le président une fois le club approuvé
                      </p>
                    </div>
                  )}

                  {/* Informations sur le système de contrats */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2 text-sm sm:text-base">ℹ️ Système de contrats</h4>
                    <div className="text-xs sm:text-sm text-blue-700 space-y-1">
                      <p>• <strong>Contrats professionnels:</strong> Salaires, bonus, durée définie</p>
                      <p>• <strong>Contrats amateurs:</strong> Pas de salaire, participation aux frais</p>
                      <p>• <strong>Contrats de formation:</strong> Formation + petite rémunération</p>
                      <p>• <strong>Prêts:</strong> Joueur prêté à un autre club</p>
                      <p>• <strong>Essais:</strong> Période d&apos;essai avant signature</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminClubDetailPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN" redirectTo="/">
      <AdminClubDetailContent />
    </ProtectedRoute>
  );
}
