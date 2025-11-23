'use client';

import Image from 'next/image';
import { useState } from 'react';

interface SimpleImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
}

export default function SimpleImage({ 
  src, 
  alt, 
  width = 400, 
  height = 300, 
  className = '', 
  priority = false,
  fill = false,
  sizes
}: SimpleImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Normaliser l'URL de l'image
  const normalizeImageUrl = (url: string): string => {
    if (!url) return '/icons/icon-192x192.png';
    
    // Si c'est une URL complète, la retourner telle quelle
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Si c'est une URL relative, la retourner telle quelle
    if (url.startsWith('/')) {
      return url;
    }
    
    // Construire l'URL complète
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://192.168.1.118:3001';
    return `${apiBaseUrl}/${url}`;
  };

  const imageUrl = normalizeImageUrl(src);

  console.log(`🖼️ [SIMPLE_IMAGE] Chargement: ${imageUrl}`);

  // Si erreur de chargement, afficher une image de fallback
  if (imageError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={fill ? {} : { width, height }}
      >
        <div className="text-gray-400 text-center">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-xs">Image non disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
          style={fill ? {} : { width, height }}
        >
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
      
      <Image
        src={imageUrl}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        sizes={sizes}
        priority={priority}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => {
          console.log(`✅ [SIMPLE_IMAGE] Image chargée: ${imageUrl}`);
          setIsLoading(false);
        }}
        onError={() => {
          console.log(`❌ [SIMPLE_IMAGE] Erreur chargement: ${imageUrl}`);
          setImageError(true);
          setIsLoading(false);
        }}
        // Configuration pour les images HTTP
        unoptimized={true}
      />
    </div>
  );
}
