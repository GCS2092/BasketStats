'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import Header from '@/components/layout/Header';
import NavigationBreadcrumb from '@/components/common/NavigationBreadcrumb';
import { useAuthSync } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

interface Club {
  id: string;
  name: string;
  shortName?: string;
  logo?: string;
  country: string;
  city: string;
  league?: string;
  division?: string;
  website?: string;
  email?: string;
  phone?: string;
  arena?: string;
  arenaCapacity?: number;
  founded?: number;
  colors: string[];
  description?: string;
  budget?: number;
  status: string;
  verified: boolean;
  responsibleUser?: {
    id: string;
    fullName: string;
    email: string;
  };
  _count?: {
    events: number;
    members: number;
  };
}

interface ClubMember {
  id: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
    role: string;
  };
}

interface ClubStats {
  totalMembers: number;
  membersByRole: Array<{
    role: string;
    _count: { role: number };
  }>;
  recentMembers: Array<{
    id: string;
    role: string;
    joinedAt: string;
    user: {
      id: string;
      fullName: string;
      avatarUrl?: string;
    };
  }>;
}

function ClubDetailPageContent() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'info' | 'members' | 'events'>('info');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinRole, setJoinRole] = useState('PLAYER');

  useAuthSync();

  const clubId = params.id as string;

  // Récupérer les détails du club
  const { data: club, isLoading: clubLoading } = useQuery({
    queryKey: ['club', clubId],
    queryFn: async () => {
      const response = await apiClient.get(`/clubs/${clubId}`);
      return response.data as Club;
    },
  });

  // Récupérer les membres du club
  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['club-members', clubId],
    queryFn: async () => {
      const response = await apiClient.get(`/clubs/${clubId}/members`);
      return response.data as ClubMember[];
    },
    enabled: !!clubId && activeTab === 'members',
  });

  // Récupérer les statistiques du club
  const { data: stats } = useQuery({
    queryKey: ['club-stats', clubId],
    queryFn: async () => {
      const response = await apiClient.get(`/clubs/${clubId}/stats`);
      return response.data as ClubStats;
    },
    enabled: !!clubId,
  });

  // Vérifier si l'utilisateur est membre du club
  const isMember = members.some(member => member.user.id === session?.user?.id);
  const userMembership = members.find(member => member.user.id === session?.user?.id);
  const isAdmin = userMembership?.role === 'PRESIDENT' || userMembership?.role === 'DIRECTOR';

  // Mutation pour rejoindre le club
  const joinClubMutation = useMutation({
    mutationFn: async (role: string) => {
      const response = await apiClient.post(`/clubs/${clubId}/join`, { role });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['club-members', clubId] });
      queryClient.invalidateQueries({ queryKey: ['club-stats', clubId] });
      setShowJoinModal(false);
      alert('✅ Vous avez rejoint le club avec succès !');
    },
    onError: (error: any) => {
      console.error('Erreur lors de la demande:', error);
      alert(`❌ Erreur: ${error.response?.data?.message || error.message}`);
    },
  });

  const handleJoinClub = () => {
    joinClubMutation.mutate(joinRole);
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
          <p className="text-neutral-600 mb-4">Ce club n'existe pas ou a été supprimé.</p>
          <button
            onClick={() => router.push('/clubs')}
            className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
          >
            Retour aux clubs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <Header />
      
      <NavigationBreadcrumb 
        items={[
          { label: 'Accueil', href: '/' },
          { label: 'Clubs', href: '/clubs' },
          { label: club.name, href: `/clubs/${club.id}` },
        ]}
      />

      <main className="container-custom py-6">
        {/* Header du club */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden mb-6">
          {/* Bannière avec couleurs du club */}
          <div
            className="h-32 relative"
            style={{
              background: club.colors.length > 0
                ? `linear-gradient(135deg, ${club.colors[0]}, ${club.colors[1] || club.colors[0]})`
                : 'linear-gradient(135deg, #3B82F6, #1E40AF)',
            }}
          >
            <div className="absolute top-4 right-4 flex gap-2">
              {club.verified && (
                <span className="bg-white/90 rounded-full px-3 py-1 text-xs font-bold text-green-600">
                  ✓ Vérifié
                </span>
              )}
              <span className={`bg-white/90 rounded-full px-3 py-1 text-xs font-bold ${
                club.status === 'APPROVED' ? 'text-green-600' :
                club.status === 'PENDING' ? 'text-yellow-600' :
                club.status === 'REJECTED' ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {club.status === 'APPROVED' ? 'Approuvé' :
                 club.status === 'PENDING' ? 'En attente' :
                 club.status === 'REJECTED' ? 'Rejeté' :
                 'Suspendu'}
              </span>
            </div>
          </div>

          <div className="p-6 -mt-16 relative">
            {/* Logo/Avatar */}
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {club.logo ? (
                <img src={club.logo} alt={club.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                club.name.charAt(0).toUpperCase()
              )}
            </div>

            {/* Informations principales */}
            <div className="mt-6">
              <h1 className="text-3xl font-bold text-neutral-800 mb-2">{club.name}</h1>
              {club.shortName && (
                <p className="text-lg text-neutral-600 mb-4">({club.shortName})</p>
              )}
              
              <div className="flex flex-wrap gap-4 text-sm text-neutral-600 mb-4">
                <span>📍 {club.city}, {club.country}</span>
                {club.league && <span>🏆 {club.league}</span>}
                {club.founded && <span>📅 Fondé en {club.founded}</span>}
                {club.arena && <span>🏟️ {club.arena}</span>}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                {/* Bouton Gérer - Seulement pour président et directeur */}
                {isAdmin && (
                  <button
                    onClick={() => router.push(`/clubs/${clubId}/manage`)}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                  >
                    ⚙️ Gérer le club
                  </button>
                )}

                {!isMember && club.status === 'APPROVED' && session?.user && (
                  <button
                    onClick={() => setShowJoinModal(true)}
                    className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
                  >
                    🏀 Rejoindre le club
                  </button>
                )}
                
                {isMember && (
                  <span className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium">
                    ✓ Membre du club
                  </span>
                )}

                {club.website && (
                  <a
                    href={club.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-neutral-200 text-neutral-800 px-6 py-3 rounded-lg font-medium hover:bg-neutral-300 transition-colors"
                  >
                    🌐 Site web
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 mb-6">
          <div className="border-b border-neutral-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'info'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-neutral-600 hover:text-neutral-800'
                }`}
              >
                📋 Informations
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'members'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-neutral-600 hover:text-neutral-800'
                }`}
              >
                👥 Membres ({stats?.totalMembers || 0})
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'events'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-neutral-600 hover:text-neutral-800'
                }`}
              >
                📅 Événements ({club._count?.events || 0})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Contenu des onglets */}
            {activeTab === 'info' && (
              <div className="space-y-6">
                {club.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-3">Description</h3>
                    <p className="text-neutral-600 leading-relaxed">{club.description}</p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-3">Informations de contact</h3>
                    <div className="space-y-2">
                      {club.email && (
                        <p className="text-sm"><span className="font-medium">Email:</span> {club.email}</p>
                      )}
                      {club.phone && (
                        <p className="text-sm"><span className="font-medium">Téléphone:</span> {club.phone}</p>
                      )}
                      {club.responsibleUser && (
                        <p className="text-sm"><span className="font-medium">Responsable:</span> {club.responsibleUser.fullName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-3">Détails techniques</h3>
                    <div className="space-y-2">
                      {club.division && (
                        <p className="text-sm"><span className="font-medium">Division:</span> {club.division}</p>
                      )}
                      {club.arenaCapacity && (
                        <p className="text-sm"><span className="font-medium">Capacité:</span> {club.arenaCapacity.toLocaleString()} places</p>
                      )}
                      {club.budget && (
                        <p className="text-sm"><span className="font-medium">Budget:</span> {club.budget.toLocaleString()} €</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'members' && (
              <div className="space-y-6">
                {membersLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="mt-4 text-neutral-600">Chargement des membres...</p>
                  </div>
                ) : (
                  <>
                    {/* Statistiques des membres */}
                    {stats && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {stats.membersByRole.map((roleData) => (
                          <div key={roleData.role} className="bg-neutral-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-primary">{roleData._count.role}</div>
                            <div className="text-sm text-neutral-600">{getRoleBadge(roleData.role)}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Liste des membres */}
                    <div className="space-y-4">
                      {members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                              {member.user.avatarUrl ? (
                                <img src={member.user.avatarUrl} alt={member.user.fullName} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                member.user.fullName.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-neutral-800">{member.user.fullName}</h4>
                              <p className="text-sm text-neutral-600">{member.user.email}</p>
                              <p className="text-xs text-neutral-500">
                                Rejoint le {new Date(member.joinedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {getRoleBadge(member.role)}
                            {isAdmin && member.user.id !== session?.user?.id && (
                              <div className="flex gap-2">
                                <button className="text-blue-600 hover:text-blue-800 text-sm">
                                  Modifier
                                </button>
                                <button className="text-red-600 hover:text-red-800 text-sm">
                                  Retirer
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {members.length === 0 && (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-4">👥</div>
                        <p className="text-neutral-600">Aucun membre pour le moment</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'events' && (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📅</div>
                <p className="text-neutral-600">Les événements du club seront affichés ici</p>
                <p className="text-sm text-neutral-500 mt-2">Cette fonctionnalité sera disponible prochainement</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal pour rejoindre le club */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Rejoindre {club.name}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Rôle souhaité
                </label>
                <select
                  value={joinRole}
                  onChange={(e) => setJoinRole(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="PLAYER">Joueur</option>
                  <option value="COACH">Coach</option>
                  <option value="ASSISTANT">Assistant Coach</option>
                  <option value="STAFF">Staff</option>
                  <option value="SCOUT">Scout</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  Vous rejoindrez ce club avec le rôle sélectionné. 
                  Les présidents et directeurs pourront modifier votre rôle si nécessaire.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleJoinClub}
                disabled={joinClubMutation.isPending}
                className="flex-1 bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {joinClubMutation.isPending ? 'Rejoindre...' : 'Rejoindre'}
              </button>
              <button
                onClick={() => setShowJoinModal(false)}
                className="flex-1 bg-neutral-200 text-neutral-800 py-2 px-4 rounded-lg font-medium hover:bg-neutral-300 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClubDetailPage() {
  return (
    <ProtectedRoute redirectTo="/auth/login">
      <ClubDetailPageContent />
    </ProtectedRoute>
  );
}
