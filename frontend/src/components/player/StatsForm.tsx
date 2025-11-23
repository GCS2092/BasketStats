'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';

interface StatsFormProps {
  userId: string;
  currentStats?: any;
}

export default function StatsForm({ userId, currentStats }: StatsFormProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState(currentStats?.season2024 || {
    points: 0,
    assists: 0,
    rebounds: 0,
    steals: 0,
    blocks: 0,
    threePointers: 0,
    fieldGoalPercentage: 0,
    freeThrowPercentage: 0,
  });

  const updateStatsMutation = useMutation({
    mutationFn: async (statsData: any) => {
      return apiClient.put(`/players/${userId}/profile`, {
        stats: { season2024: statsData },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-profile', userId] });
      setIsEditing(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStatsMutation.mutate(stats);
  };

  if (!isEditing) {
    return (
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">📊 Statistiques Saison 2024</h3>
          <button onClick={() => setIsEditing(true)} className="btn btn-secondary text-sm">
            ✏️ Modifier
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">{value as number}</div>
              <div className="text-xs text-neutral-600 uppercase mt-1">
                {key === 'points' ? 'Points' :
                 key === 'assists' ? 'Assists' :
                 key === 'rebounds' ? 'Rebonds' :
                 key === 'steals' ? 'Interceptions' :
                 key === 'blocks' ? 'Contres' :
                 key === 'threePointers' ? '3-points' :
                 key === 'fieldGoalPercentage' ? 'FG%' :
                 key === 'freeThrowPercentage' ? 'LF%' : key}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="text-xl font-bold mb-4">✏️ Modifier mes statistiques</h3>
      <form onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Points par match</label>
            <input
              type="number"
              step="0.1"
              value={stats.points}
              onChange={(e) => setStats({ ...stats, points: parseFloat(e.target.value) || 0 })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Assists par match</label>
            <input
              type="number"
              step="0.1"
              value={stats.assists}
              onChange={(e) => setStats({ ...stats, assists: parseFloat(e.target.value) || 0 })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Rebonds par match</label>
            <input
              type="number"
              step="0.1"
              value={stats.rebounds}
              onChange={(e) => setStats({ ...stats, rebounds: parseFloat(e.target.value) || 0 })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Interceptions</label>
            <input
              type="number"
              step="0.1"
              value={stats.steals}
              onChange={(e) => setStats({ ...stats, steals: parseFloat(e.target.value) || 0 })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Contres</label>
            <input
              type="number"
              step="0.1"
              value={stats.blocks}
              onChange={(e) => setStats({ ...stats, blocks: parseFloat(e.target.value) || 0 })}
              className="input"
            />
          </div>
          <div>
            <label className="label">3-points réussis</label>
            <input
              type="number"
              step="0.1"
              value={stats.threePointers}
              onChange={(e) => setStats({ ...stats, threePointers: parseFloat(e.target.value) || 0 })}
              className="input"
            />
          </div>
          <div>
            <label className="label">% Tirs réussis (FG%)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={stats.fieldGoalPercentage}
              onChange={(e) => setStats({ ...stats, fieldGoalPercentage: parseFloat(e.target.value) || 0 })}
              className="input"
            />
          </div>
          <div>
            <label className="label">% Lancers francs (FT%)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={stats.freeThrowPercentage}
              onChange={(e) => setStats({ ...stats, freeThrowPercentage: parseFloat(e.target.value) || 0 })}
              className="input"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary">
            Annuler
          </button>
          <button
            type="submit"
            disabled={updateStatsMutation.isPending}
            className="btn btn-primary"
          >
            {updateStatsMutation.isPending ? 'Sauvegarde...' : 'Enregistrer les stats'}
          </button>
        </div>
      </form>
    </div>
  );
}

