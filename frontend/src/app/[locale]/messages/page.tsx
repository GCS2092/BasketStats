'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

export const dynamic = 'force-dynamic';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import Header from '@/components/layout/Header';
import NavigationBreadcrumb from '@/components/common/NavigationBreadcrumb';
import ElegantQuickNavigation from '@/components/common/ElegantQuickNavigation';
import FriendsList from '@/components/messages/FriendsList';
import FriendRequests from '@/components/messages/FriendRequests';
import AddFriend from '@/components/messages/AddFriend';
import { io, Socket } from 'socket.io-client';
import { useAuthSync } from '@/hooks/useAuth';
import { UserGroupIcon, UserPlusIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

function MessagesPageContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [conversationSearch, setConversationSearch] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeTab, setActiveTab] = useState<'conversations' | 'friends' | 'requests' | 'add'>('conversations');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useAuthSync(); // Synchroniser tokens

  // Paramètre pour démarrer une conversation avec un utilisateur
  const targetUserId = searchParams.get('userId');

  // Fonction pour démarrer une conversation avec un ami
  const handleStartConversationWithFriend = (friend: any) => {
    // Créer ou trouver une conversation avec cet ami
    createConversationMutation.mutate({
      participantIds: [friend.id],
      type: 'DIRECT',
    });
    setActiveTab('conversations');
  };

  // Connexion Socket.IO
  useEffect(() => {
    if (!session?.user?.id) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.9:4000/api';
    const socketUrl = apiUrl.replace('/api', '');
    
    console.log('🔌 Connexion Socket.IO à:', socketUrl);

    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket connecté');
      newSocket.emit('register', session.user.id);
    });

    newSocket.on('newMessage', (data) => {
      console.log('📨 Nouveau message reçu:', data);
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [session?.user?.id]);

  // Récupérer les conversations
  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await apiClient.get('/messages/conversations');
      return response.data;
    },
    enabled: !!session,
  });

  // Récupérer les messages d'une conversation
  const { data: messages } = useQuery({
    queryKey: ['messages', selectedConversation],
    queryFn: async () => {
      if (!selectedConversation) return [];
      const response = await apiClient.get(`/messages/conversations/${selectedConversation}/messages`);
      return response.data;
    },
    enabled: !!selectedConversation,
  });

  // Créer une nouvelle conversation
  const createConversationMutation = useMutation({
    mutationFn: async (otherUserId: string) => {
      const response = await apiClient.post('/messages/conversations', { otherUserId });
      return response.data;
    },
    onSuccess: (data) => {
      setSelectedConversation(data.id);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  // Envoyer un message
  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, body }: { conversationId: string; body: string }) => {
      const response = await apiClient.post(`/messages/conversations/${conversationId}/messages`, { body });
      return response.data;
    },
    onSuccess: () => {
      setMessageText('');
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      
      // Émettre via Socket.IO
      if (socket && selectedConversation) {
        socket.emit('sendMessage', {
          conversationId: selectedConversation,
          senderId: session?.user?.id,
          body: messageText,
        });
      }
    },
  });

  // Supprimer un message
  const deleteMessageMutation = useMutation({
    mutationFn: async ({ conversationId, messageId }: { conversationId: string; messageId: string }) => {
      const response = await apiClient.delete(`/messages/conversations/${conversationId}/messages/${messageId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  // Supprimer une conversation
  const deleteConversationMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      const response = await apiClient.delete(`/messages/conversations/${conversationId}`);
      return response.data;
    },
    onSuccess: () => {
      setSelectedConversation(null);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  // Créer conversation si userId fourni
  useEffect(() => {
    if (targetUserId && !selectedConversation) {
      createConversationMutation.mutate(targetUserId);
    }
  }, [targetUserId]);

  // Joindre la conversation via Socket.IO
  useEffect(() => {
    if (socket && selectedConversation) {
      socket.emit('joinConversation', selectedConversation);
      return () => {
        socket.emit('leaveConversation', selectedConversation);
      };
    }
  }, [socket, selectedConversation]);

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation) return;

    sendMessageMutation.mutate({
      conversationId: selectedConversation,
      body: messageText,
    });
  };

  const selectedConvData = conversations?.find((c: any) => c.id === selectedConversation);
  const otherUser = selectedConvData?.participants?.find((p: any) => p.userId !== session?.user?.id)?.user;

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      <Header />
      
      {/* Navigation rapide élégante */}
      <ElegantQuickNavigation currentPage="/messages" />

      <main className="flex-1 container-custom py-6">
        <div className="h-[calc(100vh-12rem)] grid grid-cols-12 gap-6">
          {/* Sidebar avec onglets */}
          <div className="col-span-12 md:col-span-4 card p-0 overflow-hidden">
            {/* Onglets */}
            <div className="flex border-b border-neutral-200">
              <button
                onClick={() => setActiveTab('conversations')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'conversations'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50'
                }`}
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4 inline mr-2" />
                Conversations
              </button>
              <button
                onClick={() => setActiveTab('friends')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'friends'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50'
                }`}
              >
                <UserGroupIcon className="h-4 w-4 inline mr-2" />
                Amis
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'requests'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50'
                }`}
              >
                <UserPlusIcon className="h-4 w-4 inline mr-2" />
                Demandes
              </button>
              <button
                onClick={() => setActiveTab('add')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'add'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50'
                }`}
              >
                <UserPlusIcon className="h-4 w-4 inline mr-2" />
                Ajouter
              </button>
            </div>

            {/* Contenu des onglets */}
            <div className="p-4 overflow-y-auto h-[calc(100%-60px)]">
              {activeTab === 'conversations' && (
                <div>
                  <h2 className="text-lg font-semibold mb-4">💬 Conversations</h2>

            {conversations?.length > 0 ? (
              <>
                <div className="mb-3">
                  <input
                    type="text"
                    value={conversationSearch}
                    onChange={(e) => setConversationSearch(e.target.value)}
                    placeholder="Rechercher une conversation..."
                    className="input w-full"
                  />
                </div>
                <div className="space-y-2">
                {(conversations || []).filter((conv: any) => {
                  if (!conversationSearch.trim()) return true;
                  const other = conv.participants?.find((p: any) => p.userId !== session?.user?.id)?.user;
                  const name = other?.fullName || '';
                  return name.toLowerCase().includes(conversationSearch.toLowerCase());
                }).map((conv: any) => {
                  const otherParticipant = conv.participants.find((p: any) => p.userId !== session?.user?.id);
                  const isSelected = selectedConversation === conv.id;

                  return (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv.id)}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        isSelected ? 'bg-primary-100 border-2 border-primary' : 'hover:bg-neutral-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0">
                          {otherParticipant?.user?.avatarUrl ? (
                            <img
                              src={otherParticipant.user.avatarUrl}
                              alt=""
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            '👤'
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">
                            {otherParticipant?.user?.fullName || 'Utilisateur'}
                          </h3>
                          <p className="text-sm text-neutral-600 truncate">{conv.lastMessage || 'Nouvelle conversation'}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-neutral-500">Aucune conversation</p>
                <p className="text-sm text-neutral-400 mt-2">Commencez à discuter avec des joueurs !</p>
              </div>
            )}
                </div>
              )}

              {activeTab === 'friends' && (
                <FriendsList onStartConversation={handleStartConversationWithFriend} />
              )}

              {activeTab === 'requests' && (
                <FriendRequests />
              )}

              {activeTab === 'add' && (
                <AddFriend />
              )}
            </div>
          </div>

          {/* Zone de chat */}
          <div className="col-span-12 md:col-span-8 card flex flex-col">
            {selectedConversation ? (
              <>
                {/* En-tête de la conversation */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center">
                      {otherUser?.avatarUrl ? (
                        <img src={otherUser.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        '👤'
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold">{otherUser?.fullName || 'Utilisateur'}</h3>
                      <p className="text-xs text-neutral-500">En ligne</p>
                    </div>
                  </div>
                  
                  {/* Bouton de suppression de conversation */}
                  <button
                    onClick={() => {
                      if (confirm('Supprimer cette conversation ? Tous les messages seront perdus.')) {
                        deleteConversationMutation.mutate(selectedConversation);
                      }
                    }}
                    className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                    title="Supprimer la conversation"
                  >
                    🗑️
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-4">
                    {messages?.map((msg: any) => {
                      const isMe = msg.senderId === session?.user?.id;
                      return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                          <div className="flex items-end gap-2">
                            <div
                              className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                                isMe ? 'bg-primary text-white' : 'bg-neutral-200 text-neutral-800'
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{msg.body}</p>
                              <p className={`text-xs mt-1 ${isMe ? 'text-primary-100' : 'text-neutral-500'}`}>
                                {new Date(msg.createdAt).toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                            
                            {/* Bouton de suppression du message (seulement pour l'expéditeur) */}
                            {isMe && (
                              <button
                                onClick={() => {
                                  if (confirm('Supprimer ce message ?')) {
                                    deleteMessageMutation.mutate({
                                      conversationId: selectedConversation,
                                      messageId: msg.id,
                                    });
                                  }
                                }}
                                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-1 rounded transition-all"
                                title="Supprimer le message"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Zone d'envoi */}
                <form onSubmit={handleSendMessage} className="p-4 border-t">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Écrivez votre message..."
                      className="flex-1 input"
                    />
                    <button
                      type="submit"
                      disabled={!messageText.trim() || sendMessageMutation.isPending}
                      className="btn btn-primary"
                    >
                      Envoyer
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <p className="text-neutral-500 text-lg">Sélectionnez une conversation</p>
                  <p className="text-neutral-400 text-sm mt-2">ou créez-en une nouvelle depuis un profil joueur</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    }>
      <MessagesPageContent />
    </Suspense>
  );
}
