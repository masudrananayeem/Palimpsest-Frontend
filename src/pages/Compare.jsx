import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Box, Calendar, CheckCircle2, Layers, MapPin, RotateCcw, Scale, Loader2 } from "lucide-react";
import { getArtifacts } from "../lib/artifactsRepo";
import useCompare from "../hooks/useCompare";

export default function Compare() {
  const { compare, clearCompare } = useCompare();
  const [artifacts, setArtifacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getArtifacts().then(({ items }) => {
      if (active) { setArtifacts(items); setLoading(false); }
    });
    return () => { active = false; };
  }, []);

  const selected = compare.map((id) => artifacts.find((a) => a.id === id)).filter(Boolean);

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-10 py-14">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <Link to="/archive" className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wide text-bone-faint hover:text-scan"><ArrowLeft className="w-3.5 h-3.5" /> Back to archive</Link>
          <span className="eyebrow block mt-8">Research comparison</span>
          <h1 className="mt-4 text-4xl sm:text-5xl">Compare digital twins.</h1>
          <p className="mt-4 text-bone-dim max-w-2xl leading-relaxed">Place up to three records side by side to compare provenance, condition, scan depth, and restoration state.</p>
        </div>
        {selected.length > 0 && <button onClick={clearCompare} className="btn-ghost"><RotateCcw className="w-4 h-4" /> Clear selection</button>}
      </div>

      {loading ? (
        <div className="mt-12 panel p-12 text-center text-bone-dim flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading records…</div>
      ) : selected.length === 0 ? (
        <div className="mt-12 panel p-12 text-center">
          <Scale className="w-10 h-10 text-scan mx-auto" />
          <h2 className="mt-5 text-2xl">Nothing selected yet.</h2>
          <p className="mt-2 text-bone-dim">Choose Compare on artifact cards in the archive.</p>
          <Link to="/archive" className="btn-primary mt-7">Choose artifacts <ArrowRight className="w-4 h-4" /></Link>
        </div>
      ) : (
        <div className="mt-12 overflow-x-auto panel">
          <div className="min-w-[760px] grid" style={{ gridTemplateColumns: `180px repeat(${selected.length}, minmax(190px, 1fr))` }}>
            <div className="p-5 border-b border-r border-ink-line font-mono text-[10px] uppercase text-bone-faint">Record</div>
            {selected.map((a) => <div key={a.id} className="p-5 border-b border-ink-line border-r last:border-r-0">
              <div className="h-28 rounded-lg mesh-grid border border-ink-line flex items-center justify-center" style={{ background: `radial-gradient(circle at 50% 50%, ${a.thumbnailTone}55, transparent 60%)` }}><div className="w-12 h-12 rounded-full" style={{ background: a.thumbnailTone }} /></div>
              <h2 className="mt-4 text-base leading-snug">{a.title}</h2>
              <Link to={`/archive/${a.id}`} className="mt-3 inline-flex items-center gap-1 text-xs text-scan">Open record <ArrowRight className="w-3 h-3" /></Link>
            </div>)}
            {[
              ["Status", (a) => <span className="inline-flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-verdigris-bright" />{(a.status || "queued").replace("-", " ")}</span>],
              ["Era", (a) => <span className="inline-flex gap-2"><Calendar className="w-4 h-4 text-bone-faint" />{a.era}</span>],
              ["Origin", (a) => <span className="inline-flex gap-2"><MapPin className="w-4 h-4 text-bone-faint" />{a.origin}</span>],
              ["Category", (a) => a.category],
              ["Condition", (a) => a.condition],
              ["Source scans", (a) => <span className="inline-flex gap-2"><Layers className="w-4 h-4 text-scan" />{a.scans}</span>],
              ["Mesh vertices", (a) => <span className="inline-flex gap-2"><Box className="w-4 h-4 text-scan" />{a.meshVerts}</span>],
              ["Contributor", (a) => a.contributor],
            ].map(([label, render]) => <div key={label} className="contents"><div className="p-4 border-b border-r border-ink-line font-mono text-[10px] uppercase tracking-wide text-bone-faint">{label}</div>{selected.map((a) => <div key={`${a.id}-${label}`} className="p-4 border-b border-r last:border-r-0 border-ink-line text-sm text-bone-dim">{render(a)}</div>)}</div>)}
          </div>
        </div>
      )}
    </div>
  );
}
