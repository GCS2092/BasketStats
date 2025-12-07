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
    <div className="flex flex-col items-center gap-4 mb-6">
      <div className="relative group">
        <div className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl overflow-hidden border-4 shadow-xl ${
          isRecruiter 
            ? 'border-purple-300 bg-gradient-to-br from-purple-100 to-purple-200' 
            : 'border-blue-300 bg-gradient-to-br from-blue-100 to-blue-200'
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
        
        {/* Bouton caméra moderne */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={`absolute bottom-0 right-0 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 hover:scale-110 ${
            isRecruiter
              ? 'bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
              : 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
          }`}
        >
          {isUploading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
          ) : (
            <span className="text-lg">📷</span>
          )}
        </button>
        
        {isUploading && (
          <div className="absolute inset-0 rounded-full bg-black bg-opacity-30 flex items-center justify-center backdrop-blur-sm">
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

      <p className="text-xs text-neutral-500 text-center">JPG, PNG ou WebP - Max 5MB</p>
    </div>
  );
}

