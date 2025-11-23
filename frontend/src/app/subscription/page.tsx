'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import PlanSelection from '@/components/subscription/PlanSelection';
import SubscriptionHistory from '@/components/subscription/SubscriptionHistory';
import SubscriptionRestore from '@/components/subscription/SubscriptionRestore';
import SubscriptionRestoreStats from '@/components/subscription/SubscriptionRestoreStats';
import { 
  CreditCardIcon, 
  ClockIcon, 
  ArrowPathIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/outline';

export default function SubscriptionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'plans' | 'history' | 'restore' | 'stats'>('plans');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
        <div className="card p-6 sm:p-8 text-center max-w-sm w-full">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Chargement...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <Header />
      
      {/* Onglets de navigation */}
      <div className="bg-white border-b border-neutral-200">
        <div className="container-custom">
          <div className="flex space-x-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('plans')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === 'plans'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-neutral-600 hover:text-neutral-800'
              }`}
            >
              <CreditCardIcon className="h-4 w-4" />
              Plans d'abonnement
            </button>
            
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-neutral-600 hover:text-neutral-800'
              }`}
            >
              <ClockIcon className="h-4 w-4" />
              Mon historique
            </button>

            {session?.user?.role === 'ADMIN' && (
              <>
                <button
                  onClick={() => setActiveTab('restore')}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === 'restore'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-neutral-600 hover:text-neutral-800'
                  }`}
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  Restauration
                </button>
                
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === 'stats'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-neutral-600 hover:text-neutral-800'
                  }`}
                >
                  <ChartBarIcon className="h-4 w-4" />
                  Statistiques
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="container-custom py-6">
        {activeTab === 'plans' && <PlanSelection />}
        {activeTab === 'history' && <SubscriptionHistory />}
        {activeTab === 'restore' && session?.user?.role === 'ADMIN' && <SubscriptionRestore />}
        {activeTab === 'stats' && session?.user?.role === 'ADMIN' && <SubscriptionRestoreStats />}
      </div>
    </div>
  );
}