'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import Header from '@/components/layout/Header';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useAuthSync } from '@/hooks/useAuth';

export default function AdminPostsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [moderationReason, setModerationReason] = useState('');
  
  useAuthSync();

  // Vérifier si l'utilisateur est admin
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [session, status, router]);

  // Récupérer les posts
  const { data: postsData, isLoading } = useQuery({
    queryKey: ['admin-posts', currentPage, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      });
      
      if (statusFilter) params.append('status', statusFilter);
      
      const response = await apiClient.get(`/admin/posts?${params}`);
      return response.data;
    },
    enabled: !!session && session.user?.role === 'ADMIN',
  });

  // Mutation pour modérer un post
  const moderatePostMutation = useMutation({
    mutationFn: async ({ postId, status, reason }: { postId: string; status: string; reason?: string }) => {
      const response = await apiClient.put(`/admin/posts/${postId}/moderate`, { status, reason });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      setShowModal(false);
      setModerationReason('');
    },
  });

  // Mutation pour supprimer un post
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await apiClient.delete(`/admin/posts/${postId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      setShowModal(false);
    },
  });

  const handleModeratePost = (post: any, status: string) => {
    setSelectedPost(post);
    setShowModal(true);
    setModerationReason('');
  };

  const confirmModeration = (status: string) => {
    if (selectedPost) {
      moderatePostMutation.mutate({ 
        postId: selectedPost.id, 
        status, 
        reason: moderationReason || undefined 
      });
    }
  };

  const handleDeletePost = (post: any) => {
    setSelectedPost(post);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (selectedPost) {
      deletePostMutation.mutate(selectedPost.id);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'ADMIN') {
    return null;
  }

  const posts = postsData?.posts || [];
  const pagination = postsData?.pagination || {};

  return (
    <div className="min-h-screen bg-neutral-100">
      <Header />
      
      <div className="flex">
        <AdminSidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />

        <div className="flex-1 lg:ml-64">
          <div className="p-6">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-neutral-800 mb-2">
                    📝 Modération des posts
                  </h1>
                  <p className="text-neutral-600">
                    Gérer et modérer le contenu publié par les utilisateurs
                  </p>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 bg-white rounded-lg shadow-sm border border-neutral-200"
                >
                  <span className="text-xl">☰</span>
                </button>
              </div>
            </div>

            {/* Filtres */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-neutral-200">
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Statut
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Tous les statuts</option>
                    <option value="PENDING">En attente</option>
                    <option value="PUBLISHED">Publié</option>
                    <option value="REJECTED">Rejeté</option>
                    <option value="HIDDEN">Masqué</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setStatusFilter('');
                      setCurrentPage(1);
                    }}
                    className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors"
                  >
                    Réinitialiser
                  </button>
                </div>
              </div>
            </div>

            {/* Liste des posts */}
            <div className="space-y-4">
              {posts.map((post: any) => (
                <div key={post.id} className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {post.user.fullName?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-800">{post.user.fullName}</p>
                        <p className="text-sm text-neutral-500">
                          {new Date(post.createdAt).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <span className={`
                      px-2 py-1 text-xs font-semibold rounded-full
                      ${post.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                        post.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        post.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'}
                    `}>
                      {post.status === 'PUBLISHED' ? 'Publié' :
                       post.status === 'PENDING' ? 'En attente' :
                       post.status === 'REJECTED' ? 'Rejeté' :
                       post.status === 'HIDDEN' ? 'Masqué' : post.status}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-neutral-700 mb-2">{post.content}</p>
                    {post.images && post.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {post.images.slice(0, 4).map((image: string, index: number) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-neutral-500">
                      <span>👍 {post._count.likes}</span>
                      <span>💬 {post._count.comments}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {post.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleModeratePost(post, 'PUBLISHED')}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                          >
                            Approuver
                          </button>
                          <button
                            onClick={() => handleModeratePost(post, 'REJECTED')}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                          >
                            Rejeter
                          </button>
                        </>
                      )}
                      
                      {post.status === 'PUBLISHED' && (
                        <button
                          onClick={() => handleModeratePost(post, 'HIDDEN')}
                          className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg transition-colors"
                        >
                          Masquer
                        </button>
                      )}

                      <button
                        onClick={() => handleDeletePost(post)}
                        className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded-lg transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-6 bg-white rounded-lg shadow-sm p-4 border border-neutral-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-neutral-700">
                    Affichage de {((pagination.page - 1) * pagination.limit) + 1} à{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} sur{' '}
                    {pagination.total} posts
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-neutral-300 rounded hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Précédent
                    </button>
                    <span className="px-3 py-1 text-sm">
                      Page {pagination.page} sur {pagination.pages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === pagination.pages}
                      className="px-3 py-1 text-sm border border-neutral-300 rounded hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de modération */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-neutral-800 mb-4">
              Modérer le post
            </h3>
            
            {selectedPost && (
              <div className="mb-4 p-3 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-700 line-clamp-3">
                  {selectedPost.content}
                </p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Raison de la modération (optionnel)
              </label>
              <textarea
                value={moderationReason}
                onChange={(e) => setModerationReason(e.target.value)}
                placeholder="Expliquez la raison de cette action..."
                rows={3}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setModerationReason('');
                }}
                className="flex-1 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors"
              >
                Annuler
              </button>
              
              {selectedPost?.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => confirmModeration('PUBLISHED')}
                    disabled={moderatePostMutation.isPending}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    Approuver
                  </button>
                  <button
                    onClick={() => confirmModeration('REJECTED')}
                    disabled={moderatePostMutation.isPending}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    Rejeter
                  </button>
                </>
              )}

              {selectedPost?.status === 'PUBLISHED' && (
                <button
                  onClick={() => confirmModeration('HIDDEN')}
                  disabled={moderatePostMutation.isPending}
                  className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  Masquer
                </button>
              )}

              <button
                onClick={confirmDelete}
                disabled={deletePostMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {deletePostMutation.isPending ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
