'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function useValidation() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (status === 'loading' || !session?.user) return;

    const user = session.user;
    
    // Vérifier si l'utilisateur est un recruteur non vérifié
    if (user.role === 'RECRUITER' && !user.verified) {
      setIsValidating(true);
      // Rediriger vers l'écran de validation si on n'y est pas déjà
      if (!window.location.pathname.startsWith('/validation-pending')) {
        router.push('/validation-pending');
      }
    } else {
      setIsValidating(false);
      // Si on est sur la page de validation mais qu'on est vérifié, rediriger
      if (window.location.pathname === '/validation-pending') {
        router.push('/dashboard');
      }
    }
  }, [session, status, router]);

  return {
    isValidating,
    user: session?.user,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading'
  };
}
