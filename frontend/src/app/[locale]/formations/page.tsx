'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import Header from '@/components/layout/Header';
import BasketballCourt from '@/components/formations/BasketballCourt';
import { useAuthSync } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export const dynamic = 'force-dynamic';

function FormationsPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'formations' | 'lineups'>('formations');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isDefault: false,
  });

  useAuthSync();

  const isRecruiter = session?.user?.role === 'RECRUITER';

  useEffect(() => {
    if (status === 'authenticated' && !isRecruiter) {
      router.push('/feed');
    }
  }, [status, isRecruiter, router]);

  // Récupérer les formations
  const { data: formations = [], isLoading: formationsLoading } = useQuery({
    queryKey: ['formations'],
    queryFn: async () => {
      const response = await apiClient.get('/formations');
      return response.data;
    },
    enabled: !!session && isRecruiter,
  });

  // Récupérer les ligneups
  const { data: lineups = [], isLoading: lineupsLoading } = useQuery({
    queryKey: ['lineups'],
    queryFn: async () => {
      const response = await apiClient.get('/formations/lineups');
      return response.data;
    },
    enabled: !!session && isRecruiter,
  });

  // Récupérer les joueurs disponibles
  const { data: availablePlayers = [], isLoading: playersLoading } = useQuery({
    queryKey: ['available-players'],
    queryFn: async () => {
      const response = await apiClient.get('/formations/players/available');
      return response.data;
    },
    enabled: !!session && isRecruiter,
  });

  // États pour la formation en cours
  const [currentFormation, setCurrentFormation] = useState<{
    [key: string]: string;
  }>({});
  const [bench, setBench] = useState<string[]>([]);

  // Créer une formation
  const createFormationMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/formations', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formations'] });
      setShowCreateForm(false);
      setFormData({ name: '', description: '', isDefault: false });
      setCurrentFormation({});
      setBench([]);
    },
  });

  // Créer une lineup
  const createLineupMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/formations/lineups', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lineups'] });
      setActiveTab('lineups');
    },
  });

  const handleSaveFormation = () => {
    if (!formData.name.trim()) {
      alert('Veuillez saisir un nom pour la formation');
      return;
    }

    const formationData = {
      ...formData,
      ...currentFormation,
      bench,
    };

    createFormationMutation.mutate(formationData);
  };

  const handleCreateLineup = () => {
    const selectedPlayers = [
      ...Object.values(currentFormation).filter(Boolean),
      ...bench,
    ];

    if (selectedPlayers.length === 0) {
      alert('Veuillez sélectionner au moins un joueur');
      return;
    }

    const lineupData = {
      name: `Lineup ${new Date().toLocaleDateString('fr-FR')}`,
      players: selectedPlayers,
      formationId: selectedFormation?.id || null,
    };

    createLineupMutation.mutate(lineupData);
  };

  const handlePlayerSelect = (position: string, playerId: string | null) => {
    setCurrentFormation(prev => ({
      ...prev,
      [position]: playerId || '',
    }));
  };

  if (status === 'loading' || formationsLoading || playersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isRecruiter) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <Header />

      <main className="container-custom py-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{t('formations.title')}</h1>
            <p className="text-neutral-600">
              {t('formations.subtitle')}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6">
            <button
              onClick={() => setActiveTab('formations')}
              className={`px-4 sm:px-6 py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base ${
                activeTab === 'formations'
                  ? 'bg-primary text-white'
                  : 'bg-white text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              {t('formations.formations')} ({formations.length})
            </button>
            <button
              onClick={() => setActiveTab('lineups')}
              className={`px-4 sm:px-6 py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base ${
                activeTab === 'lineups'
                  ? 'bg-primary text-white'
                  : 'bg-white text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              {t('formations.lineups')} ({lineups.length})
            </button>
          </div>

          {/* Onglet Formations */}
          {activeTab === 'formations' && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Terrain de basket */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Terrain de basket</h2>
                  {!showCreateForm && (
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="btn btn-primary text-sm"
                    >
                      + Nouvelle formation
                    </button>
                  )}
                </div>

                {showCreateForm ? (
                  <div className="space-y-4">
                    <div>
                      <label className="label">Nom de la formation</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ex: Formation défensive"
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="label">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Description de la formation..."
                        rows={3}
                        className="input"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isDefault"
                        checked={formData.isDefault}
                        onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                        className="rounded"
                      />
                      <label htmlFor="isDefault" className="text-sm">
                        Formation par défaut
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-neutral-500">
                    <div className="text-4xl mb-2">🏀</div>
                    <p>Sélectionnez une formation ou créez-en une nouvelle</p>
                  </div>
                )}

                <BasketballCourt
                  players={availablePlayers}
                  selectedPlayers={currentFormation}
                  onPlayerSelect={handlePlayerSelect}
                  bench={bench}
                  onBenchChange={setBench}
                  className="mt-6"
                />

                {showCreateForm && (
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => {
                        setShowCreateForm(false);
                        setFormData({ name: '', description: '', isDefault: false });
                        setCurrentFormation({});
                        setBench([]);
                      }}
                      className="btn btn-secondary flex-1"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSaveFormation}
                      disabled={createFormationMutation.isPending}
                      className="btn btn-primary flex-1"
                    >
                      {createFormationMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                  </div>
                )}
              </div>

              {/* Liste des formations */}
              <div className="card p-6">
                <h2 className="text-xl font-bold mb-6">Mes formations</h2>

                {formations.length > 0 ? (
                  <div className="space-y-4">
                    {formations.map((formation: any) => (
                      <div
                        key={formation.id}
                        className={`p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                          selectedFormation?.id === formation.id
                            ? 'border-primary bg-primary-50'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                        onClick={() => setSelectedFormation(formation)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold flex items-center gap-2">
                              {formation.name}
                              {formation.isDefault && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                                  Défaut
                                </span>
                              )}
                            </h3>
                            {formation.description && (
                              <p className="text-sm text-neutral-600 mt-1">
                                {formation.description}
                              </p>
                            )}
                          </div>
                          <div className="text-sm text-neutral-500">
                            {new Date(formation.createdAt).toLocaleDateString('fr-FR')}
                          </div>
                        </div>

                        {/* Positions occupées */}
                        <div className="flex gap-2 mt-3">
                          {['pointGuard', 'shootingGuard', 'smallForward', 'powerForward', 'center'].map((pos) => {
                            const playerId = formation[pos];
                            const player = playerId ? availablePlayers.find((p: any) => p.id === playerId) : null;
                            return (
                              <div
                                key={pos}
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  player ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                }`}
                              >
                                {pos.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-neutral-500">
                    <div className="text-4xl mb-2">📋</div>
                    <p>Aucune formation créée</p>
                    <p className="text-sm">Créez votre première formation !</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Onglet Ligneups */}
          {activeTab === 'lineups' && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Mes ligneups</h2>
                <button
                  onClick={handleCreateLineup}
                  disabled={Object.values(currentFormation).filter(Boolean).length === 0}
                  className="btn btn-primary text-sm"
                >
                  + Créer lineup
                </button>
              </div>

              {lineups.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lineups.map((lineup: any) => (
                    <div key={lineup.id} className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow">
                      <h3 className="font-semibold mb-2">{lineup.name}</h3>
                      {lineup.description && (
                        <p className="text-sm text-neutral-600 mb-3">{lineup.description}</p>
                      )}
                      
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Joueurs:</span> {lineup.players.length}
                        </div>
                        {lineup.gameType && (
                          <div className="text-sm">
                            <span className="font-medium">Type:</span> {lineup.gameType}
                          </div>
                        )}
                        {lineup.opponent && (
                          <div className="text-sm">
                            <span className="font-medium">Adversaire:</span> {lineup.opponent}
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-neutral-500 mt-3">
                        {new Date(lineup.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  <div className="text-4xl mb-2">👥</div>
                  <p>Aucune lineup créée</p>
                  <p className="text-sm">Créez votre première lineup !</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function FormationsPage() {
  return (
    <ProtectedRoute requiredRole="RECRUITER" requiresVerification={true} redirectTo="/feed">
      <FormationsPageContent />
    </ProtectedRoute>
  );
}
