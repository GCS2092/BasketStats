'use client';

import { useState } from 'react';
import { useRouter, Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import apiClient from '@/lib/api/client';

export const dynamic = 'force-dynamic';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const t = useTranslations();
  const [step, setStep] = useState<'email' | 'verify'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiClient.post('/auth/forgot-password', { email });
      setSuccess('Code envoyé ! Vérifiez votre email.');
      setStep('verify');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi du code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiClient.post('/auth/reset-password', {
        email,
        code,
        newPassword,
      });
      setSuccess('Mot de passe réinitialisé ! Redirection...');
      setTimeout(() => router.push('/auth/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Code invalide ou expiré');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 px-4">
      <div className="max-w-md w-full">
        <div className="card p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">🏀 BasketStats</h1>
            <p className="text-neutral-600">Réinitialisation du mot de passe</p>
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

          {step === 'email' ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  required
                  placeholder="votre@email.com"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Nous vous enverrons un code de vérification à 6 chiffres
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? 'Envoi...' : '📧 Envoyer le code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="label">Code de vérification (6 chiffres)</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="input text-center text-2xl font-bold letter-spacing-wide"
                  required
                  maxLength={6}
                  placeholder="000000"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Code envoyé à {email}
                </p>
              </div>

              <div>
                <label className="label">Nouveau mot de passe</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input"
                  required
                  minLength={6}
                  placeholder="Minimum 6 caractères"
                />
              </div>

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="btn btn-primary w-full"
              >
                {loading ? 'Réinitialisation...' : '✓ Réinitialiser le mot de passe'}
              </button>

              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-full text-sm text-neutral-600 hover:text-neutral-800"
              >
                ← Renvoyer un code
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link href="/auth/login" className="text-sm text-neutral-500 hover:text-neutral-700">
              ← Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

