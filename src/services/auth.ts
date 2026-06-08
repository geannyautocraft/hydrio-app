import {
  signInAnonymously,
  signInWithEmailAndPassword as fbSignInWithEmailAndPassword,
  createUserWithEmailAndPassword as fbCreateUserWithEmailAndPassword,
  signInWithCredential,
  linkWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail as fbSendPasswordResetEmail,
  signOut as fbSignOut,
  type User,
} from 'firebase/auth';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { Capacitor } from '@capacitor/core';
import { firebaseAuth } from '../lib/firebase';

export type AuthUser = User;

export class AuthError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

function wrap(err: unknown): AuthError {
  const e = err as { code?: string; message?: string };
  return new AuthError(e?.code ?? 'auth/unknown', e?.message ?? 'Authentication error');
}

export function getCurrentUser(): AuthUser | null {
  return firebaseAuth.currentUser;
}

export async function ensureSignedIn(): Promise<AuthUser> {
  await firebaseAuth.authStateReady();
  if (firebaseAuth.currentUser) return firebaseAuth.currentUser;
  try {
    const { user } = await signInAnonymously(firebaseAuth);
    return user;
  } catch (err) {
    throw wrap(err);
  }
}

export async function signUpWithEmail(email: string, password: string): Promise<AuthUser> {
  await firebaseAuth.authStateReady();
  const current = firebaseAuth.currentUser;
  console.log('[auth] signUpWithEmail: current user', current?.uid, 'isAnonymous=', current?.isAnonymous);
  try {
    if (current?.isAnonymous) {
      console.log('[auth] linking anonymous to email');
      const cred = EmailAuthProvider.credential(email, password);
      const { user } = await linkWithCredential(current, cred);
      console.log('[auth] link success, user uid=', user.uid, 'email=', user.email);
      return user;
    }
    console.log('[auth] creating new email/password user');
    const { user } = await fbCreateUserWithEmailAndPassword(firebaseAuth, email, password);
    console.log('[auth] create success, user uid=', user.uid, 'email=', user.email);
    return user;
  } catch (err) {
    console.error('[auth] signUpWithEmail error', err);
    throw wrap(err);
  }
}

export async function signInWithEmail(email: string, password: string): Promise<AuthUser> {
  try {
    console.log('[auth] signInWithEmail attempt');
    const { user } = await fbSignInWithEmailAndPassword(firebaseAuth, email, password);
    console.log('[auth] signIn success, user uid=', user.uid, 'email=', user.email);
    return user;
  } catch (err) {
    console.error('[auth] signInWithEmail error', err);
    throw wrap(err);
  }
}

async function getGoogleCredential(): Promise<ReturnType<typeof GoogleAuthProvider.credential>> {
  const result = await FirebaseAuthentication.signInWithGoogle();
  const idToken = result.credential?.idToken;
  if (!idToken) throw new AuthError('auth/no-token', 'Google did not return an ID token');
  return GoogleAuthProvider.credential(idToken);
}

export async function continueWithGoogle(): Promise<AuthUser> {
  try {
    if (!Capacitor.isNativePlatform()) {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(firebaseAuth, provider);
      return user;
    }

    const credential = await getGoogleCredential();
    const current = firebaseAuth.currentUser;
    if (current?.isAnonymous) {
      try {
        const { user } = await linkWithCredential(current, credential);
        return user;
      } catch (linkErr) {
        const code = (linkErr as { code?: string })?.code ?? '';
        if (!code.includes('credential-already-in-use') && !code.includes('email-already-in-use')) {
          throw linkErr;
        }
        // Google account already has a Firebase user — fall through to sign-in.
      }
    }
    const { user } = await signInWithCredential(firebaseAuth, credential);
    return user;
  } catch (err) {
    throw wrap(err);
  }
}

export async function sendPasswordReset(email: string): Promise<void> {
  try {
    await fbSendPasswordResetEmail(firebaseAuth, email);
  } catch (err) {
    throw wrap(err);
  }
}

export async function signOut(): Promise<void> {
  try {
    await fbSignOut(firebaseAuth);
    await FirebaseAuthentication.signOut().catch(() => undefined);
    await signInAnonymously(firebaseAuth);
  } catch (err) {
    throw wrap(err);
  }
}
