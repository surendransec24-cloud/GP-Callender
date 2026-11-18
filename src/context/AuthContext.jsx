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

const DEMO_USER_KEY = 'bit_calendar_demo_user';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // 1. Check local demo user first if in offline/demo mode
    const cachedDemo = localStorage.getItem(DEMO_USER_KEY);
    if (cachedDemo) {
      try {
        const u = JSON.parse(cachedDemo);
        setCurrentUser(u);
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem(DEMO_USER_KEY);
      }
    }

    // 2. If Firebase is configured, listen to auth state changes
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          const email = (user.email || '').toLowerCase();
          if (email.endsWith(`@${ALLOWED_DOMAIN}`) && user.emailVerified) {
            setCurrentUser(user);
          } else {
            // Disallowed domain or unverified
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

  /**
   * Demo sign in for evaluating or testing without Firebase credentials
   */
  const loginWithDemoAccount = (asAdmin = false) => {
    setAuthError(null);
    const demoUser = {
      uid: asAdmin ? 'demo-admin-uid' : 'demo-student-uid',
      displayName: asAdmin ? 'BIT Administrator' : 'Kavitha S (Student)',
      email: asAdmin ? 'admin@bitsathy.ac.in' : 'kavitha.cs24@bitsathy.ac.in',
      photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${asAdmin ? 'Admin' : 'Kavitha'}&backgroundColor=0c3b82&textColor=ffffff`,
      emailVerified: true,
      isDemo: true
    };
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
    setCurrentUser(demoUser);
  };

  const logout = async () => {
    setAuthError(null);
    localStorage.removeItem(DEMO_USER_KEY);
    await signOutUser();
    setCurrentUser(null);
  };

  const isAdmin = currentUser ? isUserAdmin(currentUser.email) : false;

  const value = {
    currentUser,
    loading,
    isAdmin,
    authError,
    setAuthError,
    loginWithGoogle,
    loginWithDemoAccount,
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

