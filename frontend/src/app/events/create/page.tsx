'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import apiClient from '@/lib/api/client';
import NavigationBreadcrumb from '@/components/common/NavigationBreadcrumb';
import ElegantQuickNavigation from '@/components/common/ElegantQuickNavigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function CreateEventPageContent() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    type: 'TRYOUT' as any,
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    location: '',
    city: '',
    country: '',
    maxParticipants: '',
    requirements: '',
    registrationUrl: '',
    visibility: 'PUBLIC' as any,
    featured: false,
  });

  // Rediriger si pas recruteur
  if (session && session.user?.role !== 'RECRUITER') {
    router.push('/events');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const startDateTime = `${formData.startDate}T${formData.startTime || '00:00'}:00`;
      const endDateTime = formData.endDate && formData.endTime
        ? `${formData.endDate}T${formData.endTime}:00`
        : undefined;

      const payload = {
        type: formData.type,
        title: formData.title,
        description: formData.description || undefined,
        startDate: startDateTime,
        endDate: endDateTime,
        location: formData.location,
        city: formData.city || undefined,
        country: formData.country || undefined,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
        requirements: formData.requirements || undefined,
        registrationUrl: formData.registrationUrl || undefined,
        visibility: formData.visibility,
        featured: formData.featured,
      };

      await apiClient.post('/events', payload);
      alert('✅ Événement créé avec succès !');
      router.push('/events');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Navigation rapide élégante */}
      <ElegantQuickNavigation currentPage="/events" />
      
      {/* Breadcrumbs */}
      <NavigationBreadcrumb
        items={[
          { label: 'Événements', href: '/events', icon: '📅' },
          { label: 'Créer un événement', icon: '➕' }
        ]}
        backButtonText="Retour aux événements"
        backButtonHref="/events"
      />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-8 sm:py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">➕ Créer un événement</h1>
          <p className="text-orange-100 mt-2 text-sm sm:text-base">
            Organisez un match, tryout, stage ou tournoi
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Type */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Type d'événement *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="input"
                required
              >
                <option value="MATCH">🏀 Match</option>
                <option value="TRYOUT">🎯 Essai/Tryout</option>
                <option value="TRAINING_CAMP">💪 Camp d'entraînement</option>
                <option value="SHOWCASE">⭐ Showcase</option>
                <option value="TOURNAMENT">🏆 Tournoi</option>
              </select>
            </div>

            {/* Titre */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Titre de l'événement *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input"
                required
                placeholder="Ex: Tryout ASVEL - Jeunes Talents"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input min-h-[120px]"
                placeholder="Décrivez l'événement, les objectifs, ce qui est prévu..."
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Date de début *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Heure de début
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Date de fin (optionnel)
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Heure de fin
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            {/* Lieu */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Adresse du lieu *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="input"
                required
                placeholder="Ex: LDLC Arena, 32 Rue Rachais"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Ville
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="input"
                  placeholder="Ex: Lyon"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Pays
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="input"
                  placeholder="Ex: France"
                />
              </div>
            </div>

            {/* Participants max */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Nombre maximum de participants
              </label>
              <input
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                className="input"
                min="1"
                placeholder="Ex: 50"
              />
            </div>

            {/* Prérequis */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Prérequis et conditions
              </label>
              <textarea
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                className="input min-h-[80px]"
                placeholder="Ex: Âge 18-23 ans, niveau amateur minimum, certificat médical obligatoire"
              />
            </div>

            {/* URL inscription */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Lien d'inscription externe (optionnel)
              </label>
              <input
                type="url"
                value={formData.registrationUrl}
                onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })}
                className="input"
                placeholder="https://..."
              />
            </div>

            {/* Options */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-5 h-5 text-orange-500 rounded"
                />
                <span className="font-medium text-neutral-700">
                  ⭐ Mettre en avant cet événement
                </span>
              </label>
            </div>

            {/* Boutons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 border-t">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary flex-1 text-sm sm:text-base"
              >
                {loading ? 'Création...' : '✓ Créer l\'événement'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="btn btn-secondary text-sm sm:text-base"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function CreateEventPage() {
  return (
    <ProtectedRoute requiredRole="RECRUITER" requiresVerification={true} redirectTo="/events">
      <CreateEventPageContent />
    </ProtectedRoute>
  );
}

