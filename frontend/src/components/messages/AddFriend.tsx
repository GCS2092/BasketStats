'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import apiClient from '@/lib/api/client';
import { MagnifyingGlassIcon, UserPlusIcon, CheckIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface User {
  id: string;
  fullName: string;
  avatarUrl?: string;
  role: string;
  bio?: string;
}

interface AddFriendProps {
  className?: string;
}

export default function AddFriend({ className = '' }: AddFriendProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Rechercher des utilisateurs
  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await apiClient.get(`/friends/search?q=${encodeURIComponent(query)}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Envoyer une demande d'amitié
  const sendFriendRequestMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiClient.post('/friends/request', { addresseeId: userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friend-requests-sent'] });
      setSearchTerm('');
      setSearchResults([]);
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchUsers(searchTerm);
  };

  const handleSendRequest = (userId: string) => {
    sendFriendRequestMutation.mutate(userId);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-neutral-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center gap-2 mb-4">
          <UserPlusIcon className="h-5 w-5 text-neutral-600" />
          <h3 className="text-lg font-semibold text-neutral-800">Ajouter un ami</h3>
        </div>

        {/* Formulaire de recherche */}
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher par nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 pl-10 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          </div>
          <button
            type="submit"
            disabled={!searchTerm.trim() || isSearching}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-300 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {isSearching ? 'Recherche...' : 'Rechercher'}
          </button>
        </form>
      </div>

      {/* Résultats de recherche */}
      <div className="max-h-96 overflow-y-auto">
        {searchResults.length === 0 && searchTerm ? (
          <div className="p-4 text-center">
            <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-neutral-300 mb-3" />
            <p className="text-neutral-500">
              {isSearching ? 'Recherche en cours...' : 'Aucun utilisateur trouvé'}
            </p>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="divide-y divide-neutral-100">
            {searchResults.map((user) => (
              <div key={user.id} className="p-4">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    {user.avatarUrl ? (
                      <Image
                        src={user.avatarUrl}
                        alt={user.fullName}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {user.fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Informations */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-neutral-800 truncate">
                      {user.fullName}
                    </h4>
                    <p className="text-sm text-neutral-500 truncate">
                      {user.bio || 'Aucune bio disponible'}
                    </p>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {user.role === 'RECRUITER' ? 'Recruteur' : 
                       user.role === 'PLAYER' ? 'Joueur' : 
                       user.role === 'ADMIN' ? 'Admin' : user.role}
                    </span>
                  </div>

                  {/* Bouton d'ajout */}
                  <button
                    onClick={() => handleSendRequest(user.id)}
                    disabled={sendFriendRequestMutation.isPending}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <UserPlusIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Ajouter</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center">
            <UserPlusIcon className="mx-auto h-12 w-12 text-neutral-300 mb-3" />
            <p className="text-neutral-500">
              Recherchez un utilisateur pour l'ajouter comme ami
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
