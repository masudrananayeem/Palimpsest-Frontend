import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { documents as demoDocuments, documentBodies as demoBodies } from "../data/documents";

const COLLECTION = "documents";

/**
 * Mirrors artifactsRepo's demo-fallback shape: the static library in
 * data/documents.js always shows up (read-only, no owner), live Firestore
 * documents are layered on top so guests still see a full research library
 * even with no backend connected.
 */
export async function getDocuments() {
  const demo = demoDocuments.map((d) => ({ ...d, body: demoBodies[d.id], readonly: true }));
  if (!isFirebaseConfigured) return { items: demo, source: "demo" };
  try {
    const snap = await getDocs(query(collection(db, COLLECTION), orderBy("createdAt", "desc")));
    const live = snap.docs.map((d) => ({ id: d.id, ...d.data(), readonly: false }));
    return { items: [...live, ...demo], source: live.length ? "live" : "demo" };
  } catch (err) {
    console.error("[Palimpsest] Failed to load documents from Firestore, showing library only.", err);
    return { items: demo, source: "demo" };
  }
}

export async function createDocument(data, user) {
  if (!isFirebaseConfigured) {
    throw new Error("Firebase isn't configured — connect your project to save real documents.");
  }
  const ref = await addDoc(collection(db, COLLECTION), {
    title: data.title,
    type: data.type || "Note",
    version: data.version || "1.0",
    summary: data.summary || "",
    body: data.body || "",
    tags: data.tags || [],
    updated: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    ownerId: user.uid,
    ownerName: user.displayName || user.email || "Contributor",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateDocument(id, data) {
  if (!isFirebaseConfigured) throw new Error("Firebase isn't configured.");
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updated: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
  });
}

export async function deleteDocument(id) {
  if (!isFirebaseConfigured) throw new Error("Firebase isn't configured.");
  await deleteDoc(doc(db, COLLECTION, id));
}
