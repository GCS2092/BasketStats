'use client';

import StatsChart from './StatsChart';

interface PlayerAveragesProps {
  averages: {
    points: string;
    rebounds: string;
    assists: string;
    steals: string;
    blocks: string;
    fieldGoalPercentage: string;
    threePointPercentage: string;
  };
  gamesPlayed: number;
}

export default function PlayerAverages({ averages, gamesPlayed }: PlayerAveragesProps) {
  const mainStats = [
    { label: 'Points', value: parseFloat(averages.points) },
    { label: 'Rebonds', value: parseFloat(averages.rebounds) },
    { label: 'Passes', value: parseFloat(averages.assists) },
    { label: 'Interceptions', value: parseFloat(averages.steals) },
    { label: 'Contres', value: parseFloat(averages.blocks) },
  ];

  const shootingStats = [
    { label: 'Tirs réussis', value: parseFloat(averages.fieldGoalPercentage), max: 100 },
    { label: 'Tirs à 3 points', value: parseFloat(averages.threePointPercentage), max: 100 },
  ];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">📊 Moyennes par match</h2>
        <p className="text-orange-100">
          Sur {gamesPlayed} match{gamesPlayed > 1 ? 's' : ''} joué{gamesPlayed > 1 ? 's' : ''}
        </p>
      </div>

      {/* Stats principales */}
      <StatsChart 
        data={mainStats}
        title="Stats principales"
      />

      {/* Pourcentages de tir */}
      <StatsChart 
        data={shootingStats}
        title="Précision au tir"
      />

      {/* Résumé rapide */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-orange-600">{averages.points}</div>
          <div className="text-sm text-neutral-600">PTS</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">{averages.rebounds}</div>
          <div className="text-sm text-neutral-600">REB</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-green-600">{averages.assists}</div>
          <div className="text-sm text-neutral-600">AST</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-purple-600">{averages.steals}</div>
          <div className="text-sm text-neutral-600">STL</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-red-600">{averages.blocks}</div>
          <div className="text-sm text-neutral-600">BLK</div>
        </div>
      </div>
    </div>
  );
}

