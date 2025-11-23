// Script de test pour vérifier le menu hamburger admin
function testAdminMenu() {
  console.log('🧪 [TEST] Test du menu hamburger admin...\n');

  // Simulation des données de session admin
  const adminSession = {
    user: {
      id: 'admin-123',
      fullName: 'Administrateur BasketStats',
      email: 'admin@basketstats.com',
      role: 'ADMIN',
      verified: true
    }
  };

  // Simulation de la fonction getNavigationItems pour ADMIN
  const getNavigationItems = (session) => {
    if (!session?.user) {
      return [
        { href: '/feed', label: 'Feed', icon: '📰', description: 'Actualités' },
        { href: '/players', label: 'Joueurs', icon: '👥', description: 'Découvrir les talents' },
        { href: '/clubs', label: 'Clubs', icon: '🏢', description: 'Équipes et organisations' },
        { href: '/events', label: 'Événements', icon: '📅', description: 'Compétitions et tryouts' },
      ];
    }

    const user = session.user;
    const baseItems = [
      { href: '/feed', label: 'Feed', icon: '📰', description: 'Actualités' },
      { href: '/players', label: 'Joueurs', icon: '👥', description: 'Découvrir les talents' },
      { href: '/clubs', label: 'Clubs', icon: '🏢', description: 'Équipes et organisations' },
      { href: '/events', label: 'Événements', icon: '📅', description: 'Compétitions et tryouts' },
    ];

    if (user.role === 'ADMIN') {
      return [
        { href: '/admin', label: 'Dashboard Admin', icon: '🛡️', description: 'Tableau de bord admin' },
        { href: '/admin/users', label: 'Utilisateurs', icon: '👥', description: 'Gestion des comptes' },
        { href: '/admin/clubs', label: 'Clubs', icon: '🏢', description: 'Approbation des clubs' },
        { href: '/admin/posts', label: 'Posts', icon: '📝', description: 'Modération des contenus' },
        { href: '/admin/reports', label: 'Signalements', icon: '🚨', description: 'Traitement des rapports' },
        { href: '/admin/moderation-alerts', label: 'Modération Auto', icon: '🛡️', description: 'Alertes automatiques' },
        { href: '/admin/stats', label: 'Statistiques', icon: '📊', description: 'Analyses détaillées' },
        ...baseItems,
        { href: '/messages', label: 'Messages', icon: '💬', description: 'Conversations' },
        { href: '/notifications', label: 'Notifications', icon: '🔔', description: 'Alertes et mises à jour' },
        { href: '/profile', label: 'Profil', icon: '👤', description: 'Mon profil' },
      ];
    }

    return baseItems;
  };

  // Test avec session admin
  console.log('📋 [TEST] Test avec session admin:');
  const adminItems = getNavigationItems(adminSession);
  
  console.log(`  ✅ Nombre d'options: ${adminItems.length}/14`);
  console.log(`  ✅ Rôle détecté: ${adminSession.user.role}`);
  console.log(`  ✅ Nom d'utilisateur: ${adminSession.user.fullName}`);
  
  console.log('\n📋 [TEST] Options d\'administration:');
  const adminOptions = adminItems.filter(item => item.href.startsWith('/admin'));
  adminOptions.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.icon} ${item.label} (${item.href})`);
  });
  
  console.log('\n📋 [TEST] Options générales:');
  const generalOptions = adminItems.filter(item => !item.href.startsWith('/admin'));
  generalOptions.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.icon} ${item.label} (${item.href})`);
  });

  // Vérifications
  console.log('\n🔍 [TEST] Vérifications:');
  
  const expectedAdminOptions = [
    '/admin',
    '/admin/users',
    '/admin/clubs',
    '/admin/posts',
    '/admin/reports',
    '/admin/moderation-alerts',
    '/admin/stats'
  ];
  
  const expectedGeneralOptions = [
    '/feed',
    '/players',
    '/clubs',
    '/events',
    '/messages',
    '/notifications',
    '/profile'
  ];

  // Vérifier les options d'administration
  const adminHrefs = adminOptions.map(item => item.href);
  const missingAdminOptions = expectedAdminOptions.filter(href => !adminHrefs.includes(href));
  const extraAdminOptions = adminHrefs.filter(href => !expectedAdminOptions.includes(href));

  if (missingAdminOptions.length === 0) {
    console.log('  ✅ Toutes les options d\'administration sont présentes');
  } else {
    console.log('  ❌ Options d\'administration manquantes:', missingAdminOptions);
  }

  if (extraAdminOptions.length === 0) {
    console.log('  ✅ Aucune option d\'administration en trop');
  } else {
    console.log('  ⚠️ Options d\'administration en trop:', extraAdminOptions);
  }

  // Vérifier les options générales
  const generalHrefs = generalOptions.map(item => item.href);
  const missingGeneralOptions = expectedGeneralOptions.filter(href => !generalHrefs.includes(href));

  if (missingGeneralOptions.length === 0) {
    console.log('  ✅ Toutes les options générales sont présentes');
  } else {
    console.log('  ❌ Options générales manquantes:', missingGeneralOptions);
  }

  // Vérifier le total
  if (adminItems.length === 14) {
    console.log('  ✅ Nombre total d\'options correct (14)');
  } else {
    console.log(`  ❌ Nombre total d'options incorrect: ${adminItems.length}/14`);
  }

  // Test avec session non-admin
  console.log('\n📋 [TEST] Test avec session non-admin:');
  const nonAdminSession = {
    user: {
      id: 'user-123',
      fullName: 'Utilisateur Test',
      email: 'user@test.com',
      role: 'PLAYER',
      verified: false
    }
  };

  const nonAdminItems = getNavigationItems(nonAdminSession);
  console.log(`  ✅ Nombre d'options: ${nonAdminItems.length}`);
  console.log(`  ✅ Rôle détecté: ${nonAdminSession.user.role}`);
  
  const hasAdminOptions = nonAdminItems.some(item => item.href.startsWith('/admin'));
  if (!hasAdminOptions) {
    console.log('  ✅ Aucune option d\'administration pour les non-admins');
  } else {
    console.log('  ❌ Options d\'administration visibles pour les non-admins');
  }

  console.log('\n🎉 [TEST] Test terminé !');
  console.log('📊 [TEST] Résumé:');
  console.log(`  - Options admin: ${adminOptions.length}/7`);
  console.log(`  - Options générales: ${generalOptions.length}/7`);
  console.log(`  - Total: ${adminItems.length}/14`);
  console.log(`  - Rôle admin: ${adminSession.user.role}`);
  console.log(`  - Nom: ${adminSession.user.fullName}`);
}

// Exécuter le test
testAdminMenu();
