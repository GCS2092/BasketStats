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

function ClubManagePageContent() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'members' | 'teams' | 'settings'>('members');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);

  useAuthSync();

  const clubId = params.id as string;

  // Récupérer les détails du club
  const { data: club, isLoading: clubLoading } = useQuery({
    queryKey: ['club', clubId],
    queryFn: async () => {
      const response = await apiClient.get(`/clubs/${clubId}`);
      return response.data;
    },
  });

  // Récupérer les membres
  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['club-members', clubId],
    queryFn: async () => {
      const response = await apiClient.get(`/clubs/${clubId}/members`);
      return response.data;
    },
  });

  // Récupérer les équipes
  const { data: teams = [], isLoading: teamsLoading } = useQuery({
    queryKey: ['club-teams', clubId],
    queryFn: async () => {
      const response = await apiClient.get(`/clubs/${clubId}/teams`);
      return response.data;
    },
  });

  // Vérifier si l'utilisateur est président ou directeur
  const userMembership = members.find((m: any) => m.user.id === session?.user?.id);
  const canManage = userMembership?.role === 'PRESIDENT' || userMembership?.role === 'DIRECTOR';

  // Rediriger si pas autorisé
  if (!clubLoading && !membersLoading && !canManage) {
    router.push(`/clubs/${clubId}`);
    return null;
  }

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

  const getCategoryLabel = (category: string) => {
    const labels = {
      PROFESSIONAL: 'Équipe Pro',
      ESPOIRS_U21: 'Espoirs U21',
      ESPOIRS_U19: 'Espoirs U19',
      JUNIOR_U17: 'Junior U17',
      JUNIOR_U15: 'Junior U15',
      MINIME_U13: 'Minime U13',
      FEMININE: 'Féminine',
    };
    return labels[category as keyof typeof labels] || category;
  };

  if (clubLoading || membersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
          { label: club?.name || 'Club', href: `/clubs/${clubId}` },
          { label: 'Gestion', href: `/clubs/${clubId}/manage` },
        ]}
      />

      <main className="container-custom py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">🏢 Gestion de {club?.name}</h1>
              <p className="text-neutral-600">
                Gérez les membres, équipes et paramètres de votre club
              </p>
            </div>
            <button
              onClick={() => router.push(`/clubs/${clubId}`)}
              className="bg-neutral-200 text-neutral-800 px-4 py-2 rounded-lg font-medium hover:bg-neutral-300 transition-colors"
            >
              ← Retour au club
            </button>
          </div>
        </div>

        {/* Onglets */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 mb-6">
          <div className="border-b border-neutral-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('members')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'members'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-neutral-600 hover:text-neutral-800'
                }`}
              >
                👥 Membres ({members.length})
              </button>
              <button
                onClick={() => setActiveTab('teams')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'teams'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-neutral-600 hover:text-neutral-800'
                }`}
              >
                🏀 Équipes ({teams.length})
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'settings'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-neutral-600 hover:text-neutral-800'
                }`}
              >
                ⚙️ Paramètres
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* ONGLET MEMBRES */}
            {activeTab === 'members' && (
              <div className="space-y-6">
                {/* Actions */}
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-neutral-800">Gestion des membres</h2>
                  <button
                    onClick={() => setShowAddMemberModal(true)}
                    className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors"
                  >
                    ➕ Ajouter un membre
                  </button>
                </div>

                {/* Liste des membres */}
                <div className="space-y-4">
                  {members.map((member: any) => (
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
                            Membre depuis le {new Date(member.joinedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getRoleBadge(member.role)}
                        {member.user.id !== session?.user?.id && userMembership?.role === 'PRESIDENT' && (
                          <button className="text-red-600 hover:text-red-800 text-sm px-3 py-1 rounded bg-red-50 hover:bg-red-100 transition-colors">
                            Retirer
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ONGLET ÉQUIPES */}
            {activeTab === 'teams' && (
              <div className="space-y-6">
                {/* Actions */}
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-neutral-800">Gestion des équipes</h2>
                  <button
                    onClick={() => setShowCreateTeamModal(true)}
                    className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors"
                  >
                    ➕ Créer une équipe
                  </button>
                </div>

                {/* Liste des équipes */}
                <div className="grid md:grid-cols-2 gap-6">
                  {teams.map((team: any) => (
                    <div key={team.id} className="bg-neutral-50 rounded-lg p-6 border border-neutral-200">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-neutral-800">{team.name}</h3>
                          <p className="text-sm text-neutral-600">{getCategoryLabel(team.category)}</p>
                          <p className="text-xs text-neutral-500">Saison {team.season}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          team.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {team.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        {team.headCoach && (
                          <p className="text-sm text-neutral-600">
                            👨‍💼 Coach: {team.headCoach.fullName}
                          </p>
                        )}
                        <p className="text-sm text-neutral-600">
                          👥 Joueurs: {team._count?.players || 0}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/clubs/teams/${team.id}`)}
                          className="flex-1 bg-primary text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
                        >
                          Gérer l'équipe
                        </button>
                        <button className="px-3 py-2 text-neutral-600 hover:bg-neutral-200 rounded-lg text-sm transition-colors">
                          ⚙️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {teams.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🏀</div>
                    <h3 className="text-xl font-semibold text-neutral-800 mb-2">Aucune équipe</h3>
                    <p className="text-neutral-600 mb-6">
                      Créez votre première équipe pour commencer à organiser votre club
                    </p>
                    <button
                      onClick={() => setShowCreateTeamModal(true)}
                      className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
                    >
                      ➕ Créer une équipe
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ONGLET PARAMÈTRES */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-neutral-800">Paramètres du club</h2>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-yellow-600 text-xl">⚠️</div>
                    <div>
                      <h3 className="font-semibold text-yellow-800 mb-2">Fonctionnalité en développement</h3>
                      <p className="text-sm text-yellow-700">
                        La modification des paramètres du club sera disponible prochainement.
                        Pour toute modification urgente, contactez un administrateur.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Informations actuelles */}
                <div className="bg-white border border-neutral-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-neutral-800 mb-4">Informations actuelles</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-neutral-600">Nom</p>
                      <p className="text-neutral-800">{club?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-600">Localisation</p>
                      <p className="text-neutral-800">{club?.city}, {club?.country}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-600">Ligue</p>
                      <p className="text-neutral-800">{club?.league || 'Non spécifié'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-600">Statut</p>
                      <p className="text-neutral-800">
                        {club?.status === 'APPROVED' ? '✅ Approuvé' :
                         club?.status === 'PENDING' ? '⏳ En attente' :
                         club?.status === 'REJECTED' ? '❌ Rejeté' :
                         '🚫 Suspendu'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Ajouter un membre */}
        {showAddMemberModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">Ajouter un membre</h3>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  Cette fonctionnalité sera disponible prochainement.
                  Les utilisateurs peuvent rejoindre votre club via la page publique du club.
                </p>
              </div>

              <button
                onClick={() => setShowAddMemberModal(false)}
                className="w-full bg-neutral-200 text-neutral-800 py-2 px-4 rounded-lg font-medium hover:bg-neutral-300 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* Modal Créer une équipe */}
        {showCreateTeamModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">Créer une équipe</h3>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Nom de l'équipe *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Équipe Pro"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Catégorie *
                  </label>
                  <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option value="PROFESSIONAL">Équipe Pro</option>
                    <option value="ESPOIRS_U21">Espoirs U21</option>
                    <option value="ESPOIRS_U19">Espoirs U19</option>
                    <option value="JUNIOR_U17">Junior U17</option>
                    <option value="JUNIOR_U15">Junior U15</option>
                    <option value="MINIME_U13">Minime U13</option>
                    <option value="FEMININE">Féminine</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Saison *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 2024-2025"
                    defaultValue="2024-2025"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Description de l'équipe..."
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    L'équipe sera créée et vous pourrez ensuite ajouter des joueurs.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-dark transition-colors"
                  >
                    Créer l'équipe
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateTeamModal(false)}
                    className="flex-1 bg-neutral-200 text-neutral-800 py-2 px-4 rounded-lg font-medium hover:bg-neutral-300 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ClubManagePage() {
  return (
    <ProtectedRoute redirectTo="/auth/login">
      <ClubManagePageContent />
    </ProtectedRoute>
  );
}
