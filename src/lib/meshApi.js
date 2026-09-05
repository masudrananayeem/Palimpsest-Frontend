import { auth } from "./firebase";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export const isMeshApiConfigured = Boolean(API_BASE);

async function authedFetch(path, options = {}) {
  const token = await auth?.currentUser?.getIdToken();
  if (!token) throw new Error("Sign in required to generate a 3D model.");
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

/**
 * Kicks off a real AI image-to-3D reconstruction job (Meshy, via our
 * Worker) for an already-uploaded photo. Returns a Meshy task id to poll.
 * This is genuine mesh generation, not a visual trick — it costs Meshy
 * credits server-side, so it's only triggered explicitly.
 */
export async function generateMeshFromImage(imageUrl) {
  const { taskId } = await authedFetch("/api/mesh/generate", {
    method: "POST",
    body: JSON.stringify({ imageUrl }),
  });
  return taskId;
}

/**
 * status: "PENDING" | "IN_PROGRESS" | "SUCCEEDED" | "FAILED"
 * modelUrl (.glb) is only present once status is "SUCCEEDED".
 */
export async function getMeshStatus(taskId) {
  return authedFetch(`/api/mesh/status/${taskId}`);
}
