'use client';

import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';

export default function ValidationPendingScreen() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header avec logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🏀</span>
          </div>
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">
            BasketStats
          </h1>
          <p className="text-neutral-600">
            La plateforme de recrutement pour basketteurs professionnels et amateurs
          </p>
        </div>

        {/* Carte principale */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-neutral-200">
          {/* Statut d'attente */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⏳</span>
            </div>
            <h2 className="text-2xl font-bold text-neutral-800 mb-2">
              Compte en attente de validation
            </h2>
            <p className="text-neutral-600">
              Bonjour <strong>{session?.user?.fullName || session?.user?.email}</strong>,
              votre compte recruteur est en cours de validation par notre équipe.
            </p>
          </div>

          {/* Informations sur le processus */}
          <div className="bg-blue-50 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <span>📋</span>
              Processus de validation
            </h3>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Vérification de l'authenticité de votre entreprise
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Validation de vos documents professionnels
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Contrôle de votre activité de recrutement
              </li>
            </ul>
            <p className="text-blue-700 text-sm mt-3">
              ⏱️ Délai moyen : 24-48 heures
            </p>
          </div>

          {/* Description de BasketStats */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
              <span>🌟</span>
              À propos de BasketStats
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <span>👥</span>
                  Base de joueurs
                </h4>
                <p className="text-green-800 text-sm">
                  Accès à une base de données complète de joueurs de tous niveaux, 
                  avec leurs statistiques détaillées et profils complets.
                </p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                  <span>🔍</span>
                  Outils de recherche
                </h4>
                <p className="text-purple-800 text-sm">
                  Filtres avancés pour trouver les joueurs qui correspondent 
                  exactement à vos critères de recrutement.
                </p>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-4">
                <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                  <span>📊</span>
                  Analytics détaillées
                </h4>
                <p className="text-orange-800 text-sm">
                  Statistiques complètes et analyses de performance 
                  pour évaluer le potentiel des joueurs.
                </p>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <span>💬</span>
                  Communication directe
                </h4>
                <p className="text-blue-800 text-sm">
                  Système de messagerie intégré pour contacter 
                  directement les joueurs qui vous intéressent.
                </p>
              </div>
            </div>
          </div>

          {/* Fonctionnalités principales */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
              <span>⚡</span>
              Fonctionnalités disponibles après validation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                <span className="text-xl">🎯</span>
                <span className="text-sm font-medium">Recherche avancée</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                <span className="text-xl">📧</span>
                <span className="text-sm font-medium">Envoi d'offres</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                <span className="text-xl">📅</span>
                <span className="text-sm font-medium">Gestion d'événements</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                <span className="text-xl">⭐</span>
                <span className="text-sm font-medium">Favoris</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                <span className="text-xl">📊</span>
                <span className="text-sm font-medium">Tableau de bord</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                <span className="text-xl">🏢</span>
                <span className="text-sm font-medium">Gestion de clubs</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-neutral-200">
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex-1 px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors font-medium"
            >
              🚪 Se déconnecter
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 px-6 py-3 bg-primary hover:bg-primary-600 text-white rounded-lg transition-colors font-medium"
            >
              🔄 Vérifier le statut
            </button>
          </div>

          {/* Contact support */}
          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-500 mb-2">
              Des questions ? Besoin d'aide ?
            </p>
            <a 
              href="mailto:support@basketstats.com" 
              className="text-primary hover:text-primary-600 font-medium text-sm"
            >
              📧 Contactez notre support
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-neutral-500">
          <p>
            BasketStats - Connectant les talents du basketball depuis 2025
          </p>
        </div>
      </div>
    </div>
  );
}
