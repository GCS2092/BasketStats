'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import Header from '@/components/layout/Header';
import NavigationBreadcrumb from '@/components/common/NavigationBreadcrumb';
import ElegantQuickNavigation from '@/components/common/ElegantQuickNavigation';
import Link from 'next/link';
import { useAuthSync } from '@/hooks/useAuth';

export default function PlayersListPage() {
  const { data: session } = useSession();
  useAuthSync(); // Synchroniser tokens
  const [filters, setFilters] = useState({
    query: '',
    position: '',
    level: '',
    country: '',
    availability: '',
  });

  // Récupérer tous les joueurs ou rechercher avec filtres
  const { data: results, isLoading } = useQuery({
    queryKey: ['all-players', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.query) params.append('query', filters.query);
      if (filters.position) params.append('position', filters.position);
      if (filters.level) params.append('level', filters.level);
      if (filters.country) params.append('country', filters.country);
      if (filters.availability) params.append('availability', filters.availability);

      const response = await apiClient.get(`/players/search?${params.toString()}`);
      return response.data;
    },
  });

  const isRecruiter = session?.user?.role === 'RECRUITER';

  return (
    <div className="min-h-screen bg-neutral-100">
      <Header />
      
      {/* Navigation rapide élégante */}
      <ElegantQuickNavigation currentPage="/players" />

      <main className="container-custom py-6">
        <div className="card p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">
                {isRecruiter ? '🔍 Recherche de talents' : '👥 Découvrir des joueurs'}
              </h1>
              <p className="text-sm text-neutral-600 mt-1">
                {isRecruiter 
                  ? 'Trouvez les meilleurs joueurs pour votre équipe' 
                  : 'Connectez-vous avec d\'autres joueurs'}
              </p>
            </div>
            {isRecruiter && (
              <div className="flex items-center gap-2 bg-purple-50 border-2 border-purple-300 text-purple-700 px-4 py-2 rounded-lg font-semibold">
                <span className="text-lg">🔍</span>
                <span>Mode Recruteur</span>
              </div>
            )}
          </div>

          {/* Barre de recherche */}
          <div className="mb-4">
            <input
              type="text"
              value={filters.query}
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
              placeholder="🔍 Rechercher par nom, club, ville..."
              className="input w-full text-lg"
            />
          </div>

          {/* Filtres avancés */}
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="label">Poste</label>
              <select
                value={filters.position}
                onChange={(e) => setFilters({ ...filters, position: e.target.value })}
                className="input"
              >
                <option value="">Tous les postes</option>
                <option value="PG">Point Guard (PG)</option>
                <option value="SG">Shooting Guard (SG)</option>
                <option value="SF">Small Forward (SF)</option>
                <option value="PF">Power Forward (PF)</option>
                <option value="C">Center (C)</option>
              </select>
            </div>

            <div>
              <label className="label">Niveau</label>
              <select
                value={filters.level}
                onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                className="input"
              >
                <option value="">Tous les niveaux</option>
                <option value="PRO">Professionnel</option>
                <option value="SEMI_PRO">Semi-Pro</option>
                <option value="AMATEUR">Amateur</option>
                <option value="YOUTH">Jeune</option>
              </select>
            </div>

            <div>
              <label className="label">Pays</label>
              <input
                type="text"
                value={filters.country}
                onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                placeholder="France, USA..."
                className="input"
              />
            </div>

            <div>
              <label className="label">Disponibilité</label>
              <select
                value={filters.availability}
                onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
                className="input"
              >
                <option value="">Toutes</option>
                <option value="IMMEDIATELY">Immédiate</option>
                <option value="ONE_MONTH">Dans 1 mois</option>
                <option value="THREE_MONTHS">Dans 3 mois</option>
                <option value="SIX_MONTHS">Dans 6 mois</option>
              </select>
            </div>
          </div>

          {/* Bouton réinitialiser */}
          {Object.values(filters).some(v => v) && (
            <button
              onClick={() => setFilters({ query: '', position: '', level: '', country: '', availability: '' })}
              className="mt-4 text-sm text-primary-600 hover:underline"
            >
              ✕ Réinitialiser les filtres
            </button>
          )}
        </div>

        {/* Résultats */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : results?.players?.length > 0 ? (
          <>
            <div className="mb-4 text-neutral-600">
              <strong>{results.players.length}</strong> joueur{results.players.length > 1 ? 's' : ''} trouvé{results.players.length > 1 ? 's' : ''}
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.players.map((player: any) => (
                <Link key={player.id} href={`/players/${player.userId}`}>
                  <div className="card p-6 hover:shadow-lg transition-all cursor-pointer group">
                    {/* En-tête de la carte */}
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-2xl flex-shrink-0">
                        {player.user.avatarUrl ? (
                          <img
                            src={player.user.avatarUrl}
                            alt=""
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          '🏀'
                        )}
                      </div>
                      <div className="ml-4 flex-1 min-w-0">
                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors truncate">
                          {player.user.fullName}
                        </h3>
                        {player.nickname && (
                          <p className="text-neutral-600 text-sm truncate">"{player.nickname}"</p>
                        )}
                        {player.currentClub && (
                          <p className="text-neutral-500 text-xs mt-1 truncate">
                            📍 {player.currentClub}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex gap-2 flex-wrap mb-4">
                      {player.position && (
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium">
                          {player.position}
                        </span>
                      )}
                      {player.level && (
                        <span className="px-2 py-1 bg-accent-100 text-accent-700 rounded text-xs font-medium">
                          {player.level}
                        </span>
                      )}
                      {player.availability === 'IMMEDIATELY' && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                          ✓ Disponible
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center text-sm border-t pt-3">
                      <div>
                        <div className="font-bold text-neutral-800">
                          {player.heightCm ? `${player.heightCm} cm` : '-'}
                        </div>
                        <div className="text-neutral-500 text-xs">Taille</div>
                      </div>
                      <div>
                        <div className="font-bold text-neutral-800">
                          {player.yearsExperience || '-'}
                        </div>
                        <div className="text-neutral-500 text-xs">Années</div>
                      </div>
                      <div>
                        <div className="font-bold text-neutral-800">
                          {player.profileViews || 0}
                        </div>
                        <div className="text-neutral-500 text-xs">Vues</div>
                      </div>
                    </div>

                    {/* Localisation */}
                    {(player.city || player.country) && (
                      <div className="mt-3 text-xs text-neutral-500 text-center">
                        🌍 {[player.city, player.country].filter(Boolean).join(', ')}
                      </div>
                    )}

                    {/* Actions selon le rôle */}
                    <div className="mt-4 pt-4 border-t flex gap-2">
                      {isRecruiter ? (
                        <>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              window.location.href = `/players/${player.userId}`;
                            }}
                            className="flex-1 btn bg-purple-500 hover:bg-purple-600 text-white text-sm font-semibold"
                          >
                            📧 Envoyer offre
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              window.location.href = `/messages?userId=${player.userId}`;
                            }}
                            className="flex-1 btn btn-secondary text-sm"
                          >
                            💬 Chat
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              window.location.href = `/players/${player.userId}`;
                            }}
                            className="flex-1 btn btn-primary text-sm"
                          >
                            👁️ Voir profil
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              window.location.href = `/messages?userId=${player.userId}`;
                            }}
                            className="flex-1 btn btn-secondary text-sm"
                          >
                            💬 Message
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="card p-12 text-center">
            <div className="text-6xl mb-4">🏀</div>
            <p className="text-neutral-500 text-lg mb-2">
              {Object.values(filters).some(v => v)
                ? 'Aucun joueur ne correspond à vos critères'
                : 'Aucun joueur enregistré pour le moment'}
            </p>
            <p className="text-neutral-400 text-sm">
              Modifiez les filtres ou revenez plus tard
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

