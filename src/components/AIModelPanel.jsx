import { useEffect, useRef, useState } from "react";
import { Sparkles, Loader2, AlertTriangle, RefreshCcw } from "lucide-react";
import GLBViewer from "./GLBViewer";
import { generateMeshFromImage, getMeshStatus, isMeshApiConfigured } from "../lib/meshApi";
import { updateArtifact } from "../lib/artifactsRepo";
import { useAuth } from "../context/AuthContext";

/**
 * artifact needs: id, imageUrl, and optionally meshTaskId/meshStatus/meshModelUrl
 * already persisted from a previous run (so reloading the page doesn't lose it).
 */
export default function AIModelPanel({ artifact, canEdit }) {
  const { user } = useAuth();
  const [status, setStatus] = useState(artifact.meshStatus || null);
  const [modelUrl, setModelUrl] = useState(artifact.meshModelUrl || null);
  const [progress, setProgress] = useState(0);
  const [taskId, setTaskId] = useState(artifact.meshTaskId || null);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);
  const pollRef = useRef(null);

  const persist = (fields) => {
    if (canEdit) updateArtifact(artifact.id, fields).catch(() => {});
  };

  const poll = (id) => {
    clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await getMeshStatus(id);
        setStatus(res.status);
        setProgress(res.progress || 0);
        if (res.status === "SUCCEEDED") {
          clearInterval(pollRef.current);
          setModelUrl(res.modelUrl);
          persist({ meshStatus: "SUCCEEDED", meshModelUrl: res.modelUrl });
        } else if (res.status === "FAILED") {
          clearInterval(pollRef.current);
          setError("Generation failed — you can try again.");
          persist({ meshStatus: "FAILED" });
        }
      } catch (err) {
        clearInterval(pollRef.current);
        setError(err.message);
      }
    }, 4000);
  };

  useEffect(() => {
    if (taskId && status && status !== "SUCCEEDED" && status !== "FAILED") poll(taskId);
    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = async () => {
    if (!user) return;
    setStarting(true);
    setError("");
    try {
      const id = await generateMeshFromImage(artifact.imageUrl);
      setTaskId(id);
      setStatus("PENDING");
      persist({ meshTaskId: id, meshStatus: "PENDING" });
      poll(id);
    } catch (err) {
      setError(err.message);
    } finally {
      setStarting(false);
    }
  };

  if (!isMeshApiConfigured) {
    return (
      <div className="panel p-5 text-sm text-bone-dim flex gap-3">
        <Sparkles className="w-4 h-4 text-bronze-bright shrink-0 mt-0.5" />
        <div>
          <p><span className="text-bone font-medium">Optional paid upgrade.</span> The free "3D relief" tab already works with no setup. This tab calls a real AI image-to-3D service (Meshy, Tripo3D, or Rodin) for an actual reconstructed mesh — as of now, every one of those providers requires a paid plan for API access, so it's off by default.</p>
          <p className="mt-2 text-xs">To enable it later: get a paid API key from one of those providers, set it as a backend secret, and set <code className="text-bone">VITE_API_BASE_URL</code> on the frontend.</p>
        </div>
      </div>
    );
  }

  if (modelUrl) return <GLBViewer src={modelUrl} height={420} />;

  if (status === "PENDING" || status === "IN_PROGRESS") {
    return (
      <div className="panel p-6 text-center">
        <Loader2 className="w-6 h-6 text-scan mx-auto animate-spin" />
        <p className="mt-3 text-sm text-bone">Reconstructing a real 3D mesh from the photo…</p>
        <div className="mt-4 h-1.5 rounded-full bg-ink-line overflow-hidden max-w-xs mx-auto"><div className="h-full bg-scan transition-all" style={{ width: `${progress}%` }} /></div>
        <p className="mt-2 font-mono text-[10px] text-bone-faint uppercase tracking-wider">{progress}% · this can take a minute or two</p>
      </div>
    );
  }

  return (
    <div className="panel p-6 text-center">
      <Sparkles className="w-6 h-6 text-scan mx-auto" />
      <p className="mt-3 text-sm text-bone">Generate a real 3D model from this photo using AI reconstruction.</p>
      {!user && <p className="mt-1 text-xs text-bone-faint">Sign in to start a generation job.</p>}
      {error && <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-rust-bright"><AlertTriangle className="w-3.5 h-3.5" /> {error}</p>}
      <button onClick={start} disabled={!user || starting} className="btn-primary mt-5 justify-center mx-auto disabled:opacity-40">
        {starting ? <><Loader2 className="w-4 h-4 animate-spin" /> Starting…</> : status === "FAILED" ? <><RefreshCcw className="w-4 h-4" /> Try again</> : <><Sparkles className="w-4 h-4" /> Generate 3D model</>}
      </button>
    </div>
  );
}
