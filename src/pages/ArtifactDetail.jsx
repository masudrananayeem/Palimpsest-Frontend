import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Download, Layers, Box, User, MapPin, Calendar, ArrowLeft, Heart, Share2, Check, Copy, ShieldCheck, Lock, Loader2, Image as ImageIcon, Boxes, Sparkles } from "lucide-react";
import MeshViewer from "../components/MeshViewer";
import PhotoRelief3D from "../components/PhotoRelief3D";
import AIModelPanel from "../components/AIModelPanel";
import RestorationSlider from "../components/RestorationSlider";
import ArtifactCard from "../components/ArtifactCard";
import Reveal from "../components/Reveal";
import Tooltip from "../components/Tooltip";
import { statusMeta } from "../data/artifacts";
import { getArtifactById, getArtifacts } from "../lib/artifactsRepo";
import { useAuth } from "../context/AuthContext";
import useFavorites from "../hooks/useFavorites";
import useRecentArtifacts from "../hooks/useRecentArtifacts";
import useLocalStorage from "../hooks/useLocalStorage";
import useAuthGate from "../hooks/useAuthGate";

export default function ArtifactDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [artifact, setArtifact] = useState(undefined); // undefined = loading, null = not found
  const [related, setRelated] = useState([]);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addRecent } = useRecentArtifacts();
  const requireAuth = useAuthGate();
  const [notes, setNotes] = useLocalStorage(`palimpsest-note-${id}`, "");
  const [viewMode, setViewMode] = useState("relief"); // "relief" | "flat" | "ai"

  useEffect(() => {
    let active = true;
    setArtifact(undefined);
    getArtifactById(id).then((found) => {
      if (!active) return;
      setArtifact(found || null);
      if (found) addRecent(found.id);
    });
    getArtifacts().then(({ items }) => {
      if (active) setRelated(items);
    });
    return () => { active = false; };
  }, [id]);

  const citation = useMemo(
    () =>
      `${artifact?.contributor || "Palimpsest Archive"}. "${artifact?.title || "Artifact"}." Palimpsest Digital Heritage Archive. ${artifact?.era || ""}. Record ${artifact?.id || ""}.`,
    [artifact]
  );

  if (artifact === undefined) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-32 text-center text-bone-faint flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading record…
      </div>
    );
  }

  if (!artifact) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="text-3xl">Record not found</h1>
        <p className="text-bone-dim mt-3">This artifact may have been unpublished or the link is out of date.</p>
        <Link to="/archive" className="btn-ghost mt-8 inline-flex"><ArrowLeft className="w-4 h-4" /> Back to archive</Link>
      </div>
    );
  }

  const status = statusMeta[artifact.status] || statusMeta.queued;
  const relatedItems = related.filter((a) => a.id !== artifact.id && a.category === artifact.category).slice(0, 3);

  const copyCitation = async () => {
    try {
      await navigator.clipboard.writeText(citation);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy this citation:", citation);
    }
  };

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: artifact.title, text: citation, url: window.location.href });
      else await navigator.clipboard.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 1800);
    } catch {
      // Native share can be cancelled.
    }
  };

  const exportRecord = () => {
    const blob = new Blob([JSON.stringify({ ...artifact, citation }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${artifact.id}-provenance.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-10 py-14">
      <Link to="/archive" className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wide text-bone-faint hover:text-scan transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to archive
      </Link>

      <div className="mt-6 grid lg:grid-cols-2 gap-12">
        <div>
          {artifact.imageUrl && (
            <div className="mb-3 inline-flex rounded-lg border border-ink-line overflow-hidden">
              <button onClick={() => setViewMode("relief")} className={`px-3.5 py-2 text-xs font-mono uppercase tracking-wide flex items-center gap-1.5 transition-colors ${viewMode === "relief" ? "bg-scan/15 text-scan" : "text-bone-faint hover:text-bone"}`}><Boxes className="w-3.5 h-3.5" /> 3D relief</button>
              <button onClick={() => setViewMode("flat")} className={`px-3.5 py-2 text-xs font-mono uppercase tracking-wide flex items-center gap-1.5 transition-colors border-l border-ink-line ${viewMode === "flat" ? "bg-scan/15 text-scan" : "text-bone-faint hover:text-bone"}`}><ImageIcon className="w-3.5 h-3.5" /> Photo</button>
              <button onClick={() => setViewMode("ai")} className={`px-3.5 py-2 text-xs font-mono uppercase tracking-wide flex items-center gap-1.5 transition-colors border-l border-ink-line ${viewMode === "ai" ? "bg-scan/15 text-scan" : "text-bone-faint hover:text-bone"}`}><Sparkles className="w-3.5 h-3.5" /> AI 3D model <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-bronze/20 text-bronze-bright normal-case tracking-normal">Pro</span></button>
            </div>
          )}
          <div className="aspect-square rounded-xl border border-ink-line mesh-grid overflow-hidden relative">
            {artifact.imageUrl ? (
              viewMode === "relief" ? (
                <PhotoRelief3D src={artifact.imageUrl} height={520} className="w-full h-full !rounded-none border-0" />
              ) : viewMode === "ai" ? (
                <div className="absolute inset-0 flex items-center p-4 bg-ink"><AIModelPanel artifact={artifact} canEdit={Boolean(user) && (user.uid === artifact.contributorId)} /></div>
              ) : (
                <img src={artifact.imageUrl} alt={artifact.title} className="w-full h-full object-cover" />
              )
            ) : (
              <MeshViewer tone={artifact.thumbnailTone} shape={artifact.shape} className="w-full h-full" />
            )}
            <div className="absolute top-4 right-4 flex gap-2">
              <button onClick={() => requireAuth(() => toggleFavorite(artifact.id))} className={`w-10 h-10 rounded-full backdrop-blur border flex items-center justify-center ${isFavorite(artifact.id) ? "border-rust-bright text-rust-bright bg-rust/10" : "border-ink-line bg-ink/70 text-bone"}`} aria-label="Save artifact">
                <Heart className={`w-4 h-4 ${isFavorite(artifact.id) ? "fill-current" : ""}`} />
              </button>
              <button onClick={share} className="w-10 h-10 rounded-full backdrop-blur border border-ink-line bg-ink/70 text-bone flex items-center justify-center hover:border-scan" aria-label="Share artifact">
                {shared ? <Check className="w-4 h-4 text-verdigris-bright" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>
            {viewMode === "flat" && <div className="absolute bottom-4 left-4 font-mono text-[10px] text-scan tracking-wide">{artifact.meshVerts} vertices · rotate preview</div>}
          </div>

          <div className="mt-8">
            <span className="eyebrow">As found / restored</span>
            <div className="mt-3"><RestorationSlider afterTone={artifact.thumbnailTone} /></div>
          </div>
        </div>

        <div>
          <Tooltip label={status.hint}>
            <div className="flex items-center gap-2 cursor-help">
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              <span className={`font-mono text-xs uppercase tracking-wide ${status.color}`}>{status.label}</span>
            </div>
          </Tooltip>
          <h1 className="mt-4 text-3xl sm:text-4xl leading-tight">{artifact.title}</h1>
          <p className="mt-3 text-bone-dim leading-relaxed">{artifact.description}</p>

          <dl className="mt-8 grid grid-cols-2 gap-6 border-y border-ink-line py-6">
            <Meta icon={Calendar} label="Era" value={artifact.era} />
            <Meta icon={MapPin} label="Origin" value={artifact.origin} />
          </dl>

          {/* Guest gate: technical record + export/citation require sign-in */}
          {user ? (
            <>
              <dl className="mt-6 grid grid-cols-2 gap-6">
                <Meta icon={User} label="Contributor" value={artifact.contributor} />
                <Meta icon={Layers} label="Condition" value={artifact.condition} />
              </dl>
              <div className="mt-6 flex items-center gap-4 font-mono text-xs text-bone-faint">
                <span className="flex items-center gap-1.5"><Box className="w-3.5 h-3.5" /> {artifact.meshVerts} verts</span>
                <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> {artifact.scans} source scans</span>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Tooltip label="Downloads a provenance record for this artifact.">
                  <button className="btn-primary" onClick={exportRecord}><Download className="w-4 h-4" /> Export record</button>
                </Tooltip>
                <button className="btn-ghost" onClick={copyCitation}>
                  {copied ? <Check className="w-4 h-4 text-verdigris-bright" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied" : "Copy citation"}
                </button>
              </div>
            </>
          ) : (
            <div className="mt-6 relative overflow-hidden rounded-xl border border-ink-line">
              <div className="pointer-events-none select-none blur-sm opacity-60 p-5">
                <dl className="grid grid-cols-2 gap-6">
                  <Meta icon={User} label="Contributor" value="•••••••" />
                  <Meta icon={Layers} label="Condition" value="•••••••••••" />
                </dl>
                <div className="mt-6 flex items-center gap-4 font-mono text-xs text-bone-faint">
                  <span className="flex items-center gap-1.5"><Box className="w-3.5 h-3.5" /> ••• verts</span>
                  <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> •• source scans</span>
                </div>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink/40 px-6 text-center">
                <Lock className="w-5 h-5 text-scan" />
                <p className="text-sm text-bone">Sign in to view the full technical record</p>
                <p className="text-xs text-bone-dim max-w-xs">Contributor credit, condition notes, mesh stats, export and citation tools unlock once you're signed in.</p>
                <Link to="/login" state={{ from: `/archive/${artifact.id}` }} className="btn-primary !py-2 !px-4 !text-xs mt-1">Sign in</Link>
              </div>
            </div>
          )}

          <div className="mt-6 panel p-5">
            <div className="flex items-center justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-wide text-bone-faint">Private research note</p><p className="mt-1 text-xs text-bone-dim">Saved only in this browser for your own research workflow.</p></div><span className="font-mono text-[10px] text-bone-faint">{notes.length}/500</span></div>
            <textarea
              value={notes}
              onChange={(e) => user && setNotes(e.target.value.slice(0, 500))}
              onFocus={(e) => { if (!user) { e.target.blur(); requireAuth(() => {}); } }}
              rows={4}
              placeholder={user ? "Add a finding, citation reminder, or restoration question…" : "Sign in to add a private research note."}
              readOnly={!user}
              className={`field mt-4 resize-none ${!user ? "cursor-pointer opacity-70" : ""}`}
            />
          </div>

          <div className="mt-10 panel p-5">
            <p className="font-mono text-[10px] uppercase tracking-wide text-bone-faint mb-2">Restoration disclosure</p>
            <p className="text-sm text-bone-dim leading-relaxed">
              Portions of this model outside the highlighted scan region are inferred through symmetry or comparative reference and are not physically verified. Use the comparison slider above to review the unmodified capture before citing this record.
            </p>
          </div>

          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            <div className="panel p-4">
              <ShieldCheck className="w-4 h-4 text-verdigris-bright" />
              <p className="mt-2 text-sm">Provenance preserved</p>
              <p className="mt-1 text-xs text-bone-faint">Original contributor and record metadata remain attached.</p>
            </div>
            <div className="panel p-4">
              <Copy className="w-4 h-4 text-scan" />
              <p className="mt-2 text-sm">Citation ready</p>
              <p className="mt-1 text-xs text-bone-faint">Use the one-click citation for reports, slides, and research notes.</p>
            </div>
          </div>
        </div>
      </div>

      {relatedItems.length > 0 && (
        <div className="mt-24">
          <span className="eyebrow">More in {artifact.category}</span>
          <h2 className="mt-4 text-2xl sm:text-3xl mb-8">Related artifacts</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedItems.map((a, i) => <Reveal key={a.id} delay={i * 100}><ArtifactCard artifact={a} /></Reveal>)}
          </div>
        </div>
      )}
    </div>
  );
}

function Meta({ icon: Icon, label, value }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-bone-faint"><Icon className="w-3.5 h-3.5" /> {label}</dt>
      <dd className="mt-1.5 text-sm text-bone">{value}</dd>
    </div>
  );
}
