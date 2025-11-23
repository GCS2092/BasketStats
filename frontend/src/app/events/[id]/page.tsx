'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/api/client';
import NavigationBreadcrumb from '@/components/common/NavigationBreadcrumb';
import ElegantQuickNavigation from '@/components/common/ElegantQuickNavigation';
import Link from 'next/link';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const eventId = params.id as string;

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const response = await apiClient.get(`/events/${eventId}`);
      return response.data;
    },
  });

  const handleRegister = async () => {
    try {
      await apiClient.post(`/events/${eventId}/register`);
      alert('✅ Inscription réussie !');
      router.refresh();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de l\'inscription');
    }
  };

  const handleUnregister = async () => {
    try {
      await apiClient.delete(`/events/${eventId}/register`);
      alert('Désinscription réussie');
      router.refresh();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Chargement de l'événement...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-2">Événement non trouvé</h1>
          <Link href="/events" className="btn btn-primary mt-4">
            ← Retour aux événements
          </Link>
        </div>
      </div>
    );
  }

  const isPassed = new Date(event.startDate) < new Date();
  const isFull = event.maxParticipants && event.participants.length >= event.maxParticipants;
  const isRegistered = session?.user?.id && event.participants.includes(session.user.id);

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Navigation rapide élégante */}
      <ElegantQuickNavigation currentPage="/events" />
      
      {/* Breadcrumbs */}
      <NavigationBreadcrumb
        items={[
          { label: 'Événements', href: '/events', icon: '📅' },
          { label: event.title, icon: '🏀' }
        ]}
        backButtonText="Retour aux événements"
        backButtonHref="/events"
      />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-8 sm:py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">{event.title}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Informations principales */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
          {/* Type et statut */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
            <span className="px-3 sm:px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-semibold text-sm sm:text-base">
              {event.type}
            </span>
            {event.featured && (
              <span className="px-3 sm:px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-semibold text-sm sm:text-base">
                ⭐ Mis en avant
              </span>
            )}
            {isPassed && (
              <span className="px-3 sm:px-4 py-2 bg-neutral-100 text-neutral-600 rounded-lg font-semibold text-sm sm:text-base">
                Terminé
              </span>
            )}
            {isFull && !isPassed && (
              <span className="px-3 sm:px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold text-sm sm:text-base">
                Complet
              </span>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Description</h2>
              <p className="text-neutral-700 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                {event.description}
              </p>
            </div>
          )}

          {/* Détails */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
            {/* Date */}
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="text-2xl sm:text-3xl md:text-4xl">📅</div>
              <div className="min-w-0 flex-1">
                <div className="text-xs sm:text-sm text-neutral-500 font-medium">Date et heure</div>
                <div className="text-base sm:text-lg font-bold text-neutral-800">
                  {new Date(event.startDate).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
                <div className="text-neutral-600 text-sm sm:text-base">
                  {new Date(event.startDate).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
                {event.endDate && (
                  <div className="text-xs sm:text-sm text-neutral-500 mt-1">
                    Jusqu'au {new Date(event.endDate).toLocaleDateString('fr-FR')}
                  </div>
                )}
              </div>
            </div>

            {/* Lieu */}
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="text-2xl sm:text-3xl md:text-4xl">📍</div>
              <div className="min-w-0 flex-1">
                <div className="text-xs sm:text-sm text-neutral-500 font-medium">Localisation</div>
                <div className="text-base sm:text-lg font-bold text-neutral-800">
                  {event.location}
                </div>
                <div className="text-neutral-600 text-sm sm:text-base">
                  {event.city}, {event.country}
                </div>
                {event.club && (
                  <div className="text-xs sm:text-sm text-neutral-500 mt-1">
                    {event.club.name}
                  </div>
                )}
              </div>
            </div>

            {/* Participants */}
            {event.maxParticipants && (
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="text-2xl sm:text-3xl md:text-4xl">👥</div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs sm:text-sm text-neutral-500 font-medium">Participants</div>
                  <div className="text-base sm:text-lg font-bold text-neutral-800">
                    {event.participants.length} / {event.maxParticipants}
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-neutral-200 rounded-full h-2 sm:h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-orange-600 h-full transition-all duration-500"
                        style={{
                          width: `${(event.participants.length / event.maxParticipants) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Prérequis */}
            {event.requirements && (
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="text-2xl sm:text-3xl md:text-4xl">📋</div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs sm:text-sm text-neutral-500 font-medium">Prérequis</div>
                  <div className="text-neutral-700 text-sm sm:text-base">
                    {event.requirements}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3 pt-4 sm:pt-6 border-t">
            {!isPassed && session ? (
              <>
                {isRegistered ? (
                  <>
                    <button className="btn bg-green-500 text-white hover:bg-green-600 text-sm sm:text-base">
                      ✅ Vous êtes inscrit
                    </button>
                    <button
                      onClick={handleUnregister}
                      className="btn btn-secondary text-sm sm:text-base"
                    >
                      Se désinscrire
                    </button>
                  </>
                ) : isFull ? (
                  <button className="btn bg-neutral-300 text-neutral-600 cursor-not-allowed text-sm sm:text-base" disabled>
                    Complet
                  </button>
                ) : (
                  <button
                    onClick={handleRegister}
                    className="btn btn-primary text-sm sm:text-base px-4 sm:px-8"
                  >
                    ✓ S'inscrire à l'événement
                  </button>
                )}
              </>
            ) : !session ? (
              <Link href="/auth/login" className="btn btn-primary text-sm sm:text-base px-4 sm:px-8">
                Se connecter pour s'inscrire
              </Link>
            ) : (
              <div className="text-neutral-500 text-sm sm:text-base">
                Événement passé
              </div>
            )}

            {event.registrationUrl && (
              <a
                href={event.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary text-sm sm:text-base"
              >
                🔗 Lien d'inscription externe
              </a>
            )}
          </div>
        </div>

        {/* Club organisateur */}
        {event.club && (
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4">🏢 Club organisateur</h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              {event.club.logo && (
                <img src={event.club.logo} alt={event.club.name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover self-start" />
              )}
              <div className="min-w-0 flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-neutral-800">{event.club.name}</h3>
                <p className="text-neutral-600 text-sm sm:text-base">{event.club.city}, {event.club.country}</p>
                <Link
                  href={`/clubs/${event.club.id}`}
                  className="text-orange-600 hover:text-orange-700 font-semibold mt-2 inline-block text-sm sm:text-base"
                >
                  Voir le profil du club →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

