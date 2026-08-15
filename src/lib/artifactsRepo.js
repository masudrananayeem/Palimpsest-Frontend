import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../lib/firebase";
import { artifacts as demoArtifacts } from "../data/artifacts";

const COLLECTION = "artifacts";

/**
 * Every read here falls back to the bundled demo dataset when Firebase
 * isn't configured (or a live project has no data yet). This keeps the
 * archive fully browsable out of the box, and makes it obvious — via
 * `source` — whether what's on screen is live or sample data.
 */
export async function getArtifacts() {
  if (!isFirebaseConfigured) {
    return { items: demoArtifacts, source: "demo" };
  }
  try {
    const snap = await getDocs(query(collection(db, COLLECTION), orderBy("createdAt", "desc")));
    if (snap.empty) return { items: demoArtifacts, source: "demo" };
    return { items: snap.docs.map((d) => ({ id: d.id, ...d.data() })), source: "live" };
  } catch (err) {
    console.error("[Palimpsest] Failed to load artifacts from Firestore, showing demo data.", err);
    return { items: demoArtifacts, source: "demo" };
  }
}

export async function getArtifactById(id) {
  if (!isFirebaseConfigured) {
    return demoArtifacts.find((a) => a.id === id) || null;
  }
  try {
    const snap = await getDoc(doc(db, COLLECTION, id));
    if (snap.exists()) return { id: snap.id, ...snap.data() };
    return demoArtifacts.find((a) => a.id === id) || null;
  } catch (err) {
    console.error("[Palimpsest] Failed to load artifact from Firestore, checking demo data.", err);
    return demoArtifacts.find((a) => a.id === id) || null;
  }
}

export async function getArtifactsByUser(uid) {
  if (!isFirebaseConfigured || !uid) return [];
  try {
    const snap = await getDocs(
      query(collection(db, COLLECTION), where("contributorId", "==", uid), orderBy("createdAt", "desc"))
    );
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error("[Palimpsest] Failed to load your submissions from Firestore.", err);
    return [];
  }
}

/**
 * Creates a new artifact record owned by the given user. Throws if
 * Firebase isn't configured — callers should check `isFirebaseConfigured`
 * (or catch) before calling this from a submit handler.
 */
export async function createArtifact(data, user) {
  if (!isFirebaseConfigured) {
    throw new Error("Firebase isn't configured — connect your project to submit real records.");
  }
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    contributorId: user.uid,
    contributor: user.displayName || user.email || "Anonymous contributor",
    status: data.status || "queued",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Admin-only actions. Firestore rules are the real gatekeeper here — these
 * will fail for anyone whose email isn't in the ADMIN_EMAILS list in
 * firestore.rules, no matter what the client-side UI shows.
 */
export async function updateArtifactStatus(id, status) {
  if (!isFirebaseConfigured) throw new Error("Firebase isn't configured.");
  await updateDoc(doc(db, COLLECTION, id), { status });
}

export async function deleteArtifact(id) {
  if (!isFirebaseConfigured) throw new Error("Firebase isn't configured.");
  await deleteDoc(doc(db, COLLECTION, id));
}
