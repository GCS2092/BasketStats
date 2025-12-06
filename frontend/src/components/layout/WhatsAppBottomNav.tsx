'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { useNotifications } from '@/contexts/NotificationContext';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  roles: string[];
  requiresVerification?: boolean;
}

export default function WhatsAppBottomNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { unreadCount } = useNotifications();

  // Récupérer le nombre de notifications non lues
  const { data: notifData } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: async () => {
      const response = await apiClient.get('/notifications?unreadOnly=true');
      return response.data;
    },
    enabled: !!session,
    refetchInterval: 30000,
  });

  const unreadNotifications = notifData?.notifications?.length || unreadCount;

  // Pages où la barre de navigation ne doit pas s'afficher
  const hiddenPages = [
    '/auth/login',
    '/auth/register',
    '/auth/signup',
    '/auth/error',
    '/auth/verify-email',
    '/auth/validation-pending',
  ];

  // Ne pas afficher sur les pages admin (elles ont leur propre sidebar)
  if (pathname.startsWith('/admin') && session?.user?.role === 'ADMIN') {
    return null;
  }

  if (hiddenPages.some(page => pathname.startsWith(page))) {
    return null;
  }

  // Navigation items selon les rôles
  const getNavigationItems = (): NavItem[] => {
    if (!session?.user) {
      // Navigation publique (visiteurs non connectés) - seulement 2 boutons sur la page d'accueil
      if (pathname === '/' || pathname.startsWith('/?')) {
        return [
          { href: '/?tab=news', label: 'Actualités', icon: '📰', roles: ['GUEST'] },
          { href: '/?tab=scores', label: 'Matchs', icon: '🏀', roles: ['GUEST'] },
        ];
      }
      // Sur les autres pages, pas de navigation (redirection vers login)
      return [];
    }

    const user = session.user;
    const isVerified = user.verified;

    // Navigation pour PLAYER
    if (user.role === 'PLAYER') {
      return [
        { href: '/feed', label: 'Feed', icon: '📰', roles: ['PLAYER'] },
        { href: '/players', label: 'Joueurs', icon: '👥', roles: ['PLAYER'] },
        { href: '/messages', label: 'Messages', icon: '💬', roles: ['PLAYER'] },
        { href: '/notifications', label: 'Notifications', icon: '🔔', roles: ['PLAYER'] },
        { href: `/players/${user.id}`, label: 'Profil', icon: '👤', roles: ['PLAYER'] },
      ];
    }

    // Navigation pour RECRUITER
    if (user.role === 'RECRUITER') {
      if (!isVerified) {
        // Recruteur non vérifié - navigation limitée
        return [
          { href: '/feed', label: 'Feed', icon: '📰', roles: ['RECRUITER'] },
          { href: '/players', label: 'Joueurs', icon: '👥', roles: ['RECRUITER'] },
          { href: '/messages', label: 'Messages', icon: '💬', roles: ['RECRUITER'] },
          { href: '/notifications', label: 'Notifications', icon: '🔔', roles: ['RECRUITER'] },
          { href: `/players/${user.id}`, label: 'Profil', icon: '👤', roles: ['RECRUITER'] },
        ];
      }

      // Recruteur vérifié - navigation complète
      return [
        { href: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['RECRUITER'], requiresVerification: true },
        { href: '/players', label: 'Joueurs', icon: '👥', roles: ['RECRUITER'] },
        { href: '/messages', label: 'Messages', icon: '💬', roles: ['RECRUITER'] },
        { href: '/notifications', label: 'Notifications', icon: '🔔', roles: ['RECRUITER'] },
        { href: `/players/${user.id}`, label: 'Profil', icon: '👤', roles: ['RECRUITER'] },
      ];
    }

    // Navigation pour ADMIN
    if (user.role === 'ADMIN') {
      return [
        { href: '/admin', label: 'Admin', icon: '🛡️', roles: ['ADMIN'] },
        { href: '/admin/users', label: 'Utilisateurs', icon: '👥', roles: ['ADMIN'] },
        { href: '/messages', label: 'Messages', icon: '💬', roles: ['ADMIN'] },
        { href: '/notifications', label: 'Notifications', icon: '🔔', roles: ['ADMIN'] },
        { href: `/players/${user.id}`, label: 'Profil', icon: '👤', roles: ['ADMIN'] },
      ];
    }

    // Par défaut
    return [
      { href: '/feed', label: 'Feed', icon: '📰', roles: ['*'] },
      { href: '/players', label: 'Joueurs', icon: '👥', roles: ['*'] },
      { href: '/messages', label: 'Messages', icon: '💬', roles: ['*'] },
      { href: '/notifications', label: 'Notifications', icon: '🔔', roles: ['*'] },
      { href: `/players/${user.id}`, label: 'Profil', icon: '👤', roles: ['*'] },
    ];
  };

  const navigationItems = getNavigationItems();

  // Filtrer les items selon les permissions
  const allowedItems = navigationItems.filter(item => {
    if (!session?.user) {
      // Pour les visiteurs, seulement sur la page d'accueil
      if (pathname === '/' || pathname.startsWith('/?')) {
        return item.roles.includes('GUEST');
      }
      return false;
    }

    const user = session.user;
    
    // Vérifier le rôle
    if (!item.roles.includes(user.role) && !item.roles.includes('*')) {
      return false;
    }
    
    // Vérifier la validation si nécessaire
    if (item.requiresVerification && !user.verified) {
      return false;
    }
    
    return true;
  });

  // Si aucun item n'est autorisé, ne pas afficher la barre
  if (allowedItems.length === 0) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] md:hidden">
      <div className="flex items-center justify-around h-16 px-2 safe-area-bottom">
        {allowedItems.map((item) => {
          // Détection de la page active
          let isActive = false;
          if (item.href === pathname) {
            isActive = true;
          } else if (item.href === '/?tab=news' && (pathname === '/' || pathname.startsWith('/?tab=news') || (pathname === '/' && !pathname.includes('tab=scores')))) {
            isActive = true;
          } else if (item.href === '/?tab=scores' && pathname.includes('tab=scores')) {
            isActive = true;
          } else if (item.href === '/notifications' && pathname.startsWith('/notifications')) {
            isActive = true;
          } else if (item.href === '/messages' && pathname.startsWith('/messages')) {
            isActive = true;
          } else if (item.href.startsWith('/players/') && pathname.startsWith('/players/')) {
            // Vérifier si c'est le même utilisateur
            const itemUserId = item.href.split('/players/')[1];
            const pathUserId = pathname.split('/players/')[1]?.split('/')[0];
            if (itemUserId === pathUserId) {
              isActive = true;
            }
          } else if (item.href === '/feed' && (pathname === '/feed')) {
            isActive = true;
          } else if (item.href === '/dashboard' && pathname.startsWith('/dashboard')) {
            isActive = true;
          } else if (item.href === '/admin' && pathname.startsWith('/admin')) {
            isActive = true;
          }
          
          const showBadge = item.href === '/notifications' && unreadNotifications > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full min-w-0 px-1 transition-all duration-200 ${
                isActive
                  ? 'text-primary'
                  : 'text-neutral-500 active:text-primary'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <span className="text-2xl">{item.icon}</span>
                {showBadge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 font-medium truncate w-full text-center ${
                isActive ? 'text-primary' : 'text-neutral-500'
              }`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-primary rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

