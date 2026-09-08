import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Loader2, Trash2, ExternalLink, RefreshCcw, AlertTriangle, UserPlus, Crown, X } from "lucide-react";
import { getArtifacts, updateArtifactStatus, deleteArtifact } from "../lib/artifactsRepo";
import { verifyImageLoads } from "../lib/mediaCheck";
import { listAdmins, addAdmin, removeAdmin } from "../lib/adminRepo";
import { statusMeta } from "../data/artifacts";
import { useAuth } from "../context/AuthContext";

const STATUS_OPTIONS = Object.keys(statusMeta);

export default function Admin() {
  const { user, isOwner } = useAuth();
  const [items, setItems] = useState([]);
  const [source, setSource] = useState("demo");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const [admins, setAdmins] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [adminBusy, setAdminBusy] = useState(false);
  const [adminError, setAdminError] = useState("");

  const loadAdmins = () => {
    setAdminsLoading(true);
    listAdmins()
      .then(setAdmins)
      .catch(() => setAdmins([]))
      .finally(() => setAdminsLoading(false));
  };

  const load = () => {
    setLoading(true);
    getArtifacts().then(({ items, source }) => {
      setItems(items);
      setSource(source);
      setLoading(false);
    });
  };

  useEffect(load, []);
  useEffect(loadAdmins, []);

  const [checkingId, setCheckingId] = useState(null);

  const handleStatusChange = async (id, status) => {
    setError("");
    setBusyId(id);
    try {
      // Publishing ("restored") is gated: the record only goes live once its
      // photo actually loads, so the 3D relief/photo views won't be broken
      // for visitors. Sending back to an earlier stage never needs this.
      if (status === "restored") {
        setCheckingId(id);
        const artifact = items.find((a) => a.id === id);
        const ok = await verifyImageLoads(artifact?.imageUrl);
        setCheckingId(null);
        if (!ok) {
          setError(
            `Can't publish "${artifact?.title}" — its photo isn't loading, so the 3D preview would be broken for visitors. Ask the contributor to re-upload the photo (Dashboard → Edit), or fix the image link, then try approving again.`
          );
          setBusyId(null);
          return;
        }
      }
      await updateArtifactStatus(id, status);
      setItems((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    } catch (err) {
      setError(err.message || "Couldn't update status.");
    } finally {
      setBusyId(null);
      setCheckingId(null);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This can't be undone.`)) return;
    setError("");
    setBusyId(id);
    try {
      await deleteArtifact(id);
      setItems((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err.message || "Couldn't delete this record.");
    } finally {
      setBusyId(null);
    }
  };

  const counts = STATUS_OPTIONS.reduce((acc, s) => ({ ...acc, [s]: items.filter((a) => a.status === s).length }), {});

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    const email = newAdminEmail.trim().toLowerCase();
    if (!email) return;
    setAdminError("");
    setAdminBusy(true);
    try {
      await addAdmin(email, user?.email);
      setNewAdminEmail("");
      loadAdmins();
    } catch (err) {
      setAdminError(err.message || "Couldn't grant admin access.");
    } finally {
      setAdminBusy(false);
    }
  };

  const handleRemoveAdmin = async (email) => {
    if (!window.confirm(`Remove admin access for ${email}?`)) return;
    setAdminError("");
    setAdminBusy(true);
    try {
      await removeAdmin(email);
      setAdmins((prev) => prev.filter((a) => a.email !== email));
    } catch (err) {
      setAdminError(err.message || "Couldn't remove admin access.");
    } finally {
      setAdminBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-10 py-14">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <span className="eyebrow flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5" /> Admin</span>
          <h1 className="mt-4 text-4xl sm:text-5xl">Curation panel.</h1>
          <p className="mt-3 text-bone-dim max-w-lg">
            Signed in as {user?.displayName || user?.email}. Every record here — from any contributor — can be
            published, sent back, or removed.
          </p>
        </div>
        <button onClick={load} className="btn-ghost"><RefreshCcw className="w-4 h-4" /> Refresh</button>
      </div>

      {source === "demo" && (
        <div className="mt-8 panel p-4 text-sm text-bone-dim flex gap-3">
          <AlertTriangle className="w-5 h-5 text-bronze-bright shrink-0" />
          <p>Showing demo data — no live Firestore records yet, so there's nothing real to moderate.</p>
        </div>
      )}

      <div className="mt-8 panel p-4 text-sm text-bone-dim flex gap-3 border-scan/25">
        <ShieldCheck className="w-5 h-5 text-scan shrink-0" />
        <p>Setting a record to <span className="text-bone">{statusMeta.restored.label}</span> automatically checks that its photo actually loads first — so nothing goes live with a broken 3D/photo preview. If the check fails, the status won't change and you'll see why below.</p>
      </div>

      {error && (
        <div className="mt-8 panel p-4 text-sm text-rust-bright flex gap-3 border-rust-bright/40">
          <AlertTriangle className="w-5 h-5 shrink-0" /> {error}
        </div>
      )}

      <div className="mt-10 grid sm:grid-cols-3 gap-px bg-ink-line">
        {STATUS_OPTIONS.map((s) => (
          <div key={s} className="bg-ink p-6">
            <p className="text-3xl font-display text-bone">{counts[s]}</p>
            <p className={`mt-1.5 text-xs font-mono uppercase tracking-wide ${statusMeta[s].color}`}>{statusMeta[s].label}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 panel divide-y divide-ink-line overflow-hidden">
        {loading ? (
          <div className="px-5 py-16 text-center text-bone-dim text-sm flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading all records…
          </div>
        ) : items.length === 0 ? (
          <div className="px-5 py-16 text-center text-bone-dim text-sm">No artifacts yet.</div>
        ) : (
          items.map((a) => (
            <div key={a.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
              <div className="min-w-0 flex-1">
                <Link to={`/archive/${a.id}`} className="text-bone hover:text-scan truncate flex items-center gap-1.5">
                  {a.title} <ExternalLink className="w-3 h-3 opacity-50" />
                </Link>
                <p className="text-xs text-bone-faint mt-1">{a.category} · {a.era} · by {a.contributor || "Unknown"}</p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={a.status}
                  disabled={busyId === a.id || source === "demo"}
                  onChange={(e) => handleStatusChange(a.id, e.target.value)}
                  className="field !w-auto !py-1.5 !text-xs"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{statusMeta[s].label}</option>
                  ))}
                </select>
                {checkingId === a.id && (
                  <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-scan">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Checking 3D preview…
                  </span>
                )}
              </div>

              <button
                onClick={() => handleDelete(a.id, a.title)}
                disabled={busyId === a.id || source === "demo"}
                className="w-9 h-9 rounded-lg border border-ink-line text-bone-faint hover:text-rust-bright hover:border-rust-bright/50 flex items-center justify-center transition-colors disabled:opacity-30"
                aria-label={`Delete ${a.title}`}
              >
                {busyId === a.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mt-16">
        <span className="eyebrow flex items-center gap-2"><Crown className="w-3.5 h-3.5" /> Access control</span>
        <h2 className="mt-3 text-2xl">Manage admins</h2>
        <p className="mt-2 text-sm text-bone-dim max-w-lg">
          Anyone added here gets full curation access — the same as you. Removing someone here takes effect
          immediately, everywhere.
        </p>

        <form onSubmit={handleAddAdmin} className="mt-6 flex gap-3 max-w-md">
          <input
            type="email"
            required
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
            placeholder="someone@example.com"
            className="field"
            disabled={adminBusy || source === "demo"}
          />
          <button type="submit" disabled={adminBusy || source === "demo"} className="btn-primary shrink-0 !px-4">
            {adminBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />} Grant access
          </button>
        </form>
        {adminError && (
          <p className="mt-3 flex items-start gap-1.5 text-sm text-rust-bright"><AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {adminError}</p>
        )}

        <div className="mt-6 panel divide-y divide-ink-line overflow-hidden max-w-2xl">
          {isOwner && (
            <div className="flex items-center justify-between gap-4 px-5 py-3.5 bg-ink-soft">
              <span className="text-sm text-bone flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-bronze-bright" /> {user?.email} <span className="text-bone-faint">(you)</span></span>
              <span className="font-mono text-[10px] uppercase tracking-wide text-bronze-bright">Owner · set in code</span>
            </div>
          )}
          {adminsLoading ? (
            <div className="px-5 py-8 text-center text-bone-dim text-sm flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading admins…
            </div>
          ) : admins.length === 0 ? (
            <div className="px-5 py-8 text-center text-bone-dim text-sm">No additional admins yet.</div>
          ) : (
            admins.map((a) => (
              <div key={a.email} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <span className="text-sm text-bone truncate">{a.email}</span>
                <button
                  onClick={() => handleRemoveAdmin(a.email)}
                  disabled={adminBusy}
                  className="w-8 h-8 rounded-lg border border-ink-line text-bone-faint hover:text-rust-bright hover:border-rust-bright/50 flex items-center justify-center transition-colors disabled:opacity-30 shrink-0"
                  aria-label={`Remove admin access for ${a.email}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
