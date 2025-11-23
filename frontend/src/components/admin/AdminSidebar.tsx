'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const menuItems = [
    {
      title: 'Tableau de bord',
      href: '/admin',
      icon: '🛡️',
      description: 'Vue d\'ensemble'
    },
    {
      title: 'Utilisateurs',
      href: '/admin/users',
      icon: '👥',
      description: 'Gestion des comptes'
    },
    {
      title: 'Clubs',
      href: '/admin/clubs',
      icon: '🏢',
      description: 'Approbation des clubs'
    },
    {
      title: 'Posts',
      href: '/admin/posts',
      icon: '📝',
      description: 'Modération des contenus'
    },
    {
      title: 'Signalements',
      href: '/admin/reports',
      icon: '🚨',
      description: 'Traitement des rapports'
    },
    {
      title: 'Modération Auto',
      href: '/admin/moderation-alerts',
      icon: '🛡️',
      description: 'Alertes automatiques'
    },
    {
      title: 'Statistiques',
      href: '/admin/stats',
      icon: '📊',
      description: 'Analyses détaillées'
    },
    {
      title: 'Notifications',
      href: '/notifications',
      icon: '🔔',
      description: 'Gestion des notifications'
    }
  ];

  const handleLogout = async () => {
    const { signOut } = await import('next-auth/react');
    signOut({ callbackUrl: '/' });
  };

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 sm:w-80 lg:w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-neutral-800">Admin Panel</h1>
              <p className="text-xs text-neutral-500">BasketStats</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-neutral-100 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User info */}
        <div className="p-3 sm:p-4 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm sm:text-base">
                {session?.user?.fullName?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-neutral-800 text-xs sm:text-sm truncate">
                {session?.user?.fullName || 'Administrateur'}
              </p>
              <p className="text-xs text-neutral-500 truncate">{session?.user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 sm:p-4 overflow-y-auto">
          <ul className="space-y-1 sm:space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => {
                      // Fermer la sidebar sur mobile après clic
                      if (window.innerWidth < 1024) {
                        onClose();
                      }
                    }}
                    className={`
                      flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg transition-colors group
                      ${isActive 
                        ? 'bg-primary text-white shadow-sm' 
                        : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                      }
                    `}
                  >
                    <span className="text-lg sm:text-xl flex-shrink-0">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs sm:text-sm">{item.title}</p>
                      <p className={`
                        text-xs truncate hidden sm:block
                        ${isActive ? 'text-primary-100' : 'text-neutral-500'}
                      `}>
                        {item.description}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-neutral-200">
          <div className="space-y-1 sm:space-y-2">
            <button
              onClick={() => router.push('/')}
              className="w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <span className="text-lg sm:text-xl flex-shrink-0">🏠</span>
              <div className="text-left min-w-0 flex-1">
                <p className="font-medium text-xs sm:text-sm">Retour au site</p>
                <p className="text-xs text-neutral-500 hidden sm:block">Vue utilisateur</p>
              </div>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <span className="text-lg sm:text-xl flex-shrink-0">🚪</span>
              <div className="text-left min-w-0 flex-1">
                <p className="font-medium text-xs sm:text-sm">Déconnexion</p>
                <p className="text-xs text-red-500 hidden sm:block">Se déconnecter</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
