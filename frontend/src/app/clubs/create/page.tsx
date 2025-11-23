'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import Header from '@/components/layout/Header';
import NavigationBreadcrumb from '@/components/common/NavigationBreadcrumb';
import { useAuthSync } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

interface CreateClubFormData {
  name: string;
  shortName?: string;
  country: string;
  city: string;
  league?: string;
  division?: string;
  website?: string;
  email?: string;
  phone?: string;
  arena?: string;
  arenaCapacity?: number;
  founded?: number;
  colors: string[];
  description?: string;
  budget?: number;
  licenseNumber?: string;
  federationId?: string;
}

function CreateClubPageContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useAuthSync();

  const [formData, setFormData] = useState<CreateClubFormData>({
    name: '',
    shortName: '',
    country: '',
    city: '',
    league: '',
    division: '',
    website: '',
    email: '',
    phone: '',
    arena: '',
    arenaCapacity: undefined,
    founded: undefined,
    colors: ['#3B82F6', '#1E40AF'],
    description: '',
    budget: undefined,
    licenseNumber: '',
    federationId: '',
  });

  const createClubMutation = useMutation({
    mutationFn: async (data: CreateClubFormData) => {
      const response = await apiClient.post('/clubs', data);
      return response.data;
    },
    onSuccess: () => {
      alert('✅ Demande de création de club soumise avec succès ! Elle sera examinée par notre équipe.');
      router.push('/clubs');
    },
    onError: (error: any) => {
      console.error('Erreur lors de la création:', error);
      alert(`❌ Erreur: ${error.response?.data?.message || error.message}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Nettoyer les données (supprimer les champs vides)
      const cleanedData = { ...formData };
      Object.keys(cleanedData).forEach(key => {
        const value = cleanedData[key as keyof CreateClubFormData];
        if (value === '' || value === undefined || (Array.isArray(value) && value.length === 0)) {
          delete cleanedData[key as keyof CreateClubFormData];
        }
      });

      await createClubMutation.mutateAsync(cleanedData);
    } catch (error) {
      // L'erreur est déjà gérée dans onError
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value ? parseInt(value) : undefined,
      }));
    } else if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const addColor = () => {
    setFormData(prev => ({
      ...prev,
      colors: [...prev.colors, '#3B82F6'],
    }));
  };

  const updateColor = (index: number, color: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.map((c, i) => i === index ? color : c),
    }));
  };

  const removeColor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      <Header />
      
      <NavigationBreadcrumb 
        items={[
          { label: 'Accueil', href: '/' },
          { label: 'Clubs', href: '/clubs' },
          { label: 'Créer un club', href: '/clubs/create' },
        ]}
      />

      <main className="container-custom py-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">🏢 Créer un nouveau club</h1>
            <p className="text-neutral-600">
              Soumettez une demande de création de club. Elle sera examinée par notre équipe avant approbation.
            </p>
          </div>

          {/* Formulaire */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informations de base */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-neutral-800 border-b border-neutral-200 pb-2">
                  📋 Informations de base
                </h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">
                      Nom du club *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Ex: Los Angeles Lakers"
                    />
                  </div>

                  <div>
                    <label htmlFor="shortName" className="block text-sm font-medium text-neutral-700 mb-1">
                      Nom abrégé
                    </label>
                    <input
                      type="text"
                      id="shortName"
                      name="shortName"
                      value={formData.shortName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Ex: LAL"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-neutral-700 mb-1">
                      Pays *
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Ex: France"
                    />
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-neutral-700 mb-1">
                      Ville *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Ex: Paris"
                    />
                  </div>

                  <div>
                    <label htmlFor="founded" className="block text-sm font-medium text-neutral-700 mb-1">
                      Année de fondation
                    </label>
                    <input
                      type="number"
                      id="founded"
                      name="founded"
                      value={formData.founded || ''}
                      onChange={handleInputChange}
                      min="1800"
                      max="2024"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Ex: 1947"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="league" className="block text-sm font-medium text-neutral-700 mb-1">
                      Ligue
                    </label>
                    <input
                      type="text"
                      id="league"
                      name="league"
                      value={formData.league}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Ex: NBA, Euroleague, Pro A"
                    />
                  </div>

                  <div>
                    <label htmlFor="division" className="block text-sm font-medium text-neutral-700 mb-1">
                      Division
                    </label>
                    <input
                      type="text"
                      id="division"
                      name="division"
                      value={formData.division}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Ex: Western Conference"
                    />
                  </div>
                </div>
              </div>

              {/* Contact et installations */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-neutral-800 border-b border-neutral-200 pb-2">
                  📞 Contact et installations
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                      Email de contact
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="contact@club.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="+33 1 23 45 67 89"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-neutral-700 mb-1">
                      Site web
                    </label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="https://www.club.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="arena" className="block text-sm font-medium text-neutral-700 mb-1">
                      Stade/Salle
                    </label>
                    <input
                      type="text"
                      id="arena"
                      name="arena"
                      value={formData.arena}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Ex: Staples Center"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="arenaCapacity" className="block text-sm font-medium text-neutral-700 mb-1">
                    Capacité du stade
                  </label>
                  <input
                    type="number"
                    id="arenaCapacity"
                    name="arenaCapacity"
                    value={formData.arenaCapacity || ''}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full md:w-1/2 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Ex: 20000"
                  />
                </div>
              </div>

              {/* Couleurs du club */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-neutral-800 border-b border-neutral-200 pb-2">
                  🎨 Couleurs du club
                </h2>

                <div className="space-y-3">
                  {formData.colors.map((color, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => updateColor(index, e.target.value)}
                        className="w-12 h-10 border border-neutral-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={color}
                        onChange={(e) => updateColor(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="#3B82F6"
                      />
                      {formData.colors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeColor(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          ❌
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addColor}
                    className="px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
                  >
                    ➕ Ajouter une couleur
                  </button>
                </div>
              </div>

              {/* Informations officielles */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-neutral-800 border-b border-neutral-200 pb-2">
                  📜 Informations officielles
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="licenseNumber" className="block text-sm font-medium text-neutral-700 mb-1">
                      Numéro de licence fédérale
                    </label>
                    <input
                      type="text"
                      id="licenseNumber"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Ex: FFBB-12345"
                    />
                  </div>

                  <div>
                    <label htmlFor="federationId" className="block text-sm font-medium text-neutral-700 mb-1">
                      ID Fédération
                    </label>
                    <input
                      type="text"
                      id="federationId"
                      name="federationId"
                      value={formData.federationId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Ex: FFBB-ID"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-neutral-800 border-b border-neutral-200 pb-2">
                  📝 Description
                </h2>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">
                    Description du club
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Décrivez l'histoire, les valeurs et les objectifs de votre club..."
                  />
                </div>
              </div>

              {/* Informations importantes */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-blue-600 text-xl">ℹ️</div>
                  <div>
                    <h3 className="font-semibold text-blue-800 mb-2">Important</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Votre demande sera examinée par notre équipe d'administration</li>
                      <li>• Vous recevrez une notification par email une fois la décision prise</li>
                      <li>• Les champs marqués d'un * sont obligatoires</li>
                      <li>• Assurez-vous que toutes les informations sont exactes</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Boutons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-neutral-200">
                <button
                  type="submit"
                  disabled={isSubmitting || createClubMutation.isPending}
                  className="flex-1 bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting || createClubMutation.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Soumission en cours...
                    </span>
                  ) : (
                    '🚀 Soumettre la demande'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/clubs')}
                  className="flex-1 sm:flex-none bg-neutral-200 text-neutral-800 py-3 px-6 rounded-lg font-medium hover:bg-neutral-300 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CreateClubPage() {
  return (
    <ProtectedRoute requiredRole="RECRUITER" requiresVerification={true} redirectTo="/clubs">
      <CreateClubPageContent />
    </ProtectedRoute>
  );
}
