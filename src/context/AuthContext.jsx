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
import { isDynamicAdmin } from "../lib/adminRepo";

// "Owners" — the bootstrap admin tier, code-only (see firestore.rules).
// Anyone else with admin access is added/removed from inside the app
// (Admin panel → Manage admins), stored in the `admins` Firestore collection.
const OWNER_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(isFirebaseConfigured);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminChecking, setAdminChecking] = useState(false);

  const isOwner = Boolean(user?.email && OWNER_EMAILS.includes(user.email.toLowerCase()));

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setInitializing(false);
    });
    return unsub;
  }, []);

  // Owner status resolves instantly (no network round trip). Non-owner
  // admin status is granted dynamically, so it needs a Firestore check —
  // this can only ever *add* admin access, never remove the owner's.
  useEffect(() => {
    let active = true;
    if (!user?.email) {
      setIsAdmin(false);
      setAdminChecking(false);
      return;
    }
    if (isOwner) {
      setIsAdmin(true);
      setAdminChecking(false);
      return;
    }
    setIsAdmin(false);
    setAdminChecking(true);
    isDynamicAdmin(user.email).then((result) => {
      if (active) {
        setIsAdmin(result);
        setAdminChecking(false);
      }
    });
    return () => { active = false; };
  }, [user?.email, isOwner]);

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
      value={{ user, initializing, isFirebaseConfigured, isAdmin, isOwner, adminChecking, signUpEmail, signInEmail, signInGoogle, logout, updateAvatar, refreshUser }}
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
