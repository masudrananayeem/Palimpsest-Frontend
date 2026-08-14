import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "../lib/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setInitializing(false);
    });
    return unsub;
  }, []);

  const requireConfig = () => {
    if (!isFirebaseConfigured) {
      throw new Error(
        "Firebase isn't configured yet. Add your project keys to frontend/.env (see .env.example) and restart the dev server."
      );
    }
  };

  const refreshUser = async () => {
    if (!auth.currentUser) return;
    await auth.currentUser.reload();
    // Spread into a new object so React sees a changed reference and re-renders
    // (the Firebase User instance mutates its own fields in place otherwise).
    setUser({ ...auth.currentUser });
  };

  const signUpEmail = async (email, password, displayName) => {
    requireConfig();
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(cred.user, { displayName });
      await refreshUser();
    }
    return cred.user;
  };

  const signInEmail = async (email, password) => {
    requireConfig();
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  };

  const signInGoogle = async () => {
    requireConfig();
    const cred = await signInWithPopup(auth, googleProvider);
    return cred.user;
  };

  const logout = async () => {
    requireConfig();
    await signOut(auth);
  };

  const updateAvatar = async (photoURL) => {
    requireConfig();
    if (!auth.currentUser) throw new Error("You need to be signed in to update your photo.");
    await updateProfile(auth.currentUser, { photoURL });
    await refreshUser();
  };

  return (
    <AuthContext.Provider
      value={{ user, initializing, isFirebaseConfigured, signUpEmail, signInEmail, signInGoogle, logout, updateAvatar, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
