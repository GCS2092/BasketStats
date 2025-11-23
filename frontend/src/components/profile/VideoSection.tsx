'use client';

import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import apiClient from '@/lib/api/client';

interface VideoSectionProps {
  userId: string;
  isOwnProfile: boolean;
}

export default function VideoSection({ userId, isOwnProfile }: VideoSectionProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload vidéo
  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (!file) return;

    setUploading(true);
    try {
      // Upload vers serveur
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      
      const uploadResponse = await apiClient.post('/upload/video', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Créer la vidéo dans la base
      await apiClient.post('/videos', {
        fileName: uploadResponse.data.originalName,
        filePath: uploadResponse.data.path,
        fileSize: uploadResponse.data.size,
        mimeType: uploadResponse.data.mimetype,
        title: title || 'Ma vidéo',
        description: description || undefined,
      });

      queryClient.invalidateQueries({ queryKey: ['videos', userId] });
      setShowUploadModal(false);
      e.currentTarget.reset();
    } catch (error) {
      console.error('Erreur upload vidéo:', error);
      alert('Erreur lors de l\'upload de la vidéo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">🎬 Mes vidéos</h2>
        {isOwnProfile && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn btn-primary"
          >
            📹 Ajouter une vidéo
          </button>
        )}
      </div>

      <div className="text-center py-12 text-neutral-500">
        <div className="text-6xl mb-4">🎬</div>
        <p>Aucune vidéo pour le moment</p>
        {isOwnProfile && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn btn-secondary mt-4"
          >
            Ajouter votre première vidéo
          </button>
        )}
      </div>

      {/* Modal Upload */}
      {showUploadModal && isOwnProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-2xl font-bold mb-4">Ajouter une vidéo</h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="label">Vidéo</label>
                <input
                  type="file"
                  name="file"
                  accept="video/*"
                  required
                  className="input"
                />
              </div>
              <div>
                <label className="label">Titre</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Titre de la vidéo"
                  className="input"
                />
              </div>
              <div>
                <label className="label">Description (optionnel)</label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Décrivez votre vidéo..."
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
    </div>
  );
}
