'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import apiClient from '@/lib/api/client';
import Header from '@/components/layout/Header';
import { useAuthSync } from '@/hooks/useAuth';
import VideoGallery from '@/components/player/VideoGallery';
import PhotoGallery from '@/components/player/PhotoGallery';
import StatsForm from '@/components/player/StatsForm';

export default function PlayerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const userId = params.id as string;
  const [showContactModal, setShowContactModal] = useState(false);
  
  useAuthSync(); // Synchroniser tokens

  const { data: profile, isLoading } = useQuery({
    queryKey: ['player-profile', userId],
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/players/${userId}/profile`);
        return response.data;
      } catch (error) {
        console.warn('Erreur API profil, utilisation des données mockées:', error);
        // Données mockées temporaires
        return {
          user: {
            id: userId,
            name: 'Joueur de Test',
            email: 'joueur@test.com',
            avatarUrl: null,
            role: 'PLAYER',
            verified: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          position: 'Point Guard',
          height: '185 cm',
          weight: '80 kg',
          age: 22,
          experience: '5 ans',
          nationality: 'Français',
          currentClub: 'Paris Basketball Academy',
          bio: 'Joueur passionné de basketball avec 5 ans d\'expérience. Spécialisé en point guard, je recherche de nouvelles opportunités pour développer ma carrière.',
          skills: ['Dribble', 'Passe', 'Tir à 3 points', 'Défense'],
          achievements: ['Champion régional 2023', 'Meilleur passeur de la saison'],
          videos: [],
          photos: [],
          stats: {
            pointsPerGame: 15.2,
            assistsPerGame: 8.1,
            reboundsPerGame: 4.3,
            stealsPerGame: 2.1
          }
        };
      }
    },
  });

  // Récupérer les stats du joueur
  const { data: stats } = useQuery({
    queryKey: ['user-stats', userId],
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/users/${userId}/stats`);
        return response.data;
      } catch (error) {
        console.warn('Erreur API stats, utilisation des données mockées:', error);
        // Stats mockées temporaires
        return {
          pointsPerGame: 15.2,
          assistsPerGame: 8.1,
          reboundsPerGame: 4.3,
          stealsPerGame: 2.1,
          blocksPerGame: 0.8,
          fieldGoalPercentage: 45.2,
          threePointPercentage: 38.5,
          freeThrowPercentage: 82.1
        };
      }
    },
    enabled: !!userId,
  });

  // Vérifier si on suit déjà ce joueur
  const { data: followStatus } = useQuery({
    queryKey: ['is-following', userId],
    queryFn: async () => {
      if (!session?.user?.id) return { isFollowing: false };
      try {
        const response = await apiClient.get(`/users/${session.user.id}/is-following/${userId}`);
        return response.data;
      } catch (error) {
        console.warn('Erreur API follow status, utilisation des données mockées:', error);
        return { isFollowing: false };
      }
    },
    enabled: !!session?.user?.id && session.user.id !== userId,
  });

  // Mutation pour follow/unfollow
  const followMutation = useMutation({
    mutationFn: async (action: 'follow' | 'unfollow') => {
      if (action === 'follow') {
        return apiClient.post(`/users/${userId}/follow`);
      } else {
        return apiClient.delete(`/users/${userId}/follow`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['is-following', userId] });
      queryClient.invalidateQueries({ queryKey: ['user-stats', userId] });
    },
  });

  const isOwnProfile = session?.user?.id === userId;
  const isRecruiter = session?.user?.role === 'RECRUITER';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-neutral-100">
        <Header />
        <div className="container-custom py-12 text-center">
          <h1 className="text-2xl font-bold">Profil introuvable</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <Header />

      <main className="container-custom py-6">
        {/* Hero Section */}
        <div className="card overflow-hidden mb-6">
          <div className="h-32 sm:h-40 md:h-48 gradient-primary"></div>
          <div className="px-4 sm:px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-12 sm:-mt-16 mb-4">
              {/* Photo de profil */}
              <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border-4 border-white bg-neutral-200 flex items-center justify-center text-2xl sm:text-3xl md:text-4xl mx-auto sm:mx-0 mb-4 sm:mb-0">
                {profile.user.avatarUrl ? (
                  <img src={profile.user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  '👤'
                )}
              </div>
              
              {/* Informations principales */}
              <div className="w-full sm:ml-6 sm:flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 mb-2">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-800 break-words">{profile.user.fullName}</h1>
                  {profile.certified && (
                    <span className="w-6 h-6 sm:w-7 sm:h-7 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm shrink-0" title="Profil vérifié">
                      ✓
                    </span>
                  )}
                </div>
                
                {profile.nickname && (
                  <p className="text-base sm:text-lg md:text-xl text-neutral-600 mb-3">"{profile.nickname}"</p>
                )}
                
                {/* Stats */}
                <div className="flex justify-center sm:justify-start gap-4 sm:gap-6 text-sm mb-4">
                  <div>
                    <span className="font-bold text-neutral-800">{stats?.followersCount || 0}</span>{' '}
                    <span className="text-neutral-600">abonnés</span>
                  </div>
                  <div>
                    <span className="font-bold text-neutral-800">{stats?.followingCount || 0}</span>{' '}
                    <span className="text-neutral-600">abonnements</span>
                  </div>
                  <div>
                    <span className="font-bold text-neutral-800">{stats?.postsCount || 0}</span>{' '}
                    <span className="text-neutral-600">posts</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions - Layout responsive */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {isOwnProfile ? (
                <button
                  onClick={() => router.push('/profile')}
                  className="btn btn-secondary w-full sm:w-auto"
                >
                  ✏️ Modifier le profil
                </button>
              ) : (
                <>
                  {isRecruiter ? (
                    /* Actions pour RECRUTEUR */
                    <>
                      <button
                        onClick={() => setShowContactModal(true)}
                        className="btn bg-purple-500 hover:bg-purple-600 text-white font-semibold shadow-lg w-full sm:w-auto"
                      >
                        📧 Envoyer une offre
                      </button>
                      <button
                        onClick={() => router.push(`/messages?userId=${userId}`)}
                        className="btn bg-purple-100 text-purple-700 border-2 border-purple-300 font-semibold w-full sm:w-auto"
                      >
                        💬 Discuter
                      </button>
                      <button
                        onClick={() => followMutation.mutate(followStatus?.isFollowing ? 'unfollow' : 'follow')}
                        disabled={followMutation.isPending}
                        className={`btn w-full sm:w-auto ${
                          followStatus?.isFollowing 
                            ? 'bg-purple-200 text-purple-800 border-2 border-purple-400' 
                            : 'btn-secondary'
                        }`}
                      >
                        {followMutation.isPending
                          ? '...'
                          : followStatus?.isFollowing
                          ? '⭐ Favori'
                          : '+ Suivre'}
                      </button>
                    </>
                  ) : (
                    /* Actions pour JOUEUR */
                    <>
                      <button
                        onClick={() => followMutation.mutate(followStatus?.isFollowing ? 'unfollow' : 'follow')}
                        disabled={followMutation.isPending}
                        className={`btn w-full sm:w-auto ${
                          followStatus?.isFollowing 
                            ? 'bg-blue-200 text-blue-800 border-2 border-blue-400' 
                            : 'bg-blue-500 hover:bg-blue-600 text-white font-semibold'
                        }`}
                      >
                        {followMutation.isPending
                          ? '...'
                          : followStatus?.isFollowing
                          ? '✓ Abonné'
                          : '+ Suivre'}
                      </button>
                      <button
                        onClick={() => router.push(`/messages?userId=${userId}`)}
                        className="btn btn-primary font-semibold w-full sm:w-auto"
                      >
                        💬 Envoyer un message
                      </button>
                    </>
                  )}
                </>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center p-4 bg-neutral-50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{profile.heightCm || '-'}</div>
                <div className="text-sm text-neutral-600">Taille (cm)</div>
              </div>
              <div className="text-center p-4 bg-neutral-50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{profile.position || '-'}</div>
                <div className="text-sm text-neutral-600">Poste</div>
              </div>
              <div className="text-center p-4 bg-neutral-50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{profile.level || '-'}</div>
                <div className="text-sm text-neutral-600">Niveau</div>
              </div>
              <div className="text-center p-4 bg-neutral-50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{profile.currentClub || '-'}</div>
                <div className="text-sm text-neutral-600">Club</div>
              </div>
            </div>

            {/* Bio */}
            {profile.user.bio && (
              <div className="mt-6">
                <h3 className="font-bold mb-2">À propos</h3>
                <p className="text-neutral-700">{profile.user.bio}</p>
              </div>
            )}

            {/* Stats */}
            {profile.stats && (
              <div className="mt-6">
                <h3 className="font-bold mb-4">Statistiques</h3>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                  {Object.entries(profile.stats.season2023 || {}).map(([key, value]) => (
                    <div key={key} className="text-center p-3 bg-primary-50 rounded-lg">
                      <div className="text-xl font-bold text-primary">{value as string}</div>
                      <div className="text-xs text-neutral-600 uppercase">{key.replace('_', ' ')}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CV Link */}
            {profile.cvLink && (
              <div className="mt-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">CV en ligne disponible</p>
                      <p className="text-xs text-blue-600">Cliquez pour consulter le CV complet</p>
                    </div>
                    <div className="flex-shrink-0">
                      <a
                        href={profile.cvLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Consulter le CV
                      </a>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-blue-500 truncate">
                      {profile.cvLink}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Achievements */}
            {profile.achievements?.length > 0 && (
              <div className="mt-6">
                <h3 className="font-bold mb-2">Réalisations</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.achievements.map((achievement: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-accent-100 text-accent-700 rounded-full text-sm">
                      🏆 {achievement}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats section (si profil personnel) */}
        {isOwnProfile && (
          <StatsForm userId={userId} currentStats={profile.stats} />
        )}

        {/* Galerie photos */}
        <PhotoGallery userId={userId} isOwnProfile={isOwnProfile} />

        {/* Vidéos section */}
        <VideoGallery userId={userId} isOwnProfile={isOwnProfile} />
      </main>

      {/* Modal d'envoi d'offre (recruteur) */}
      {showContactModal && isRecruiter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Envoyer une offre de recrutement</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                try {
                  await apiClient.post('/recruit', {
                    toUserId: userId,
                    subject: formData.get('subject'),
                    message: formData.get('message'),
                  });
                  setShowContactModal(false);
                  alert('Offre envoyée avec succès !');
                } catch (error) {
                  console.error('Erreur:', error);
                  alert('Erreur lors de l\'envoi de l\'offre');
                }
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="label">Objet</label>
                  <input
                    type="text"
                    name="subject"
                    required
                    placeholder="Ex: Opportunité club professionnel"
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Message</label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    placeholder="Présentez votre offre..."
                    className="input"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary flex-1">
                  Envoyer l'offre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

