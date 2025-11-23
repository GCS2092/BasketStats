'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiresVerification?: boolean;
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  requiresVerification = false,
  redirectTo = '/' 
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Vérification sécurisée de la validation
  const isValidating = session?.user?.role === 'RECRUITER' && !session?.user?.verified;

  useEffect(() => {
    if (status === 'loading') return;

    // Vérifier l'authentification
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (!session?.user) {
      setIsLoading(false);
      return;
    }

    const user = session.user;

    // Vérifier le rôle si spécifié
    if (requiredRole && user.role !== requiredRole) {
      router.push(redirectTo);
      return;
    }

    // Vérifier la validation si requise
    if (requiresVerification && !user.verified) {
      if (user.role === 'RECRUITER') {
        router.push('/validation-pending');
        return;
      } else {
        router.push(redirectTo);
        return;
      }
    }

    // Vérifier si l'utilisateur est en cours de validation
    if (isValidating && user.role === 'RECRUITER') {
      router.push('/validation-pending');
      return;
    }

    setIsAuthorized(true);
    setIsLoading(false);
  }, [session, status, requiredRole, requiresVerification, redirectTo, router, isValidating]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
