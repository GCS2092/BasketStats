'use client';

import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface MobileBackButtonProps {
  fallbackUrl?: string;
  className?: string;
}

export default function MobileBackButton({ 
  fallbackUrl = '/feed', 
  className = '' 
}: MobileBackButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [canGoBack, setCanGoBack] = useState(false);

  // Pages qui ne doivent pas avoir de bouton retour
  const noBackPages = [
    '/feed',
    '/dashboard', 
    '/profile',
    '/auth/login',
    '/auth/register',
    '/subscription',
    '/'
  ];

  // Vérifier si on peut revenir en arrière
  useEffect(() => {
    // Vérifier si on est sur une page qui ne doit pas avoir de bouton retour
    const shouldShowBack = !noBackPages.some(page => pathname === page || pathname.startsWith(page + '/'));
    
    // Vérifier si on a un historique de navigation
    const hasHistory = window.history.length > 1;
    
    setCanGoBack(shouldShowBack && hasHistory);
  }, [pathname]);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackUrl);
    }
  };

  // Ne pas afficher sur desktop
  if (typeof window !== 'undefined' && window.innerWidth >= 768) {
    return null;
  }

  if (!canGoBack) {
    return null;
  }

  return (
    <button
      onClick={handleBack}
      className={`fixed top-16 left-4 z-40 w-10 h-10 bg-white/90 backdrop-blur-sm border border-neutral-200 rounded-full shadow-lg flex items-center justify-center text-neutral-700 hover:bg-white hover:shadow-xl transition-all duration-200 active:scale-95 ${className}`}
      aria-label="Retour"
    >
      <svg 
        className="w-5 h-5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M15 19l-7-7 7-7" 
        />
      </svg>
    </button>
  );
}
