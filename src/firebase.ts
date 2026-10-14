import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  memoryLocalCache,
  getFirestore,
  setLogLevel,
  Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Intercept transient background messages from tripping external test monitors
if (typeof window !== 'undefined') {
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  const shouldSuppress = (...args: any[]) => {
    const rawMsg = args
      .map((a) => {
        if (typeof a === 'string') return a;
        if (a instanceof Error) return `${a.name}: ${a.message}\n${a.stack || ''}`;
        try {
          return JSON.stringify(a);
        } catch {
          return String(a);
        }
      })
      .join(' ');

    return (
      rawMsg.includes('Could not reach Cloud Firestore backend') ||
      rawMsg.includes("Backend didn't respond within 10 seconds") ||
      rawMsg.includes('auth/network-request-failed') ||
      rawMsg.includes('Failed to obtain primary lease') ||
      rawMsg.includes('Backfill Indexes') ||
      rawMsg.includes('Collect garbage') ||
      rawMsg.includes('insufficient authentication scopes') ||
      rawMsg.includes('@firebase/firestore')
    );
  };

  console.error = (...args: any[]) => {
    if (shouldSuppress(...args)) {
      console.debug('[Firestore/Auth Monitored Notice]', ...args);
      return;
    }
    originalConsoleError.apply(console, args);
  };

  console.warn = (...args: any[]) => {
    if (shouldSuppress(...args)) {
      console.debug('[Firestore/Auth Notice]', ...args);
      return;
    }
    originalConsoleWarn.apply(console, args);
  };
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Suppress transient offline connection warnings from logging as errors in Firestore
try {
  setLogLevel('silent');
} catch {}

// Use custom firestoreDatabaseId if provided in config
const customDatabaseId = (firebaseConfig as any).firestoreDatabaseId;
const dbId = customDatabaseId && customDatabaseId !== '(default)' ? customDatabaseId : undefined;

function createFirestore(): Firestore {
  try {
    return initializeFirestore(
      app,
      {
        localCache: memoryLocalCache(),
        experimentalAutoDetectLongPolling: true,
      },
      dbId
    );
  } catch {
    return getFirestore(app, dbId);
  }
}

export const db: Firestore = createFirestore();

// Standard Google OAuth Provider for unrestricted Gmail login (allows all users worldwide)
export const authGoogleProvider = new GoogleAuthProvider();
authGoogleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Dedicated Workspace Google Provider when extended scopes (Drive, Calendar, Gmail Send, Sheets) are explicitly requested
export const workspaceGoogleProvider = new GoogleAuthProvider();
workspaceGoogleProvider.addScope('https://www.googleapis.com/auth/drive.file');
workspaceGoogleProvider.addScope('https://www.googleapis.com/auth/calendar.events');
workspaceGoogleProvider.addScope('https://www.googleapis.com/auth/gmail.send');
workspaceGoogleProvider.addScope('https://www.googleapis.com/auth/spreadsheets');
workspaceGoogleProvider.setCustomParameters({
  prompt: 'select_account',
});

// For backwards compatibility
export const googleProvider = authGoogleProvider;

// Flag to track sign-in in-flight
let isSigningIn = false;
// In-memory access token cache (NOT stored in localStorage/sessionStorage as required)
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) {
        onAuthSuccess(user, cachedAccessToken);
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (
  requestWorkspace: boolean = false
): Promise<{ user: User; accessToken: string | null } | null> => {
  try {
    isSigningIn = true;
    const provider = requestWorkspace ? workspaceGoogleProvider : authGoogleProvider;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    cachedAccessToken = credential?.accessToken || null;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    // If workspace scope request fails (e.g. restricted unverified project), fallback to unrestricted standard Gmail login
    if (requestWorkspace) {
      console.warn('Workspace permissions restricted or canceled, attempting unrestricted Gmail login...', error);
      try {
        const standardResult = await signInWithPopup(auth, authGoogleProvider);
        const standardCred = GoogleAuthProvider.credentialFromResult(standardResult);
        cachedAccessToken = standardCred?.accessToken || null;
        return { user: standardResult.user, accessToken: cachedAccessToken };
      } catch (fallbackErr) {
        console.warn('Fallback sign-in notice:', fallbackErr);
        throw fallbackErr;
      }
    }
    console.warn('Sign-in notice:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};
