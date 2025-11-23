'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface QuickNavigationProps {
  currentPage?: string;
}

export default function QuickNavigation({ currentPage }: QuickNavigationProps) {
  const { data: session } = useSession();
  const isRecruiter = session?.user?.role === 'RECRUITER';
  const isPlayer = session?.user?.role === 'PLAYER';

  const playerNavigation = [
    { href: '/feed', label: '📰 Feed', icon: '📰' },
    { href: '/players', label: '👥 Joueurs', icon: '👥' },
    { href: '/recruiters', label: '🔍 Recruteurs', icon: '🔍' },
    { href: '/events', label: '📅 Événements', icon: '📅' },
    { href: '/clubs', label: '🏢 Clubs', icon: '🏢' },
    { href: '/offers', label: '📧 Offres', icon: '📧' },
    { href: '/messages', label: '💬 Messages', icon: '💬' },
    { href: '/notifications', label: '🔔 Notifications', icon: '🔔' },
    { href: '/profile', label: '👤 Profil', icon: '👤' },
  ];

  const recruiterNavigation = [
    { href: '/dashboard', label: '📊 Dashboard', icon: '📊' },
    { href: '/players', label: '👥 Joueurs', icon: '👥' },
    { href: '/my-players', label: '⭐ Mes joueurs', icon: '⭐' },
    { href: '/formations', label: '🏀 Formations', icon: '🏀' },
    { href: '/events', label: '📅 Événements', icon: '📅' },
    { href: '/clubs', label: '🏢 Clubs', icon: '🏢' },
    { href: '/offers', label: '📧 Offres', icon: '📧' },
    { href: '/messages', label: '💬 Messages', icon: '💬' },
    { href: '/notifications', label: '🔔 Notifications', icon: '🔔' },
    { href: '/profile', label: '👤 Profil', icon: '👤' },
  ];

  const navigation = isRecruiter ? recruiterNavigation : playerNavigation;

  if (!session) return null;

  return (
    <div className="bg-white border-b border-neutral-200 py-3">
      <div className="container-custom">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin">
          <span className="text-sm font-medium text-neutral-600 shrink-0">
            Navigation rapide élégante :
          </span>
          
          <div className="flex items-center gap-1">
            {navigation.map((item, index) => {
              const isActive = currentPage === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-neutral-600 hover:text-primary hover:bg-neutral-100'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
