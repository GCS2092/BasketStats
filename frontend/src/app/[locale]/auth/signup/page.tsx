'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { authApi } from '@/lib/api/auth';
import apiClient from '@/lib/api/client';

export default function SignupPage() {
  const router = useRouter();
  const t = useTranslations();
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
      await apiClient.post('/auth/send-verification-otp', { email: formData.email });
      setSuccess(t('auth.codeSent'));
      setStep('verify');
    } catch (err: any) {
      setError(err.response?.data?.message || t('auth.codeError'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const verifyResponse = await apiClient.post('/auth/verify-otp', {
        email: formData.email,
        code: verificationCode,
      });

      if (!verifyResponse.data.valid) {
        throw new Error(t('auth.codeError'));
      }

      await authApi.signup(formData);
      setSuccess(t('auth.signupSuccess') + ' Redirection...');
      
      setTimeout(() => router.push('/welcome'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || t('auth.codeError'));
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
            <p className="text-neutral-600">{t('auth.signupTitle')}</p>
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
                {t('auth.fullName')}
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
                {t('auth.email')}
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input"
                required
                placeholder={t('auth.emailPlaceholder')}
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                {t('auth.password')}
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
              <p className="text-xs text-neutral-500 mt-1">{t('auth.passwordMinLength')}</p>
            </div>

            <div>
              <label className="label">{t('auth.role')}</label>
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
                  <span>{t('auth.rolePlayer')}</span>
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
                  <span>{t('auth.roleRecruiter')}</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('auth.sendingCode') : '📧 ' + t('auth.sendCode')}
            </button>
          </form>
          ) : (
            <form onSubmit={handleVerifyAndSignup} className="space-y-4">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <span className="text-3xl">📧</span>
                </div>
                <p className="text-sm text-neutral-600">
                  {t('auth.codeSentTo')}<br />
                  <strong>{formData.email}</strong>
                </p>
              </div>

              <div>
                <label htmlFor="verificationCode" className="label">
                  {t('auth.verificationCode')}
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
                  {t('auth.codeExpires')}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || verificationCode.length !== 6}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('auth.verifying') : '✓ ' + t('auth.verifyAndCreate')}
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
                ← {t('auth.editInfo')}
              </button>

              <button
                type="button"
                onClick={async () => {
                  try {
                    setLoading(true);
                    await apiClient.post('/auth/send-verification-otp', { email: formData.email });
                    setSuccess(t('auth.codeResent'));
                  } catch (err: any) {
                    setError(t('auth.codeError'));
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="w-full text-sm text-primary hover:text-primary-600 py-2 font-medium"
              >
                📧 {t('auth.resendCode')}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-neutral-600">
              {t('auth.hasAccount')}{' '}
              <Link href="/auth/login" className="text-primary font-medium hover:underline">
                {t('auth.login')}
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-700">
              ← {t('auth.backToHome')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

