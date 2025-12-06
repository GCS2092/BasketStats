'use client';

import { useSession } from 'next-auth/react';
import { Link } from '@/i18n/routing';

interface SimpleNavigationProps {
  type: 'desktop' | 'mobile';
  onItemClick?: () => void;
}

export default function SimpleNavigation({ type, onItemClick }: SimpleNavigationProps) {
  const { data: session } = useSession();

  if (!session?.user) {
    // Navigation publique
    return type === 'desktop' ? (
      <nav className="hidden md:flex items-center space-x-6">
        <Link href="/feed" className="text-neutral-700 hover:text-primary transition-colors">📰 Feed</Link>
        <Link href="/players" className="text-neutral-700 hover:text-primary transition-colors">👥 Joueurs</Link>
        <Link href="/clubs" className="text-neutral-700 hover:text-primary transition-colors">🏢 Clubs</Link>
        <Link href="/my-clubs" className="text-neutral-700 hover:text-primary transition-colors">🏢 Mes clubs</Link>
        <Link href="/events" className="text-neutral-700 hover:text-primary transition-colors">📅 Événements</Link>
      </nav>
    ) : (
      <nav className="flex flex-col space-y-1 px-3">
        <Link href="/feed" className="flex items-center gap-3 px-4 py-3.5 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors" onClick={onItemClick}>
          <span className="text-xl">📰</span>
          <span className="text-sm">Feed</span>
        </Link>
        <Link href="/players" className="flex items-center gap-3 px-4 py-3.5 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors" onClick={onItemClick}>
          <span className="text-xl">👥</span>
          <span className="text-sm">Joueurs</span>
        </Link>
        <Link href="/clubs" className="flex items-center gap-3 px-4 py-3.5 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors" onClick={onItemClick}>
          <span className="text-xl">🏢</span>
          <span className="text-sm">Clubs</span>
        </Link>
        <Link href="/my-clubs" className="flex items-center gap-3 px-4 py-3.5 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors" onClick={onItemClick}>
          <span className="text-xl">🏢</span>
          <span className="text-sm">Mes clubs</span>
        </Link>
        <Link href="/events" className="flex items-center gap-3 px-4 py-3.5 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors" onClick={onItemClick}>
          <span className="text-xl">📅</span>
          <span className="text-sm">Événements</span>
        </Link>
      </nav>
    );
  }

  const user = session.user;
  const userRole = user.role;
  const isVerified = user.verified;

  // Navigation pour ADMIN - Interface dédiée uniquement aux fonctions d'administration
  if (userRole === 'ADMIN') {
    return type === 'desktop' ? (
      <nav className="hidden md:flex items-center space-x-6">
        <Link href="/admin" className="text-red-700 hover:text-red-900 transition-colors font-semibold">🛡️ Admin</Link>
        <Link href="/admin/users" className="text-red-600 hover:text-red-800 transition-colors">👥 Utilisateurs</Link>
        <Link href="/admin/clubs" className="text-red-600 hover:text-red-800 transition-colors">🏢 Clubs</Link>
        <Link href="/admin/posts" className="text-red-600 hover:text-red-800 transition-colors">📝 Modération</Link>
        <Link href="/admin/reports" className="text-red-600 hover:text-red-800 transition-colors">🚨 Signalements</Link>
        <Link href="/admin/stats" className="text-red-600 hover:text-red-800 transition-colors">📊 Statistiques</Link>
      </nav>
    ) : (
      <nav className="flex flex-col space-y-1 px-3">
        <Link href="/admin" className="flex items-center gap-3 px-4 py-3.5 text-red-700 hover:bg-red-50 rounded-lg font-semibold transition-colors" onClick={onItemClick}>
          <span className="text-xl">🛡️</span>
          <span className="text-sm">Dashboard Admin</span>
        </Link>
        <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" onClick={onItemClick}>
          <span className="text-xl">👥</span>
          <span className="text-sm">Utilisateurs</span>
        </Link>
        <Link href="/admin/clubs" className="flex items-center gap-3 px-4 py-3.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" onClick={onItemClick}>
          <span className="text-xl">🏢</span>
          <span className="text-sm">Clubs</span>
        </Link>
        <Link href="/admin/posts" className="flex items-center gap-3 px-4 py-3.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" onClick={onItemClick}>
          <span className="text-xl">📝</span>
          <span className="text-sm">Modération</span>
        </Link>
        <Link href="/admin/reports" className="flex items-center gap-3 px-4 py-3.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" onClick={onItemClick}>
          <span className="text-xl">🚨</span>
          <span className="text-sm">Signalements</span>
        </Link>
        <Link href="/admin/stats" className="flex items-center gap-3 px-4 py-3.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" onClick={onItemClick}>
          <span className="text-xl">📊</span>
          <span className="text-sm">Statistiques</span>
        </Link>
      </nav>
    );
  }

  // Navigation pour RECRUITER
  if (userRole === 'RECRUITER') {
    // Si recruteur non vérifié, pas de navigation (redirection vers validation-pending)
    if (!isVerified) {
      return null;
    }

    // Recruteur vérifié
    return type === 'desktop' ? (
      <nav className="hidden md:flex items-center space-x-6">
        <Link href="/dashboard" className="text-purple-700 hover:text-purple-900 transition-colors font-semibold">📊 Dashboard</Link>
        <Link href="/actualites" className="text-orange-700 hover:text-orange-900 transition-colors font-semibold">🏀 Actualités</Link>
        <Link href="/players" className="text-neutral-700 hover:text-primary transition-colors">👥 Joueurs</Link>
        <Link href="/my-players" className="text-purple-700 hover:text-purple-900 transition-colors font-semibold">⭐ Mes joueurs</Link>
        <Link href="/events" className="text-neutral-700 hover:text-primary transition-colors">📅 Événements</Link>
        <Link href="/clubs" className="text-neutral-700 hover:text-primary transition-colors">🏢 Clubs</Link>
        <Link href="/offers" className="text-neutral-700 hover:text-primary transition-colors">📧 Offres</Link>
        <Link href="/messages" className="text-neutral-700 hover:text-primary transition-colors">💬 Messages</Link>
        <Link href="/notifications" className="text-neutral-700 hover:text-primary transition-colors">🔔 Notifications</Link>
        <Link href="/profile" className="text-neutral-700 hover:text-primary transition-colors">👤 Profil</Link>
      </nav>
    ) : (
      <nav className="flex flex-col space-y-1 px-3">
        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3.5 text-purple-700 hover:bg-purple-50 rounded-lg font-semibold transition-colors" onClick={onItemClick}>
          <span className="text-xl">📊</span>
          <span className="text-sm">Dashboard</span>
        </Link>
        <Link href="/actualites" className="flex items-center gap-3 px-4 py-3.5 text-orange-700 hover:bg-orange-50 rounded-lg font-semibold transition-colors" onClick={onItemClick}>
          <span className="text-xl">🏀</span>
          <span className="text-sm">Actualités</span>
        </Link>
        <Link href="/players" className="flex items-center gap-3 px-4 py-3.5 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors" onClick={onItemClick}>
          <span className="text-xl">👥</span>
          <span className="text-sm">Joueurs</span>
        </Link>
        <Link href="/my-players" className="flex items-center gap-3 px-4 py-3.5 text-purple-700 hover:bg-purple-50 rounded-lg font-semibold transition-colors" onClick={onItemClick}>
          <span className="text-xl">⭐</span>
          <span className="text-sm">Mes joueurs</span>
        </Link>
        <Link href="/events" className="flex items-center gap-3 px-4 py-3.5 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors" onClick={onItemClick}>
          <span className="text-xl">📅</span>
          <span className="text-sm">Événements</span>
        </Link>
        <Link href="/clubs" className="flex items-center gap-3 px-4 py-3.5 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors" onClick={onItemClick}>
          <span className="text-xl">🏢</span>
          <span className="text-sm">Clubs</span>
        </Link>
        <Link href="/offers" className="flex items-center gap-3 px-4 py-3.5 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors" onClick={onItemClick}>
          <span className="text-xl">📧</span>
          <span className="text-sm">Offres</span>
        </Link>
        <Link href="/notifications" className="flex items-center gap-3 px-4 py-3.5 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors" onClick={onItemClick}>
          <span className="text-xl">🔔</span>
          <span className="text-sm">Notifications</span>
        </Link>
        <Link href="/messages" className="flex items-center gap-3 px-4 py-3.5 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors" onClick={onItemClick}>
          <span className="text-xl">💬</span>
          <span className="text-sm">Messages</span>
        </Link>
        <Link href="/profile" className="flex items-center gap-3 px-4 py-3.5 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors" onClick={onItemClick}>
          <span className="text-xl">👤</span>
          <span className="text-sm">Profil</span>
        </Link>
      </nav>
    );
  }

  // Navigation pour PLAYER
  if (userRole === 'PLAYER') {
    return type === 'desktop' ? (
      <nav className="hidden md:flex items-center space-x-6">
        <Link href="/feed" className="text-neutral-700 hover:text-primary transition-colors">📰 Feed</Link>
        <Link href="/actualites" className="text-orange-700 hover:text-orange-900 transition-colors font-semibold">🏀 Actualités</Link>
        <Link href="/players" className="text-neutral-700 hover:text-primary transition-colors">👥 Joueurs</Link>
        <Link href="/recruiters" className="text-blue-700 hover:text-blue-900 transition-colors font-semibold">🔍 Recruteurs</Link>
        <Link href="/events" className="text-neutral-700 hover:text-primary transition-colors">📅 Événements</Link>
        <Link href="/clubs" className="text-neutral-700 hover:text-primary transition-colors">🏢 Clubs</Link>
        <Link href="/offers" className="text-neutral-700 hover:text-primary transition-colors">📧 Offres</Link>
        <Link href="/messages" className="text-neutral-700 hover:text-primary transition-colors">💬 Messages</Link>
        <Link href="/notifications" className="text-neutral-700 hover:text-primary transition-colors">🔔 Notifications</Link>
        <Link href="/profile" className="text-neutral-700 hover:text-primary transition-colors">👤 Profil</Link>
      </nav>
    ) : (
      <nav className="flex flex-col space-y-1 px-3">
        <Link href="/feed" className="flex items-center gap-3 px-4 py-3.5 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors" onClick={onItemClick}>
          <span className="text-xl">📰</span>
          <span className="text-sm">Feed</span>
        </Link>
        <Link href="/actualites" className="flex items-center gap-3 px-4 py-3.5 text-orange-700 hover:bg-orange-50 rounded-lg font-semibold transition-colors" onClick={onItemClick}>
          <span className="text-xl">🏀</span>
          <span className="text-sm">Actualités</span>
        </Link>
        <Link href="/players" className="flex items-center gap-3 px-4 py-3.5 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors" onClick={onItemClick}>
          <span className="text-xl">👥</span>
          <span className="text-sm">Joueurs</span>
        </Link>
        <Link href="/recruiters" className="flex items-center gap-3 px-4 py-3.5 text-blue-700 hover:bg-blue-50 rounded-lg font-semibold transition-colors" onClick={onItemClick}>
          <span className="text-xl">🔍</span>
          <span className="text-sm">Recruteurs</span>
        </Link>
        <Link href="/events" className="flex items-center gap-3 px-4 py-3.5 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors" onClick={onItemClick}>
          <span className="text-xl">📅</span>
          <span className="text-sm">Événements</span>
        </Link>
        <Link href="/clubs" className="flex items-center gap-3 px-4 py-3.5 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors" onClick={onItemClick}>
          <span className="text-xl">🏢</span>
          <span className="text-sm">Clubs</span>
        </Link>
        <Link href="/offers" className="flex items-center gap-3 px-4 py-3.5 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors" onClick={onItemClick}>
          <span className="text-xl">📧</span>
          <span className="text-sm">Offres</span>
        </Link>
        <Link href="/notifications" className="flex items-center gap-3 px-4 py-3.5 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors" onClick={onItemClick}>
          <span className="text-xl">🔔</span>
          <span className="text-sm">Notifications</span>
        </Link>
        <Link href="/messages" className="flex items-center gap-3 px-4 py-3.5 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors" onClick={onItemClick}>
          <span className="text-xl">💬</span>
          <span className="text-sm">Messages</span>
        </Link>
        <Link href="/profile" className="flex items-center gap-3 px-4 py-3.5 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors" onClick={onItemClick}>
          <span className="text-xl">👤</span>
          <span className="text-sm">Profil</span>
        </Link>
      </nav>
    );
  }

  return null;
}
