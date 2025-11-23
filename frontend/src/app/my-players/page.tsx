'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import { useAuthSync } from '@/hooks/useAuth';

export default function MyPlayersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  useAuthSync();

  const isRecruiter = session?.user?.role === 'RECRUITER';

  // Rediriger si pas recruteur
  if (session && !isRecruiter) {
    router.push('/feed');
    return null;
  }

  // Récupérer les joueurs qui ont accepté mes offres
  const { data, isLoading } = useQuery({
    queryKey: ['my-players'],
    queryFn: async () => {
      const response = await apiClient.get('/recruit/my-players');
      return response.data;
    },
    enabled: !!session && isRecruiter,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <Header />

      <main className="container-custom py-6">
        <div className="max-w-6xl mx-auto">
          {/* En-tête recruteur */}
          <div className="card p-6 mb-6 border-l-4 border-l-purple-500 bg-purple-50">
            <h1 className="text-3xl font-bold mb-2">⭐ Mes joueurs</h1>
            <p className="text-neutral-700">
              Joueurs qui ont accepté vos offres de recrutement. Vous avez accès à leurs coordonnées pour finaliser le recrutement.
            </p>
          </div>

          {data?.players?.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.players.map((player: any) => (
                <div key={player.id} className="card p-6 border-2 border-purple-200 hover:shadow-xl transition-all">
                  {/* Badge "Accepté" */}
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold border-2 border-green-300">
                      ✓ Offre acceptée
                    </span>
                    <span className="text-xs text-neutral-500">
                      {new Date(player.acceptedAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>

                  {/* Info joueur */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-blue-100 border-2 border-blue-300 flex items-center justify-center text-2xl flex-shrink-0">
                      {player.avatarUrl ? (
                        <img
                          src={player.avatarUrl}
                          alt=""
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        '🏀'
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg truncate">{player.fullName}</h3>
                      {player.playerProfile?.currentClub && (
                        <p className="text-sm text-neutral-600 truncate">
                          📍 {player.playerProfile.currentClub}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Infos de contact */}
                  <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-xs text-neutral-500 mb-1">Coordonnées :</p>
                    <p className="text-sm font-mono font-semibold text-purple-700">
                      📧 {player.email}
                    </p>
                  </div>

                  {/* Stats rapides */}
                  {player.playerProfile && (
                    <div className="grid grid-cols-3 gap-2 text-center text-sm mb-4">
                      <div>
                        <div className="font-bold text-neutral-800">
                          {player.playerProfile.heightCm ? `${player.playerProfile.heightCm}cm` : '-'}
                        </div>
                        <div className="text-neutral-500 text-xs">Taille</div>
                      </div>
                      <div>
                        <div className="font-bold text-neutral-800">
                          {player.playerProfile.position || '-'}
                        </div>
                        <div className="text-neutral-500 text-xs">Poste</div>
                      </div>
                      <div>
                        <div className="font-bold text-neutral-800">
                          {player.playerProfile.level || '-'}
                        </div>
                        <div className="text-neutral-500 text-xs">Niveau</div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/players/${player.id}`}
                      className="flex-1 btn btn-secondary text-sm text-center"
                    >
                      👁️ Profil
                    </Link>
                    <Link
                      href={`/messages?userId=${player.id}`}
                      className="flex-1 btn bg-purple-500 hover:bg-purple-600 text-white text-sm font-semibold text-center"
                    >
                      💬 Discuter
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <div className="text-6xl mb-4">⭐</div>
              <p className="text-neutral-500 text-lg mb-2">
                Aucun joueur n'a encore accepté vos offres
              </p>
              <p className="text-neutral-400 text-sm mb-6">
                Recherchez des talents et envoyez-leur des offres de recrutement
              </p>
              <Link href="/players" className="btn bg-purple-500 hover:bg-purple-600 text-white font-semibold">
                🔍 Rechercher des joueurs
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

