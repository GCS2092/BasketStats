'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import Header from '@/components/layout/Header';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export default function SearchPage() {
  const t = useTranslations();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    position: '',
    level: '',
    country: '',
  });

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', query, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(query && { query }),
        ...(filters.position && { position: filters.position }),
        ...(filters.level && { level: filters.level }),
        ...(filters.country && { country: filters.country }),
      });
      const response = await apiClient.get(`/players/search?${params}`);
      return response.data;
    },
    enabled: query.length > 0 || Object.values(filters).some((v) => v),
  });

  return (
    <div className="min-h-screen bg-neutral-100">
      <Header />

      <main className="container-custom py-6">
        <div className="card p-6 mb-6">
          <h1 className="text-2xl font-bold mb-6">{t('search.title')} 🔍</h1>

          {/* Barre de recherche */}
          <div className="mb-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search.placeholder')}
              className="input w-full text-lg"
            />
          </div>

          {/* Filtres */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="label">{t('search.position')}</label>
              <select
                value={filters.position}
                onChange={(e) => setFilters({ ...filters, position: e.target.value })}
                className="input"
              >
                <option value="">{t('search.all')}</option>
                <option value="PG">Point Guard</option>
                <option value="SG">Shooting Guard</option>
                <option value="SF">Small Forward</option>
                <option value="PF">Power Forward</option>
                <option value="C">Center</option>
              </select>
            </div>

            <div>
              <label className="label">{t('search.level')}</label>
              <select
                value={filters.level}
                onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                className="input"
              >
                <option value="">{t('search.all')}</option>
                <option value="PRO">{t('search.pro')}</option>
                <option value="SEMI_PRO">{t('search.semiPro')}</option>
                <option value="AMATEUR">{t('search.amateur')}</option>
                <option value="YOUTH">{t('search.youth')}</option>
              </select>
            </div>

            <div>
              <label className="label">{t('search.country')}</label>
              <input
                type="text"
                value={filters.country}
                onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                placeholder={t('search.countryPlaceholder')}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Résultats */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : results?.players?.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.players.map((player: any) => (
              <Link key={player.id} href={`/players/${player.userId}`}>
                <div className="card p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-neutral-200 flex items-center justify-center text-2xl">
                      {player.user.avatarUrl ? (
                        <img src={player.user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        '👤'
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="font-bold text-lg">{player.user.fullName}</h3>
                      {player.nickname && <p className="text-neutral-600 text-sm">"{player.nickname}"</p>}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {player.position && (
                      <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-sm">
                        {player.position}
                      </span>
                    )}
                    {player.level && (
                      <span className="px-2 py-1 bg-accent-100 text-accent-700 rounded text-sm">
                        {player.level}
                      </span>
                    )}
                    {player.currentClub && (
                      <span className="px-2 py-1 bg-neutral-200 text-neutral-700 rounded text-sm">
                        {player.currentClub}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                    <div>
                      <div className="font-bold">{player.heightCm || '-'}</div>
                      <div className="text-neutral-500 text-xs">{t('search.height')}</div>
                    </div>
                    <div>
                      <div className="font-bold">{player.yearsExperience || '-'}</div>
                      <div className="text-neutral-500 text-xs">{t('search.years')}</div>
                    </div>
                    <div>
                      <div className="font-bold">{player.profileViews}</div>
                      <div className="text-neutral-500 text-xs">{t('search.views')}</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <p className="text-neutral-500 text-lg">
              {query || Object.values(filters).some((v) => v)
                ? t('search.noResults')
                : t('search.useFilters')}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

