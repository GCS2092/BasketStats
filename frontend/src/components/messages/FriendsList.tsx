'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import apiClient from '@/lib/api/client';
import { UserPlusIcon, ChatBubbleLeftRightIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface Friend {
  id: string;
  fullName: string;
  avatarUrl?: string;
  role: string;
  lastLogin?: string;
  friendshipId: string;
  isOnline: boolean;
}

interface FriendsListProps {
  onStartConversation: (friend: Friend) => void;
  className?: string;
}

export default function FriendsList({ onStartConversation, className = '' }: FriendsListProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  // Récupérer la liste des amis
  const { data: friends, isLoading, error } = useQuery({
    queryKey: ['friends'],
    queryFn: async () => {
      const response = await apiClient.get('/friends');
      return response.data as Friend[];
    },
    enabled: !!session,
  });

  // Filtrer les amis selon le terme de recherche
  const filteredFriends = friends?.filter(friend =>
    friend.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleStartConversation = (friend: Friend) => {
    onStartConversation(friend);
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-neutral-200 ${className}`}>
        <div className="p-4 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-800">Mes Amis</h3>
        </div>
        <div className="p-4">
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neutral-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-neutral-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-neutral-200 ${className}`}>
        <div className="p-4 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-800">Mes Amis</h3>
        </div>
        <div className="p-4 text-center">
          <p className="text-neutral-500">Erreur lors du chargement des amis</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-neutral-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-neutral-800">Mes Amis</h3>
          <span className="text-sm text-neutral-500">
            {friends?.length || 0} ami{friends?.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        {/* Barre de recherche */}
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher un ami..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 pl-10 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <UserCircleIcon className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
        </div>
      </div>

      {/* Liste des amis */}
      <div className="max-h-96 overflow-y-auto">
        {filteredFriends.length === 0 ? (
          <div className="p-4 text-center">
            <UserCircleIcon className="mx-auto h-12 w-12 text-neutral-300 mb-3" />
            <p className="text-neutral-500 mb-2">
              {searchTerm ? 'Aucun ami trouvé' : 'Aucun ami pour le moment'}
            </p>
            {!searchTerm && (
              <p className="text-sm text-neutral-400">
                Ajoutez des amis pour commencer à discuter
              </p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {filteredFriends.map((friend) => (
              <div
                key={friend.id}
                className="p-4 hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    {friend.avatarUrl ? (
                      <Image
                        src={friend.avatarUrl}
                        alt={friend.fullName}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {friend.fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    
                    {/* Indicateur en ligne */}
                    {friend.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>

                  {/* Informations de l'ami */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-neutral-800 truncate">
                        {friend.fullName}
                      </h4>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        {friend.role === 'RECRUITER' ? 'Recruteur' : 
                         friend.role === 'PLAYER' ? 'Joueur' : 
                         friend.role === 'ADMIN' ? 'Admin' : friend.role}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-500">
                      {friend.isOnline ? 'En ligne' : 
                       friend.lastLogin ? `Vu il y a ${Math.floor((new Date().getTime() - new Date(friend.lastLogin).getTime()) / (1000 * 60))} min` :
                       'Jamais connecté'}
                    </p>
                  </div>

                  {/* Bouton de conversation */}
                  <button
                    onClick={() => handleStartConversation(friend)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <ChatBubbleLeftRightIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Discuter</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
