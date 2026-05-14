import { FirebaseCrashlytics } from '@capacitor-firebase/crashlytics';

let installed = false;

export function installGlobalErrorHandlers() {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  window.addEventListener('error', (event) => {
    const err = event.error instanceof Error ? event.error : new Error(String(event.message || event));
    void reportError(err);
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const err = reason instanceof Error ? reason : new Error(typeof reason === 'string' ? reason : JSON.stringify(reason));
    void reportError(err);
  });
}

export async function reportError(error: Error, context?: Record<string, string>) {
  if (import.meta.env.DEV) {
    console.warn('[crash]', error.message, context);
  }
  try {
    if (context) {
      for (const [key, value] of Object.entries(context)) {
        await FirebaseCrashlytics.setCustomKey({ key, value, type: 'string' });
      }
    }
    await FirebaseCrashlytics.recordException({
      message: error.message,
      stacktrace: parseStacktrace(error.stack),
    });
  } catch (err) {
    if (import.meta.env.DEV) console.warn('[crash] recordException failed', err);
  }
}

export async function setCrashUserId(userId: string | null) {
  try {
    await FirebaseCrashlytics.setUserId({ userId: userId ?? '' });
  } catch (err) {
    if (import.meta.env.DEV) console.warn('[crash] setUserId failed', err);
  }
}

function parseStacktrace(stack?: string): { fileName?: string; lineNumber?: number; methodName?: string }[] {
  if (!stack) return [];
  // Best-effort parse: each line like "    at functionName (file:line:col)"
  return stack
    .split('\n')
    .slice(1)
    .map((line) => {
      const match = line.match(/at\s+(.+?)\s+\((.+?):(\d+):\d+\)/) || line.match(/at\s+(.+?):(\d+):\d+/);
      if (!match) return { methodName: line.trim() };
      if (match.length === 4) {
        return { methodName: match[1], fileName: match[2], lineNumber: parseInt(match[3], 10) };
      }
      return { fileName: match[1], lineNumber: parseInt(match[2], 10) };
    })
    .slice(0, 30); // cap frames
}
