import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const ALLOWED_DOMAIN = (import.meta.env.VITE_ALLOWED_DOMAIN || 'bitsathy.ac.in').toLowerCase();

export const ADMIN_EMAILS = (
  import.meta.env.VITE_ADMIN_EMAILS || 
  'admin@bitsathy.ac.in,principal@bitsathy.ac.in,studentcouncil@bitsathy.ac.in'
)
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);

// Firebase configuration from environment
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

// Check if valid Firebase configuration is present
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey.trim() !== '' &&
  firebaseConfig.apiKey !== 'your-api-key-here' &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId.trim() !== '' &&
  firebaseConfig.projectId !== 'your-project-id' &&
  firebaseConfig.authDomain &&
  firebaseConfig.authDomain.trim() !== '' &&
  firebaseConfig.appId &&
  firebaseConfig.appId.trim() !== ''
);

// Initialize Firebase only if configured
let app = null;
let auth = null;
let db = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    // Ensure persistence across browser visits
    setPersistence(auth, browserLocalPersistence).catch(console.warn);
  } catch (err) {
    console.error('Failed to initialize Firebase:', err);
  }
}

export { auth, db };

/**
 * Configure Google Auth Provider strictly for college accounts
 */
export function getGoogleProvider() {
  const provider = new GoogleAuthProvider();
  // Constrain Google account picker to the college domain & always show prompt
  provider.setCustomParameters({
    hd: ALLOWED_DOMAIN,
    prompt: 'select_account'
  });
  return provider;
}

/**
 * Signs in using Google Auth and validates college domain + email verification
 */
export async function signInWithCollegeGoogle() {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('FIREBASE_NOT_CONFIGURED');
  }

  const provider = getGoogleProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const email = (user.email || '').toLowerCase();
    const isDomainAllowed = email.endsWith(`@${ALLOWED_DOMAIN}`);
    const isVerified = Boolean(user.emailVerified);

    if (!isDomainAllowed || !isVerified) {
      // Sign out immediately if not from bitsathy.ac.in or not verified
      await fbSignOut(auth);
      const err = new Error(`Please sign in with your @${ALLOWED_DOMAIN} email.`);
      err.code = 'custom/unauthorized-domain';
      throw err;
    }

    return user;
  } catch (error) {
    // Human-friendly error translation
    if (error.code === 'auth/popup-closed-by-user') {
      const err = new Error('Sign-in cancelled. The Google popup was closed before completing.');
      err.code = error.code;
      throw err;
    } else if (error.code === 'auth/network-request-failed') {
      const err = new Error('Network error. Please check your internet connection.');
      err.code = error.code;
      throw err;
    } else if (error.code === 'auth/unauthorized-domain') {
      const err = new Error(
        'This domain is not in the Firebase Authorized Domains list. Please add your hosting domain in Firebase Console -> Authentication -> Settings.'
      );
      err.code = error.code;
      throw err;
    } else if (error.code === 'custom/unauthorized-domain') {
      throw error;
    }
    throw error;
  }
}

/**
 * Sign out helper
 */
export async function signOutUser() {
  if (auth) {
    await fbSignOut(auth);
  }
}

/**
 * Check if an email address is an administrator
 */
export function isUserAdmin(email) {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

