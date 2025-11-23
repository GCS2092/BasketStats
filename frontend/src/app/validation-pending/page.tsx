'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ValidationPendingScreen from '@/components/auth/ValidationPendingScreen';

export default function ValidationPendingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    // Vérifier si l'utilisateur est bien un recruteur non vérifié
    if (session?.user?.role !== 'RECRUITER' || session?.user?.verified) {
      router.push('/');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Ne pas afficher la page si l'utilisateur n'est pas autorisé
  if (status === 'unauthenticated' || session?.user?.role !== 'RECRUITER' || session?.user?.verified) {
    return null;
  }

  return <ValidationPendingScreen />;
}
