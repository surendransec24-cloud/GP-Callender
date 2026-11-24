import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  isFirebaseConfigured, 
  signInWithCollegeGoogle, 
  signOutUser, 
  isUserAdmin,
  ALLOWED_DOMAIN 
} from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Purge any legacy demo user data from local storage
    try {
      localStorage.removeItem('bit_calendar_demo_user');
    } catch (e) {}

    // Listen to live Firebase authentication state
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          const email = (user.email || '').toLowerCase();
          if (email.endsWith(`@${ALLOWED_DOMAIN}`) && user.emailVerified) {
            setCurrentUser(user);
          } else {
            // Disallowed domain or unverified email
            signOutUser();
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      }, (error) => {
        console.error('Auth state error:', error);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      const user = await signInWithCollegeGoogle();
      setCurrentUser(user);
      return user;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    setAuthError(null);
    try {
      localStorage.removeItem('bit_calendar_demo_user');
    } catch (e) {}
    await signOutUser();
    setCurrentUser(null);
  };

  // Admin access is strictly determined by ADMIN_EMAILS and Firestore rules
  const isAdmin = currentUser ? isUserAdmin(currentUser.email) : false;

  const value = {
    currentUser,
    loading,
    isAdmin,
    authError,
    setAuthError,
    loginWithGoogle,
    logout,
    isFirebaseConfigured
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
