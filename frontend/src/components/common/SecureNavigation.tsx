'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavigationItem {
  href: string;
  label: string;
  icon: string;
  roles: string[];
  requiresVerification?: boolean;
}

interface SecureNavigationProps {
  type: 'desktop' | 'mobile';
  className?: string;
  onItemClick?: () => void;
}

export default function SecureNavigation({ type, className = '', onItemClick }: SecureNavigationProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session?.user) return null;

  const user = session.user;
  const isAdmin = user.role === 'ADMIN';
  const isRecruiter = user.role === 'RECRUITER';
  const isPlayer = user.role === 'PLAYER';
  const isVerified = user.verified;

  // Navigation items avec permissions
  const navigationItems: NavigationItem[] = [
    // Items pour tous les utilisateurs authentifiés
    {
      href: '/feed',
      label: 'Feed',
      icon: '🏠',
      roles: ['PLAYER', 'RECRUITER', 'ADMIN']
    },
    {
      href: '/players',
      label: 'Joueurs',
      icon: '👥',
      roles: ['PLAYER', 'RECRUITER', 'ADMIN']
    },
    {
      href: '/events',
      label: 'Événements',
      icon: '📅',
      roles: ['PLAYER', 'RECRUITER', 'ADMIN']
    },
    {
      href: '/clubs',
      label: 'Clubs',
      icon: '🏢',
      roles: ['PLAYER', 'RECRUITER', 'ADMIN']
    },
    {
      href: '/messages',
      label: 'Messages',
      icon: '💬',
      roles: ['PLAYER', 'RECRUITER', 'ADMIN']
    },
    {
      href: '/notifications',
      label: 'Notifications',
      icon: '🔔',
      roles: ['PLAYER', 'RECRUITER', 'ADMIN']
    },
    {
      href: '/profile',
      label: 'Profil',
      icon: '👤',
      roles: ['PLAYER', 'RECRUITER', 'ADMIN']
    },

    // Items spécifiques aux joueurs
    {
      href: '/recruiters',
      label: 'Recruteurs',
      icon: '🔍',
      roles: ['PLAYER']
    },

    // Items spécifiques aux recruteurs vérifiés
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: '📊',
      roles: ['RECRUITER'],
      requiresVerification: true
    },
    {
      href: '/my-players',
      label: 'Mes joueurs',
      icon: '⭐',
      roles: ['RECRUITER'],
      requiresVerification: true
    },
    {
      href: '/offers',
      label: 'Offres',
      icon: '📧',
      roles: ['RECRUITER'],
      requiresVerification: true
    },
    {
      href: '/formations',
      label: 'Formations',
      icon: '🏀',
      roles: ['RECRUITER'],
      requiresVerification: true
    },

    // Items spécifiques aux admins
    {
      href: '/admin',
      label: 'Admin',
      icon: '🛡️',
      roles: ['ADMIN']
    }
  ];

  // Filtrer les items selon les permissions
  const allowedItems = navigationItems.filter(item => {
    // Vérifier le rôle
    if (!item.roles.includes(user.role)) return false;
    
    // Vérifier la validation si nécessaire
    if (item.requiresVerification && !isVerified) return false;
    
    return true;
  });

  if (type === 'desktop') {
    return (
      <nav className={`hidden md:flex items-center space-x-6 ${className}`}>
        {allowedItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`transition-colors ${
              pathname === item.href
                ? 'text-primary font-semibold'
                : 'text-neutral-700 hover:text-primary'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    );
  }

  // Mobile navigation
  return (
    <nav className={`flex flex-col space-y-1 px-3 ${className}`}>
      {allowedItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex items-center gap-3 px-4 py-3.5 rounded-lg active:bg-neutral-200 transition-colors touch-target ${
            pathname === item.href
              ? 'bg-primary text-white'
              : 'text-neutral-700 hover:bg-neutral-100'
          }`}
          onClick={onItemClick}
        >
          <span className="text-xl flex-shrink-0">{item.icon}</span>
          <span className="text-sm">{item.label}</span>
          {item.requiresVerification && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full ml-auto">
              Vérifié
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}
