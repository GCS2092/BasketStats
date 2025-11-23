'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import Header from '@/components/layout/Header';
import NavigationBreadcrumb from '@/components/common/NavigationBreadcrumb';
import ElegantQuickNavigation from '@/components/common/ElegantQuickNavigation';
import Link from 'next/link';
import { useAuthSync } from '@/hooks/useAuth';

export default function RecruitersPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  useAuthSync();

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    country: '',
    organization: '',
  });

  // Récupérer tous les recruteurs
  const { data: recruiters, isLoading } = useQuery({
    queryKey: ['recruiters', searchQuery, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filters.country) params.append('country', filters.country);
      if (filters.organization) params.append('organization', filters.organization);

      const response = await apiClient.get(`/users/recruiters?${params.toString()}`);
      return response.data;
    },
    enabled: !!session,
  });

  // Mutation pour envoyer une demande de contact
  const sendContactRequestMutation = useMutation({
    mutationFn: async ({ recruiterId, message }: { recruiterId: string; message: string }) => {
      const response = await apiClient.post('/recruit/contact-request', {
        recruiterId,
        message,
      });
      return response.data;
    },
    onSuccess: () => {
      alert('✅ Demande de contact envoyée avec succès !');
    },
  });

  const [selectedRecruiter, setSelectedRecruiter] = useState<string | null>(null);
  const [contactMessage, setContactMessage] = useState('');

  const handleSendContactRequest = (recruiterId: string) => {
    if (!contactMessage.trim()) {
      alert('⚠️ Veuillez écrire un message de présentation');
      return;
    }
    sendContactRequestMutation.mutate({ recruiterId, message: contactMessage });
    setSelectedRecruiter(null);
    setContactMessage('');
  };

  const isPlayer = session?.user?.role === 'PLAYER';

  return (
    <div className="min-h-screen bg-neutral-100">
      <Header />
      
      {/* Navigation rapide élégante */}
      <ElegantQuickNavigation currentPage="/recruiters" />

      <main className="container-custom py-6">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">🔍 Recruteurs & Clubs</h1>
          </div>
          <p className="text-neutral-600">
            {isPlayer
              ? 'Découvrez les recruteurs et clubs qui recherchent des talents comme vous !'
              : 'Liste de tous les recruteurs inscrits sur la plateforme'}
          </p>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="card p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Recherche */}
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="🔍 Rechercher par nom, club, organisation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input w-full"
              />
            </div>

            {/* Filtre Pays */}
            <div>
              <select
                value={filters.country}
                onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                className="input w-full"
              >
                <option value="">🌍 Tous les pays</option>
                <option value="France">France</option>
                <option value="USA">États-Unis</option>
                <option value="Spain">Espagne</option>
                <option value="Germany">Allemagne</option>
                <option value="Italy">Italie</option>
              </select>
            </div>
          </div>

          {/* Nombre de résultats */}
          {recruiters && (
            <div className="mt-4 text-sm text-neutral-600">
              ✨ <strong>{recruiters.length}</strong> recruteur(s) trouvé(s)
            </div>
          )}
        </div>

        {/* Liste des recruteurs */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-neutral-600">Chargement...</p>
          </div>
        ) : recruiters && recruiters.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recruiters.map((recruiter: any) => (
              <div key={recruiter.id} className="card hover:shadow-xl transition-shadow">
                {/* En-tête de la carte */}
                <div className="p-6 text-center border-b">
                  {/* Avatar */}
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center overflow-hidden">
                    {recruiter.avatarUrl ? (
                      <img
                        src={recruiter.avatarUrl}
                        alt={recruiter.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl text-white">🎯</span>
                    )}
                  </div>

                  {/* Nom */}
                  <h3 className="font-bold text-lg mb-1">{recruiter.fullName}</h3>

                  {/* Badge Recruteur */}
                  <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                    👔 Recruteur
                  </span>
                </div>

                {/* Informations */}
                <div className="p-6 space-y-3">
                  {/* Organisation/Club */}
                  {recruiter.recruiterProfile?.companyName && (
                    <div className="flex items-start gap-2">
                      <span className="text-neutral-500">🏢</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-neutral-700">
                          {recruiter.recruiterProfile.companyName}
                        </p>
                        {recruiter.recruiterProfile.companyType && (
                          <p className="text-xs text-neutral-500">
                            {recruiter.recruiterProfile.companyType}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Localisation */}
                  {(recruiter.recruiterProfile?.city || recruiter.recruiterProfile?.country) && (
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-500">🌍</span>
                      <p className="text-sm text-neutral-600">
                        {[recruiter.recruiterProfile?.city, recruiter.recruiterProfile?.country]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    </div>
                  )}

                  {/* Bio */}
                  {recruiter.bio && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-neutral-600 line-clamp-2">{recruiter.bio}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {isPlayer && (
                  <div className="p-4 bg-neutral-50 border-t flex gap-2">
                    {/* Bouton Message */}
                    <button
                      onClick={() => {
                        window.location.href = `/messages?userId=${recruiter.id}`;
                      }}
                      className="flex-1 btn btn-secondary text-sm"
                    >
                      💬 Message
                    </button>

                    {/* Bouton Me présenter */}
                    <button
                      onClick={() => setSelectedRecruiter(recruiter.id)}
                      className="flex-1 btn bg-purple-500 hover:bg-purple-600 text-white text-sm font-semibold"
                    >
                      📧 Me présenter
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-neutral-500 text-lg font-medium">Aucun recruteur trouvé</p>
            <p className="text-neutral-400 mt-2">Essayez de modifier vos critères de recherche</p>
          </div>
        )}

        {/* Modal de demande de contact */}
        {selectedRecruiter && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="card max-w-lg w-full p-6">
              <h3 className="text-xl font-bold mb-4">📧 Me présenter au recruteur</h3>
              <p className="text-sm text-neutral-600 mb-4">
                Écrivez un message de présentation pour vous démarquer. Parlez de vos compétences, votre
                expérience, et pourquoi vous souhaitez entrer en contact.
              </p>

              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Bonjour, je suis [Votre nom], joueur de basketball avec [X] années d'expérience. Je joue au poste de [Poste]. J'aimerais discuter d'opportunités avec votre organisation..."
                className="input w-full h-32 mb-4"
                maxLength={500}
              />

              <p className="text-xs text-neutral-500 mb-4">
                {contactMessage.length}/500 caractères
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedRecruiter(null);
                    setContactMessage('');
                  }}
                  className="flex-1 btn btn-secondary"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleSendContactRequest(selectedRecruiter)}
                  disabled={sendContactRequestMutation.isPending}
                  className="flex-1 btn btn-primary"
                >
                  {sendContactRequestMutation.isPending ? 'Envoi...' : '✓ Envoyer'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

