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
    <div className="card p-6">
      <div className="flex items-start gap-4">
        <Link href={`/players/${post.user.id}`}>
          <div className="w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
            {post.user.avatarUrl ? (
              <img src={post.user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              '👤'
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
            
            {/* Badge de rôle */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${
              post.user.role === 'RECRUITER'
                ? 'bg-purple-100 text-purple-700 border-purple-300'
                : post.user.role === 'ADMIN'
                ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                : 'bg-blue-100 text-blue-700 border-blue-300'
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

          {/* Boutons d'interaction */}
          <div className="flex items-center gap-6 text-neutral-600 border-t pt-4">
            <button
              onClick={handleLike}
              disabled={likeMutation.isPending}
              className={`flex items-center gap-2 transition-colors ${
                isLiked ? 'text-red-500' : 'hover:text-red-500'
              }`}
            >
              <span className="text-xl">{isLiked ? '❤️' : '🤍'}</span>
              <span className="font-medium">{likesCount}</span>
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              <span className="text-xl">💬</span>
              <span className="font-medium">{post.commentsCount}</span>
            </button>
            <button className="flex items-center gap-2 hover:text-primary transition-colors">
              <span className="text-xl">🔗</span>
              <span className="font-medium">Partager</span>
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

