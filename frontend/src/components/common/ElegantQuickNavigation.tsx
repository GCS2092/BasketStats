'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import IconDisplay from './IconDisplay';
import { useLogoAnimation } from '@/contexts/LogoAnimationContext';

interface ElegantQuickNavigationProps {
  currentPage?: string;
}

export default function ElegantQuickNavigation({ currentPage }: ElegantQuickNavigationProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { triggerLogoSpin } = useLogoAnimation();

  // Fonction utilitaire pour extraire les couleurs de gradient
  const extractGradientColors = (colorString: string) => {
    if (!colorString) return { from: undefined, to: undefined };
    
    const parts = colorString.split(' ');
    if (parts.length < 2) return { from: undefined, to: undefined };
    
    const fromColor = parts[0]?.replace('from-', '');
    const toColor = parts[1]?.replace('to-', '');
    
    return {
      from: fromColor ? fromColor : undefined,
      to: toColor ? toColor : undefined
    };
  };

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft } = scrollContainerRef.current;
        setIsScrolled(scrollLeft > 0);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const getNavigationItems = () => {
    if (!session?.user) {
      return [
        { href: '/feed', label: 'Feed', icon: '📰', color: 'from-blue-500 to-cyan-500' },
        { href: '/players', label: 'Joueurs', icon: '👥', color: 'from-green-500 to-emerald-500' },
        { href: '/clubs', label: 'Clubs', icon: '🏢', color: 'from-purple-500 to-violet-500' },
        { href: '/events', label: 'Événements', icon: '📅', color: 'from-orange-500 to-red-500' },
      ];
    }

    const user = session.user;
    const baseItems = [
      { href: '/feed', label: 'Feed', icon: '📰', color: 'from-blue-500 to-cyan-500' },
      { href: '/players', label: 'Joueurs', icon: '👥', color: 'from-green-500 to-emerald-500' },
      { href: '/clubs', label: 'Clubs', icon: '🏢', color: 'from-purple-500 to-violet-500' },
      { href: '/events', label: 'Événements', icon: '📅', color: 'from-orange-500 to-red-500' },
    ];

    if (user.role === 'RECRUITER') {
      return [
        { href: '/dashboard', label: 'Dashboard', icon: '📊', color: 'from-indigo-500 to-blue-500' },
        { href: '/my-players', label: 'Mes joueurs', icon: '⭐', color: 'from-yellow-500 to-orange-500' },
        { href: '/formations', label: 'Formations', icon: '🏀', color: 'from-pink-500 to-rose-500' },
        ...baseItems,
        { href: '/offers', label: 'Offres', icon: '📧', color: 'from-teal-500 to-cyan-500' },
        { href: '/messages', label: 'Messages', icon: '💬', color: 'from-slate-500 to-gray-500' },
        { href: '/notifications', label: 'Notifications', icon: '🔔', color: 'from-red-500 to-pink-500' },
        { href: '/profile', label: 'Profil', icon: '👤', color: 'from-violet-500 to-purple-500' },
      ];
    }

    if (user.role === 'PLAYER') {
      return [
        ...baseItems,
        { href: '/recruiters', label: 'Recruteurs', icon: '🔍', color: 'from-amber-500 to-yellow-500' },
        { href: '/offers', label: 'Offres', icon: '📧', color: 'from-teal-500 to-cyan-500' },
        { href: '/messages', label: 'Messages', icon: '💬', color: 'from-slate-500 to-gray-500' },
        { href: '/notifications', label: 'Notifications', icon: '🔔', color: 'from-red-500 to-pink-500' },
        { href: '/profile', label: 'Profil', icon: '👤', color: 'from-violet-500 to-purple-500' },
      ];
    }

    if (user.role === 'ADMIN') {
      return [
        { href: '/admin', label: 'Dashboard Admin', icon: '🛡️', color: 'from-red-500 to-pink-500' },
        { href: '/admin/users', label: 'Utilisateurs', icon: '👥', color: 'from-blue-500 to-cyan-500' },
        { href: '/admin/clubs', label: 'Clubs', icon: '🏢', color: 'from-purple-500 to-violet-500' },
        { href: '/admin/posts', label: 'Posts', icon: '📝', color: 'from-green-500 to-emerald-500' },
        { href: '/admin/reports', label: 'Signalements', icon: '🚨', color: 'from-orange-500 to-red-500' },
        { href: '/admin/moderation-alerts', label: 'Modération Auto', icon: '🛡️', color: 'from-indigo-500 to-blue-500' },
        { href: '/admin/stats', label: 'Statistiques', icon: '📊', color: 'from-yellow-500 to-orange-500' },
        ...baseItems,
        { href: '/messages', label: 'Messages', icon: '💬', color: 'from-slate-500 to-gray-500' },
        { href: '/notifications', label: 'Notifications', icon: '🔔', color: 'from-red-500 to-pink-500' },
        { href: '/profile', label: 'Profil', icon: '👤', color: 'from-violet-500 to-purple-500' },
      ];
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  const handleNavigationClick = () => {
    triggerLogoSpin();
  };

  if (!session) return null;

  return (
    <div className="bg-gradient-to-r from-white via-blue-50/30 to-purple-50/30 border-b border-neutral-200/50 backdrop-blur-sm">
      <div className="container-custom">
        <div className="flex items-center gap-4 py-4">
          {/* Label with icon */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">⚡</span>
            </div>
            <span className="text-sm font-semibold text-neutral-700 hidden sm:block">
              Navigation rapide élégante
            </span>
          </div>

          {/* Scroll indicators */}
          <div className="flex items-center gap-2 shrink-0">
            {isScrolled && (
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            )}
            <div className="text-xs text-neutral-500 hidden sm:block">
              {navigationItems.length} sections
            </div>
          </div>

          {/* Navigation items */}
          <div 
            ref={scrollContainerRef}
            className="flex items-center gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent pb-1"
            style={{ scrollbarWidth: 'thin' }}
          >
            {navigationItems.map((item, index) => {
              const isActive = currentPage === item.href || pathname === item.href;
              const gradientColors = extractGradientColors(item.color);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavigationClick}
                  className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r text-white shadow-lg transform scale-105'
                      : 'text-neutral-600 hover:text-neutral-800 hover:bg-white/60 hover:shadow-md hover:transform hover:scale-105'
                  }`}
                  style={{
                    background: isActive ? `linear-gradient(135deg, var(--tw-gradient-stops))` : undefined,
                    '--tw-gradient-from': isActive ? gradientColors.from : undefined,
                    '--tw-gradient-to': isActive ? gradientColors.to : undefined,
                  } as React.CSSProperties}
                >
                  {/* Icon with gradient background */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? 'bg-white/20 backdrop-blur-sm'
                      : `bg-gradient-to-r ${item.color} opacity-20 group-hover:opacity-100`
                  }`}>
                    <div className={`${isActive ? 'text-white' : 'text-blue-600'}`}>
                      <IconDisplay icon={item.icon} size="md" />
                    </div>
                  </div>

                  {/* Label */}
                  <span className="font-medium text-sm hidden sm:block">
                    {item.label}
                  </span>

                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
                  )}

                  {/* Hover effect */}
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                </Link>
              );
            })}
          </div>

          {/* Scroll hint */}
          <div className="shrink-0 text-xs text-neutral-400 hidden lg:block">
            ← Faites défiler →
          </div>
        </div>
      </div>
    </div>
  );
}
