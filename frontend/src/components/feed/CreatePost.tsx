'use client';

import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { useSession } from 'next-auth/react';
import SimpleImage from '@/components/common/SimpleImage';

export default function CreatePost() {
  const { data: session } = useSession();
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [media, setMedia] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const isRecruiter = session?.user?.role === 'RECRUITER';
  
  const placeholder = isRecruiter
    ? "Partagez une opportunité, une actualité de votre club ou recherchez des talents..."
    : "Quoi de neuf ? Partagez vos performances, entraînements, matchs, objectifs...";

  const createPostMutation = useMutation({
    mutationFn: async (data: { content: string; media?: any[] }) => {
      const response = await apiClient.post('/posts', data);
      return response.data;
    },
    onSuccess: () => {
      setContent('');
      setMedia([]);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  // Upload de fichier
  const handleFileUpload = async (file: File, type: 'image' | 'video') => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Récupérer le token depuis le localStorage ou la session
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const sessionToken = session?.accessToken;
      const authToken = token || sessionToken;

      const endpoint = type === 'image' ? '/upload/image' : '/upload/video';
      const response = await apiClient.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        },
      });

      const newMedia = {
        type,
        url: response.data.url,
        thumbnail: response.data.thumbnailUrl || response.data.url,
      };

      setMedia((prev) => [...prev, newMedia]);
    } catch (error: any) {
      console.error('Erreur upload:', error);
      const errorMsg = error.response?.data?.message || 'Erreur lors de l\'upload du fichier';
      alert(errorMsg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file, 'image');
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file, 'video');
  };

  const removeMedia = (index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && media.length === 0) return;

    setIsPosting(true);
    try {
      await createPostMutation.mutateAsync({
        content,
        media: media.length > 0 ? media : undefined,
      });
    } catch (error) {
      console.error('Erreur création post:', error);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className={`card p-6 border-l-4 ${
      isRecruiter ? 'border-l-purple-500' : 'border-l-blue-500'
    }`}>
      <div className="flex items-start gap-4">
        {/* Avatar avec badge de rôle */}
        <div className="relative flex-shrink-0">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
            isRecruiter 
              ? 'bg-purple-100 border-purple-300' 
              : 'bg-blue-100 border-blue-300'
          }`}>
            {session?.user?.image ? (
              <SimpleImage
                src={session.user.image}
                alt=""
                width={48}
                height={48}
                className="w-full h-full rounded-full object-cover"
                fill={false}
              />
            ) : (
              <span className="text-xl">{isRecruiter ? '🔍' : '🏀'}</span>
            )}
          </div>
          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
            isRecruiter ? 'bg-purple-500' : 'bg-blue-500'
          }`}>
            {isRecruiter ? '🔍' : '🏀'}
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className={`w-full resize-none border-2 rounded-lg p-3 focus:outline-none focus:ring-2 focus:border-transparent ${
              isRecruiter
                ? 'border-purple-300 focus:ring-purple-500'
                : 'border-blue-300 focus:ring-blue-500'
            }`}
            rows={3}
          />

          {/* Aperçu des médias */}
          {media.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {media.map((item, index) => (
                <div key={index} className="relative">
                  {item.type === 'image' ? (
                    <SimpleImage
                      src={item.url}
                      alt="Preview"
                      width={200}
                      height={160}
                      className="w-full h-40 object-cover rounded-lg"
                      fill={false}
                    />
                  ) : (
                    <div className="w-full h-40 bg-neutral-200 rounded-lg flex items-center justify-center">
                      <span className="text-4xl">🎥</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeMedia(index)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center mt-3">
            <div className="flex gap-2">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={isUploading}
                className="px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50"
              >
                📷 Photo
              </button>

              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                disabled={isUploading}
                className="px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50"
              >
                🎥 Vidéo
              </button>

              {isUploading && (
                <span className="text-sm text-neutral-500 self-center">Chargement...</span>
              )}
            </div>

            <button
              type="submit"
              disabled={(!content.trim() && media.length === 0) || isPosting || isUploading}
              className={`btn font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${
                isRecruiter
                  ? 'bg-purple-500 hover:bg-purple-600 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isPosting ? 'Publication...' : isRecruiter ? '📢 Publier l\'annonce' : '✨ Publier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

