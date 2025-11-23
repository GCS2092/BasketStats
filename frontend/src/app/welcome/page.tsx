'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function WelcomePage() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Récupérer les informations utilisateur
    const user = localStorage.getItem('user');
    if (user) {
      setUserInfo(JSON.parse(user));
    }
  }, []);

  const handleStartPayment = () => {
    setIsLoading(true);
    // Rediriger vers la page d'abonnement
    router.push('/subscription?newUser=true');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header avec logo */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6">
              <span className="text-4xl">🏀</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Bienvenue sur BB Ball Connection !
            </h1>
            <p className="text-xl text-blue-100">
              La plateforme de référence pour les joueurs de basket et les recruteurs
            </p>
          </div>

          {/* Contenu principal */}
          <div className="px-8 py-12">
            {userInfo && (
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  Salut {userInfo.fullName || userInfo.email} ! 👋
                </h2>
                <p className="text-gray-600">
                  Votre compte a été créé avec succès. Choisissez maintenant votre plan d'abonnement pour accéder à toutes les fonctionnalités.
                </p>
              </div>
            )}

            {/* Fonctionnalités principales */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Analytics Avancés</h3>
                <p className="text-sm text-gray-600">Suivez vos performances et statistiques détaillées</p>
              </div>

              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Recrutement</h3>
                <p className="text-sm text-gray-600">Connectez-vous avec des recruteurs et clubs</p>
              </div>

              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Réseau Social</h3>
                <p className="text-sm text-gray-600">Partagez vos exploits et connectez-vous</p>
              </div>
            </div>

            {/* Message d'encouragement */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="text-2xl">💡</span>
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-blue-800 mb-2">
                    Prêt à commencer votre aventure ?
                  </h3>
                  <p className="text-blue-700">
                    Choisissez le plan qui correspond à vos besoins et débloquez toutes les fonctionnalités de BB Ball Connection.
                    Commencez avec le plan Premium pour une expérience complète !
                  </p>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleStartPayment}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading ? 'Chargement...' : '🚀 Choisir mon plan d\'abonnement'}
              </button>

              <button
                onClick={handleLogout}
                className="bg-gray-200 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-300 transition-all duration-200"
              >
                Se déconnecter
              </button>
            </div>

            {/* Informations supplémentaires */}
            <div className="mt-8 text-center text-sm text-gray-500">
              <p>
                Vous pouvez changer de plan à tout moment dans vos paramètres.
                <br />
                <span className="font-medium">Support client disponible 24/7</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
