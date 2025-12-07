'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import apiClient from '@/lib/api/client';
import Link from 'next/link';
import SimpleImage from '@/components/common/SimpleImage';

interface PostCardProps {
  post: {
    id: string;
    content: string;
    media?: any; // JSON avec photos/vidéos
    likesCount: number;
    commentsCount: number;
    createdAt: string;
    user: {
      id: string;
      fullName: string;
      avatarUrl?: string;
      role: string;
    };
  };
}

export default function PostCard({ post }: PostCardProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount);

  // Récupérer les commentaires
  const { data: comments } = useQuery({
    queryKey: ['comments', post.id],
    queryFn: async () => {
      const response = await apiClient.get(`/posts/${post.id}/comments`);
      return response.data;
    },
    enabled: showComments,
  });

  // Mutation pour liker/unliker
  const likeMutation = useMutation({
    mutationFn: async () => {
      return apiClient.post(`/posts/${post.id}/like`);
    },
    onSuccess: (response) => {
      setIsLiked(response.data.liked);
      setLikesCount(response.data.liked ? likesCount + 1 : likesCount - 1);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  // Mutation pour commenter
  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiClient.post(`/posts/${post.id}/comment`, { content });
    },
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['comments', post.id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const handleLike = () => {
    likeMutation.mutate();
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    commentMutation.mutate(commentText);
  };

  return (
    <div className="card-modern p-5 mb-4">
      <div className="flex items-start gap-4">
        <Link href={`/players/${post.user.id}`}>
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center flex-shrink-0 cursor-pointer hover:opacity-90 transition-all duration-200 hover:scale-105 shadow-md border-2 border-white">
            {post.user.avatarUrl ? (
              <img src={post.user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-2xl">👤</span>
            )}
          </div>
        </Link>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <div className="flex items-center gap-1">
              <Link href={`/players/${post.user.id}`} className="hover:underline">
                <h3 className="font-bold">{post.user.fullName}</h3>
              </Link>
            </div>
            
            {/* Badge de rôle moderne */}
            <span className={`badge-modern ${
              post.user.role === 'RECRUITER'
                ? 'bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 border border-purple-200'
                : post.user.role === 'ADMIN'
                ? 'bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-700 border border-yellow-200'
                : 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 border border-blue-200'
            }`}>
              <span>{post.user.role === 'RECRUITER' ? '🔍' : post.user.role === 'ADMIN' ? '👑' : '🏀'}</span>
              <span>{post.user.role === 'RECRUITER' ? 'Recruteur' : post.user.role === 'ADMIN' ? 'Admin' : 'Joueur'}</span>
            </span>

            <span className="text-sm text-neutral-500">
              · {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: fr })}
            </span>
          </div>

          <p className="text-neutral-700 mb-4 whitespace-pre-wrap">{post.content}</p>

          {/* Affichage des médias */}
          {post.media && Array.isArray(post.media) && post.media.length > 0 && (
            <div className={`mb-4 grid gap-2 ${post.media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {post.media.map((item: any, index: number) => (
                <div key={index} className="relative rounded-lg overflow-hidden">
                  {item.type === 'image' ? (
                    <SimpleImage
                      src={item.url}
                      alt="Post media"
                      width={400}
                      height={300}
                      className="w-full h-auto object-cover"
                      fill={false}
                    />
                  ) : item.type === 'video' ? (
                    <video
                      src={item.url}
                      controls
                      className="w-full h-auto"
                      poster={item.thumbnail}
                    >
                      Votre navigateur ne supporte pas les vidéos.
                    </video>
                  ) : null}
                </div>
              ))}
            </div>
          )}

          {/* Boutons d'interaction modernes */}
          <div className="flex items-center gap-4 text-neutral-600 border-t border-neutral-100 pt-4 mt-4">
            <button
              onClick={handleLike}
              disabled={likeMutation.isPending}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 hover:bg-red-50 ${
                isLiked ? 'text-red-500 bg-red-50' : 'hover:text-red-500'
              }`}
            >
              <span className="text-xl">{isLiked ? '❤️' : '🤍'}</span>
              <span className="font-semibold">{likesCount}</span>
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
            >
              <span className="text-xl">💬</span>
              <span className="font-semibold">{post.commentsCount}</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-neutral-100 hover:text-primary transition-all duration-200">
              <span className="text-xl">🔗</span>
              <span className="font-semibold">Partager</span>
            </button>
          </div>

          {/* Section commentaires */}
          {showComments && (
            <div className="mt-4 pt-4 border-t space-y-4">
              {/* Formulaire d'ajout de commentaire */}
              {session && (
                <form onSubmit={handleComment} className="flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Ajouter un commentaire..."
                    className="flex-1 input text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim() || commentMutation.isPending}
                    className="btn btn-primary text-sm disabled:opacity-50"
                  >
                    {commentMutation.isPending ? '...' : 'Envoyer'}
                  </button>
                </form>
              )}

              {/* Liste des commentaires */}
              {comments && comments.length > 0 ? (
                <div className="space-y-3">
                  {comments.map((comment: any) => (
                    <div key={comment.id} className="flex gap-3 bg-neutral-50 p-3 rounded-lg">
                      <Link href={`/players/${comment.user.id}`}>
                        <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0 cursor-pointer">
                          {comment.user.avatarUrl ? (
                            <img
                              src={comment.user.avatarUrl}
                              alt=""
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            '👤'
                          )}
                        </div>
                      </Link>
                      <div className="flex-1">
                        <Link href={`/players/${comment.user.id}`} className="hover:underline">
                          <p className="font-semibold text-sm">{comment.user.fullName}</p>
                        </Link>
                        <p className="text-sm text-neutral-700 mt-1">{comment.content}</p>
                        <p className="text-xs text-neutral-500 mt-1">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : showComments && (
                <p className="text-sm text-neutral-500 text-center py-4">
                  Aucun commentaire pour le moment
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

