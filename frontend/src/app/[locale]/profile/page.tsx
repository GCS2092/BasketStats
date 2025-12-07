'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
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

export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [activeTab, setActiveTab] = useState('profile');
  
  useAuthSync(); // Synchroniser tokens

  // Récupérer le profil utilisateur
  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const response = await apiClient.get('/users/me');
      return response.data;
    },
    enabled: !!session,
  });

  // Récupérer le profil joueur/recruteur
  const { data: playerProfile } = useQuery({
    queryKey: ['player-profile'],
    queryFn: async () => {
      const response = await apiClient.get('/players/me');
      return response.data;
    },
    enabled: !!session && session.user?.role === 'PLAYER',
  });

  const { data: recruiterProfile } = useQuery({
    queryKey: ['recruiter-profile'],
    queryFn: async () => {
      const response = await apiClient.get('/recruiters/me');
      return response.data;
    },
    enabled: !!session && session.user?.role === 'RECRUITER',
  });

  // Règles de validation
  const validationRules = {
    fullName: { required: true, min: 2, max: 100 },
    heightCm: { 
      required: false, 
      min: HEIGHT_RANGES.min, 
      max: HEIGHT_RANGES.max,
    },
    weightKg: { 
      required: false, 
      min: WEIGHT_RANGES.min, 
      max: WEIGHT_RANGES.max,
    },
    wingspan: { 
      required: false, 
      min: WINGSPAN_RANGES.min, 
      max: WINGSPAN_RANGES.max,
    },
    yearsExperience: { 
      required: false, 
      min: EXPERIENCE_RANGES.min, 
      max: EXPERIENCE_RANGES.max,
    },
    jerseyNumber: { 
      required: false, 
      min: JERSEY_NUMBER_RANGES.min, 
      max: JERSEY_NUMBER_RANGES.max,
    },
  };

  const { errors, validateField, validateForm } = useFormValidation(validationRules);

  // Initialiser formData avec les données du profil
  useEffect(() => {
    if (profile && !isEditing) {
      setFormData({
        ...profile,
        ...playerProfile,
        ...recruiterProfile,
      });
    }
  }, [profile, playerProfile, recruiterProfile, isEditing]);

  // Mutation pour mettre à jour le profil
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.put('/users/me', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['player-profile'] });
      queryClient.invalidateQueries({ queryKey: ['recruiter-profile'] });
      setIsEditing(false);
    },
  });

  const handleSave = async () => {
    if (!validateForm(formData)) {
      return;
    }

    updateProfileMutation.mutate(formData);
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <Header />
      <ElegantQuickNavigation currentPage="/profile" />
      
      <main className="container-custom py-6">
        <div className="max-w-4xl mx-auto">
          <div className="card p-6 mb-6">
            <h1 className="text-3xl font-bold mb-4">{t('profile.title')}</h1>
            
            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2 font-medium ${activeTab === 'profile' ? 'border-b-2 border-primary text-primary' : 'text-neutral-600'}`}
              >
                {t('profile.profile')}
              </button>
              <button
                onClick={() => setActiveTab('subscription')}
                className={`px-4 py-2 font-medium ${activeTab === 'subscription' ? 'border-b-2 border-primary text-primary' : 'text-neutral-600'}`}
              >
                {t('profile.subscription')}
              </button>
            </div>

            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Avatar */}
                <AvatarUpload />

                {/* Formulaire de profil */}
                {isEditing ? (
                  <div className="space-y-4">
                    <ValidatedInput
                      label={t('auth.fullName')}
                      value={formData.fullName || ''}
                      onChange={(value) => setFormData({ ...formData, fullName: value })}
                      error={errors.fullName}
                      validate={(v) => validateField('fullName', v)}
                    />

                    {session.user?.role === 'PLAYER' && (
                      <>
                        <ValidatedInput
                          label="Taille (cm)"
                          type="number"
                          value={formData.heightCm || ''}
                          onChange={(value) => setFormData({ ...formData, heightCm: parseInt(value) || 0 })}
                          error={errors.heightCm}
                        />
                        <ValidatedInput
                          label="Poids (kg)"
                          type="number"
                          value={formData.weightKg || ''}
                          onChange={(value) => setFormData({ ...formData, weightKg: parseInt(value) || 0 })}
                          error={errors.weightKg}
                        />
                      </>
                    )}

                    <div className="flex gap-4">
                      <button onClick={handleSave} className="btn-primary">
                        {t('common.save')}
                      </button>
                      <button onClick={() => setIsEditing(false)} className="btn-secondary">
                        {t('common.cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p><strong>{t('auth.fullName')}:</strong> {profile?.fullName}</p>
                    {playerProfile && (
                      <>
                        <p><strong>Taille:</strong> {playerProfile.heightCm} cm</p>
                        <p><strong>Poids:</strong> {playerProfile.weightKg} kg</p>
                      </>
                    )}
                    <button onClick={() => setIsEditing(true)} className="btn-primary mt-4">
                      {t('profile.edit')}
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'subscription' && (
              <SubscriptionManagement />
            )}
          </div>

          {/* Section Vidéos */}
          {session.user?.role === 'PLAYER' && (
            <VideoSection />
          )}
        </div>
      </main>
    </div>
  );
}

