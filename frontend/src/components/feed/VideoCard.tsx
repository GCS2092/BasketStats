'use client';

import { useState } from 'react';
import Link from 'next/link';
import VideoPlayer from '../common/VideoPlayer';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface VideoCardProps {
  video: any;
}

export default function VideoCard({ video }: VideoCardProps) {
  const [showDescription, setShowDescription] = useState(false);
  
  // Construire l'URL complète de la vidéo
  const videoUrl = video.filePath.startsWith('http') 
    ? video.filePath 
    : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/${video.filePath}`;

  const thumbnailUrl = video.thumbnailUrl 
    ? (video.thumbnailUrl.startsWith('http') 
      ? video.thumbnailUrl 
      : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/${video.thumbnailUrl}`)
    : undefined;

  return (
    <div className="card overflow-hidden">
      {/* En-tête : Info utilisateur */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/players/${video.userId}`}>
            <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center cursor-pointer hover:ring-2 ring-primary">
              {video.user.avatarUrl ? (
                <img
                  src={video.user.avatarUrl}
                  alt=""
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-lg">👤</span>
              )}
            </div>
          </Link>
          <div>
            <Link href={`/players/${video.userId}`}>
              <h3 className="font-bold hover:text-primary cursor-pointer">
                {video.user.fullName}
              </h3>
            </Link>
            <p className="text-sm text-neutral-500">
              {formatDistanceToNow(new Date(video.createdAt), {
                addSuffix: true,
                locale: fr,
              })}
            </p>
          </div>
        </div>

        {/* Badge Vidéo */}
        <div className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
          Vidéo
        </div>
      </div>

      {/* Player Vidéo */}
      <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
        <VideoPlayer
          src={videoUrl}
          thumbnail={thumbnailUrl}
          title={video.title}
          className="w-full h-full"
        />
      </div>

      {/* Contenu : Titre + Description */}
      <div className="p-4">
        <h2 className="text-xl font-bold mb-2">{video.title}</h2>
        
        {video.description && (
          <div>
            <p className={`text-neutral-700 ${!showDescription ? 'line-clamp-2' : ''}`}>
              {video.description}
            </p>
            {video.description.length > 100 && (
              <button
                onClick={() => setShowDescription(!showDescription)}
                className="text-primary text-sm font-semibold hover:underline mt-1"
              >
                {showDescription ? 'Voir moins' : 'Voir plus'}
              </button>
            )}
          </div>
        )}

        {/* Tags */}
        {video.tags && video.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {video.tags.map((tag: string, index: number) => (
              <span
                key={index}
                className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-6 mt-4 text-sm text-neutral-600">
          <div className="flex items-center gap-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <span>{video.views || 0} vues</span>
          </div>

          {video.duration && (
            <div className="flex items-center gap-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

