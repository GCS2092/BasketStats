'use client';

import { useState, useEffect } from 'react';
import { usePersistentAuth } from '@/hooks/usePersistentAuth';

export default function MobilePersistenceTest() {
  const { 
    isAuthenticated, 
    isInactive, 
    lastActivity, 
    updateActivity,
    extendSession 
  } = usePersistentAuth();
  
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // Tests automatiques
  useEffect(() => {
    const tests = [];

    // Test 1: Vérifier l'authentification
    if (isAuthenticated) {
      tests.push('✅ Utilisateur authentifié');
    } else {
      tests.push('❌ Utilisateur non authentifié');
    }

    // Test 2: Vérifier localStorage
    const isStored = localStorage.getItem('basketstats_user_authenticated') === 'true';
    if (isStored) {
      tests.push('✅ État sauvegardé dans localStorage');
    } else {
      tests.push('❌ État non sauvegardé dans localStorage');
    }

    // Test 3: Vérifier l'inactivité
    if (isInactive) {
      tests.push('⚠️ Utilisateur inactif');
    } else {
      tests.push('✅ Utilisateur actif');
    }

    // Test 4: Vérifier le temps depuis la dernière activité
    const timeSinceActivity = Math.floor((Date.now() - lastActivity) / 1000);
    tests.push(`⏰ Inactif depuis ${timeSinceActivity} secondes`);

    setTestResults(tests);
  }, [isAuthenticated, isInactive, lastActivity]);

  // Simuler une activité
  const simulateActivity = () => {
    updateActivity();
    setTestResults(prev => [...prev, '🔄 Activité simulée']);
  };

  // Tester la prolongation de session
  const testExtendSession = async () => {
    try {
      await extendSession();
      setTestResults(prev => [...prev, '⏰ Session prolongée']);
    } catch (error) {
      setTestResults(prev => [...prev, '❌ Erreur lors de la prolongation']);
    }
  };

  // Vérifier la taille d'écran
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 z-50 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
        title="Afficher les tests"
      >
        🧪
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white border border-neutral-200 rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm text-neutral-800">
          Tests Mobile & Persistence
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-neutral-400 hover:text-neutral-600"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2 mb-4">
        <div className="text-xs text-neutral-600">
          <strong>Écran:</strong> {isMobile ? '📱 Mobile' : '💻 Desktop'}
        </div>
        
        {testResults.map((result, index) => (
          <div key={index} className="text-xs">
            {result}
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <button
          onClick={simulateActivity}
          className="w-full bg-green-500 text-white text-xs py-2 px-3 rounded hover:bg-green-600 transition-colors"
        >
          Simuler activité
        </button>
        
        <button
          onClick={testExtendSession}
          className="w-full bg-blue-500 text-white text-xs py-2 px-3 rounded hover:bg-blue-600 transition-colors"
        >
          Prolonger session
        </button>
        
        <button
          onClick={() => setTestResults([])}
          className="w-full bg-neutral-200 text-neutral-700 text-xs py-2 px-3 rounded hover:bg-neutral-300 transition-colors"
        >
          Effacer logs
        </button>
      </div>
    </div>
  );
}
