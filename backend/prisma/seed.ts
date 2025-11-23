import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding...\n');

  // Hash du mot de passe par défaut
  const passwordHash = await bcrypt.hash('password123', 10);

  // ========================================
  // 1. JOUEURS PROFESSIONNELS
  // ========================================

  console.log('🏀 Création des joueurs professionnels...');

  // Joueur 1 : Point Guard français
  const player1 = await prisma.user.upsert({
    where: { email: 'thomas.dubois@basketstats.com' },
    update: {},
    create: {
      email: 'thomas.dubois@basketstats.com',
      passwordHash,
      fullName: 'Thomas Dubois',
      role: 'PLAYER',
      avatarUrl: null,
      bio: 'Point Guard professionnel avec 8 ans d\'expérience. Champion de France 2022.',
      verified: true,
      active: true,
    },
  });

  await prisma.playerProfile.upsert({
    where: { userId: player1.id },
    update: {},
    create: {
      userId: player1.id,
      nickname: 'T-Dub',
          heightCm: 188,
          weightKg: 82,
      position: 'PG',
      secondaryPos: 'SG',
      dominantHand: 'RIGHT',
      birthdate: new Date('1995-03-15'),
      currentClub: 'ASVEL Lyon-Villeurbanne',
      level: 'PRO',
      availability: 'THREE_MONTHS',
      jerseyNumber: 7,
      yearsExperience: 8,
      achievements: ['Champion de France 2022', 'MVP Finale 2022', 'All-Star 2023'],
          country: 'France',
      city: 'Lyon',
          certified: true,
          certifiedAt: new Date(),
          stats: {
        points: 16.5,
        rebounds: 3.2,
        assists: 7.8,
        steals: 2.1,
        blocks: 0.3,
      },
    },
  });

  // Joueur 2 : Center américain
  const player2 = await prisma.user.upsert({
    where: { email: 'marcus.johnson@basketstats.com' },
    update: {},
    create: {
      email: 'marcus.johnson@basketstats.com',
      passwordHash,
      fullName: 'Marcus Johnson',
      role: 'PLAYER',
      bio: 'Center dominant avec expérience NCAA Division 1. Spécialiste défensif.',
      verified: true,
      active: true,
    },
  });

  await prisma.playerProfile.upsert({
    where: { userId: player2.id },
    update: {},
        create: {
      userId: player2.id,
      nickname: 'Big Marc',
      heightCm: 211,
      weightKg: 110,
      position: 'C',
      dominantHand: 'RIGHT',
      birthdate: new Date('1998-07-22'),
      currentClub: 'Free Agent',
      level: 'SEMI_PRO',
      availability: 'IMMEDIATELY',
      jerseyNumber: 33,
      yearsExperience: 4,
      achievements: ['NCAA All-Conference 2020', 'Defensive Player of the Year 2021'],
      country: 'USA',
      city: 'Los Angeles',
          certified: true,
          certifiedAt: new Date(),
          stats: {
        points: 12.3,
        rebounds: 10.5,
        assists: 1.2,
        steals: 0.8,
        blocks: 2.7,
      },
    },
  });

  // Joueur 3 : Shooting Guard espagnol
  const player3 = await prisma.user.upsert({
    where: { email: 'carlos.garcia@basketstats.com' },
    update: {},
    create: {
      email: 'carlos.garcia@basketstats.com',
      passwordHash,
      fullName: 'Carlos García',
      role: 'PLAYER',
      bio: 'Tireur d\'élite formé à la Masia du FC Barcelona. Spécialiste du tir à 3 points.',
      verified: true,
      active: true,
    },
  });

  await prisma.playerProfile.upsert({
    where: { userId: player3.id },
    update: {},
        create: {
      userId: player3.id,
      nickname: 'El Tirador',
      heightCm: 196,
      weightKg: 88,
      position: 'SG',
      secondaryPos: 'SF',
      dominantHand: 'RIGHT',
      birthdate: new Date('1997-11-08'),
      currentClub: 'Real Madrid',
      level: 'PRO',
      availability: 'SIX_MONTHS',
      jerseyNumber: 23,
      yearsExperience: 6,
      achievements: ['Euroleague Champion 2023', 'Spanish League MVP 2023'],
      country: 'Spain',
      city: 'Madrid',
      certified: true,
      certifiedAt: new Date(),
          stats: {
        points: 18.7,
        rebounds: 4.1,
              assists: 3.5,
        steals: 1.2,
        blocks: 0.4,
      },
    },
  });

  // Joueur 4 : Small Forward sénégalais
  const player4 = await prisma.user.upsert({
    where: { email: 'mamadou.diop@basketstats.com' },
    update: {},
    create: {
      email: 'mamadou.diop@basketstats.com',
      passwordHash,
      fullName: 'Mamadou Diop',
      role: 'PLAYER',
      bio: 'Ailier athlétique avec une envergure exceptionnelle. Polyvalent en attaque et défense.',
      verified: true,
      active: true,
    },
  });

  await prisma.playerProfile.upsert({
    where: { userId: player4.id },
    update: {},
    create: {
      userId: player4.id,
      nickname: 'MD3',
      heightCm: 203,
      weightKg: 95,
      position: 'SF',
      secondaryPos: 'PF',
      dominantHand: 'LEFT',
      birthdate: new Date('1999-01-30'),
      currentClub: 'Monaco Basket',
      level: 'PRO',
      availability: 'ONE_MONTH',
      jerseyNumber: 15,
      yearsExperience: 5,
      achievements: ['AfroBasket 2023', 'French Cup Winner 2023'],
      country: 'Senegal',
      city: 'Monaco',
      certified: true,
      certifiedAt: new Date(),
      stats: {
        points: 14.8,
        rebounds: 6.3,
        assists: 2.9,
        steals: 1.8,
        blocks: 1.1,
      },
    },
  });

  // Joueur 5 : Power Forward italien
  const player5 = await prisma.user.upsert({
    where: { email: 'luca.rossi@basketstats.com' },
    update: {},
    create: {
      email: 'luca.rossi@basketstats.com',
      passwordHash,
      fullName: 'Luca Rossi',
      role: 'PLAYER',
      bio: 'Intérieur puissant avec un bon tir extérieur. Formé à l\'Olimpia Milano.',
      verified: true,
      active: true,
    },
  });

  await prisma.playerProfile.upsert({
    where: { userId: player5.id },
    update: {},
    create: {
      userId: player5.id,
      nickname: 'Il Martello',
      heightCm: 206,
      weightKg: 105,
      position: 'PF',
      dominantHand: 'RIGHT',
      birthdate: new Date('1996-05-12'),
      currentClub: 'Olimpia Milano',
      level: 'PRO',
      availability: 'NOT_AVAILABLE',
      jerseyNumber: 44,
      yearsExperience: 7,
      achievements: ['Italian League Champion 2022', 'Euroleague Final Four 2023'],
      country: 'Italy',
      city: 'Milan',
      certified: true,
      certifiedAt: new Date(),
      stats: {
        points: 13.5,
        rebounds: 8.2,
        assists: 2.1,
        steals: 0.9,
        blocks: 1.5,
      },
    },
  });

  // Joueur 6 : Jeune talent français
  const player6 = await prisma.user.upsert({
    where: { email: 'antoine.martin@basketstats.com' },
    update: {},
    create: {
      email: 'antoine.martin@basketstats.com',
      passwordHash,
      fullName: 'Antoine Martin',
      role: 'PLAYER',
      bio: 'Jeune espoir français. Passé par le centre de formation de l\'INSEP.',
      verified: false,
      active: true,
    },
  });

  await prisma.playerProfile.upsert({
    where: { userId: player6.id },
    update: {},
        create: {
      userId: player6.id,
      nickname: 'Anto',
      heightCm: 193,
      weightKg: 85,
      position: 'SG',
      secondaryPos: 'PG',
      dominantHand: 'BOTH',
      birthdate: new Date('2003-09-18'),
      currentClub: 'INSEP Paris',
      level: 'YOUTH',
      availability: 'IMMEDIATELY',
      jerseyNumber: 10,
      yearsExperience: 2,
      achievements: ['Champion de France U21 2023', 'Meilleur jeune 2023'],
          country: 'France',
          city: 'Paris',
      certified: false,
      stats: {
        points: 19.2,
        rebounds: 4.5,
        assists: 5.1,
        steals: 2.3,
        blocks: 0.6,
      },
    },
  });

  // ========================================
  // 2. RECRUTEURS
  // ========================================

  console.log('🎯 Création des recruteurs...');

  // Recruteur 1 : Scout NBA
  const recruiter1 = await prisma.user.upsert({
    where: { email: 'john.smith@nba-scouts.com' },
    update: {},
    create: {
      email: 'john.smith@nba-scouts.com',
      passwordHash,
      fullName: 'John Smith',
      role: 'RECRUITER',
      bio: 'Scout NBA avec 15 ans d\'expérience. Spécialiste du marché européen.',
      verified: true,
      active: true,
    },
  });

  await prisma.recruiterProfile.upsert({
    where: { userId: recruiter1.id },
    update: {},
    create: {
      userId: recruiter1.id,
      companyName: 'NBA Scouting Department',
      companyType: 'LEAGUE',
      country: 'USA',
      city: 'New York',
      website: 'https://nba.com',
      description: 'Recrutement pour équipes NBA. Focus sur talents européens.',
    },
  });

  // Recruteur 2 : Coach français
  const recruiter2 = await prisma.user.upsert({
    where: { email: 'pierre.bernard@asvel.com' },
    update: {},
    create: {
      email: 'pierre.bernard@asvel.com',
      passwordHash,
      fullName: 'Pierre Bernard',
      role: 'RECRUITER',
      bio: 'Coach assistant ASVEL. Responsable du recrutement jeunes talents.',
      verified: true,
      active: true,
    },
  });

  await prisma.recruiterProfile.upsert({
    where: { userId: recruiter2.id },
    update: {},
    create: {
      userId: recruiter2.id,
      companyName: 'ASVEL Lyon-Villeurbanne',
      companyType: 'CLUB',
      country: 'France',
      city: 'Lyon',
      website: 'https://www.asvel.com',
      description: 'Club professionnel français. Champion de France 2022.',
    },
  });

  // Recruteur 3 : Agent espagnol
  const recruiter3 = await prisma.user.upsert({
    where: { email: 'miguel.santos@probasket-agency.com' },
    update: {},
    create: {
      email: 'miguel.santos@probasket-agency.com',
      passwordHash,
      fullName: 'Miguel Santos',
      role: 'RECRUITER',
      bio: 'Agent de joueurs. Spécialiste des transferts entre Europe et USA.',
      verified: true,
      active: true,
    },
  });

  await prisma.recruiterProfile.upsert({
    where: { userId: recruiter3.id },
    update: {},
    create: {
      userId: recruiter3.id,
      companyName: 'ProBasket Agency',
      companyType: 'AGENCY',
      country: 'Spain',
      city: 'Barcelona',
      website: 'https://probasket-agency.com',
      description: 'Agence de représentation de joueurs professionnels.',
    },
  });

  // ========================================
  // 3. CLUBS
  // ========================================

  console.log('🏢 Création des clubs...');

  const club1 = await prisma.club.upsert({
    where: { name: 'ASVEL Lyon-Villeurbanne' },
    update: {},
    create: {
      name: 'ASVEL Lyon-Villeurbanne',
      shortName: 'ASVEL',
      country: 'France',
      city: 'Lyon',
      league: 'Betclic Elite',
      division: 'Pro A',
      website: 'https://www.asvel.com',
      arena: 'LDLC Arena',
      arenaCapacity: 12000,
      founded: 1948,
      colors: ['Rouge', 'Blanc'],
      description: 'Club historique français, propriété de Tony Parker. Multiple champion de France.',
      verified: true,
      active: true,
    },
  });

  const club2 = await prisma.club.upsert({
    where: { name: 'Real Madrid Baloncesto' },
    update: {},
    create: {
      name: 'Real Madrid Baloncesto',
      shortName: 'RMB',
      country: 'Spain',
      city: 'Madrid',
      league: 'Liga ACB',
      division: 'ACB',
      website: 'https://www.realmadrid.com/baloncesto',
      arena: 'WiZink Center',
      arenaCapacity: 15000,
      founded: 1931,
      colors: ['Blanc', 'Bleu'],
      description: 'Club le plus titré d\'Europe. 10 fois champion d\'Euroleague.',
      verified: true,
      active: true,
    },
  });

  const club3 = await prisma.club.upsert({
    where: { name: 'AS Monaco Basket' },
    update: {},
    create: {
      name: 'AS Monaco Basket',
      shortName: 'ASM',
      country: 'France',
      city: 'Monaco',
      league: 'Betclic Elite',
      division: 'Pro A',
      website: 'https://www.asmonaco-basket.com',
      arena: 'Salle Gaston Médecin',
      arenaCapacity: 4200,
      founded: 1924,
      colors: ['Rouge', 'Blanc'],
      description: 'Club ambitieux de la Principauté. Champion de France 2021.',
      verified: true,
      active: true,
    },
  });

  // ========================================
  // 4. ÉVÉNEMENTS
  // ========================================

  console.log('📅 Création des événements...');

  await prisma.event.create({
    data: {
      type: 'TRYOUT',
      title: 'Tryout ASVEL - Jeunes Talents',
      description: 'Session de détection pour joueurs U23. Présence de scouts professionnels.',
      startDate: new Date('2025-11-15'),
      endDate: new Date('2025-11-15'),
      location: 'LDLC Arena, Lyon',
      city: 'Lyon',
      country: 'France',
      clubId: club1.id,
      maxParticipants: 50,
      requirements: 'Âge : 18-23 ans. Niveau minimum : Amateur confirmé.',
      visibility: 'PUBLIC',
      featured: true,
    },
  });

  await prisma.event.create({
    data: {
      type: 'TRAINING_CAMP',
      title: 'Camp d\'Entraînement Real Madrid',
      description: 'Stage intensif de 3 jours avec les coachs du Real Madrid.',
      startDate: new Date('2025-12-01'),
      endDate: new Date('2025-12-03'),
      location: 'WiZink Center, Madrid',
      city: 'Madrid',
      country: 'Spain',
      clubId: club2.id,
      maxParticipants: 30,
      requirements: 'Niveau semi-pro minimum. Âge : 16-25 ans.',
      visibility: 'PUBLIC',
      featured: true,
    },
  });

  await prisma.event.create({
    data: {
      type: 'SHOWCASE',
      title: 'Monaco Basketball Showcase',
      description: 'Événement de présentation devant recruteurs européens.',
      startDate: new Date('2025-10-25'),
      location: 'Salle Gaston Médecin, Monaco',
      city: 'Monaco',
      country: 'Monaco',
      clubId: club3.id,
      maxParticipants: 40,
      requirements: 'Tous niveaux acceptés. Inscription obligatoire.',
      visibility: 'PUBLIC',
      featured: false,
    },
  });

  await prisma.event.create({
    data: {
      type: 'TOURNAMENT',
      title: 'Tournoi 3x3 Paris Basketball',
      description: 'Tournoi de basket 3x3 en plein air. Prix pour les gagnants.',
      startDate: new Date('2025-11-01'),
      endDate: new Date('2025-11-02'),
      location: 'Bercy Arena, Paris',
      city: 'Paris',
      country: 'France',
      maxParticipants: 64,
      requirements: 'Équipes de 4 joueurs (3 + 1 remplaçant).',
      visibility: 'PUBLIC',
      featured: true,
    },
  });

  // ========================================
  // 5. HISTORIQUE CARRIÈRE
  // ========================================

  console.log('🏆 Création de l\'historique carrière...');

  // Historique pour Thomas Dubois
  const player1Profile = await prisma.playerProfile.findUnique({
    where: { userId: player1.id },
  });

  if (player1Profile) {
    await prisma.careerHistory.create({
      data: {
        playerId: player1Profile.id,
        teamName: 'ASVEL Lyon-Villeurbanne',
        league: 'Betclic Elite',
        country: 'France',
        position: 'PG',
        jerseyNumber: 7,
        startDate: new Date('2020-07-01'),
        isCurrent: true,
        gamesPlayed: 156,
        achievements: ['Champion de France 2022', 'MVP Finale 2022'],
        description: 'Meneur titulaire. Leader de l\'équipe.',
      },
    });

    await prisma.careerHistory.create({
      data: {
        playerId: player1Profile.id,
        teamName: 'JDA Dijon',
        league: 'Pro B',
        country: 'France',
        position: 'PG',
        jerseyNumber: 11,
        startDate: new Date('2017-09-01'),
        endDate: new Date('2020-06-30'),
        isCurrent: false,
        gamesPlayed: 98,
        achievements: ['Montée en Pro A 2019'],
        description: 'Première expérience professionnelle.',
      },
    });
  }

  // ========================================
  // 6. POSTS ET INTERACTIONS
  // ========================================

  console.log('📱 Création de posts...');

  await prisma.post.create({
    data: {
      userId: player1.id,
      content: '🏆 Quelle victoire hier soir ! Merci à toute l\'équipe et aux supporters. On continue sur cette lancée ! 💪 #ASVEL #TeamWork',
      visibility: 'PUBLIC',
      likesCount: 45,
      commentsCount: 12,
    },
  });

  await prisma.post.create({
    data: {
      userId: player3.id,
      content: '🎯 Session de tirs ce matin. 87% de réussite à 3 points ! Le travail paie toujours. #NeverStopWorking #RealMadrid',
      visibility: 'PUBLIC',
      likesCount: 78,
      commentsCount: 23,
    },
  });

  await prisma.post.create({
    data: {
      userId: player6.id,
      content: '🙏 Reconnaissant pour cette opportunité à l\'INSEP. Chaque jour est une chance de progresser. #YoungTalent #DreamBig',
      visibility: 'PUBLIC',
      likesCount: 34,
      commentsCount: 8,
    },
  });

  // ========================================
  // 7. FOLLOWS
  // ========================================

  console.log('👥 Création des follows...');

  await prisma.follow.create({
    data: {
      followerId: player6.id,
      followeeId: player1.id,
    },
  });

  await prisma.follow.create({
    data: {
      followerId: player6.id,
      followeeId: player3.id,
    },
  });

  await prisma.follow.create({
    data: {
      followerId: recruiter1.id,
      followeeId: player2.id,
    },
  });

  await prisma.follow.create({
    data: {
      followerId: recruiter2.id,
      followeeId: player6.id,
    },
  });

  // ========================================
  // 8. OFFRES DE RECRUTEMENT
  // ========================================

  console.log('📧 Création des offres de recrutement...');

  await prisma.recruitRequest.create({
    data: {
      fromUserId: recruiter1.id,
      toUserId: player2.id,
      subject: 'Opportunité NBA G League',
      message: 'Bonjour Marcus, nous avons suivi votre parcours et aimerions discuter d\'une opportunité en G League. Votre profil défensif nous intéresse particulièrement.',
      status: 'PENDING',
    },
  });

  await prisma.recruitRequest.create({
    data: {
      fromUserId: recruiter2.id,
      toUserId: player6.id,
      subject: 'Contrat professionnel ASVEL',
      message: 'Antoine, ton potentiel est évident. Nous aimerions t\'intégrer à notre effectif professionnel dès la saison prochaine.',
      status: 'ACCEPTED',
    },
  });

  await prisma.recruitRequest.create({
    data: {
      fromUserId: recruiter3.id,
      toUserId: player4.id,
      subject: 'Représentation internationale',
      message: 'Mamadou, notre agence souhaite te représenter pour des opportunités en Euroleague et NBA.',
      status: 'PENDING',
    },
  });

  console.log('\n✅ Seeding terminé avec succès !');
  console.log('\n📊 Résumé :');
  console.log('  - 6 joueurs créés (5 pros + 1 jeune)');
  console.log('  - 3 recruteurs créés (scout, coach, agent)');
  console.log('  - 3 clubs créés (ASVEL, Real Madrid, Monaco)');
  console.log('  - 4 événements créés (tryout, camp, showcase, tournoi)');
  console.log('  - Historique carrière ajouté');
  console.log('  - Posts et interactions créés');
  console.log('  - Offres de recrutement créées');
  console.log('\n🔐 Mot de passe pour tous : password123');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
