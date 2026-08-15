import { doc, getDoc, setDoc, deleteDoc, collection, getDocs, serverTimestamp } from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";

const COLLECTION = "admins";

/** True if this email has a doc in the `admins` collection (owners never do — see firestore.rules). */
export async function isDynamicAdmin(email) {
  if (!isFirebaseConfigured || !email) return false;
  try {
    const snap = await getDoc(doc(db, COLLECTION, email.toLowerCase()));
    return snap.exists();
  } catch {
    // Most likely: this user has no read access, i.e. they're asking about
    // someone else's status, or Firestore rules rejected it — either way,
    // safe default is "not an admin".
    return false;
  }
}

/** Lists everyone in the dynamic admins collection. Requires the caller to already be an admin (enforced by rules). */
export async function listAdmins() {
  if (!isFirebaseConfigured) return [];
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs.map((d) => ({ email: d.id, ...d.data() }));
}

/** Grants admin access to an email. Requires the caller to already be an admin (enforced by rules). */
export async function addAdmin(email, addedByEmail) {
  if (!isFirebaseConfigured) throw new Error("Firebase isn't configured.");
  const normalized = email.trim().toLowerCase();
  await setDoc(doc(db, COLLECTION, normalized), {
    email: normalized,
    addedBy: addedByEmail || null,
    addedAt: serverTimestamp(),
  });
}

/** Revokes admin access from an email. Owners (hardcoded in firestore.rules) can't be removed this way. */
export async function removeAdmin(email) {
  if (!isFirebaseConfigured) throw new Error("Firebase isn't configured.");
  await deleteDoc(doc(db, COLLECTION, email.trim().toLowerCase()));
}
