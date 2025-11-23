'use client';

import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import apiClient from '@/lib/api/client';
import NetworkAwareImage from '../common/NetworkAwareImage';

interface AvatarUploadProps {
  currentAvatar?: string;
  userId: string;
}

export default function AvatarUpload({ currentAvatar, userId }: AvatarUploadProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(currentAvatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadAvatarMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      console.log('🚀 Upload avatar en cours...');
      const response = await apiClient.post('/upload/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('✅ Upload réussi:', response.data);
      return response.data;
    },
    onSuccess: async (data) => {
      try {
        console.log('🔄 Mise à jour du profil utilisateur...');
        // Mettre à jour l'utilisateur avec le nouvel avatar
        await apiClient.put(`/users/${userId}`, {
          avatarUrl: data.url,
        });
        
        setPreview(data.url);
        queryClient.invalidateQueries({ queryKey: ['my-profile'] });
        queryClient.invalidateQueries({ queryKey: ['player-profile'] });
        console.log('✅ Profil mis à jour avec succès');
      } catch (error) {
        console.error('❌ Erreur lors de la mise à jour du profil:', error);
        alert('Photo uploadée mais erreur lors de la mise à jour du profil');
      }
    },
    onError: (error) => {
      console.error('❌ Erreur upload avatar:', error);
      alert('Erreur lors de l\'upload de la photo de profil');
      setPreview(currentAvatar);
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation du fichier
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (file.size > maxSize) {
      alert('Le fichier est trop volumineux. Taille maximale : 5MB');
      return;
    }
    
    if (!allowedTypes.includes(file.type)) {
      alert('Format de fichier non supporté. Utilisez JPG, PNG ou WebP');
      return;
    }

    // Preview local
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await uploadAvatarMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Erreur upload avatar:', error);
      alert('Erreur lors de l\'upload de la photo');
      setPreview(currentAvatar);
    } finally {
      setIsUploading(false);
    }
  };

  const isRecruiter = session?.user?.role === 'RECRUITER';

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl overflow-hidden border-4 ${
          isRecruiter ? 'border-purple-300 bg-purple-100' : 'border-blue-300 bg-blue-100'
        }`}>
          {preview ? (
            <NetworkAwareImage
              src={preview}
              alt="Avatar"
              width={128}
              height={128}
              className="w-full h-full object-cover rounded-full"
              priority={true}
            />
          ) : (
            <span>{isRecruiter ? '🔍' : '🏀'}</span>
          )}
        </div>
        
        {isUploading && (
          <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className={`btn text-sm font-semibold ${
          isRecruiter
            ? 'bg-purple-500 hover:bg-purple-600 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {isUploading ? '⏳ Upload...' : '📷 Changer la photo'}
      </button>
      <p className="text-xs text-neutral-500">JPG, PNG ou WebP - Max 5MB</p>
    </div>
  );
}

