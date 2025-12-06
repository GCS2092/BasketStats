'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import apiClient from '@/lib/api/client';
import NavigationBreadcrumb from '@/components/common/NavigationBreadcrumb';
import ElegantQuickNavigation from '@/components/common/ElegantQuickNavigation';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export const dynamic = 'force-dynamic';

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

export default function EventsPage() {
  const { data: session } = useSession();
  const t = useTranslations();
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
      alert(t('events.registrationSuccess'));
    } catch (error: any) {
      alert(error.response?.data?.message || t('events.registrationError'));
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(t('common.locale'), {
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

  const eventTypeLabels: Record<EventType, { label: string; icon: string; color: string }> = {
    MATCH: { label: t('events.types.match'), icon: '🏀', color: 'bg-blue-500' },
    TRYOUT: { label: t('events.types.tryout'), icon: '🎯', color: 'bg-orange-500' },
    TRAINING_CAMP: { label: t('events.types.trainingCamp'), icon: '💪', color: 'bg-green-500' },
    SHOWCASE: { label: t('events.types.showcase'), icon: '⭐', color: 'bg-purple-500' },
    TOURNAMENT: { label: t('events.types.tournament'), icon: '🏆', color: 'bg-red-500' },
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <ElegantQuickNavigation currentPage="/events" />
      
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-8 sm:py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3">📅 {t('events.title')}</h1>
          <p className="text-orange-100 text-sm sm:text-base md:text-lg">
            {t('events.subtitle')}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">{t('events.filters')}</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              {t('events.eventType')}
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
                {t('events.all')}
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

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlyUpcoming}
                onChange={(e) => setShowOnlyUpcoming(e.target.checked)}
                className="w-5 h-5 text-orange-500 rounded"
              />
              <span className="text-sm font-medium text-neutral-700">
                {t('events.showOnlyUpcoming')}
              </span>
            </label>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-neutral-600">{t('events.loading')}</p>
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
                  {event.featured && !isPassed && (
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 text-sm font-bold">
                      ⭐ {t('events.featured')}
                    </div>
                  )}

                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 mb-4">
                      <div className={`${typeInfo.color} text-white px-3 sm:px-4 py-2 rounded-lg font-bold text-sm sm:text-lg flex items-center gap-2 shrink-0 w-fit`}>
                        <span>{typeInfo.icon}</span>
                        <span>{typeInfo.label}</span>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-800 mb-2">
                          {event.title}
                        </h3>

                        {event.club && (
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-neutral-600 mb-2">
                            <span className="font-medium text-sm sm:text-base">{t('events.organizedBy')}:</span>
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

                    {event.description && (
                      <p className="text-neutral-600 mb-4 leading-relaxed">
                        {event.description}
                      </p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="text-xl sm:text-2xl">📅</div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs sm:text-sm text-neutral-500">{t('events.date')}</div>
                          <div className="font-semibold text-neutral-800 text-sm sm:text-base">
                            {formatDate(event.startDate)}
                          </div>
                          {event.endDate && (
                            <div className="text-xs sm:text-sm text-neutral-600">
                              {t('events.to')} {formatDate(event.endDate)}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="text-xl sm:text-2xl">📍</div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs sm:text-sm text-neutral-500">{t('events.location')}</div>
                          <div className="font-semibold text-neutral-800 text-sm sm:text-base">
                            {event.location}
                          </div>
                          <div className="text-xs sm:text-sm text-neutral-600">
                            {event.city}, {event.country}
                          </div>
                        </div>
                      </div>

                      {event.maxParticipants && (
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className="text-xl sm:text-2xl">👥</div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs sm:text-sm text-neutral-500">{t('events.participants')}</div>
                            <div className="font-semibold text-neutral-800 text-sm sm:text-base">
                              {event.participants.length} / {event.maxParticipants}
                            </div>
                            {isFull && (
                              <div className="text-xs sm:text-sm text-red-600 font-medium">
                                {t('events.full')}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {event.requirements && (
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className="text-xl sm:text-2xl">📋</div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs sm:text-sm text-neutral-500">{t('events.requirements')}</div>
                            <div className="text-xs sm:text-sm text-neutral-700">
                              {event.requirements}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3 pt-4 border-t">
                      {!isPassed && session ? (
                        <>
                          {isRegistered ? (
                            <button className="btn bg-green-500 text-white hover:bg-green-600 text-sm sm:text-base">
                              ✅ {t('events.registered')}
                            </button>
                          ) : isFull ? (
                            <button className="btn bg-neutral-300 text-neutral-600 cursor-not-allowed text-sm sm:text-base" disabled>
                              {t('events.full')}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRegister(event.id)}
                              className="btn btn-primary text-sm sm:text-base"
                            >
                              ✓ {t('events.register')}
                            </button>
                          )}
                        </>
                      ) : !session ? (
                        <Link href="/auth/login" className="btn btn-primary text-sm sm:text-base">
                          {t('events.loginToRegister')}
                        </Link>
                      ) : (
                        <div className="text-neutral-500 text-xs sm:text-sm">
                          {t('events.passed')}
                        </div>
                      )}

                      {event.registrationUrl && (
                        <a
                          href={event.registrationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary text-sm sm:text-base"
                        >
                          🔗 {t('events.externalRegistration')}
                        </a>
                      )}

                      <Link
                        href={`/events/${event.id}`}
                        className="btn btn-secondary text-sm sm:text-base"
                      >
                        📄 {t('events.fullDetails')}
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
              {t('events.noEvents')}
            </h3>
            <p className="text-neutral-600">
              {filterType !== 'ALL'
                ? t('events.tryFilters')
                : t('events.noEventsScheduled')}
            </p>
          </div>
        )}

        {session?.user?.role === 'RECRUITER' && (
          <div className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-50">
            <Link
              href="/events/create"
              className="btn btn-primary shadow-lg flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg"
            >
              <span className="text-lg sm:text-2xl">➕</span>
              <span className="hidden sm:inline">{t('events.createEvent')}</span>
              <span className="sm:hidden">{t('events.create')}</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

