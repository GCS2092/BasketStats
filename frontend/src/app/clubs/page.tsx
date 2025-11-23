'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import NavigationBreadcrumb from '@/components/common/NavigationBreadcrumb';
import ElegantQuickNavigation from '@/components/common/ElegantQuickNavigation';
import Link from 'next/link';

interface Club {
  id: string;
  name: string;
  shortName?: string;
  logo?: string;
  country: string;
  city: string;
  league?: string;
  division?: string;
  arena?: string;
  arenaCapacity?: number;
  founded?: number;
  colors: string[];
  verified: boolean;
  _count?: {
    events: number;
  };
}

export default function ClubsPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [leagueFilter, setLeagueFilter] = useState('');
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  
  // Vérifier si l'utilisateur peut créer un club
  const canCreateClub = session?.user?.role === 'RECRUITER' && session?.user?.verified || session?.user?.role === 'ADMIN';

  const { data: clubs, isLoading } = useQuery({
    queryKey: ['clubs', countryFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (countryFilter) params.append('country', countryFilter);
      // Seuls les clubs approuvés sont visibles pour les utilisateurs normaux
      if (session?.user?.role !== 'ADMIN') {
        params.append('status', 'APPROVED');
      }
      
      const response = await apiClient.get(`/clubs?${params.toString()}`);
      return response.data as Club[];
    },
  });

  const filteredClubs = clubs?.filter((club) =>
      club.name.toLowerCase().includes(search.toLowerCase()) ||
      club.city.toLowerCase().includes(search.toLowerCase()) ||
    club.league?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  // Mutation pour postuler à un club
  const applyToClubMutation = useMutation({
    mutationFn: async (data: { clubId: string; message: string; position?: string; experience?: string; availability?: string }) => {
      const response = await apiClient.post('/clubs/applications', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      setShowApplicationModal(false);
      setSelectedClub(null);
      alert('✅ Votre candidature a été envoyée avec succès !');
    },
    onError: (error: any) => {
      console.error('Erreur lors de l\'envoi de la candidature:', error);
      alert('❌ Erreur lors de l\'envoi de la candidature: ' + (error.response?.data?.message || error.message));
    }
  });

  const handleApplyToClub = (club: Club) => {
    setSelectedClub(club);
    setShowApplicationModal(true);
  };

  const countries = Array.from(new Set(clubs?.map((c) => c.country) || []));
  const leagues = Array.from(new Set((clubs || []).map((c) => c.league).filter(Boolean) as string[]));

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Navigation rapide élégante */}
      <ElegantQuickNavigation currentPage="/clubs" />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">🏢 Clubs et Équipes</h1>
          <p className="text-blue-100 text-base sm:text-lg">
            Découvrez les clubs professionnels de basketball
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Bouton créer club - Seulement pour recruteurs vérifiés et admins */}
        {canCreateClub && (
          <div className="mb-6 flex justify-end">
            <Link
              href="/clubs/create"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors shadow-sm"
            >
              ➕ Créer un club
            </Link>
          </div>
        )}

        {/* Filtres et recherche */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Recherche */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Rechercher un club
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nom, ville, ligue..."
                className="input"
              />
            </div>

            {/* Pays */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Pays
              </label>
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="input"
              >
                <option value="">Tous les pays</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            {/* Ligue */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Ligue
              </label>
              <select
                value={leagueFilter}
                onChange={(e) => setLeagueFilter(e.target.value)}
                className="input"
              >
                <option value="">Toutes les ligues</option>
                {leagues.map((lg) => (
                  <option key={lg} value={lg}>
                    {lg}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Liste des clubs */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-neutral-600">Chargement des clubs...</p>
          </div>
        ) : filteredClubs && filteredClubs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClubs.map((club) => (
              <div
                key={club.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden group"
              >
                {/* Header avec couleurs du club */}
                <div
                  className="h-24 relative"
                  style={{
                    background: club.colors.length > 0
                      ? `linear-gradient(135deg, ${club.colors[0]}, ${club.colors[1] || club.colors[0]})`
                      : 'linear-gradient(135deg, #0B3D91, #E03C31)',
                  }}
                >
                  {club.verified && (
                    <div className="absolute top-2 right-2 bg-white/90 rounded-full px-3 py-1 text-xs font-bold text-blue-600">
                      ✓ Vérifié
                    </div>
                  )}
                </div>

                <div className="p-6 -mt-12 relative">
                  {/* Logo */}
                  <div className="w-20 h-20 bg-white rounded-lg shadow-lg flex items-center justify-center mb-4 border-4 border-white">
                    {club.logo ? (
                      <img src={club.logo} alt={club.name} className="w-16 h-16 object-contain" />
                    ) : (
                      <span className="text-3xl">🏀</span>
                    )}
                  </div>

                  {/* Nom */}
                  <h3 className="text-xl font-bold text-neutral-800 mb-1 group-hover:text-blue-600 transition-colors">
                    {club.name}
                  </h3>
                  {club.shortName && (
                    <div className="text-sm text-neutral-500 font-semibold mb-3">
                      {club.shortName}
                    </div>
                  )}

                  {/* Ligue */}
                  {club.league && (
                    <div className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold mb-3">
                      {club.league}
                    </div>
                  )}

                  {/* Localisation */}
                  <div className="flex items-center gap-2 text-neutral-600 text-sm mb-2">
                    <span>📍</span>
                    <span>{club.city}, {club.country}</span>
                  </div>

                  {/* Stade */}
                  {club.arena && (
                    <div className="flex items-center gap-2 text-neutral-600 text-sm mb-2">
                      <span>🏟️</span>
                      <span>{club.arena}</span>
                      {club.arenaCapacity && (
                        <span className="text-neutral-500">
                          ({club.arenaCapacity.toLocaleString()} places)
                        </span>
                      )}
                    </div>
                  )}

                  {/* Fondation */}
                  {club.founded && (
                    <div className="text-sm text-neutral-500">
                      Fondé en {club.founded}
                    </div>
                  )}

                  {/* Événements */}
                  {club._count && club._count.events > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="text-sm text-neutral-600">
                        📅 {club._count.events} événement{club._count.events > 1 ? 's' : ''} à venir
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t flex gap-2">
                    <Link
                      href={`/clubs/${club.id}`}
                      className="flex-1 bg-neutral-100 text-neutral-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors text-center"
                    >
                      👁️ Voir détails
                    </Link>
                    {session?.user?.role === 'PLAYER' && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleApplyToClub(club);
                        }}
                        className="flex-1 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
                      >
                        📝 Postuler
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-xl font-bold text-neutral-800 mb-2">
              Aucun club trouvé
            </h3>
            <p className="text-neutral-600">
              Essayez de modifier les filtres de recherche
            </p>
          </div>
        )}
      </div>
      <ElegantQuickNavigation />

      {/* Modal de candidature */}
      {showApplicationModal && selectedClub && (
        <ApplicationModal
          club={selectedClub}
          onClose={() => {
            setShowApplicationModal(false);
            setSelectedClub(null);
          }}
          onSubmit={(data) => {
            applyToClubMutation.mutate({
              clubId: selectedClub.id,
              ...data
            });
          }}
          isLoading={applyToClubMutation.isPending}
        />
      )}
    </div>
  );
}

// Composant Modal de candidature
function ApplicationModal({ club, onClose, onSubmit, isLoading }: {
  club: Club;
  onClose: () => void;
  onSubmit: (data: { message: string; position?: string; experience?: string; availability?: string }) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    message: '',
    position: '',
    experience: '',
    availability: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message.trim()) {
      alert('Veuillez saisir un message de motivation');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neutral-800">
              📝 Candidature pour {club.name}
            </h2>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Message de motivation */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Message de motivation *
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={4}
                placeholder="Expliquez pourquoi vous souhaitez rejoindre ce club..."
                required
              />
            </div>

            {/* Position souhaitée */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Position souhaitée
              </label>
              <select
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Sélectionnez une position</option>
                <option value="POINT_GUARD">Meneur (PG)</option>
                <option value="SHOOTING_GUARD">Arrière (SG)</option>
                <option value="SMALL_FORWARD">Ailier (SF)</option>
                <option value="POWER_FORWARD">Ailier fort (PF)</option>
                <option value="CENTER">Pivot (C)</option>
              </select>
            </div>

            {/* Expérience */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Expérience
              </label>
              <textarea
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={3}
                placeholder="Décrivez votre expérience en basketball..."
              />
            </div>

            {/* Disponibilité */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Disponibilité
              </label>
              <textarea
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={3}
                placeholder="Indiquez vos disponibilités pour les entraînements et matchs..."
              />
            </div>

            {/* Boutons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Envoi...' : 'Envoyer candidature'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

