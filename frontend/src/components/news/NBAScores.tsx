'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api/client';

interface NBAGame {
  id: string;
  date: string;
  homeTeam: {
    id: string;
    name: string;
    abbreviation: string;
    score: number;
  };
  visitorTeam: {
    id: string;
    name: string;
    abbreviation: string;
    score: number;
  };
  status: string;
  season: number;
  period: number;
  time: string;
}

export default function NBAScores() {
  const [games, setGames] = useState<NBAGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNBAScores();
  }, []);

  const fetchNBAScores = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get('/news/nba/scores?per_page=10');
      const data = response.data;
      setGames(data);
    } catch (error) {
      console.error('Erreur récupération scores NBA:', error);
      setError('Impossible de charger les scores NBA');
    } finally {
      setLoading(false);
    }
  };

  const formatGameDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  const getGameStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'final':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-3"></div>
        <p className="text-neutral-600 text-sm">Chargement des scores...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 text-lg mb-3">⚠️</div>
        <p className="text-red-600 mb-3 text-sm">{error}</p>
        <button
          onClick={fetchNBAScores}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {games.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-neutral-400 text-lg mb-3">🏀</div>
          <p className="text-neutral-600 text-sm">Aucun match NBA récent trouvé</p>
        </div>
      ) : (
        games.map((game) => (
          <div key={game.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-neutral-500">
                {formatGameDate(game.date)}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGameStatusColor(game.status)}`}>
                {game.status}
              </span>
            </div>

            <div className="flex items-center justify-between">
              {/* Équipe visiteur */}
              <div className="flex items-center space-x-2 flex-1">
                <div className="w-6 h-6 bg-neutral-200 rounded-full flex items-center justify-center text-xs font-bold">
                  {game.visitorTeam.abbreviation}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-800 text-sm truncate">{game.visitorTeam.name}</p>
                  <p className="text-xs text-neutral-500">{game.visitorTeam.abbreviation}</p>
                </div>
                <div className="text-lg font-bold text-neutral-800">
                  {game.visitorTeam.score || '-'}
                </div>
              </div>

              {/* VS */}
              <div className="mx-2 sm:mx-4 text-neutral-400 font-bold text-sm">VS</div>

              {/* Équipe domicile */}
              <div className="flex items-center space-x-2 flex-1">
                <div className="text-lg font-bold text-neutral-800">
                  {game.homeTeam.score || '-'}
                </div>
                <div className="flex-1 text-right min-w-0">
                  <p className="font-medium text-neutral-800 text-sm truncate">{game.homeTeam.name}</p>
                  <p className="text-xs text-neutral-500">{game.homeTeam.abbreviation}</p>
                </div>
                <div className="w-6 h-6 bg-neutral-200 rounded-full flex items-center justify-center text-xs font-bold">
                  {game.homeTeam.abbreviation}
                </div>
              </div>
            </div>

            {game.status.toLowerCase() === 'in progress' && game.time && (
              <div className="mt-3 pt-3 border-t border-neutral-200">
                <p className="text-sm text-center text-neutral-600">
                  Période {game.period} - {game.time}
                </p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
