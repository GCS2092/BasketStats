'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface NetworkAwareImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackSrc?: string;
  priority?: boolean;
}

export default function NetworkAwareImage({
  src,
  alt,
  width = 300,
  height = 200,
  className = '',
  fallbackSrc = '/icons/icon-192x192.png',
  priority = false,
}: NetworkAwareImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fonction pour normaliser les URLs d'images
  const normalizeImageUrl = (url: string): string => {
    if (!url) return fallbackSrc;
    
    // Si c'est une URL relative ou déjà complète, la retourner telle quelle
    if (url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Si c'est une URL relative au backend, construire l'URL complète
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    return `${apiBaseUrl.replace('/api', '')}/${url}`;
  };

  // Fonction pour essayer différentes variantes de l'URL
  const tryImageVariants = async (originalSrc: string) => {
    const variants = [
      originalSrc,
      normalizeImageUrl(originalSrc),
      originalSrc.replace(/192\.168\.\d+\.\d+/, 'localhost'),
      originalSrc.replace(/192\.168\.\d+\.\d+/, '127.0.0.1'),
    ];

    for (const variant of variants) {
      try {
        const response = await fetch(variant, { method: 'HEAD' });
        if (response.ok) {
          setImageSrc(variant);
          setHasError(false);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.log(`Failed to load image variant: ${variant}`);
      }
    }
    
    // Si aucune variante ne fonctionne, utiliser le fallback
    setImageSrc(fallbackSrc);
    setHasError(true);
    setIsLoading(false);
  };

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    tryImageVariants(src);
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImageSrc(fallbackSrc);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={handleError}
        onLoad={handleLoad}
        priority={priority}
        unoptimized={true} // Désactiver l'optimisation pour éviter les problèmes de réseau
      />
      
      {hasError && imageSrc === fallbackSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
          <div className="text-center text-gray-500">
            <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <p className="text-sm">Image non disponible</p>
          </div>
        </div>
      )}
    </div>
  );
}
