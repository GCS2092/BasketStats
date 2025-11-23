'use client';

import { useState, useEffect } from 'react';

interface Player {
  id: string;
  fullName: string;
  position?: string;
  avatarUrl?: string;
  jerseyNumber?: number;
}

interface BasketballCourtProps {
  players: Player[];
  selectedPlayers: { [key: string]: string }; // position -> playerId
  onPlayerSelect: (position: string, playerId: string | null) => void;
  bench: string[];
  onBenchChange: (bench: string[]) => void;
  className?: string;
}

// Positions sur le terrain
const COURT_POSITIONS = [
  { id: 'pointGuard', label: 'PG', x: 50, y: 15, color: 'bg-blue-500' },
  { id: 'shootingGuard', label: 'SG', x: 25, y: 25, color: 'bg-green-500' },
  { id: 'smallForward', label: 'SF', x: 75, y: 25, color: 'bg-yellow-500' },
  { id: 'powerForward', label: 'PF', x: 25, y: 75, color: 'bg-orange-500' },
  { id: 'center', label: 'C', x: 50, y: 85, color: 'bg-red-500' },
];

export default function BasketballCourt({
  players,
  selectedPlayers,
  onPlayerSelect,
  bench,
  onBenchChange,
  className = '',
}: BasketballCourtProps) {
  const [draggedPlayer, setDraggedPlayer] = useState<Player | null>(null);
  const [showPlayerSelector, setShowPlayerSelector] = useState<string | null>(null);

  const getPlayerById = (id: string) => players.find(p => p.id === id);
  const getAvailablePlayers = () => players.filter(p => !Object.values(selectedPlayers).includes(p.id) && !bench.includes(p.id));

  const handlePositionClick = (positionId: string) => {
    setShowPlayerSelector(positionId);
  };

  const handlePlayerAssign = (positionId: string, playerId: string) => {
    onPlayerSelect(positionId, playerId);
    setShowPlayerSelector(null);
  };

  const handleRemovePlayer = (positionId: string) => {
    const removedPlayerId = selectedPlayers[positionId];
    onPlayerSelect(positionId, null);
    
    // Remettre le joueur dans la liste disponible
    if (removedPlayerId && !bench.includes(removedPlayerId)) {
      // Le joueur sera automatiquement disponible
    }
  };

  const handleAddToBench = (playerId: string) => {
    if (!bench.includes(playerId)) {
      onBenchChange([...bench, playerId]);
    }
  };

  const handleRemoveFromBench = (playerId: string) => {
    onBenchChange(bench.filter(id => id !== playerId));
  };

  return (
    <div className={`relative ${className}`}>
      {/* Terrain de basket */}
      <div className="relative w-full max-w-2xl mx-auto bg-orange-100 rounded-lg overflow-hidden shadow-lg">
        {/* Terrain SVG */}
        <svg viewBox="0 0 400 300" className="w-full h-auto">
          {/* Lignes du terrain */}
          <rect x="20" y="20" width="360" height="260" fill="none" stroke="#8B4513" strokeWidth="3" />
          
          {/* Ligne centrale */}
          <line x1="200" y1="20" x2="200" y2="280" stroke="#8B4513" strokeWidth="2" />
          
          {/* Cercles */}
          <circle cx="200" cy="150" r="60" fill="none" stroke="#8B4513" strokeWidth="2" />
          <circle cx="200" cy="150" r="15" fill="none" stroke="#8B4513" strokeWidth="2" />
          
          {/* Paniers */}
          <rect x="190" y="10" width="20" height="15" fill="#FF0000" />
          <rect x="190" y="275" width="20" height="15" fill="#FF0000" />
          
          {/* Zones de tir */}
          <path d="M 20 70 L 120 70 L 120 230 L 20 230 Z" fill="none" stroke="#8B4513" strokeWidth="2" />
          <path d="M 280 70 L 380 70 L 380 230 L 280 230 Z" fill="none" stroke="#8B4513" strokeWidth="2" />
          
          {/* Ligne des 3 points */}
          <path d="M 20 70 Q 170 40 200 150 Q 230 40 380 70" fill="none" stroke="#8B4513" strokeWidth="2" />
          <path d="M 20 230 Q 170 260 200 150 Q 230 260 380 230" fill="none" stroke="#8B4513" strokeWidth="2" />
        </svg>

        {/* Positions des joueurs */}
        {COURT_POSITIONS.map((pos) => {
          const playerId = selectedPlayers[pos.id];
          const player = playerId ? getPlayerById(playerId) : null;

          return (
            <div
              key={pos.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
              }}
              onClick={() => handlePositionClick(pos.id)}
            >
              {/* Position vide */}
              {!player && (
                <div className={`w-12 h-12 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center text-white font-bold text-xs bg-gray-300 hover:bg-gray-400 transition-colors`}>
                  {pos.label}
                </div>
              )}

              {/* Joueur assigné */}
              {player && (
                <div className="relative group">
                  <div className={`w-12 h-12 rounded-full ${pos.color} border-2 border-white flex items-center justify-center text-white font-bold text-xs shadow-lg hover:scale-110 transition-transform`}>
                    {player.jerseyNumber || player.fullName.charAt(0)}
                  </div>
                  
                  {/* Tooltip avec infos joueur */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <div className="bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                      <div className="font-semibold">{player.fullName}</div>
                      <div>{player.position || 'N/A'}</div>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
                  </div>

                  {/* Bouton supprimer */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePlayer(pos.id);
                    }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Joueurs disponibles */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3 text-center">Joueurs disponibles</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {getAvailablePlayers().map((player) => (
            <div
              key={player.id}
              className="flex items-center gap-2 p-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleAddToBench(player.id)}
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                {player.avatarUrl ? (
                  <img src={player.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-xs font-semibold text-blue-600">
                    {player.fullName.charAt(0)}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{player.fullName}</div>
                <div className="text-xs text-gray-500">{player.position || 'N/A'}</div>
              </div>
              <button className="text-blue-500 hover:text-blue-700 text-xs">+</button>
            </div>
          ))}
        </div>
      </div>

      {/* Banc (remplaçants) */}
      {bench.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3 text-center">Banc de touche ({bench.length})</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {bench.map((playerId) => {
              const player = getPlayerById(playerId);
              if (!player) return null;

              return (
                <div
                  key={playerId}
                  className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                    {player.avatarUrl ? (
                      <img src={player.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-xs font-semibold text-gray-600">
                        {player.fullName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium">{player.fullName}</span>
                  <button
                    onClick={() => handleRemoveFromBench(playerId)}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal sélection joueur */}
      {showPlayerSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">
              Sélectionner un joueur pour {COURT_POSITIONS.find(p => p.id === showPlayerSelector)?.label}
            </h3>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {getAvailablePlayers().map((player) => (
                <button
                  key={player.id}
                  onClick={() => handlePlayerAssign(showPlayerSelector, player.id)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    {player.avatarUrl ? (
                      <img src={player.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-sm font-semibold text-blue-600">
                        {player.fullName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{player.fullName}</div>
                    <div className="text-sm text-gray-500">
                      {player.position || 'N/A'} • {player.jerseyNumber ? `#${player.jerseyNumber}` : ''}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPlayerSelector(null)}
                className="btn btn-secondary flex-1"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
