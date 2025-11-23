'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api/client';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
  image?: string;
}

export default function BasketballNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBasketballNews();
  }, []);

  const fetchBasketballNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Récupération des actualités basket...');
      const response = await apiClient.get('/news/basketball');
      
      if (response.data && Array.isArray(response.data)) {
        // Trier par date de publication (les plus récentes en premier)
        const sortedNews = response.data.sort((a: NewsItem, b: NewsItem) => 
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
        
        setNews(sortedNews);
        console.log('✅ Actualités récupérées avec succès:', sortedNews.length, 'articles');
      } else {
        throw new Error('Format de données invalide');
      }
    } catch (error) {
      console.error('❌ Erreur récupération actualités:', error);
      setError('Impossible de charger les actualités');
      
      // Fallback vers des actualités de base
      setNews([
        {
          id: 'fallback-1',
          title: 'Actualités Basket Bball Connect',
          description: 'Les dernières actualités du basket seront bientôt disponibles. Revenez plus tard pour découvrir les news du monde du basketball.',
          url: '#',
          publishedAt: new Date().toISOString(),
          source: 'Bball Connect'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const now = new Date();
    const newsDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - newsDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes} min`;
    } else if (diffInMinutes < 1440) { // moins de 24h
      const hours = Math.floor(diffInMinutes / 60);
      return `Il y a ${hours}h`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4 text-center">
        <h2 className="text-xl md:text-2xl font-bold mb-2">
          🏀 Actualités Basket
        </h2>
        <p className="text-sm text-neutral-600">
          Les plus récentes • Mises à jour en temps réel
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-neutral-600">Chargement des actualités...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchBasketballNews}
            className="btn btn-secondary"
          >
            Réessayer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {news.map((item) => (
            <article key={item.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
              {item.image && (
                <div className="relative h-32 sm:h-40 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute top-2 left-2">
                    <span className="bg-primary text-white text-xs px-2 py-1 rounded-full font-medium">
                      {item.source}
                    </span>
                  </div>
                </div>
              )}

              <div className="p-3 sm:p-4">
                <h3 className="text-sm sm:text-base font-bold mb-2 line-clamp-2 leading-tight text-neutral-800 hover:text-primary transition-colors">
                  {item.title}
                </h3>

                <p className="text-neutral-600 mb-3 line-clamp-2 text-xs sm:text-sm leading-relaxed">
                  {item.description}
                </p>

                <div className="flex items-center justify-between text-xs text-neutral-500 mb-3">
                  <span className="font-medium">{formatDate(item.publishedAt)}</span>
                  {!item.image && (
                    <span className="bg-neutral-100 text-neutral-600 px-2 py-1 rounded-full text-xs">
                      {item.source}
                    </span>
                  )}
                </div>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-primary hover:bg-primary/90 text-white text-center py-2 px-3 rounded-lg font-medium transition-colors duration-200 text-sm"
                >
                  Lire l'article →
                </a>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-neutral-200">
        <p className="text-sm text-neutral-500 text-center">
          Sources : ESPN, L'Équipe, NBA.com, LFB, WNBA, FIBA
        </p>
      </div>
    </div>
  );
}
