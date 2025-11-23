'use client';

import { useEffect, useState } from 'react';

interface OnlineStatusProps {
  userId?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export default function OnlineStatus({ 
  userId, 
  size = 'md', 
  showText = false,
  className = ''
}: OnlineStatusProps) {
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<string>('');

  useEffect(() => {
    // TODO: Connecter au WebSocket pour statut temps réel
    // Pour l'instant, simulation basée sur userId
    if (userId) {
      // Simuler statut en ligne aléatoire pour démo
      const randomOnline = Math.random() > 0.5;
      setIsOnline(randomOnline);
      
      if (!randomOnline) {
        // Simuler "vu il y a X minutes"
        const minutesAgo = Math.floor(Math.random() * 60) + 1;
        if (minutesAgo < 5) {
          setLastSeen('À l\'instant');
        } else if (minutesAgo < 60) {
          setLastSeen(`Il y a ${minutesAgo} min`);
        } else {
          setLastSeen('Il y a plus d\'1h');
        }
      }
    }
  }, [userId]);

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const dotClass = isOnline 
    ? 'bg-green-500 shadow-lg shadow-green-500/50' 
    : 'bg-red-500';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div 
          className={`${sizeClasses[size]} ${dotClass} rounded-full`}
        />
        {isOnline && (
          <div 
            className={`${sizeClasses[size]} ${dotClass} rounded-full absolute inset-0 animate-ping opacity-75`}
          />
        )}
      </div>
      
      {showText && (
        <span className={`text-sm ${isOnline ? 'text-green-600 font-medium' : 'text-neutral-500'}`}>
          {isOnline ? 'En ligne' : lastSeen}
        </span>
      )}
    </div>
  );
}

