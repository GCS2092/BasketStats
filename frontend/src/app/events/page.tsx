'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import apiClient from '@/lib/api/client';
import NavigationBreadcrumb from '@/components/common/NavigationBreadcrumb';
import ElegantQuickNavigation from '@/components/common/ElegantQuickNavigation';
import Link from 'next/link';

type EventType = 'MATCH' | 'TRYOUT' | 'TRAINING_CAMP' | 'SHOWCASE' | 'TOURNAMENT';

interface Event {
  id: string;
  type: EventType;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location: string;
  city?: string;
  country?: string;
  club?: {
    id: string;
    name: string;
    logo?: string;
    city: string;
    country: string;
  };
  maxParticipants?: number;
  participants: string[];
  requirements?: string;
  registrationUrl?: string;
  featured: boolean;
}

const eventTypeLabels: Record<EventType, { label: string; icon: string; color: string }> = {
  MATCH: { label: 'Match', icon: '🏀', color: 'bg-blue-500' },
  TRYOUT: { label: 'Essai', icon: '🎯', color: 'bg-orange-500' },
  TRAINING_CAMP: { label: 'Stage', icon: '💪', color: 'bg-green-500' },
  SHOWCASE: { label: 'Showcase', icon: '⭐', color: 'bg-purple-500' },
  TOURNAMENT: { label: 'Tournoi', icon: '🏆', color: 'bg-red-500' },
};

export default function EventsPage() {
  const { data: session } = useSession();
  const [filterType, setFilterType] = useState<EventType | 'ALL'>('ALL');
  const [showOnlyUpcoming, setShowOnlyUpcoming] = useState(true);

  const { data: events, isLoading } = useQuery({
    queryKey: ['events', filterType, showOnlyUpcoming],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterType !== 'ALL') params.append('type', filterType);
      if (showOnlyUpcoming) params.append('upcoming', 'true');
      
      const response = await apiClient.get(`/events?${params.toString()}`);
      return response.data as Event[];
    },
  });

  const handleRegister = async (eventId: string) => {
    try {
      await apiClient.post(`/events/${eventId}/register`);
      alert('✅ Inscription réussie !');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de l\'inscription');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isEventPassed = (date: string) => {
    return new Date(date) < new Date();
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Navigation rapide élégante */}
      <ElegantQuickNavigation currentPage="/events" />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-8 sm:py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3">📅 Calendrier des Événements</h1>
          <p className="text-orange-100 text-sm sm:text-base md:text-lg">
            Matchs, tryouts, stages et tournois à venir
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Filtres</h2>

          {/* Type d'événement */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Type d'événement
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                  filterType === 'ALL'
                    ? 'bg-orange-500 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                Tous
              </button>
              {(Object.keys(eventTypeLabels) as EventType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                    filterType === type
                      ? eventTypeLabels[type].color + ' text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  <span className="hidden sm:inline">{eventTypeLabels[type].icon} </span>
                  {eventTypeLabels[type].label}
                </button>
              ))}
            </div>
          </div>

          {/* Période */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlyUpcoming}
                onChange={(e) => setShowOnlyUpcoming(e.target.checked)}
                className="w-5 h-5 text-orange-500 rounded"
              />
              <span className="text-sm font-medium text-neutral-700">
                Afficher uniquement les événements à venir
              </span>
            </label>
          </div>
        </div>

        {/* Liste des événements */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-neutral-600">Chargement des événements...</p>
          </div>
        ) : events && events.length > 0 ? (
          <div className="grid gap-6">
            {events.map((event) => {
              const typeInfo = eventTypeLabels[event.type];
              const isPassed = isEventPassed(event.startDate);
              const isFull = event.maxParticipants && event.participants.length >= event.maxParticipants;
              const isRegistered = session?.user?.id && event.participants.includes(session.user.id as string);

              return (
                <div
                  key={event.id}
                  className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
                    isPassed ? 'opacity-60' : ''
                  }`}
                >
                  {/* Badge featured */}
                  {event.featured && !isPassed && (
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 text-sm font-bold">
                      ⭐ ÉVÉNEMENT MIS EN AVANT
                    </div>
                  )}

                  <div className="p-4 sm:p-6">
                    {/* En-tête */}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 mb-4">
                      {/* Badge type */}
                      <div className={`${typeInfo.color} text-white px-3 sm:px-4 py-2 rounded-lg font-bold text-sm sm:text-lg flex items-center gap-2 shrink-0 w-fit`}>
                        <span>{typeInfo.icon}</span>
                        <span>{typeInfo.label}</span>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-800 mb-2">
                          {event.title}
                        </h3>

                        {/* Club organisateur */}
                        {event.club && (
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-neutral-600 mb-2">
                            <span className="font-medium text-sm sm:text-base">Organisé par :</span>
                            <Link 
                              href={`/clubs/${event.club.id}`}
                              className="text-orange-600 hover:text-orange-700 font-semibold text-sm sm:text-base"
                            >
                              {event.club.name}
                            </Link>
                            <span className="text-xs sm:text-sm">
                              ({event.club.city}, {event.club.country})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {event.description && (
                      <p className="text-neutral-600 mb-4 leading-relaxed">
                        {event.description}
                      </p>
                    )}

                    {/* Informations */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                      {/* Date */}
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="text-xl sm:text-2xl">📅</div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs sm:text-sm text-neutral-500">Date</div>
                          <div className="font-semibold text-neutral-800 text-sm sm:text-base">
                            {formatDate(event.startDate)}
                          </div>
                          {event.endDate && (
                            <div className="text-xs sm:text-sm text-neutral-600">
                              au {formatDate(event.endDate)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Lieu */}
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="text-xl sm:text-2xl">📍</div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs sm:text-sm text-neutral-500">Lieu</div>
                          <div className="font-semibold text-neutral-800 text-sm sm:text-base">
                            {event.location}
                          </div>
                          <div className="text-xs sm:text-sm text-neutral-600">
                            {event.city}, {event.country}
                          </div>
                        </div>
                      </div>

                      {/* Participants */}
                      {event.maxParticipants && (
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className="text-xl sm:text-2xl">👥</div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs sm:text-sm text-neutral-500">Participants</div>
                            <div className="font-semibold text-neutral-800 text-sm sm:text-base">
                              {event.participants.length} / {event.maxParticipants}
                            </div>
                            {isFull && (
                              <div className="text-xs sm:text-sm text-red-600 font-medium">
                                Complet
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Prérequis */}
                      {event.requirements && (
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className="text-xl sm:text-2xl">📋</div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs sm:text-sm text-neutral-500">Prérequis</div>
                            <div className="text-xs sm:text-sm text-neutral-700">
                              {event.requirements}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3 pt-4 border-t">
                      {!isPassed && session ? (
                        <>
                          {isRegistered ? (
                            <button className="btn bg-green-500 text-white hover:bg-green-600 text-sm sm:text-base">
                              ✅ Inscrit
                            </button>
                          ) : isFull ? (
                            <button className="btn bg-neutral-300 text-neutral-600 cursor-not-allowed text-sm sm:text-base" disabled>
                              Complet
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRegister(event.id)}
                              className="btn btn-primary text-sm sm:text-base"
                            >
                              ✓ S'inscrire
                            </button>
                          )}
                        </>
                      ) : !session ? (
                        <Link href="/auth/login" className="btn btn-primary text-sm sm:text-base">
                          Se connecter pour s'inscrire
                        </Link>
                      ) : (
                        <div className="text-neutral-500 text-xs sm:text-sm">
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
                          🔗 Inscription externe
                        </a>
                      )}

                      <Link
                        href={`/events/${event.id}`}
                        className="btn btn-secondary text-sm sm:text-base"
                      >
                        📄 Détails complets
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-bold text-neutral-800 mb-2">
              Aucun événement trouvé
            </h3>
            <p className="text-neutral-600">
              {filterType !== 'ALL'
                ? 'Essayez de changer les filtres'
                : 'Aucun événement n\'est programmé pour le moment'}
            </p>
          </div>
        )}

        {/* Bouton créer événement (recruteurs/admin) */}
        {session?.user?.role === 'RECRUITER' && (
          <div className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-50">
            <Link
              href="/events/create"
              className="btn btn-primary shadow-lg flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg"
            >
              <span className="text-lg sm:text-2xl">➕</span>
              <span className="hidden sm:inline">Créer un événement</span>
              <span className="sm:hidden">Créer</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

