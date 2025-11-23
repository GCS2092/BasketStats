'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import PersistentLogoutButton from '@/components/common/PersistentLogoutButton';
import IconDisplay from '@/components/common/IconDisplay';
import { useLogoAnimation } from '@/contexts/LogoAnimationContext';

interface ElegantHamburgerMenuProps {
  unreadNotifications?: number;
}

export default function ElegantHamburgerMenu({ unreadNotifications = 0 }: ElegantHamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();
  const { triggerLogoSpin } = useLogoAnimation();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);
  
  const handleNavigationClick = () => {
    triggerLogoSpin();
    closeMenu();
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    if (!session?.user) {
      return [
        { href: '/feed', label: 'Feed', icon: '📰', description: 'Actualités' },
        { href: '/players', label: 'Joueurs', icon: '👥', description: 'Découvrir les talents' },
        { href: '/clubs', label: 'Clubs', icon: '🏢', description: 'Équipes et organisations' },
        { href: '/events', label: 'Événements', icon: '📅', description: 'Compétitions et tryouts' },
      ];
    }

    const user = session.user;
    const baseItems = [
      { href: '/feed', label: 'Feed', icon: '📰', description: 'Actualités' },
      { href: '/players', label: 'Joueurs', icon: '👥', description: 'Découvrir les talents' },
      { href: '/clubs', label: 'Clubs', icon: '🏢', description: 'Équipes et organisations' },
      { href: '/events', label: 'Événements', icon: '📅', description: 'Compétitions et tryouts' },
    ];

    if (user.role === 'RECRUITER') {
      return [
        { href: '/dashboard', label: 'Dashboard', icon: '📊', description: 'Tableau de bord' },
        { href: '/my-players', label: 'Mes joueurs', icon: '⭐', description: 'Joueurs suivis' },
        { href: '/formations', label: 'Formations', icon: '🏀', description: 'Gérer les formations' },
        ...baseItems,
        { href: '/offers', label: 'Offres', icon: '📧', description: 'Gérer les offres' },
        { href: '/messages', label: 'Messages', icon: '💬', description: 'Conversations' },
        { href: '/notifications', label: 'Notifications', icon: '🔔', description: 'Alertes et mises à jour' },
        { href: '/profile', label: 'Profil', icon: '👤', description: 'Mon profil' },
      ];
    }

    if (user.role === 'PLAYER') {
      return [
        ...baseItems,
        { href: '/recruiters', label: 'Recruteurs', icon: '🔍', description: 'Découvrir les recruteurs' },
        { href: '/offers', label: 'Offres', icon: '📧', description: 'Mes offres' },
        { href: '/messages', label: 'Messages', icon: '💬', description: 'Conversations' },
        { href: '/notifications', label: 'Notifications', icon: '🔔', description: 'Alertes et mises à jour' },
        { href: '/profile', label: 'Profil', icon: '👤', description: 'Mon profil' },
      ];
    }

    if (user.role === 'ADMIN') {
      return [
        { href: '/admin', label: 'Dashboard Admin', icon: '🛡️', description: 'Tableau de bord admin' },
        { href: '/admin/users', label: 'Utilisateurs', icon: '👥', description: 'Gestion des comptes' },
        { href: '/admin/clubs', label: 'Clubs', icon: '🏢', description: 'Approbation des clubs' },
        { href: '/admin/posts', label: 'Posts', icon: '📝', description: 'Modération des contenus' },
        { href: '/admin/reports', label: 'Signalements', icon: '🚨', description: 'Traitement des rapports' },
        { href: '/admin/moderation-alerts', label: 'Modération Auto', icon: '🛡️', description: 'Alertes automatiques' },
        { href: '/admin/stats', label: 'Statistiques', icon: '📊', description: 'Analyses détaillées' },
        ...baseItems,
        { href: '/messages', label: 'Messages', icon: '💬', description: 'Conversations' },
        { href: '/notifications', label: 'Notifications', icon: '🔔', description: 'Alertes et mises à jour' },
        { href: '/profile', label: 'Profil', icon: '👤', description: 'Mon profil' },
      ];
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="md:hidden relative group p-3 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 active:scale-95"
        aria-label="Menu principal"
      >
        <div className="relative w-6 h-6">
          {/* Animated hamburger lines */}
          <span
            className={`absolute top-0 left-0 w-6 h-0.5 bg-gray-800 rounded-full transition-all duration-300 ease-in-out ${
              isOpen ? 'rotate-45 translate-y-2.5' : 'translate-y-0'
            }`}
          />
          <span
            className={`absolute top-2.5 left-0 w-6 h-0.5 bg-gray-800 rounded-full transition-all duration-300 ease-in-out ${
              isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
            }`}
          />
          <span
            className={`absolute top-5 left-0 w-6 h-0.5 bg-gray-800 rounded-full transition-all duration-300 ease-in-out ${
              isOpen ? '-rotate-45 -translate-y-2.5' : 'translate-y-0'
            }`}
          />
        </div>

        {/* Notification badge */}
        {unreadNotifications > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
            {unreadNotifications > 9 ? '9+' : unreadNotifications}
          </span>
        )}

        {/* Hover effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">🏀</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-800">BasketStats</h2>
              <p className="text-sm text-neutral-600">Navigation</p>
            </div>
          </div>
          <button
            onClick={closeMenu}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User Info */}
        {session?.user && (
          <div className="p-6 border-b border-neutral-200 bg-gradient-to-r from-green-50 to-blue-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  {session.user.fullName?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-neutral-800 truncate">
                  {session.user.fullName}
                </h3>
                <p className="text-sm text-neutral-600 capitalize">
                  {session.user.role === 'RECRUITER' ? 'Recruteur' : 
                   session.user.role === 'PLAYER' ? 'Joueur' : 
                   session.user.role === 'ADMIN' ? 'Administrateur' :
                   session.user.role}
                </p>
                {session.user.verified && (
                  <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                    <span>✓</span>
                    Vérifié
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-4">
            {navigationItems.map((item, index) => {
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavigationClick}
                  className={`group flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'text-neutral-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    isActive
                      ? 'bg-white/20'
                      : 'bg-gradient-to-r from-blue-100 to-purple-100 group-hover:from-blue-200 group-hover:to-purple-200'
                  }`}>
                    <div className={`${isActive ? 'text-white' : 'text-blue-600'}`}>
                      <IconDisplay icon={item.icon} size="lg" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{item.label}</div>
                    <div className={`text-xs ${
                      isActive ? 'text-white/80' : 'text-neutral-500'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer avec déconnexion */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50">
          <div className="flex items-center justify-between">
            <p className="text-xs text-neutral-500">
              BasketStats v1.0
            </p>
            <PersistentLogoutButton 
              variant="icon"
              className="text-neutral-400 hover:text-red-600"
            />
          </div>
        </div>
      </div>
    </>
  );
}
