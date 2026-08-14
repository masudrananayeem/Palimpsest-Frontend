import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Archive, ArrowRight, Command, Heart, Search, Upload, X } from "lucide-react";
import { artifacts } from "../data/artifacts";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  if (!open) return null;

  const q = query.trim().toLowerCase();
  const matches = q
    ? artifacts.filter((a) =>
        [a.title, a.era, a.origin, a.category].some((value) =>
          value.toLowerCase().includes(q)
        )
      ).slice(0, 5)
    : [];

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm p-4 sm:p-8" onMouseDown={() => setOpen(false)}>
      <div
        className="mx-auto mt-[10vh] max-w-2xl overflow-hidden rounded-2xl border border-ink-line bg-ink shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-ink-line px-4">
          <Search className="w-5 h-5 text-scan" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search artifacts or jump to a page..."
            className="field !border-0 !rounded-none !bg-transparent !px-0 !py-4 focus:ring-0"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded-md border border-ink-line px-2 py-1 text-[10px] font-mono text-bone-faint">
            ESC
          </kbd>
          <button onClick={() => setOpen(false)} className="text-bone-faint hover:text-bone" aria-label="Close command palette">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3">
          {!q && (
            <div className="grid sm:grid-cols-3 gap-2">
              <QuickAction icon={Archive} label="Browse archive" onClick={() => go("/archive")} />
              <QuickAction icon={Upload} label="Submit a scan" onClick={() => go("/upload")} />
              <QuickAction icon={Heart} label="Your dashboard" onClick={() => go("/dashboard")} />
            </div>
          )}

          {q && matches.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-bone-dim">No matching artifacts found.</p>
          )}

          {matches.map((artifact) => (
            <Link
              key={artifact.id}
              to={`/archive/${artifact.id}`}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between gap-4 rounded-xl px-3 py-3 hover:bg-ink-soft transition-colors"
            >
              <div className="min-w-0">
                <p className="text-sm text-bone truncate">{artifact.title}</p>
                <p className="mt-1 text-xs text-bone-faint">{artifact.era} · {artifact.category}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-bone-faint shrink-0" />
            </Link>
          ))}
        </div>

        <div className="border-t border-ink-line px-4 py-3 flex items-center justify-between text-[10px] font-mono uppercase tracking-wide text-bone-faint">
          <span className="flex items-center gap-1.5"><Command className="w-3 h-3" /> Quick navigation</span>
          <span>Ctrl / Cmd + K</span>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick} className="panel p-4 text-left hover:border-scan/50 transition-colors group">
      <Icon className="w-4 h-4 text-scan group-hover:scale-110 transition-transform" />
      <p className="mt-3 text-sm text-bone">{label}</p>
    </button>
  );
}
