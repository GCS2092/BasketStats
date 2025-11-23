'use client';

import { useState, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import apiClient from '@/lib/api/client';

interface VideoGalleryProps {
  userId: string;
  isOwnProfile: boolean;
}

export default function VideoGallery({ userId, isOwnProfile }: VideoGalleryProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Récupérer les vidéos
  const { data: videos, isLoading } = useQuery({
    queryKey: ['videos', userId],
    queryFn: async () => {
      const response = await apiClient.get(`/videos?userId=${userId}`);
      return response.data;
    },
  });

  // Upload vidéo
  const uploadVideoMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return apiClient.post('/upload/video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: async (response) => {
      // Créer l'entrée vidéo dans la base
      await apiClient.post('/videos', {
        title: 'Ma vidéo',
        fileName: response.data.fileName,
        filePath: response.data.filePath,
        fileSize: response.data.fileSize,
        mimeType: response.data.mimeType,
        thumbnailUrl: response.data.thumbnailUrl,
      });
      queryClient.invalidateQueries({ queryKey: ['videos', userId] });
    },
  });

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await uploadVideoMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Erreur upload vidéo:', error);
      alert('Erreur lors de l\'upload de la vidéo');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">🎥 Vidéos highlights</h2>
        {isOwnProfile && (
          <>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
            />
            <button
              onClick={() => videoInputRef.current?.click()}
              disabled={isUploading}
              className="btn btn-primary text-sm"
            >
              {isUploading ? '⏳ Upload...' : '+ Ajouter une vidéo'}
            </button>
          </>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : videos && videos.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {videos.map((video: any) => (
            <div key={video.id} className="bg-neutral-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <video
                src={video.filePath}
                controls
                poster={video.thumbnailUrl}
                className="w-full h-48 object-cover"
              />
              <div className="p-3">
                <h3 className="font-semibold">{video.title}</h3>
                {video.description && (
                  <p className="text-sm text-neutral-600 mt-1">{video.description}</p>
                )}
                <div className="flex gap-4 mt-2 text-xs text-neutral-500">
                  <span>👁️ {video.views || 0} vues</span>
                  <span>📅 {new Date(video.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎥</div>
          <p className="text-neutral-500">
            {isOwnProfile
              ? 'Aucune vidéo pour le moment. Ajoutez vos meilleurs highlights !'
              : 'Aucune vidéo disponible'}
          </p>
        </div>
      )}
    </div>
  );
}

