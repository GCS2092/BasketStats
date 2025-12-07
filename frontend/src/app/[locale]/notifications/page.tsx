'use client';

import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import Header from '@/components/layout/Header';
import { Link } from '@/i18n/routing';
import { useAuthSync } from '@/hooks/useAuth';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

export const dynamic = 'force-dynamic';

export default function NotificationsPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  useAuthSync(); // Synchroniser tokens

  // Filtre local: 'all' | 'unread' | 'type:new_message' etc.
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Récupérer les notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await apiClient.get('/notifications');
      return response.data;
    },
    enabled: !!session,
  });

  // Marquer comme lue
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.put(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Marquer toutes comme lues
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return apiClient.put('/notifications/mark-all-read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Supprimer une notification
  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/notifications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Supprimer toutes les notifications
  const deleteAllNotificationsMutation = useMutation({
    mutationFn: async () => {
      return apiClient.delete('/notifications/all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Masquer une notification
  const hideNotificationMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.put(`/notifications/${id}/hide`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const unreadCount = notifications?.notifications?.filter((n: any) => !n.read).length || 0;

  // Grouper les notifications par date
  const groupedNotifications = useMemo(() => {
    const list = notifications?.notifications || [];
    const filtered = filter === 'unread' ? list.filter((n: any) => !n.read) : list;
    
    // Grouper par date
    const groups: { [key: string]: any[] } = {};
    filtered.forEach((notif: any) => {
      const notifDate = new Date(notif.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let dateKey = '';
      if (notifDate.toDateString() === today.toDateString()) {
        dateKey = 'Aujourd\'hui';
      } else if (notifDate.toDateString() === yesterday.toDateString()) {
        dateKey = 'Hier';
      } else {
        dateKey = notifDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
      }
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(notif);
    });
    
    return groups;
  }, [notifications?.notifications, filter]);

  const filteredNotifications = useMemo(() => {
    const list = notifications?.notifications || [];
    if (filter === 'unread') return list.filter((n: any) => !n.read);
    return list;
  }, [notifications?.notifications, filter]);

  return (
    <div className="min-h-screen bg-neutral-100">
      <Header />

      <main className="container-custom py-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">🔔 Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-neutral-600 mt-1">
                  {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                aria-label="Filtrer les notifications"
              >
                <option value="all">Toutes</option>
                <option value="unread">Non lues</option>
              </select>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 hover:border-blue-300 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>✓</span>
                  <span>Tout marquer comme lu</span>
                </button>
              )}
              {notifications?.notifications?.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm('Êtes-vous sûr de vouloir supprimer toutes les notifications ?')) {
                      deleteAllNotificationsMutation.mutate();
                    }
                  }}
                  disabled={deleteAllNotificationsMutation.isPending}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 hover:border-red-300 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>🗑️</span>
                  <span>Tout supprimer</span>
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : Object.keys(groupedNotifications).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(groupedNotifications).map(([dateLabel, notifs]) => (
                <div key={dateLabel}>
                  <h3 className="text-sm font-semibold text-neutral-500 mb-3 px-2">{dateLabel}</h3>
                  <div className="space-y-3">
                    {notifs.map((notif: any) => (
                      <div
                        key={notif.id}
                        className={`card-modern p-5 cursor-pointer hover:shadow-lg transition-all duration-200 ${
                          !notif.read ? 'border-l-4 border-l-primary bg-gradient-to-r from-primary-50 to-white' : ''
                        }`}
                        onClick={() => !notif.read && markAsReadMutation.mutate(notif.id)}
                      >
                  <div className="flex items-start gap-3">
                    {/* Icône selon le type */}
                    <div className="text-3xl flex-shrink-0">
                      {notif.type === 'new_message' && '💬'}
                      {notif.type === 'recruit_request' && '📧'}
                      {notif.type === 'new_follower' && '👥'}
                      {notif.type === 'post_like' && '❤️'}
                      {notif.type === 'post_comment' && '💭'}
                      {!['new_message', 'recruit_request', 'new_follower', 'post_like', 'post_comment'].includes(notif.type) && '🔔'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className={`font-semibold ${!notif.read ? 'text-primary' : 'text-neutral-800'}`}>
                          {notif.title}
                        </h3>
                        <span className="text-xs text-neutral-500 flex-shrink-0">
                          {new Date(notif.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-neutral-600 text-sm mt-1">{notif.message}</p>

                      {/* Actions selon le type */}
                      {notif.payload && (
                        <div className="mt-3">
                          {notif.type === 'recruit_request' && notif.payload.requestId && (
                            <Link href="/offers" className="text-sm text-primary hover:underline">
                              Voir l'offre →
                            </Link>
                          )}
                          {notif.type === 'new_follower' && notif.payload.userId && (
                            <Link
                              href={`/players/${notif.payload.userId}`}
                              className="text-sm text-primary hover:underline"
                            >
                              Voir le profil →
                            </Link>
                          )}
                          {notif.type === 'new_message' && notif.payload.conversationId && (
                            <Link href="/messages" className="text-sm text-primary hover:underline">
                              Voir le message →
                            </Link>
                          )}
                          {notif.type === 'post_like' && notif.payload.postId && (
                            <Link href="/feed" className="text-sm text-primary hover:underline">
                              Voir le post →
                            </Link>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions de la notification */}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {!notif.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsReadMutation.mutate(notif.id);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 border border-primary/30 hover:border-primary/50 px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-105"
                        >
                          <span>✓</span>
                          <span className="hidden sm:inline">Marquer lu</span>
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Masquer cette notification ?')) {
                            hideNotificationMutation.mutate(notif.id);
                          }
                        }}
                        className="inline-flex items-center gap-1 text-xs font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 hover:border-neutral-300 px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-105"
                      >
                        <span>👁️‍🗨️</span>
                        <span className="hidden sm:inline">Masquer</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Supprimer cette notification ?')) {
                            deleteNotificationMutation.mutate(notif.id);
                          }
                        }}
                        className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-105"
                      >
                        <span>🗑️</span>
                        <span className="hidden sm:inline">Supprimer</span>
                      </button>
                    </div>

                        {/* Indicateur non lu */}
                        {!notif.read && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"></div>
                        )}
                      </div>
                    </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <div className="text-6xl mb-4">🔔</div>
              <p className="text-neutral-500 text-lg">Aucune notification pour le moment</p>
              <p className="text-neutral-400 text-sm mt-2">
                Vous serez notifié des nouvelles offres, messages et interactions
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

