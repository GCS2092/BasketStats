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

      const endpoint = type === 'image' ? '/upload/image' : '/upload/video';
      
      // Pour FormData, NE PAS définir Content-Type manuellement
      // Axios le définira automatiquement avec le bon boundary
      // L'intercepteur dans apiClient ajoutera automatiquement l'Authorization
      const response = await apiClient.post(endpoint, formData, {
        headers: {
          // Ne pas définir Content-Type pour FormData - Axios le fait automatiquement
        },
        // Augmenter le timeout pour les gros fichiers
        timeout: 60000, // 60 secondes
      });

      const newMedia = {
        type,
        url: response.data.url,
        thumbnail: response.data.thumbnailUrl || response.data.url,
      };

      setMedia((prev) => [...prev, newMedia]);
    } catch (error: any) {
      console.error('Erreur upload:', error);
      
      // Messages d'erreur plus détaillés
      let errorMsg = 'Erreur lors de l\'upload du fichier';
      
      if (error.response) {
        // Erreur du serveur
        errorMsg = error.response.data?.message || error.response.data?.error || errorMsg;
        
        if (error.response.status === 401) {
          errorMsg = 'Vous devez être connecté pour uploader des fichiers';
        } else if (error.response.status === 413) {
          errorMsg = 'Fichier trop volumineux. Taille max: 100MB';
        } else if (error.response.status === 400) {
          errorMsg = error.response.data?.message || 'Format de fichier non autorisé';
        }
      } else if (error.request) {
        // Pas de réponse du serveur
        errorMsg = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
      } else if (error.code === 'ECONNABORTED') {
        errorMsg = 'Upload trop long. Le fichier est peut-être trop volumineux.';
      }
      
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
    <div className="card-modern p-5 mb-6">
      <div className="flex items-start gap-4">
        {/* Avatar moderne avec badge de rôle */}
        <div className="relative flex-shrink-0">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 shadow-md ${
            isRecruiter 
              ? 'bg-gradient-to-br from-purple-400 to-purple-600 border-purple-300' 
              : 'bg-gradient-to-br from-blue-400 to-blue-600 border-blue-300'
          }`}>
            {session?.user?.image ? (
              <SimpleImage
                src={session.user.image}
                alt=""
                width={56}
                height={56}
                className="w-full h-full rounded-full object-cover"
                fill={false}
              />
            ) : (
              <span className="text-2xl">{isRecruiter ? '🔍' : '🏀'}</span>
            )}
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-lg ${
            isRecruiter ? 'bg-purple-600' : 'bg-blue-600'
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
            className={`w-full resize-none border-2 rounded-xl p-4 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
              isRecruiter
                ? 'border-purple-200 focus:ring-purple-500 focus:border-purple-400'
                : 'border-blue-200 focus:ring-blue-500 focus:border-blue-400'
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
                className="px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 flex items-center gap-2"
              >
                <span className="text-lg">📷</span>
                <span>Photo</span>
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
                className="px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 flex items-center gap-2"
              >
                <span className="text-lg">🎥</span>
                <span>Vidéo</span>
              </button>

              {isUploading && (
                <span className="text-sm text-neutral-500 self-center">Chargement...</span>
              )}
            </div>

            <button
              type="submit"
              disabled={(!content.trim() && media.length === 0) || isPosting || isUploading}
              className={`px-6 py-2.5 rounded-xl font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                isRecruiter
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
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

