'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import Header from '@/components/layout/Header';
import NavigationBreadcrumb from '@/components/common/NavigationBreadcrumb';
import ElegantQuickNavigation from '@/components/common/ElegantQuickNavigation';
import PostCard from '@/components/feed/PostCard';
import VideoCard from '@/components/feed/VideoCard';
import CreatePost from '@/components/feed/CreatePost';
import { useAuthSync } from '@/hooks/useAuth';

export default function FeedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Synchroniser les tokens avec localStorage
  useAuthSync();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  // Utiliser le feed mixte (posts + vidéos)
  const { data: feedData, isLoading } = useQuery({
    queryKey: ['mixed-feed'],
    queryFn: async () => {
      const response = await apiClient.get('/posts/feed/mixed');
      return response.data;
    },
    enabled: status === 'authenticated',
  });

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isRecruiter = session?.user?.role === 'RECRUITER';

  return (
    <div className="min-h-screen bg-neutral-100">
      <Header />
      
      {/* Navigation rapide élégante élégante */}
      <ElegantQuickNavigation currentPage="/feed" />
      
      <main className="container-custom py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Bannière de bienvenue selon le rôle */}
          <div className={`card p-6 border-l-4 ${
            isRecruiter 
              ? 'border-l-purple-500 bg-purple-50' 
              : 'border-l-blue-500 bg-blue-50'
          }`}>
            <h2 className="text-2xl font-bold mb-2">
              {isRecruiter ? '🔍 Tableau de bord recruteur' : '🏀 Mon fil d\'actualité'}
            </h2>
            <p className="text-neutral-700">
              {isRecruiter 
                ? `Bienvenue ${session?.user?.name} ! Suivez les performances des joueurs et découvrez de nouveaux talents.`
                : `Bienvenue ${session?.user?.name} ! Partagez vos performances et découvrez la communauté.`
              }
            </p>
          </div>

          {/* Formulaire de création de post */}
          <CreatePost />

          {/* Feed mixte : Posts + Vidéos */}
          {feedData?.feed?.length > 0 ? (
            feedData.feed.map((item: any) => (
              item.type === 'video' ? (
                <VideoCard key={`video-${item.id}`} video={item} />
              ) : (
                <PostCard key={`post-${item.id}`} post={item} />
              )
            ))
          ) : (
            <div className="card p-12 text-center">
              <p className="text-neutral-500 text-lg">Aucun contenu pour le moment</p>
              <p className="text-neutral-400 mt-2">Soyez le premier à partager quelque chose !</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

