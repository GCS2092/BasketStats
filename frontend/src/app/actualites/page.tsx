'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import NavigationBreadcrumb from '@/components/common/NavigationBreadcrumb';
import BasketballNews from '@/components/news/BasketballNews';
import NBAScores from '@/components/news/NBAScores';

export default function ActualitesPage() {
  const [activeTab, setActiveTab] = useState('news'); // 'news' ou 'scores'

  return (
    <div className="min-h-screen bg-neutral-100">
      <Header />
      
      <main className="container-custom py-6">
        {/* Breadcrumb */}
        <NavigationBreadcrumb 
          items={[
            { label: 'Accueil', href: '/' },
            { label: 'Actualités Basket', href: '/actualites' }
          ]} 
        />

        {/* Header de la page */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            🏀 Actualités Basket
          </h1>
          <p className="text-sm md:text-base text-neutral-600">
            Les dernières actualités et scores NBA en temps réel
          </p>
        </div>

        {/* Onglets */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-neutral-200 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('news')}
              className={`flex-1 py-2 px-3 rounded-md font-medium transition-colors text-sm ${
                activeTab === 'news'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-neutral-600 hover:text-primary'
              }`}
            >
              📰 Actualités
            </button>
            <button
              onClick={() => setActiveTab('scores')}
              className={`flex-1 py-2 px-3 rounded-md font-medium transition-colors text-sm ${
                activeTab === 'scores'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-neutral-600 hover:text-primary'
              }`}
            >
              🏀 Scores NBA
            </button>
          </div>
        </div>

        {/* Contenu */}
        {activeTab === 'news' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Dernières actualités</h2>
            <BasketballNews />
          </div>
        )}

        {activeTab === 'scores' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Scores NBA récents</h2>
            <NBAScores />
          </div>
        )}

        {/* Footer avec sources */}
        <div className="mt-12 pt-6 border-t border-neutral-200">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">Sources des données</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-neutral-600">
              <div>
                <h4 className="font-medium mb-2">📰 Actualités</h4>
                <ul className="space-y-1">
                  <li>• ESPN NBA News</li>
                  <li>• L'Équipe Basket</li>
                  <li>• Yahoo Sports NBA</li>
                  <li>• NBA.com</li>
                  <li>• CBS Sports NBA</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">🏀 Scores NBA</h4>
                <ul className="space-y-1">
                  <li>• ESPN NBA Scoreboard</li>
                  <li>• NBA.com Stats</li>
                  <li>• balldontlie.io</li>
                  <li>• Mise à jour en temps réel</li>
                </ul>
              </div>
            </div>
            <p className="text-xs text-neutral-500 mt-4">
              Les données sont mises à jour automatiquement toutes les quelques minutes
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}