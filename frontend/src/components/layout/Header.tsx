'use client';

import { useState } from 'react';
import { Link } from '@/i18n/routing';
import { useSession, signOut } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { useNotifications } from '@/contexts/NotificationContext';
import SimpleNavigation from '@/components/common/SimpleNavigation';
import PersistentLogoutButton from '@/components/common/PersistentLogoutButton';
import AnimatedLogo from '@/components/common/AnimatedLogo';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';

export default function Header() {
  const { data: session } = useSession();
  const { unreadCount } = useNotifications();

  // Récupérer le nombre de notifications non lues
  const { data: notifData } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: async () => {
      const response = await apiClient.get('/notifications?unreadOnly=true');
      return response.data;
    },
    enabled: !!session,
    refetchInterval: 30000, // Refresh toutes les 30 secondes
  });

  const unreadNotifications = notifData?.notifications?.length || unreadCount;

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-50 shadow-sm">
      <div className="container-custom">
        <div className="flex items-center justify-between h-14 md:h-16">
          <Link href="/feed" className="flex-shrink-0">
            <AnimatedLogo />
          </Link>

          {/* Menu desktop uniquement (le hamburger est remplacé par la barre flottante) */}
          <SimpleNavigation type="desktop" />

          {/* Sélecteur de langue */}
          <div className="hidden md:flex">
            <LanguageSwitcher />
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {session?.user && (
              <>
                {/* Badge de rôle visible uniquement desktop */}
                <div className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border-2 ${
                  session.user.role === 'RECRUITER' 
                    ? 'bg-purple-50 border-purple-300 text-purple-700' 
                    : 'bg-blue-50 border-blue-300 text-blue-700'
                }`}>
                  <span className="text-base">
                    {session.user.role === 'RECRUITER' ? '🔍' : '🏀'}
                  </span>
                  <span className="font-semibold text-xs">
                    {session.user.role === 'RECRUITER' ? 'Recruteur' : 'Joueur'}
                  </span>
                </div>

                {/* Avatar plus visible sur mobile */}
                <Link href={`/players/${session.user.id}`} className="flex items-center gap-1.5 md:gap-2">
                  <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm border-2 flex-shrink-0 ${
                    session.user.role === 'RECRUITER'
                      ? 'bg-purple-100 border-purple-300'
                      : 'bg-blue-100 border-blue-300'
                  }`}>
                    {session.user.image ? (
                      <img src={session.user.image} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      session.user.name?.[0] || '👤'
                    )}
                  </div>
                  <span className="hidden sm:block font-medium text-sm md:text-base truncate max-w-[100px] md:max-w-none">{session.user.name}</span>
                </Link>

                {/* Bouton de déconnexion visible sur tous les écrans */}
                <PersistentLogoutButton 
                  variant="icon"
                  className="flex items-center justify-center"
                />
              </>
            )}
          </div>
        </div>

        {/* Menu mobile (dropdown) */}
      </div>
    </header>
  );
}

