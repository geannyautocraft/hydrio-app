import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import {
  signUpWithEmail,
  signInWithEmail,
  continueWithGoogle,
  sendPasswordReset,
  signOut,
  AuthError,
} from '../services/auth';

type Mode = 'idle' | 'signup' | 'signin' | 'reset';

function friendlyError(t: (k: string) => string, err: unknown): string {
  if (err instanceof AuthError) {
    const code = err.code;
    if (code.includes('email-already-in-use')) return t('account.errorEmailInUse');
    if (code.includes('invalid-email')) return t('account.errorInvalidEmail');
    if (code.includes('weak-password')) return t('account.errorWeakPassword');
    if (code.includes('wrong-password') || code.includes('invalid-credential')) return t('account.errorWrongPassword');
    if (code.includes('user-not-found')) return t('account.errorUserNotFound');
    if (code.includes('network')) return t('account.errorNetwork');
    if (code.includes('popup-closed') || code.includes('cancelled')) return t('account.errorCancelled');
    return err.message;
  }
  return (err as Error)?.message ?? t('account.errorGeneric');
}

export function AccountSection() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>('idle');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const isAnonymous = !user || user.isAnonymous;
  const displayName = user?.displayName || user?.email || '';

  const sectionClass = 'rounded-lg border border-gray-300/50 dark:border-gray-600/50 glass-inner p-3';
  const labelClass = 'mb-1.5 block text-sm font-semibold text-gray-800 dark:text-gray-200';
  const inputClass = 'w-full rounded-lg border border-gray-300/60 px-3 py-2 text-base text-gray-900 bg-white/60 backdrop-blur-sm transition-colors focus:border-blue-400 focus:outline-none dark:border-gray-600/60 dark:bg-gray-800/60 dark:text-white dark:focus:border-blue-500';

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setError('');
    setInfo('');
  };

  const closeForm = () => {
    setMode('idle');
    resetForm();
  };

  const handleGoogle = async () => {
    setBusy(true);
    setError('');
    setInfo('');
    try {
      await continueWithGoogle();
    } catch (err) {
      setError(friendlyError(t, err));
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      setError(t('account.errorMissingFields'));
      return;
    }
    setBusy(true);
    setError('');
    setInfo('');
    try {
      if (mode === 'signup') {
        await signUpWithEmail(email, password);
      } else if (mode === 'signin') {
        await signInWithEmail(email, password);
      }
      closeForm();
    } catch (err) {
      setError(friendlyError(t, err));
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async () => {
    if (!email) {
      setError(t('account.errorMissingEmail'));
      return;
    }
    setBusy(true);
    setError('');
    setInfo('');
    try {
      await sendPasswordReset(email);
      setInfo(t('account.resetEmailSent'));
    } catch (err) {
      setError(friendlyError(t, err));
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    setBusy(true);
    setError('');
    try {
      await signOut();
    } catch (err) {
      setError(friendlyError(t, err));
    } finally {
      setBusy(false);
    }
  };

  // Signed-in state (not anonymous)
  if (!isAnonymous) {
    return (
      <div className={sectionClass}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('account.signedInAs')}</p>
            <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">{displayName}</p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={busy}
            className="shrink-0 rounded-lg border border-gray-300/60 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-white/50 dark:border-gray-600/60 dark:text-gray-300 dark:hover:bg-white/10 disabled:opacity-50"
          >
            {t('account.signOut')}
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  // Anonymous state — idle (default buttons)
  if (mode === 'idle') {
    return (
      <div className={sectionClass}>
        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">{t('account.anonymousHint')}</p>
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300/60 bg-white py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 dark:border-gray-600/60 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            {t('account.continueWithGoogle')}
          </button>
          <button
            type="button"
            onClick={() => { resetForm(); setMode('signup'); }}
            className="w-full rounded-lg bg-blue-500 py-2 text-sm font-medium text-white hover:bg-blue-600"
          >
            {t('account.createAccount')}
          </button>
          <button
            type="button"
            onClick={() => { resetForm(); setMode('signin'); }}
            className="w-full text-center text-xs font-medium text-blue-500 hover:text-blue-700 dark:text-blue-400"
          >
            {t('account.alreadyHaveAccount')}
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  // Anonymous state — email form (signup, signin, or reset)
  return (
    <div className={sectionClass}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          {mode === 'signup' && t('account.createAccount')}
          {mode === 'signin' && t('account.signIn')}
          {mode === 'reset' && t('account.resetPassword')}
        </h3>
        <button
          type="button"
          onClick={closeForm}
          className="rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label={t('settings.cancel')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {mode === 'signin' && (
        <p className="mb-3 text-xs text-amber-600 dark:text-amber-400">{t('account.signInWarning')}</p>
      )}

      <div className="space-y-3">
        <div>
          <label htmlFor="account-email" className={labelClass}>{t('account.email')}</label>
          <input
            id="account-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            disabled={busy}
            required
          />
        </div>

        {mode !== 'reset' && (
          <div>
            <label htmlFor="account-password" className={labelClass}>{t('account.password')}</label>
            <input
              id="account-password"
              type="password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              disabled={busy}
              minLength={6}
              required
            />
            {mode === 'signup' && (
              <p className="mt-1 text-xs text-gray-500">{t('account.passwordHint')}</p>
            )}
          </div>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}
        {info && <p className="text-xs text-green-600 dark:text-green-400">{info}</p>}

        <button
          type="button"
          onClick={mode === 'reset' ? handleReset : handleSubmit}
          disabled={busy}
          className="w-full rounded-lg bg-blue-500 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {busy && '...'}
          {!busy && mode === 'signup' && t('account.createAccount')}
          {!busy && mode === 'signin' && t('account.signIn')}
          {!busy && mode === 'reset' && t('account.sendResetEmail')}
        </button>

        {mode === 'signin' && (
          <button
            type="button"
            onClick={() => { setError(''); setInfo(''); setMode('reset'); }}
            className="block w-full text-center text-xs font-medium text-blue-500 hover:text-blue-700 dark:text-blue-400"
          >
            {t('account.forgotPassword')}
          </button>
        )}
      </div>
    </div>
  );
}
