import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import {
  auth,
  db,
  handleFirestoreError,
  isFirebaseConfigured,
  OperationType,
  signInWithGooglePopup,
  signOutFirebase,
} from '../lib/firebase';

export interface UserProfileRecord {
  uid: string;
  displayName: string;
  photoURL: string;
  role: 'member' | 'guardian' | 'partner';
  county: string;
}

interface AuthContextValue {
  user: User | null;
  profile: UserProfileRecord | null;
  loading: boolean;
  authError: string | null;
  signInWithGoogle: (preferredRole?: UserProfileRecord['role'], county?: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  authError: null,
  signInWithGoogle: async () => {},
  signOutUser: async () => {},
  clearAuthError: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfileRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const syncUserDocuments = useCallback(
    async (
      firebaseUser: User,
      preferredRole: UserProfileRecord['role'] = 'guardian',
      county = 'Kiambu'
    ) => {
      if (!firebaseUser.emailVerified || !isFirebaseConfigured || !db) return;

      const userPath = `users/${firebaseUser.uid}`;
      const userRef = doc(db, 'users', firebaseUser.uid);
      try {
        const snap = await getDoc(userRef);
        const safeName = (firebaseUser.displayName || 'Circle Member').trim().slice(0, 110);
        const safePhoto = (firebaseUser.photoURL || '').slice(0, 480);

        if (!snap.exists()) {
          await setDoc(userRef, {
            uid: firebaseUser.uid,
            displayName: safeName,
            photoURL: safePhoto,
            role: preferredRole,
            county: county.slice(0, 75),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          setProfile({
            uid: firebaseUser.uid,
            displayName: safeName,
            photoURL: safePhoto,
            role: preferredRole,
            county,
          });
        } else {
          const existing = snap.data();
          setProfile({
            uid: firebaseUser.uid,
            displayName: existing.displayName || safeName,
            photoURL: existing.photoURL || safePhoto,
            role: (existing.role as UserProfileRecord['role']) || preferredRole,
            county: existing.county || county,
          });
        }

        const privatePath = `users/${firebaseUser.uid}/private/contact`;
        const privateRef = doc(db, 'users', firebaseUser.uid, 'private', 'contact');
        try {
          const pSnap = await getDoc(privateRef);
          if (!pSnap.exists()) {
            await setDoc(privateRef, {
              uid: firebaseUser.uid,
              email: (firebaseUser.email || '').slice(0, 150),
              phone: (firebaseUser.phoneNumber || '').slice(0, 38),
              updatedAt: serverTimestamp(),
            });
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, privatePath);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, userPath);
      }
    },
    []
  );

  useEffect(() => {
    if (
      !isFirebaseConfigured ||
      !auth ||
      (typeof window !== 'undefined' &&
        (window.location.pathname.startsWith('/gbv') ||
          window.location.pathname.startsWith('/recovery')))
    ) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        void syncUserDocuments(firebaseUser).catch((err) => {
          console.error('Profile sync error:', err);
        });
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [syncUserDocuments]);

  const signInWithGoogle = useCallback(
    async (preferredRole: UserProfileRecord['role'] = 'guardian', county = 'Kiambu') => {
      setAuthError(null);
      try {
        const loggedUser = await signInWithGooglePopup();
        await syncUserDocuments(loggedUser, preferredRole, county);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unable to complete Google Sign-In.';
        setAuthError(msg);
      }
    },
    [syncUserDocuments]
  );

  const signOutUser = useCallback(async () => {
    setAuthError(null);
    await signOutFirebase();
    setProfile(null);
  }, []);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        authError,
        signInWithGoogle,
        signOutUser,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
