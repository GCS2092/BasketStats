'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { authApi } from '@/lib/api/auth';
import apiClient from '@/lib/api/client';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'PLAYER' as 'PLAYER' | 'RECRUITER',
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Vérifier que l'email n'existe pas déjà (appel au backend)
      await apiClient.post('/auth/send-verification-otp', { email: formData.email });
      setSuccess('📧 Code de vérification envoyé ! Vérifiez votre email.');
      setStep('verify');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi du code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Vérifier le code OTP
      const verifyResponse = await apiClient.post('/auth/verify-otp', {
        email: formData.email,
        code: verificationCode,
      });

      if (!verifyResponse.data.valid) {
        throw new Error('Code invalide ou expiré');
      }

      // 2. Créer le compte
      await authApi.signup(formData);
      setSuccess('✅ Compte créé avec succès ! Redirection...');
      
          // 3. Rediriger vers la page de bienvenue après inscription
          setTimeout(() => router.push('/welcome'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Code invalide ou expiré');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 px-4 py-8">
      <div className="max-w-md w-full">
        <div className="card p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">🏀 BasketStats</h1>
            <p className="text-neutral-600">Créez votre compte</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
              {success}
            </div>
          )}

          {step === 'form' ? (
            <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="label">
                Nom complet
              </label>
              <input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="input"
                required
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input"
                required
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input"
                required
                minLength={6}
                placeholder="••••••••"
              />
              <p className="text-xs text-neutral-500 mt-1">Minimum 6 caractères</p>
            </div>

            <div>
              <label className="label">Je suis un(e)</label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="PLAYER"
                    checked={formData.role === 'PLAYER'}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="mr-2"
                  />
                  <span>Joueur</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="RECRUITER"
                    checked={formData.role === 'RECRUITER'}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="mr-2"
                  />
                  <span>Recruteur</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Envoi du code...' : '📧 Envoyer le code de vérification'}
            </button>
          </form>
          ) : (
            /* Step 2: Vérification OTP */
            <form onSubmit={handleVerifyAndSignup} className="space-y-4">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <span className="text-3xl">📧</span>
                </div>
                <p className="text-sm text-neutral-600">
                  Nous avons envoyé un code à 6 chiffres à<br />
                  <strong>{formData.email}</strong>
                </p>
              </div>

              <div>
                <label htmlFor="verificationCode" className="label">
                  Code de vérification
                </label>
                <input
                  id="verificationCode"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="input text-center text-2xl font-bold tracking-widest"
                  required
                  maxLength={6}
                  placeholder="000000"
                  autoFocus
                />
                <p className="text-xs text-neutral-500 mt-1 text-center">
                  Le code expire dans 10 minutes
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || verificationCode.length !== 6}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Vérification...' : '✓ Vérifier et créer mon compte'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setVerificationCode('');
                  setError('');
                  setSuccess('');
                }}
                className="w-full text-sm text-neutral-600 hover:text-neutral-800 py-2"
              >
                ← Modifier mes informations
              </button>

              <button
                type="button"
                onClick={async () => {
                  try {
                    setLoading(true);
                    await apiClient.post('/auth/send-verification-otp', { email: formData.email });
                    setSuccess('Code renvoyé ! Vérifiez votre email.');
                  } catch (err: any) {
                    setError('Erreur lors du renvoi du code');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="w-full text-sm text-primary hover:text-primary-600 py-2 font-medium"
              >
                📧 Renvoyer le code
              </button>
            </form>
          )}

          {/* Séparateur - OAuth uniquement visible au step 1 */}
          {step === 'form' && (
            <>
          {/* Séparateur */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-neutral-500">Ou s'inscrire avec</span>
            </div>
          </div>

          {/* Boutons OAuth */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: '/feed' })}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="font-medium">Google</span>
            </button>

            <button
              type="button"
              onClick={() => signIn('facebook', { callbackUrl: '/feed' })}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="font-medium">Facebook</span>
            </button>
          </div>
          </>
          )}

          <div className="mt-6 text-center">
            <p className="text-neutral-600">
              Déjà un compte ?{' '}
              <Link href="/auth/login" className="text-primary font-medium hover:underline">
                Se connecter
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-700">
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

