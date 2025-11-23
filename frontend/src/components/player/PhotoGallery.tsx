'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import SimpleImage from '@/components/common/SimpleImage';

interface PhotoGalleryProps {
  userId: string;
  isOwnProfile: boolean;
}

export default function PhotoGallery({ userId, isOwnProfile }: PhotoGalleryProps) {
  const queryClient = useQueryClient();
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Récupérer les photos
  const { data: photosData, isLoading } = useQuery({
    queryKey: ['photos', userId],
    queryFn: async () => {
      const response = await apiClient.get(`/photos/user/${userId}`);
      return response.data;
    },
  });

  // Upload photo
  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get('file') as File;
    const caption = formData.get('caption') as string;

    if (!file) return;

    setUploading(true);
    try {
      // Upload vers serveur
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      
      const uploadResponse = await apiClient.post('/upload/image', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Créer la photo dans la base
      await apiClient.post('/photos', {
        fileName: uploadResponse.data.originalName,
        filePath: uploadResponse.data.path,
        fileSize: uploadResponse.data.size,
        mimeType: uploadResponse.data.mimetype,
        caption: caption || undefined,
      });

      queryClient.invalidateQueries({ queryKey: ['photos', userId] });
      setShowUploadModal(false);
      e.currentTarget.reset();
    } catch (error) {
      console.error('Erreur upload photo:', error);
      alert('Erreur lors de l\'upload de la photo');
    } finally {
      setUploading(false);
    }
  };

  // Supprimer photo
  const deleteMutation = useMutation({
    mutationFn: (photoId: string) => apiClient.delete(`/photos/${photoId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos', userId] });
      setSelectedPhoto(null);
    },
  });

  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const { pinnedPhoto, photos = [] } = photosData || {};
  const allPhotos = pinnedPhoto ? [pinnedPhoto, ...photos] : photos;

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          📸 Galerie photos
          <span className="text-sm font-normal text-neutral-500">
            ({allPhotos.length} photo{allPhotos.length > 1 ? 's' : ''})
          </span>
        </h2>
        {isOwnProfile && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn btn-primary text-sm"
          >
            + Ajouter une photo
          </button>
        )}
      </div>

      {/* Grille de photos */}
      {allPhotos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {allPhotos.map((photo: any, index: number) => {
            const photoUrl = photo.filePath.startsWith('http') 
              ? photo.filePath 
              : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/${photo.filePath}`;

            return (
              <div
                key={photo.id}
                className="relative aspect-square rounded-lg overflow-hidden bg-neutral-200 cursor-pointer group"
                onClick={() => setSelectedPhoto(photo)}
              >
                <SimpleImage
                  src={photoUrl}
                  alt={photo.caption || `Photo ${index + 1}`}
                  width={300}
                  height={300}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  fill={false}
                />
                
                {/* Badge épinglé */}
                {photo.isPinned && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-500 text-white rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                    📌 Épinglée
                  </div>
                )}

                {/* Overlay hover */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                    />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-neutral-500">
          <div className="text-6xl mb-4">📷</div>
          <p>Aucune photo pour le moment</p>
          {isOwnProfile && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn btn-secondary mt-4"
            >
              Ajouter votre première photo
            </button>
          )}
        </div>
      )}

      {/* Modal Upload */}
      {showUploadModal && isOwnProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-2xl font-bold mb-4">Ajouter une photo</h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="label">Photo</label>
                <input
                  type="file"
                  name="file"
                  accept="image/*"
                  required
                  className="input"
                />
              </div>
              <div>
                <label className="label">Légende (optionnel)</label>
                <textarea
                  name="caption"
                  rows={3}
                  placeholder="Ajoutez une description..."
                  className="input"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="btn btn-secondary flex-1"
                  disabled={uploading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                  disabled={uploading}
                >
                  {uploading ? 'Upload...' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Vue Photo */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <MobileImage
                src={selectedPhoto.filePath.startsWith('http') 
                  ? selectedPhoto.filePath 
                  : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/${selectedPhoto.filePath}`}
                alt={selectedPhoto.caption || 'Photo'}
                width={800}
                height={600}
                className="w-full rounded-lg"
                fill={false}
              />
              
              {/* Bouton fermer */}
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-neutral-100 shadow-lg"
              >
                ✕
              </button>

              {/* Actions (si propriétaire) */}
              {isOwnProfile && (
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button
                    onClick={() => {
                      if (confirm('Supprimer cette photo ?')) {
                        deleteMutation.mutate(selectedPhoto.id);
                      }
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-lg"
                  >
                    🗑️ Supprimer
                  </button>
                </div>
              )}
            </div>

            {/* Légende */}
            {selectedPhoto.caption && (
              <div className="mt-4 p-4 bg-white rounded-lg">
                <p className="text-neutral-800">{selectedPhoto.caption}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

