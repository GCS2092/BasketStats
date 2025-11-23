'use client';

import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import { useAuthSync } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function OffersPageContent() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  useAuthSync(); // Synchroniser tokens
  
  const isPlayer = session?.user?.role === 'PLAYER';
  const isRecruiter = session?.user?.role === 'RECRUITER';

  // Récupérer les offres reçues (joueur) ou envoyées (recruteur)
  const { data: offers, isLoading } = useQuery({
    queryKey: ['offers'],
    queryFn: async () => {
      const endpoint = isPlayer ? '/recruit/received' : '/recruit/sent';
      const response = await apiClient.get(endpoint);
      return response.data;
    },
    enabled: !!session,
  });

  // Mutation pour accepter/refuser une offre
  const updateOfferMutation = useMutation({
    mutationFn: async ({ id, status, recruiterId }: { id: string; status: string; recruiterId?: string }) => {
      const response = await apiClient.put(`/recruit/${id}/status`, { status });
      return { ...response.data, recruiterId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      
      // Si joueur accepte l'offre → Rediriger vers la conversation
      if (data.recruiterId && isPlayer) {
        setTimeout(() => {
          window.location.href = `/messages?userId=${data.recruiterId}`;
        }, 1500); // Délai de 1.5s pour voir le changement de statut
      }
    },
  });

  return (
    <div className="min-h-screen bg-neutral-100">
      <Header />

      <main className="container-custom py-6">
        <div className="max-w-4xl mx-auto">
          {/* En-tête selon le rôle */}
          <div className={`card p-6 mb-6 border-l-4 ${
            isRecruiter 
              ? 'border-l-purple-500 bg-purple-50' 
              : 'border-l-blue-500 bg-blue-50'
          }`}>
            <h1 className="text-3xl font-bold mb-2">
              {isPlayer ? '📨 Mes offres de recrutement' : '📤 Mes offres envoyées'}
            </h1>
            <p className="text-neutral-700">
              {isPlayer 
                ? 'Gérez les offres que vous avez reçues de recruteurs et clubs professionnels'
                : 'Suivez le statut de vos propositions envoyées aux joueurs'}
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : offers?.requests?.length > 0 ? (
            <div className="space-y-4">
              {offers.requests.map((offer: any) => (
                <div key={offer.id} className="card p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {/* De/À */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center">
                          {isPlayer ? (
                            offer.fromUser.avatarUrl ? (
                              <img
                                src={offer.fromUser.avatarUrl}
                                alt=""
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              '🔍'
                            )
                          ) : offer.toUser.avatarUrl ? (
                            <img
                              src={offer.toUser.avatarUrl}
                              alt=""
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            '🏀'
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold">
                            {isPlayer ? (
                              <Link
                                href={`/players/${offer.fromUserId}`}
                                className="hover:text-primary"
                              >
                                {offer.fromUser.fullName}
                              </Link>
                            ) : (
                              <Link
                                href={`/players/${offer.toUserId}`}
                                className="hover:text-primary"
                              >
                                {offer.toUser.fullName}
                              </Link>
                            )}
                          </h3>
                          <p className="text-sm text-neutral-600">
                            {new Date(offer.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Sujet et message */}
                      {offer.subject && (
                        <h4 className="font-semibold text-lg mb-2">{offer.subject}</h4>
                      )}
                      <p className="text-neutral-700 whitespace-pre-wrap">{offer.message}</p>

                      {/* Statut */}
                      <div className="mt-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            offer.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-700'
                              : offer.status === 'ACCEPTED'
                              ? 'bg-green-100 text-green-700'
                              : offer.status === 'REJECTED'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-neutral-100 text-neutral-700'
                          }`}
                        >
                          {offer.status === 'PENDING'
                            ? '⏳ En attente'
                            : offer.status === 'ACCEPTED'
                            ? '✓ Acceptée'
                            : offer.status === 'REJECTED'
                            ? '✗ Refusée'
                            : 'Fermée'}
                        </span>
                      </div>
                    </div>

                    {/* Actions pour joueur */}
                    {isPlayer && offer.status === 'PENDING' && (
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() =>
                            updateOfferMutation.mutate({ 
                              id: offer.id, 
                              status: 'ACCEPTED',
                              recruiterId: offer.fromUserId 
                            })
                          }
                          disabled={updateOfferMutation.isPending}
                          className="btn bg-green-500 hover:bg-green-600 text-white font-semibold text-sm shadow-lg"
                        >
                          {updateOfferMutation.isPending 
                            ? '⏳ Acceptation...' 
                            : '✓ Accepter l\'offre'}
                        </button>
                        <button
                          onClick={() =>
                            updateOfferMutation.mutate({ 
                              id: offer.id, 
                              status: 'REJECTED' 
                            })
                          }
                          disabled={updateOfferMutation.isPending}
                          className="btn bg-red-500 hover:bg-red-600 text-white font-semibold text-sm"
                        >
                          ✗ Refuser
                        </button>
                      </div>
                    )}
                    
                    {/* Message après acceptation */}
                    {isPlayer && offer.status === 'ACCEPTED' && (
                      <div className="ml-4 mt-2">
                        <Link
                          href={`/messages?userId=${offer.fromUserId}`}
                          className="text-sm text-green-600 hover:underline font-semibold"
                        >
                          💬 Continuer la discussion →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <div className="text-6xl mb-4">{isPlayer ? '📭' : '📤'}</div>
              <p className="text-neutral-500 text-lg">
                {isPlayer
                  ? 'Vous n\'avez reçu aucune offre pour le moment'
                  : 'Vous n\'avez envoyé aucune offre pour le moment'}
              </p>
              {!isPlayer && (
                <Link href="/players" className="btn btn-primary mt-4">
                  Rechercher des joueurs
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function OffersPage() {
  return (
    <ProtectedRoute requiresVerification={true} redirectTo="/feed">
      <OffersPageContent />
    </ProtectedRoute>
  );
}

