'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import apiClient from '@/lib/api/client';
import { UserPlusIcon, CheckIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface FriendRequest {
  id: string;
  requester: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    role: string;
    bio?: string;
  };
  status: string;
  createdAt: string;
}

interface FriendRequestsProps {
  className?: string;
}

export default function FriendRequests({ className = '' }: FriendRequestsProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');

  // Récupérer les demandes reçues
  const { data: receivedRequests, isLoading: loadingReceived } = useQuery({
    queryKey: ['friend-requests-received'],
    queryFn: async () => {
      const response = await apiClient.get('/friends/requests/received');
      return response.data as FriendRequest[];
    },
    enabled: !!session,
  });

  // Récupérer les demandes envoyées
  const { data: sentRequests, isLoading: loadingSent } = useQuery({
    queryKey: ['friend-requests-sent'],
    queryFn: async () => {
      const response = await apiClient.get('/friends/requests/sent');
      return response.data as FriendRequest[];
    },
    enabled: !!session,
  });

  // Accepter une demande
  const acceptRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      await apiClient.put(`/friends/request/${requestId}/accept`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friend-requests-received'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });

  // Refuser une demande
  const declineRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      await apiClient.put(`/friends/request/${requestId}/decline`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friend-requests-received'] });
    },
  });

  const handleAccept = (requestId: string) => {
    acceptRequestMutation.mutate(requestId);
  };

  const handleDecline = (requestId: string) => {
    declineRequestMutation.mutate(requestId);
  };

  const currentRequests = activeTab === 'received' ? receivedRequests : sentRequests;
  const isLoading = activeTab === 'received' ? loadingReceived : loadingSent;

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-neutral-200 ${className}`}>
      {/* Header avec onglets */}
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center gap-1 mb-4">
          <UserPlusIcon className="h-5 w-5 text-neutral-600" />
          <h3 className="text-lg font-semibold text-neutral-800">Demandes d'amitié</h3>
        </div>
        
        <div className="flex gap-1 bg-neutral-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('received')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'received'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-800'
            }`}
          >
            Reçues ({receivedRequests?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'sent'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-800'
            }`}
          >
            Envoyées ({sentRequests?.length || 0})
          </button>
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="p-4">
            <div className="animate-pulse space-y-3">
              {[...Array(2)].map((_, i) => (
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
        ) : currentRequests?.length === 0 ? (
          <div className="p-4 text-center">
            <ClockIcon className="mx-auto h-12 w-12 text-neutral-300 mb-3" />
            <p className="text-neutral-500">
              {activeTab === 'received' 
                ? 'Aucune demande reçue' 
                : 'Aucune demande envoyée'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {currentRequests?.map((request) => (
              <div key={request.id} className="p-4">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    {request.requester.avatarUrl ? (
                      <Image
                        src={request.requester.avatarUrl}
                        alt={request.requester.fullName}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {request.requester.fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Informations */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-neutral-800 truncate">
                      {request.requester.fullName}
                    </h4>
                    <p className="text-sm text-neutral-500 truncate">
                      {request.requester.bio || 'Aucune bio disponible'}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>

                  {/* Actions */}
                  {activeTab === 'received' && request.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(request.id)}
                        disabled={acceptRequestMutation.isPending}
                        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <CheckIcon className="h-4 w-4" />
                        Accepter
                      </button>
                      <button
                        onClick={() => handleDecline(request.id)}
                        disabled={declineRequestMutation.isPending}
                        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <XMarkIcon className="h-4 w-4" />
                        Refuser
                      </button>
                    </div>
                  )}

                  {activeTab === 'sent' && (
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        request.status === 'PENDING' 
                          ? 'bg-yellow-100 text-yellow-700'
                          : request.status === 'ACCEPTED'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {request.status === 'PENDING' ? 'En attente' :
                         request.status === 'ACCEPTED' ? 'Acceptée' :
                         request.status === 'DECLINED' ? 'Refusée' : request.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
