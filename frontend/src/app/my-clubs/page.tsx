'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import Header from '@/components/layout/Header';
import NavigationBreadcrumb from '@/components/common/NavigationBreadcrumb';
import { useAuthSync } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

interface ClubMembership {
  id: string;
  role: string;
  joinedAt: string;
  club: {
    id: string;
    name: string;
    shortName?: string;
    logo?: string;
    city: string;
    country: string;
    league?: string;
    status: string;
    verified: boolean;
    _count: {
      members: number;
      events: number;
    };
  };
}

function MyClubsPageContent() {
  const { data: session } = useSession();
  const router = useRouter();
  useAuthSync();

  // Récupérer les clubs de l'utilisateur
  const { data: memberships = [], isLoading } = useQuery({
    queryKey: ['user-clubs'],
    queryFn: async () => {
      const response = await apiClient.get('/clubs/user/memberships');
      return response.data as ClubMembership[];
    },
    enabled: !!session?.user,
  });

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

  const getStatusBadge = (status: string) => {
    const badges = {
      APPROVED: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      REJECTED: 'bg-red-100 text-red-800',
      SUSPENDED: 'bg-gray-100 text-gray-800',
    };
    
    const labels = {
      APPROVED: 'Approuvé',
      PENDING: 'En attente',
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

  return (
    <div className="min-h-screen bg-neutral-100">
      <Header />
      
      <NavigationBreadcrumb 
        items={[
          { label: 'Accueil', href: '/' },
          { label: 'Mes clubs', href: '/my-clubs' },
        ]}
      />

      <main className="container-custom py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🏢 Mes Clubs</h1>
          <p className="text-neutral-600">
            Gérez vos appartenances aux clubs de basketball
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Total clubs</p>
                <p className="text-2xl font-bold text-neutral-900">{memberships.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏢</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Rôles de direction</p>
                <p className="text-2xl font-bold text-purple-600">
                  {memberships.filter(m => m.role === 'PRESIDENT' || m.role === 'DIRECTOR').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👑</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Clubs actifs</p>
                <p className="text-2xl font-bold text-green-600">
                  {memberships.filter(m => m.club.status === 'APPROVED').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des clubs */}
        {memberships.length > 0 ? (
          <div className="space-y-6">
            {memberships.map((membership) => (
              <div key={membership.id} className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {/* Logo/Avatar du club */}
                      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {membership.club.logo ? (
                          <img 
                            src={membership.club.logo} 
                            alt={membership.club.name} 
                            className="w-full h-full rounded-full object-cover" 
                          />
                        ) : (
                          membership.club.name.charAt(0).toUpperCase()
                        )}
                      </div>

                      {/* Informations du club */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-neutral-800">
                            {membership.club.name}
                          </h3>
                          {membership.club.verified && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 text-xs font-semibold rounded-full">
                              ✓ Vérifié
                            </span>
                          )}
                          {getStatusBadge(membership.club.status)}
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-neutral-600 mb-3">
                          <span>📍 {membership.club.city}, {membership.club.country}</span>
                          {membership.club.league && <span>🏆 {membership.club.league}</span>}
                          <span>👥 {membership.club._count.members} membres</span>
                          <span>📅 {membership.club._count.events} événements</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-sm text-neutral-600">
                            Membre depuis le {new Date(membership.joinedAt).toLocaleDateString()}
                          </span>
                          {getRoleBadge(membership.role)}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => router.push(`/clubs/${membership.club.id}`)}
                        className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors"
                      >
                        Voir le club
                      </button>
                      
                      {(membership.role === 'PRESIDENT' || membership.role === 'DIRECTOR') && (
                        <button
                          onClick={() => router.push(`/clubs/${membership.club.id}?tab=members`)}
                          className="bg-neutral-200 text-neutral-800 px-4 py-2 rounded-lg font-medium hover:bg-neutral-300 transition-colors"
                        >
                          Gérer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-6">🏢</div>
            <h2 className="text-2xl font-bold text-neutral-800 mb-4">Vous n'êtes membre d'aucun club</h2>
            <p className="text-neutral-600 mb-8 max-w-md mx-auto">
              Rejoignez des clubs de basketball pour connecter avec d'autres joueurs, 
              coachs et passionnés du sport.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/clubs')}
                className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
              >
                🏀 Découvrir les clubs
              </button>
              <button
                onClick={() => router.push('/clubs/create')}
                className="bg-neutral-200 text-neutral-800 px-6 py-3 rounded-lg font-medium hover:bg-neutral-300 transition-colors"
              >
                ➕ Créer un club
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function MyClubsPage() {
  return (
    <ProtectedRoute redirectTo="/auth/login">
      <MyClubsPageContent />
    </ProtectedRoute>
  );
}
