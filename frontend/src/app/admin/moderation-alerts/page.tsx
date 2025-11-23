'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import Header from '@/components/layout/Header';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useAuthSync } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function ModerationAlertsContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | 'WARNINGS' | 'BLOCKS'>('ALL');

  useAuthSync();

  // Récupérer les avertissements
  const { data: warnings = [], isLoading: warningsLoading } = useQuery({
    queryKey: ['moderation-warnings'],
    queryFn: async () => {
      // Pour l'instant, on simule les données
      // À remplacer par un vrai endpoint
      return [];
    },
    enabled: !!session && session.user?.role === 'ADMIN',
  });

  // Récupérer les blocages
  const { data: blocks = [], isLoading: blocksLoading } = useQuery({
    queryKey: ['moderation-blocks'],
    queryFn: async () => {
      // Pour l'instant, on simule les données
      // À remplacer par un vrai endpoint
      return [];
    },
    enabled: !!session && session.user?.role === 'ADMIN',
  });

  const getSeverityBadge = (severity: string) => {
    const badges = {
      CRITICAL: 'bg-red-100 text-red-800',
      HIGH: 'bg-orange-100 text-orange-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      LOW: 'bg-blue-100 text-blue-800',
    };
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${badges[severity as keyof typeof badges]}`}>
        {severity}
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-neutral-100">
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header />
        
        <main className="flex-1 p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800">🚨 Alertes de Modération</h1>
              <p className="text-sm sm:text-base text-neutral-600 mt-1">
                Contenus suspects détectés automatiquement
              </p>
            </div>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-white shadow-sm border border-neutral-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4 border border-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Total alertes</p>
                  <p className="text-2xl font-bold text-neutral-900">{warnings.length + blocks.length}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🚨</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border border-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Avertissements</p>
                  <p className="text-2xl font-bold text-yellow-600">{warnings.length}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">⚠️</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border border-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Blocages</p>
                  <p className="text-2xl font-bold text-red-600">{blocks.length}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🚫</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filtres */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-neutral-200 mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'ALL' 
                    ? 'bg-primary text-white' 
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                Tous ({warnings.length + blocks.length})
              </button>
              <button
                onClick={() => setFilterType('WARNINGS')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'WARNINGS' 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                Avertissements ({warnings.length})
              </button>
              <button
                onClick={() => setFilterType('BLOCKS')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'BLOCKS' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                Blocages ({blocks.length})
              </button>
            </div>
          </div>

          {/* Message informatif */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 text-xl">ℹ️</div>
              <div>
                <h3 className="font-semibold text-blue-800 mb-2">Système de modération automatique</h3>
                <p className="text-sm text-blue-700">
                  Le système analyse automatiquement tous les contenus (posts, commentaires, messages) et détecte :
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1 ml-4">
                  <li>• Mots interdits et langage offensant</li>
                  <li>• Phrases suspectes et spam</li>
                  <li>• Partage d'informations personnelles (email, téléphone)</li>
                  <li>• Liens suspects</li>
                  <li>• Utilisateurs récidivistes</li>
                </ul>
                <p className="text-sm text-blue-700 mt-2">
                  Les contenus critiques sont bloqués automatiquement et vous êtes notifié.
                </p>
              </div>
            </div>
          </div>

          {/* Liste vide pour le moment */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                Aucune alerte pour le moment
              </h3>
              <p className="text-neutral-600">
                Le système de modération automatique surveille activement tous les contenus.
                Les alertes apparaîtront ici dès qu'un contenu suspect sera détecté.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ModerationAlertsPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN" redirectTo="/">
      <ModerationAlertsContent />
    </ProtectedRoute>
  );
}
