'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import Header from '@/components/layout/Header';
import NavigationBreadcrumb from '@/components/common/NavigationBreadcrumb';
import ElegantQuickNavigation from '@/components/common/ElegantQuickNavigation';
import { useAuthSync } from '@/hooks/useAuth';
import AvatarUpload from '@/components/profile/AvatarUpload';
import VideoSection from '@/components/profile/VideoSection';
import SubscriptionManagement from '@/components/subscription/SubscriptionManagement';
import { useFormValidation, ValidatedInput, ValidatedSelect, FieldError } from '@/components/profile/FormValidation';
import {
  COUNTRIES,
  NATIONALITIES,
  FRENCH_CITIES,
  POSITIONS,
  DOMINANT_HANDS,
  PLAYER_LEVELS,
  AVAILABILITY_OPTIONS,
  HEIGHT_RANGES,
  WEIGHT_RANGES,
  WINGSPAN_RANGES,
  EXPERIENCE_RANGES,
  JERSEY_NUMBER_RANGES,
} from '@/data/constants';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [activeTab, setActiveTab] = useState('profile');
  
  useAuthSync(); // Synchroniser tokens

  // Règles de validation
  const validationRules = {
    fullName: { required: true, min: 2, max: 100 },
    heightCm: { 
      required: false, 
      min: HEIGHT_RANGES.min, 
      max: HEIGHT_RANGES.max,
      custom: (value: number) => {
        if (value && (value < HEIGHT_RANGES.min || value > HEIGHT_RANGES.max)) {
          return `La taille doit être entre ${HEIGHT_RANGES.min} et ${HEIGHT_RANGES.max} cm`;
        }
        return null;
      }
    },
    weightKg: { 
      required: false, 
      min: WEIGHT_RANGES.min, 
      max: WEIGHT_RANGES.max,
      custom: (value: number) => {
        if (value && (value < WEIGHT_RANGES.min || value > WEIGHT_RANGES.max)) {
          return `Le poids doit être entre ${WEIGHT_RANGES.min} et ${WEIGHT_RANGES.max} kg`;
        }
        return null;
      }
    },
    wingspan: { 
      required: false, 
      min: WINGSPAN_RANGES.min, 
      max: WINGSPAN_RANGES.max,
      custom: (value: number) => {
        if (value && (value < WINGSPAN_RANGES.min || value > WINGSPAN_RANGES.max)) {
          return `L'envergure doit être entre ${WINGSPAN_RANGES.min} et ${WINGSPAN_RANGES.max} cm`;
        }
        return null;
      }
    },
    yearsExperience: { 
      required: false, 
      min: EXPERIENCE_RANGES.min, 
      max: EXPERIENCE_RANGES.max,
      custom: (value: number) => {
        if (value && (value < EXPERIENCE_RANGES.min || value > EXPERIENCE_RANGES.max)) {
          return `L'expérience doit être entre ${EXPERIENCE_RANGES.min} et ${EXPERIENCE_RANGES.max} ans`;
        }
        return null;
      }
    },
    jerseyNumber: { 
      required: false, 
      min: JERSEY_NUMBER_RANGES.min, 
      max: JERSEY_NUMBER_RANGES.max,
      custom: (value: number) => {
        if (value && (value < JERSEY_NUMBER_RANGES.min || value > JERSEY_NUMBER_RANGES.max)) {
          return `Le numéro de maillot doit être entre ${JERSEY_NUMBER_RANGES.min} et ${JERSEY_NUMBER_RANGES.max}`;
        }
        return null;
      }
    },
    cvLink: {
      required: false,
      custom: (value: string) => {
        if (value && !value.match(/^https?:\/\/.+/)) {
          return 'Le lien CV doit commencer par http:// ou https://';
        }
        return null;
      }
    },
    dateOfBirth: {
      required: false,
      custom: (value: string) => {
        if (value) {
          const date = new Date(value);
          const now = new Date();
          const age = now.getFullYear() - date.getFullYear();
          if (age < 12 || age > 50) {
            return 'L\'âge doit être entre 12 et 50 ans';
          }
        }
        return null;
      }
    }
  };

  const { errors, isValid, validateField, clearError } = useFormValidation(formData, validationRules);

  // Récupérer les données du profil
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => {
      const userId = session?.user?.id;
      if (!userId) return null;

      const response = await apiClient.get(`/players/${userId}/profile`);
      setFormData(response.data);
      return response.data;
    },
    enabled: !!session?.user?.id && status === 'authenticated',
  });

  // Mutation pour mettre à jour le profil
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const userId = session?.user?.id;
      try {
        const response = await apiClient.put(`/players/${userId}/profile`, data);
        return response.data;
      } catch (error: any) {
        console.error('Erreur détaillée:', error.response?.data || error.message);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
      setIsEditing(false);
      alert('Profil mis à jour avec succès !');
    },
    onError: (error: any) => {
      console.error('Erreur mutation:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur inconnue';
      alert(`Erreur lors de la mise à jour: ${errorMessage}`);
    },
  });

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth/login');
    return null;
  }

  // Fonction pour nettoyer les données (convertir les chaînes vides en null)
  const cleanFormData = (data: any) => {
    const cleaned = { ...data };
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === '' || cleaned[key] === undefined) {
        delete cleaned[key]; // Supprimer les champs vides au lieu d'envoyer des chaînes vides
      }
    });
    return cleaned;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Valider le formulaire avant soumission
    if (!isValid) {
      alert('Veuillez corriger les erreurs dans le formulaire avant de continuer.');
      return;
    }
    
    const cleanedData = cleanFormData(formData);
    console.log('Données nettoyées envoyées:', cleanedData);
    await updateProfileMutation.mutateAsync(cleanedData);
  };

  const isPlayer = session?.user?.role === 'PLAYER';

  return (
    <div className="min-h-screen bg-neutral-100">
      <Header />
      
      {/* Navigation rapide élégante */}
      <ElegantQuickNavigation currentPage="/profile" />

      <main className="container-custom py-6">
        <div className="max-w-4xl mx-auto">
          {/* En-tête du profil */}
          <div className={`card p-6 mb-6 border-l-4 ${isPlayer ? 'border-l-blue-500' : 'border-l-purple-500'}`}>
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
                {/* Avatar avec upload */}
                <AvatarUpload 
                  currentAvatar={session?.user?.image || ''} 
                  userId={session?.user?.id || ''} 
                />
                
                <div className="text-center md:text-left">
                  <h1 className="text-3xl font-bold">{session?.user?.name}</h1>
                  <p className="text-neutral-600">{session?.user?.email}</p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold border-2 ${
                    isPlayer 
                      ? 'bg-blue-100 text-blue-700 border-blue-300' 
                      : 'bg-purple-100 text-purple-700 border-purple-300'
                  }`}>
                    {isPlayer ? '🏀 Joueur' : '🔍 Recruteur'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn btn-secondary"
              >
                {isEditing ? 'Annuler' : '✏️ Modifier le profil'}
              </button>
            </div>
          </div>

          {/* Onglets de navigation */}
          <div className="card p-0 mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                👤 Profil
              </button>
              <button
                onClick={() => setActiveTab('subscription')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'subscription'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                💳 Abonnement
              </button>
              {isPlayer && (
                <button
                  onClick={() => setActiveTab('videos')}
                  className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'videos'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  🎥 Vidéos
                </button>
              )}
            </div>
          </div>

          {/* Contenu des onglets */}
          {activeTab === 'profile' && (
            <>
              {/* Formulaire de modification */}
          {isEditing && isPlayer ? (
            <form onSubmit={handleSubmit} className="card p-6 mb-6">
              <h2 className="text-2xl font-bold mb-6">Modifier mon profil joueur</h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Nom et prénom */}
                <div>
                  <label className="label">Nom complet *</label>
                  <ValidatedInput
                    name="fullName"
                    value={formData?.fullName || ''}
                    onChange={(value) => {
                      setFormData({ ...formData, fullName: value });
                      clearError('fullName');
                    }}
                    onBlur={() => validateField('fullName', formData?.fullName)}
                    error={errors.fullName}
                    placeholder="Votre nom complet"
                  />
                </div>

                {/* Date de naissance */}
                <div>
                  <label className="label">Date de naissance</label>
                  <ValidatedInput
                    name="dateOfBirth"
                    value={formData?.dateOfBirth || ''}
                    onChange={(value) => {
                      setFormData({ ...formData, dateOfBirth: value });
                      clearError('dateOfBirth');
                    }}
                    onBlur={() => validateField('dateOfBirth', formData?.dateOfBirth)}
                    error={errors.dateOfBirth}
                    type="date"
                  />
                </div>

                {/* Lieu de naissance */}
                <div>
                  <label className="label">Lieu de naissance</label>
                  <ValidatedInput
                    name="birthPlace"
                    value={formData?.birthPlace || ''}
                    onChange={(value) => {
                      setFormData({ ...formData, birthPlace: value });
                      clearError('birthPlace');
                    }}
                    error={errors.birthPlace}
                    placeholder="Ville, Pays"
                  />
                </div>

                {/* Nationalité */}
                <div>
                  <label className="label">Nationalité</label>
                  <ValidatedSelect
                    name="nationality"
                    value={formData?.nationality || ''}
                    onChange={(value) => {
                      setFormData({ ...formData, nationality: value });
                      clearError('nationality');
                    }}
                    onBlur={() => validateField('nationality', formData?.nationality)}
                    error={errors.nationality}
                    options={NATIONALITIES.map(nat => ({ value: nat, label: nat }))}
                    placeholder="Sélectionner votre nationalité"
                  />
                </div>

                {/* Poste */}
                <div>
                  <label className="label">Poste principal</label>
                  <ValidatedSelect
                    name="position"
                    value={formData?.position || ''}
                    onChange={(value) => {
                      setFormData({ ...formData, position: value });
                      clearError('position');
                    }}
                    onBlur={() => validateField('position', formData?.position)}
                    error={errors.position}
                    options={POSITIONS}
                    placeholder="Sélectionner votre poste"
                  />
                </div>

                {/* Surnom */}
                <div>
                  <label className="label">Surnom</label>
                  <ValidatedInput
                    name="nickname"
                    value={formData?.nickname || ''}
                    onChange={(value) => {
                      setFormData({ ...formData, nickname: value });
                      clearError('nickname');
                    }}
                    error={errors.nickname}
                    placeholder="Votre surnom"
                  />
                </div>

                {/* Taille */}
                <div>
                  <label className="label">Taille (cm)</label>
                  <ValidatedInput
                    name="heightCm"
                    value={formData?.heightCm || ''}
                    onChange={(value) => {
                      setFormData({ ...formData, heightCm: value });
                      clearError('heightCm');
                    }}
                    onBlur={() => validateField('heightCm', formData?.heightCm)}
                    error={errors.heightCm}
                    type="number"
                    min={HEIGHT_RANGES.min}
                    max={HEIGHT_RANGES.max}
                    step={HEIGHT_RANGES.step}
                    placeholder="185"
                  />
                </div>

                {/* Poids */}
                <div>
                  <label className="label">Poids (kg)</label>
                  <ValidatedInput
                    name="weightKg"
                    value={formData?.weightKg || ''}
                    onChange={(value) => {
                      setFormData({ ...formData, weightKg: value });
                      clearError('weightKg');
                    }}
                    onBlur={() => validateField('weightKg', formData?.weightKg)}
                    error={errors.weightKg}
                    type="number"
                    min={WEIGHT_RANGES.min}
                    max={WEIGHT_RANGES.max}
                    step={WEIGHT_RANGES.step}
                    placeholder="85"
                  />
                </div>

                {/* Envergure */}
                <div>
                  <label className="label">Envergure (cm)</label>
                  <ValidatedInput
                    name="wingspan"
                    value={formData?.wingspan || ''}
                    onChange={(value) => {
                      setFormData({ ...formData, wingspan: value });
                      clearError('wingspan');
                    }}
                    onBlur={() => validateField('wingspan', formData?.wingspan)}
                    error={errors.wingspan}
                    type="number"
                    min={WINGSPAN_RANGES.min}
                    max={WINGSPAN_RANGES.max}
                    step={WINGSPAN_RANGES.step}
                    placeholder="200"
                  />
                </div>

                {/* Club actuel */}
                <div>
                  <label className="label">Club actuel</label>
                  <ValidatedInput
                    name="currentClub"
                    value={formData?.currentClub || ''}
                    onChange={(value) => {
                      setFormData({ ...formData, currentClub: value });
                      clearError('currentClub');
                    }}
                    error={errors.currentClub}
                    placeholder="Nom du club"
                  />
                </div>

                {/* Niveau */}
                <div>
                  <label className="label">Niveau</label>
                  <ValidatedSelect
                    name="level"
                    value={formData?.level || 'AMATEUR'}
                    onChange={(value) => {
                      setFormData({ ...formData, level: value });
                      clearError('level');
                    }}
                    onBlur={() => validateField('level', formData?.level)}
                    error={errors.level}
                    options={PLAYER_LEVELS}
                    placeholder="Sélectionner votre niveau"
                  />
                </div>

                {/* Pays */}
                <div>
                  <label className="label">Pays</label>
                  <ValidatedSelect
                    name="country"
                    value={formData?.country || ''}
                    onChange={(value) => {
                      setFormData({ ...formData, country: value });
                      clearError('country');
                    }}
                    onBlur={() => validateField('country', formData?.country)}
                    error={errors.country}
                    options={COUNTRIES.map(country => ({ value: country.name, label: country.name }))}
                    placeholder="Sélectionner votre pays"
                  />
                </div>

                {/* Ville */}
                <div>
                  <label className="label">Ville</label>
                  <ValidatedSelect
                    name="city"
                    value={formData?.city || ''}
                    onChange={(value) => {
                      setFormData({ ...formData, city: value });
                      clearError('city');
                    }}
                    onBlur={() => validateField('city', formData?.city)}
                    error={errors.city}
                    options={FRENCH_CITIES.map(city => ({ value: city, label: city }))}
                    placeholder="Sélectionner votre ville"
                  />
                </div>

                {/* Années d'expérience */}
                <div>
                  <label className="label">Années d'expérience</label>
                  <ValidatedInput
                    name="yearsExperience"
                    value={formData?.yearsExperience || ''}
                    onChange={(value) => {
                      setFormData({ ...formData, yearsExperience: value });
                      clearError('yearsExperience');
                    }}
                    onBlur={() => validateField('yearsExperience', formData?.yearsExperience)}
                    error={errors.yearsExperience}
                    type="number"
                    min={EXPERIENCE_RANGES.min}
                    max={EXPERIENCE_RANGES.max}
                    step={EXPERIENCE_RANGES.step}
                    placeholder="5"
                  />
                </div>

                {/* Main dominante */}
                <div>
                  <label className="label">Main dominante</label>
                  <ValidatedSelect
                    name="dominantHand"
                    value={formData?.dominantHand || ''}
                    onChange={(value) => {
                      setFormData({ ...formData, dominantHand: value });
                      clearError('dominantHand');
                    }}
                    onBlur={() => validateField('dominantHand', formData?.dominantHand)}
                    error={errors.dominantHand}
                    options={DOMINANT_HANDS}
                    placeholder="Sélectionner votre main dominante"
                  />
                </div>

                {/* Disponibilité */}
                <div>
                  <label className="label">Disponibilité</label>
                  <ValidatedSelect
                    name="availability"
                    value={formData?.availability || 'NOT_AVAILABLE'}
                    onChange={(value) => {
                      setFormData({ ...formData, availability: value });
                      clearError('availability');
                    }}
                    onBlur={() => validateField('availability', formData?.availability)}
                    error={errors.availability}
                    options={AVAILABILITY_OPTIONS}
                    placeholder="Sélectionner votre disponibilité"
                  />
                </div>

                {/* Parcours sportif : CV */}
                <div className="md:col-span-2">
                  <label className="label">Parcours sportif : CV</label>
                  <textarea
                    value={formData?.sportingBackground || ''}
                    onChange={(e) => setFormData({ ...formData, sportingBackground: e.target.value })}
                    placeholder="Décrivez votre parcours sportif, vos clubs précédents, vos performances, vos titres..."
                    rows={4}
                    className="input"
                  />
                </div>

                {/* Lien CV externe */}
                <div className="md:col-span-2">
                  <label className="label">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Lien vers votre CV (optionnel)
                    </div>
                  </label>
                  <div className="space-y-2">
                    <ValidatedInput
                      name="cvLink"
                      value={formData?.cvLink || ''}
                      onChange={(value) => {
                        setFormData({ ...formData, cvLink: value });
                        clearError('cvLink');
                      }}
                      onBlur={() => validateField('cvLink', formData?.cvLink)}
                      error={errors.cvLink}
                      type="url"
                      placeholder="https://drive.google.com/... ou https://linkedin.com/in/..."
                      className="input w-full"
                    />
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-xs text-blue-700">
                          <p className="font-medium mb-1">💡 Liens acceptés :</p>
                          <ul className="space-y-1 text-blue-600">
                            <li>• Google Drive, Dropbox, OneDrive</li>
                            <li>• LinkedIn, portfolio personnel</li>
                            <li>• Sites de recrutement (Indeed, etc.)</li>
                            <li>• Tout lien valide vers votre CV</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    Lien vers votre CV PDF, LinkedIn, ou portfolio en ligne
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn btn-secondary"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className={`btn ${!isValid ? 'btn-disabled' : 'btn-primary'}`}
                  disabled={updateProfileMutation.isPending || !isValid}
                >
                  {updateProfileMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
              
              {/* Affichage des erreurs de validation */}
              {!isValid && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-red-800">Veuillez corriger les erreurs suivantes :</h4>
                      <ul className="mt-2 text-sm text-red-700 space-y-1">
                        {Object.entries(errors).map(([field, error]) => (
                          error && (
                            <li key={field} className="flex items-center gap-2">
                              <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                              {error}
                            </li>
                          )
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </form>
          ) : (
            /* Affichage du profil */
            <div className="card p-6">
              <h2 className="text-2xl font-bold mb-6">Mon profil</h2>

              {isPlayer ? (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-neutral-500">Nom complet</p>
                    <p className="font-medium">{profileData?.fullName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Surnom</p>
                    <p className="font-medium">{profileData?.nickname || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Date de naissance</p>
                    <p className="font-medium">{profileData?.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString('fr-FR') : '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Lieu de naissance</p>
                    <p className="font-medium">{profileData?.birthPlace || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Nationalité</p>
                    <p className="font-medium">{profileData?.nationality || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Poste</p>
                    <p className="font-medium">{profileData?.position || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Taille</p>
                    <p className="font-medium">{profileData?.heightCm ? `${profileData.heightCm} cm` : '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Poids</p>
                    <p className="font-medium">{profileData?.weightKg ? `${profileData.weightKg} kg` : '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Envergure</p>
                    <p className="font-medium">{profileData?.wingspan ? `${profileData.wingspan} cm` : '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Club actuel</p>
                    <p className="font-medium">{profileData?.currentClub || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Niveau</p>
                    <p className="font-medium">{profileData?.level || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Localisation</p>
                    <p className="font-medium">
                      {profileData?.city && profileData?.country
                        ? `${profileData.city}, ${profileData.country}`
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Expérience</p>
                    <p className="font-medium">
                      {profileData?.yearsExperience ? `${profileData.yearsExperience} ans` : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Main dominante</p>
                    <p className="font-medium">{profileData?.dominantHand || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Disponibilité</p>
                    <p className="font-medium">{profileData?.availability || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Vues du profil</p>
                    <p className="font-medium">{profileData?.profileViews || 0}</p>
                  </div>
                  {profileData?.sportingBackground && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-neutral-500">Parcours sportif</p>
                      <p className="font-medium whitespace-pre-wrap">{profileData.sportingBackground}</p>
                    </div>
                  )}
                  {profileData?.cvLink && (
                    <div className="md:col-span-2">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-blue-900">CV en ligne disponible</p>
                            <p className="text-xs text-blue-600">Cliquez pour consulter le CV complet</p>
                          </div>
                          <div className="flex-shrink-0">
                            <a
                              href={profileData.cvLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              Consulter le CV
                            </a>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs text-blue-500 truncate">
                            {profileData.cvLink}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Profil recruteur */
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-neutral-500">Entreprise/Club</p>
                    <p className="font-medium">{profileData?.recruiterProfile?.companyName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Type</p>
                    <p className="font-medium">{profileData?.recruiterProfile?.companyType || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Site web</p>
                    <p className="font-medium">
                      {profileData?.recruiterProfile?.website ? (
                        <a href={profileData.recruiterProfile.website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                          {profileData.recruiterProfile.website}
                        </a>
                      ) : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Localisation</p>
                    <p className="font-medium">
                      {profileData?.recruiterProfile?.city && profileData?.recruiterProfile?.country
                        ? `${profileData.recruiterProfile.city}, ${profileData.recruiterProfile.country}`
                        : '-'}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-neutral-500">Description</p>
                    <p className="font-medium">{profileData?.recruiterProfile?.description || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Statut</p>
                    <p className="font-medium">
                      {session?.user?.verified ? (
                        <span className="text-green-600">✓ Vérifié</span>
                      ) : (
                        <span className="text-yellow-600">En attente de vérification</span>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
            </>
          )}

          {/* Onglet Abonnement */}
          {activeTab === 'subscription' && (
            <SubscriptionManagement />
          )}

          {/* Onglet Vidéos pour les joueurs */}
          {activeTab === 'videos' && isPlayer && (
            <VideoSection 
              userId={session?.user?.id || ''} 
              isOwnProfile={true} 
            />
          )}
        </div>
      </main>
    </div>
  );
}

