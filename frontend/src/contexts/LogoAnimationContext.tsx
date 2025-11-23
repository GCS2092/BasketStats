'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface LogoAnimationContextType {
  triggerLogoSpin: () => void;
  isSpinning: boolean;
}

const LogoAnimationContext = createContext<LogoAnimationContextType | undefined>(undefined);

export function LogoAnimationProvider({ children }: { children: ReactNode }) {
  const [isSpinning, setIsSpinning] = useState(false);

  const triggerLogoSpin = () => {
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 1000);
  };

  return (
    <LogoAnimationContext.Provider value={{ triggerLogoSpin, isSpinning }}>
      {children}
    </LogoAnimationContext.Provider>
  );
}

export function useLogoAnimation() {
  const context = useContext(LogoAnimationContext);
  if (context === undefined) {
    throw new Error('useLogoAnimation must be used within a LogoAnimationProvider');
  }
  return context;
}
