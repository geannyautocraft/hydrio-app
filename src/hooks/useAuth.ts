import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth } from '../lib/firebase';
import { ensureSignedIn, type AuthUser } from '../services/auth';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: Error | null;
}

let bootstrapPromise: Promise<void> | null = null;

function bootstrapOnce(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = ensureSignedIn()
      .then(() => undefined)
      .catch((err) => {
        bootstrapPromise = null;
        throw err;
      });
  }
  return bootstrapPromise;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: firebaseAuth.currentUser,
    loading: !firebaseAuth.currentUser,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      setState((prev) => ({ ...prev, user, loading: false }));
    });

    bootstrapOnce().catch((error) => {
      setState((prev) => ({ ...prev, error, loading: false }));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return state;
}
