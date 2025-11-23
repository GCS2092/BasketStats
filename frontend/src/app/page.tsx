'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import BasketballNews from '@/components/news/BasketballNews';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/feed');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="gradient-primary text-white">
        <div className="container-custom py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              🏀 Bball Connect
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 text-neutral-100">
              Your Game Your Future Connect It
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup" className="btn-accent text-lg px-8 py-3">
                Créer un compte
              </Link>
              <Link href="/auth/login" className="btn bg-white text-primary hover:bg-neutral-100 text-lg px-8 py-3">
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section Actualités pleine largeur */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <BasketballNews />
        </div>
      </section>

      {/* Section Fonctionnalités en bas */}
      <section className="py-16 bg-neutral-50">
        <div className="container-custom">
          <h2 className="text-2xl font-bold text-center mb-8">
            Fonctionnalités
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-4xl mb-4">👤</div>
              <h3 className="text-lg font-bold mb-2">Profil Complet</h3>
              <p className="text-neutral-600 text-sm">Créez un profil détaillé avec vos stats et informations</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-4xl mb-4">🎬</div>
              <h3 className="text-lg font-bold mb-2">Vidéos Highlights</h3>
              <p className="text-neutral-600 text-sm">Partagez vos meilleures actions avec les recruteurs</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-bold mb-2">Recherche Avancée</h3>
              <p className="text-neutral-600 text-sm">Trouvez les meilleurs talents par poste et niveau</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-accent text-white py-16">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Prêt à booster votre carrière ?
          </h2>
          <p className="text-xl mb-8">
            Rejoignez des milliers de basketteurs déjà inscrits
          </p>
          <Link href="/auth/signup" className="btn bg-white text-accent hover:bg-neutral-100 text-lg px-8 py-3">
            Commencer gratuitement
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-300 py-8">
        <div className="container-custom text-center">
          <p>&copy; 2025 Bball Connect. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}


