import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../lib/firebase';

export const AUTHORIZED_LECTURER_EMAIL = 'sunsmartcbt@gmail.com';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthorized: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Immediate synchronous check for unauthorized cached session
    if (auth.currentUser) {
      const email = (auth.currentUser.email || '').toLowerCase().trim();
      if (email !== AUTHORIZED_LECTURER_EMAIL) {
        console.warn(`[Security Alert] Immediately evicting unauthorized cached session: ${email}`);
        signOut(auth).catch(() => {});
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      const userEmail = (currentUser.email || '').toLowerCase().trim();

      // 1. Strict email gate
      if (userEmail !== AUTHORIZED_LECTURER_EMAIL) {
        console.warn(`[Security Alert] Unauthorized account detected: ${userEmail}. Revoking session immediately.`);
        try {
          await signOut(auth);
        } catch {}
        setUser(null);
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      // 2. Server-side token authorization verification
      try {
        const idToken = await currentUser.getIdToken();
        const verifyRes = await fetch('/api/verify-lecturer', {
          headers: {
            Authorization: `Bearer ${idToken}`
          }
        });

        if (!verifyRes.ok) {
          console.warn('[Security Alert] Server denied authorization for lecturer session.');
          try {
            await signOut(auth);
          } catch {}
          setUser(null);
          setIsAuthorized(false);
        } else {
          setUser(currentUser);
          setIsAuthorized(true);
        }
      } catch (serverErr) {
        console.error('Server-side lecturer verification error:', serverErr);
        if (userEmail === AUTHORIZED_LECTURER_EMAIL) {
          setUser(currentUser);
          setIsAuthorized(true);
        } else {
          setUser(null);
          setIsAuthorized(false);
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail !== AUTHORIZED_LECTURER_EMAIL) {
      throw new Error(`Access Restricted: Only the designated Sports University administrator (${AUTHORIZED_LECTURER_EMAIL}) is permitted.`);
    }

    const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
    if (cred.user) {
      // Server-side verification
      const idToken = await cred.user.getIdToken();
      const verifyRes = await fetch('/api/verify-lecturer', {
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      });

      if (!verifyRes.ok) {
        await signOut(auth);
        throw new Error('Server-side authorization check failed. Access denied.');
      }

      setUser(cred.user);
      setIsAuthorized(true);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setIsAuthorized(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthorized,
        signInWithEmail,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
