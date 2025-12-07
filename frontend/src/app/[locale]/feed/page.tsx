'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from '@/i18n/routing';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

export const dynamic = 'force-dynamic';
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
  const t = useTranslations();
  
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
          {/* Bannière de bienvenue moderne selon le rôle */}
          <div className={`card-modern p-6 mb-6 ${
            isRecruiter 
              ? 'bg-gradient-to-r from-purple-50 to-purple-100 border-l-4 border-purple-500' 
              : 'bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500'
          }`}>
            <h2 className="text-2xl font-bold mb-2 text-neutral-800">
              {isRecruiter ? '🔍 ' + t('feed.recruiterTitle') : '🏀 ' + t('feed.title')}
            </h2>
            <p className="text-neutral-700 text-base">
              {isRecruiter 
                ? t('feed.recruiterWelcome', { name: session?.user?.name || '' })
                : t('feed.welcome', { name: session?.user?.name || '' })
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
            <div className="card-modern p-12 text-center">
              <div className="text-6xl mb-4">📰</div>
              <p className="text-neutral-600 text-lg font-medium">{t('feed.noContent')}</p>
              <p className="text-neutral-400 mt-2 text-sm">{t('feed.beFirst')}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

