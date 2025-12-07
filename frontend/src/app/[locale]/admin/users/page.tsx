'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import Header from '@/components/layout/Header';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useAuthSync } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function AdminUsersContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  
  useAuthSync();

  // Récupérer les utilisateurs
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/users');
      return response.data;
    },
    enabled: !!session && session.user?.role === 'ADMIN',
  });

  // Mutation pour vérifier un utilisateur (maintenant principalement pour les recruteurs)
  const verifyUserMutation = useMutation({
    mutationFn: async ({ userId, verified }: { userId: string; verified: boolean }) => {
      const response = await apiClient.put(`/admin/users/${userId}/verify`, { verified });
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      if (variables.verified) {
        alert(`✅ Utilisateur validé avec succès ! Un email a été envoyé.`);
      } else {
        alert(`⚠️ Utilisateur dévalidé. Un email de notification a été envoyé.`);
      }
    },
    onError: (error: any) => {
      console.error('Erreur lors de la validation:', error);
      alert(`❌ Erreur: ${error.response?.data?.message || error.message}`);
    },
  });

  // Mutation pour désactiver/réactiver un utilisateur
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ userId, active }: { userId: string; active: boolean }) => {
      const response = await apiClient.put(`/admin/users/${userId}/active`, { active });
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      if (variables.active) {
        alert(`✅ Utilisateur réactivé avec succès ! Un email a été envoyé.`);
      } else {
        alert(`⚠️ Utilisateur désactivé. Un email de notification a été envoyé.`);
      }
    },
    onError: (error: any) => {
      console.error('Erreur lors de la désactivation:', error);
      alert(`❌ Erreur: ${error.response?.data?.message || error.message}`);
    },
  });

  // Mutation pour supprimer un utilisateur
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiClient.delete(`/admin/users/${userId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      alert(`✅ Utilisateur supprimé avec succès !`);
    },
    onError: (error: any) => {
      console.error('Erreur lors de la suppression:', error);
      alert(`❌ Erreur: ${error.response?.data?.message || error.message}`);
    },
  });

  const handleVerifyUser = (userId: string, verified: boolean) => {
    if (verified) {
      if (confirm('Êtes-vous sûr de vouloir valider cet utilisateur ? Un email sera envoyé.')) {
        verifyUserMutation.mutate({ userId, verified });
      }
    } else {
      if (confirm('Êtes-vous sûr de vouloir dévalider cet utilisateur ? Un email de notification sera envoyé.')) {
        verifyUserMutation.mutate({ userId, verified });
      }
    }
  };

  const handleToggleActive = (userId: string, active: boolean) => {
    if (active) {
      if (confirm('Êtes-vous sûr de vouloir réactiver ce compte ? Un email sera envoyé.')) {
        toggleActiveMutation.mutate({ userId, active });
      }
    } else {
      if (confirm('Êtes-vous sûr de vouloir désactiver ce compte ? L\'utilisateur ne pourra plus se connecter et un email sera envoyé.')) {
        toggleActiveMutation.mutate({ userId, active });
      }
    }
  };

  const handleDeleteUser = (userId: string, userEmail: string, userRole: string) => {
    if (userRole === 'ADMIN') {
      if (confirm(`⚠️ ATTENTION: Vous êtes sur le point de supprimer un administrateur (${userEmail}).\n\nCette action est irréversible et supprimera définitivement :\n- Le compte utilisateur\n- Tous les posts et commentaires\n- Tous les messages\n- Toutes les données associées\n\nÊtes-vous absolument sûr de vouloir continuer ?`)) {
        deleteUserMutation.mutate(userId);
      }
    } else {
      if (confirm(`⚠️ ATTENTION: Vous êtes sur le point de supprimer l'utilisateur ${userEmail}.\n\nCette action est irréversible et supprimera définitivement :\n- Le compte utilisateur\n- Tous les posts et commentaires\n- Tous les messages\n- Toutes les données associées\n\nÊtes-vous absolument sûr de vouloir continuer ?`)) {
        deleteUserMutation.mutate(userId);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const users = usersData?.users || [];

  return (
    <div className="flex min-h-screen bg-neutral-100">
      {/* Bouton pour ouvrir la sidebar sur mobile */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-primary text-white rounded-lg shadow-md"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

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
              👥 Gestion des Utilisateurs
            </h1>
            <p className="text-sm sm:text-base text-neutral-600">
              Vérifier, modifier et gérer les comptes utilisateurs
            </p>
            
            {/* Note d'information sur l'auto-vérification */}
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-green-800 font-medium">
                  ✅ Auto-vérification activée : Tous les joueurs sont automatiquement vérifiés et certifiés
                </span>
              </div>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4 border border-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Total utilisateurs</p>
                  <p className="text-2xl font-bold text-neutral-900">{users.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border border-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Recruteurs</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {users.filter((u: any) => u.role === 'RECRUITER').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🔍</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border border-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Vérifiés</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {users.filter((u: any) => u.verified).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tableau des utilisateurs */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Inscription
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {users.map((user: any) => (
                    <tr key={user.id} className="hover:bg-neutral-50">
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-xs sm:text-sm">
                              {user.fullName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-2 sm:ml-4">
                            <div className="text-sm font-medium text-neutral-900">
                              {user.fullName || 'Non renseigné'}
                            </div>
                            <div className="text-xs sm:text-sm text-neutral-500 truncate max-w-[150px] sm:max-w-none">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`
                          inline-flex px-2 py-1 text-xs font-semibold rounded-full
                          ${user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                            user.role === 'RECRUITER' ? 'bg-purple-100 text-purple-800' :
                            'bg-green-100 text-green-800'}
                        `}>
                          {user.role === 'PLAYER' ? 'Joueur' :
                           user.role === 'RECRUITER' ? 'Recruteur' :
                           user.role === 'ADMIN' ? 'Admin' : user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`
                              inline-flex px-2 py-1 text-xs font-semibold rounded-full
                              ${user.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                            `}>
                              {user.verified ? 'Vérifié' : 'Non vérifié'}
                            </span>
                            <span className={`
                              inline-flex px-2 py-1 text-xs font-semibold rounded-full
                              ${user.active ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}
                            `}>
                              {user.active ? 'Actif' : 'Désactivé'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {user.role === 'RECRUITER' && (
                              <button
                                onClick={() => handleVerifyUser(user.id, !user.verified)}
                                disabled={verifyUserMutation.isPending}
                                className={`
                                  text-xs px-2 py-1 rounded transition-colors
                                  ${user.verified 
                                    ? 'text-red-600 hover:bg-red-50' 
                                    : 'text-green-600 hover:bg-green-50'
                                  }
                                  ${verifyUserMutation.isPending ? 'opacity-50' : ''}
                                `}
                              >
                                {user.verified ? 'Dévérifier' : 'Vérifier'}
                              </button>
                            )}
                            <button
                              onClick={() => handleToggleActive(user.id, !user.active)}
                              disabled={toggleActiveMutation.isPending}
                              className={`
                                text-xs px-2 py-1 rounded transition-colors
                                ${user.active 
                                  ? 'text-red-600 hover:bg-red-50' 
                                  : 'text-green-600 hover:bg-green-50'
                                }
                                ${toggleActiveMutation.isPending ? 'opacity-50' : ''}
                              `}
                            >
                              {user.active ? 'Désactiver' : 'Réactiver'}
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 text-xs px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                          >
                            Détails
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.email, user.role)}
                            disabled={deleteUserMutation.isPending}
                            className="text-red-600 hover:text-red-900 text-xs px-2 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            {deleteUserMutation.isPending ? 'Suppression...' : 'Supprimer'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <p className="text-neutral-500">Aucun utilisateur trouvé.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de détails utilisateur */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-neutral-800 mb-4">
              Détails de l&apos;utilisateur
            </h3>
            <div className="space-y-2">
              <p><strong>Nom:</strong> {selectedUser.fullName || 'Non renseigné'}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Rôle:</strong> {selectedUser.role}</p>
              <p><strong>Vérifié:</strong> {selectedUser.verified ? 'Oui' : 'Non'}</p>
              <p><strong>Inscription:</strong> {new Date(selectedUser.createdAt).toLocaleDateString('fr-FR')}</p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors"
              >
                Fermer
              </button>
              {selectedUser.role === 'RECRUITER' && (
                <button
                  onClick={() => {
                    handleVerifyUser(selectedUser.id, !selectedUser.verified);
                    setShowModal(false);
                  }}
                  disabled={verifyUserMutation.isPending}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedUser.verified
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  } disabled:opacity-50`}
                >
                  {selectedUser.verified ? 'Dévérifier' : 'Vérifier'}
                </button>
              )}
              <button
                onClick={() => {
                  handleDeleteUser(selectedUser.id, selectedUser.email, selectedUser.role);
                  setShowModal(false);
                }}
                disabled={deleteUserMutation.isPending}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {deleteUserMutation.isPending ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN" redirectTo="/">
      <AdminUsersContent />
    </ProtectedRoute>
  );
}