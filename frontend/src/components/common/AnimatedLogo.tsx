'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useLogoAnimation } from '@/contexts/LogoAnimationContext';

interface AnimatedLogoProps {
  className?: string;
  showText?: boolean;
}

export default function AnimatedLogo({ className = '', showText = true }: AnimatedLogoProps) {
  const { isSpinning, triggerLogoSpin } = useLogoAnimation();
  const pathname = usePathname();

  // Détecter les changements de route pour déclencher l'animation
  useEffect(() => {
    triggerLogoSpin();
  }, [pathname, triggerLogoSpin]);

  return (
    <div 
      className={`flex items-center gap-2 ${className}`}
      onClick={triggerLogoSpin}
      style={{ cursor: 'pointer' }}
    >
      <div 
        className={`text-2xl transition-transform duration-1000 ease-in-out ${
          isSpinning ? 'rotate-360' : ''
        }`}
        style={{
          transform: isSpinning ? 'rotate(360deg)' : 'rotate(0deg)',
        }}
      >
        🏀
      </div>
      {showText && (
        <>
          <span className="hidden xs:inline text-lg md:text-xl lg:text-2xl font-bold text-primary">
            BasketStats
          </span>
          <span className="xs:hidden text-lg font-bold text-primary">
            BS
          </span>
        </>
      )}
    </div>
  );
}
