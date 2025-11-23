// Plans d'abonnement par défaut si l'API ne fonctionne pas
export const FALLBACK_PLANS = [
  {
    id: 'free-plan',
    name: 'Gratuit',
    type: 'FREE',
    description: 'Accès limité aux fonctionnalités de base',
    price: 0,
    duration: 0,
    features: {
      maxClubs: 1,
      maxPlayers: 5,
      posts: 3,
      canCreateEvents: false,
      canAccessAdvancedStats: false,
      canCreateContracts: false,
      priority: false
    }
  },
  {
    id: 'basic-plan',
    name: 'Basique',
    type: 'BASIC',
    description: 'Accès aux fonctionnalités essentielles',
    price: 100,
    duration: 30,
    features: {
      maxClubs: 3,
      maxPlayers: 50,
      posts: 20,
      canCreateEvents: true,
      canAccessAdvancedStats: true,
      canCreateContracts: false,
      priority: false
    }
  },
  {
    id: 'premium-plan',
    name: 'Premium',
    type: 'PREMIUM',
    description: 'Accès complet aux fonctionnalités avancées',
    price: 500,
    duration: 30,
    features: {
      maxClubs: 10,
      maxPlayers: 200,
      posts: 100,
      canCreateEvents: true,
      canAccessAdvancedStats: true,
      canCreateContracts: true,
      priority: true
    }
  },
  {
    id: 'professional-plan',
    name: 'Professionnel',
    type: 'PROFESSIONAL',
    description: 'Accès illimité à toutes les fonctionnalités',
    price: 1000,
    duration: 30,
    features: {
      maxClubs: null,
      maxPlayers: null,
      posts: -1,
      canCreateEvents: true,
      canAccessAdvancedStats: true,
      canCreateContracts: true,
      priority: true
    }
  }
];

export default FALLBACK_PLANS;
