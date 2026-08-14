import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Eye, Heart, Archive, ArrowUpRight, History, Download, Trash2, Loader2, Camera, UserRound, AlertTriangle } from "lucide-react";
import Reveal from "../components/Reveal";
import Tooltip from "../components/Tooltip";
import { artifacts as demoArtifacts, statusMeta } from "../data/artifacts";
import { useAuth } from "../context/AuthContext";
import { getArtifactsByUser } from "../lib/artifactsRepo";
import { uploadToCloudinary, isCloudinaryConfigured } from "../lib/cloudinary";
import useFavorites from "../hooks/useFavorites";
import useRecentArtifacts from "../hooks/useRecentArtifacts";

export default function Dashboard() {
  const { user, isFirebaseConfigured, updateAvatar } = useAuth();
  const { favorites } = useFavorites();
  const { recent, clearRecent } = useRecentArtifacts();
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    let active = true;
    if (!isFirebaseConfigured || !user) {
      setMine([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    getArtifactsByUser(user.uid).then((items) => {
      if (active) {
        setMine(items);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, [user, isFirebaseConfigured]);

  const allArtifacts = isFirebaseConfigured ? mine : demoArtifacts.filter((a) => a.contributor === "M. Halloran");
  const saved = demoArtifacts.filter((a) => favorites.includes(a.id));
  const recentItems = recent.map((id) => demoArtifacts.find((a) => a.id === id)).filter(Boolean);

  const stats = [
    { label: "Artifacts submitted", value: allArtifacts.length, hint: "Records you've submitted, stored under your account." },
    { label: "Saved for research", value: favorites.length, hint: "Artifacts you bookmarked with the heart action." },
    { label: "Published & citable", value: allArtifacts.filter((a) => a.status === "restored").length, hint: "Your records approved and visible in the public archive." },
    { label: "Awaiting review", value: allArtifacts.filter((a) => a.status !== "restored").length, hint: "Submitted but not yet curator-approved." },
  ];

  const exportSaved = () => {
    const payload = demoArtifacts.filter((a) => favorites.includes(a.id));
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "palimpsest-saved-research.json"; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-10 py-14">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <span className="eyebrow">Your dashboard</span>
          <h1 className="mt-4 text-4xl sm:text-5xl">Research workspace.</h1>
          <p className="mt-3 text-bone-dim max-w-lg">
            Signed in as {user?.displayName || user?.email}. Track your submissions, saved records,
            and archive activity in one place.
          </p>
        </div>
        <Link to="/upload" className="btn-primary"><Plus className="w-4 h-4" /> New submission</Link>
      </div>

      {!isFirebaseConfigured && (
        <div className="mt-8 panel p-4 text-sm text-bone-dim flex gap-3">
          <Archive className="w-5 h-5 text-scan shrink-0" />
          <p>Firebase isn't connected yet — showing sample data. Connect your project (see <code className="text-bone">DEPLOYMENT.md</code>) to track real submissions here.</p>
        </div>
      )}

      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-ink-line">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 80}>
            <Tooltip label={s.hint} className="block w-full">
              <div className="bg-ink p-6 transition-colors duration-300 hover:bg-ink-soft cursor-help">
                <p className="text-3xl font-display text-bone">{s.value}</p>
                <p className="mt-1.5 text-xs font-mono uppercase tracking-wide text-bone-faint">{s.label}</p>
              </div>
            </Tooltip>
          </Reveal>
        ))}
      </div>

      <div className="mt-14 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl">Your submissions</h2>
            <Link to="/archive" className="text-xs font-mono uppercase text-scan">View archive</Link>
          </div>
          <div className="panel divide-y divide-ink-line">
            {loading ? (
              <div className="px-5 py-10 text-center text-bone-dim text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading your submissions…</div>
            ) : (
              <>
                {allArtifacts.map((a) => <SubmissionRow key={a.id} artifact={a} />)}
                {allArtifacts.length === 0 && <div className="px-5 py-10 text-center text-bone-dim text-sm">No submissions yet — <Link to="/upload" className="text-scan hover:underline">submit your first scan</Link>.</div>}
              </>
            )}
          </div>

          <div className="mt-10">
            <div className="flex items-center justify-between mb-5 gap-4">
              <h2 className="text-2xl">Saved research</h2>
              <div className="flex items-center gap-3"><button onClick={exportSaved} className="text-xs font-mono uppercase text-bone-faint hover:text-scan flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> Export</button><Link to="/archive" className="text-xs font-mono uppercase text-scan">Manage</Link></div>
            </div>
            {saved.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {saved.slice(0, 4).map((a) => <Link key={a.id} to={`/archive/${a.id}`} className="panel p-4 flex items-center gap-4 hover:border-scan/50 transition-colors"><Heart className="w-4 h-4 text-rust-bright fill-current shrink-0" /><div className="min-w-0"><p className="text-sm truncate">{a.title}</p><p className="text-xs text-bone-faint mt-1">{a.category} · {a.era}</p></div><ArrowUpRight className="w-4 h-4 text-bone-faint ml-auto shrink-0" /></Link>)}
              </div>
            ) : <div className="panel p-6 text-sm text-bone-dim">Save an artifact with the heart icon to build your research shortlist.</div>}
          </div>

          <div className="mt-10">
            <div className="flex items-center justify-between mb-5"><h2 className="text-2xl">Recently viewed</h2>{recentItems.length > 0 && <button onClick={clearRecent} className="text-xs font-mono uppercase text-bone-faint hover:text-rust-bright flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Clear</button>}</div>
            {recentItems.length > 0 ? <div className="grid sm:grid-cols-2 gap-4">{recentItems.slice(0, 4).map((a) => <Link key={a.id} to={`/archive/${a.id}`} className="panel p-4 flex items-center gap-4 hover:border-scan/50 transition-colors"><History className="w-4 h-4 text-scan shrink-0" /><div className="min-w-0"><p className="text-sm truncate">{a.title}</p><p className="text-xs text-bone-faint mt-1">{a.category} · {a.era}</p></div><ArrowUpRight className="w-4 h-4 text-bone-faint ml-auto" /></Link>)}</div> : <div className="panel p-6 text-sm text-bone-dim">Open artifact records and they will appear here for quick return.</div>}
          </div>
        </div>

        <div>
          <h2 className="text-2xl mb-5">Account</h2>
          <AvatarCard user={user} updateAvatar={updateAvatar} />
          <div className="mt-6 panel p-5 flex gap-4"><Eye className="w-5 h-5 text-verdigris-bright shrink-0" /><div><p className="text-sm text-bone">Workspace tip</p><p className="text-xs text-bone-dim mt-1 leading-relaxed">Use Ctrl/Cmd + K anywhere to quickly find an artifact or jump between archive actions.</p></div></div>
          <div className="mt-4 panel p-5 flex gap-4"><Archive className="w-5 h-5 text-scan shrink-0" /><div><p className="text-sm text-bone">Live data</p><p className="text-xs text-bone-dim mt-1 leading-relaxed">Submissions here are stored in Firestore and tied to your account, not just this browser.</p></div></div>
        </div>
      </div>
    </div>
  );
}

function AvatarCard({ user, updateAvatar }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (!isCloudinaryConfigured) {
      setError("Cloudinary isn't connected yet — see DEPLOYMENT.md to enable photo uploads.");
      return;
    }

    setError("");
    setUploading(true);
    try {
      const { url } = await uploadToCloudinary(file, { folder: `palimpsest/avatars/${user.uid}` });
      await updateAvatar(url);
    } catch (err) {
      setError(err.message || "Couldn't update your photo. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="panel p-5">
      <div className="flex items-center gap-4">
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="relative group/avatar shrink-0 w-16 h-16 rounded-full overflow-hidden border border-ink-line hover:border-scan/60 transition-colors"
          aria-label="Change profile photo"
        >
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="w-full h-full flex items-center justify-center bg-ink-line/40 text-bone-faint">
              <UserRound className="w-7 h-7" />
            </span>
          )}
          <span className="absolute inset-0 bg-ink/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin text-scan" /> : <Camera className="w-4 h-4 text-scan" />}
          </span>
        </button>
        <div className="min-w-0">
          <p className="text-sm text-bone leading-snug truncate">{user?.displayName || "Contributor"}</p>
          <p className="text-xs font-mono text-bone-faint mt-1 truncate">{user?.email}</p>
          <button onClick={() => inputRef.current?.click()} disabled={uploading} className="mt-2 text-xs text-scan hover:underline disabled:opacity-50">
            {uploading ? "Uploading…" : "Change photo"}
          </button>
        </div>
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </div>
      {error && (
        <p className="mt-3 flex items-start gap-1.5 text-xs text-rust-bright"><AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {error}</p>
      )}
    </div>
  );
}

function SubmissionRow({ artifact }) {
  const status = statusMeta[artifact.status] || statusMeta.queued;
  return <Link to={`/archive/${artifact.id}`} className="group/row flex items-center justify-between gap-4 px-5 py-4 hover:bg-ink-line/20 transition-all"><div className="min-w-0"><p className="text-bone truncate group-hover/row:text-scan">{artifact.title}</p><p className="text-xs text-bone-dim mt-1">{artifact.era}</p></div><span className={`shrink-0 flex items-center gap-1.5 font-mono text-[10px] uppercase ${status.color}`}><span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} /> {status.label}</span></Link>;
}
