import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, SlidersHorizontal, Grid3X3, List, ArrowUpDown, RotateCcw, Heart, Scale, Download, X, Loader2 } from "lucide-react";
import ArtifactCard from "../components/ArtifactCard";
import Reveal from "../components/Reveal";
import Tooltip from "../components/Tooltip";
import { categories, statusMeta } from "../data/artifacts";
import { getArtifacts } from "../lib/artifactsRepo";
import useFavorites from "../hooks/useFavorites";
import useCompare from "../hooks/useCompare";

export default function Archive() {
  const [artifacts, setArtifacts] = useState([]);
  const [dataSource, setDataSource] = useState("demo");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState("recent");
  const [view, setView] = useState("grid");
  const [savedOnly, setSavedOnly] = useState(false);
  const { favorites } = useFavorites();
  const { compare, clearCompare } = useCompare();

  useEffect(() => {
    let active = true;
    getArtifacts().then(({ items, source }) => {
      if (!active) return;
      setArtifacts(items);
      setDataSource(source);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const result = artifacts.filter((a) => {
      const needle = query.trim().toLowerCase();
      const haystack = [a.title, a.era, a.origin, a.category, a.contributor].join(" ").toLowerCase();
      const matchesQuery = !needle || haystack.includes(needle);
      const matchesCategory = category === "All" || a.category === category;
      const matchesStatus = status === "All" || a.status === status;
      const matchesSaved = !savedOnly || favorites.includes(a.id);
      return matchesQuery && matchesCategory && matchesStatus && matchesSaved;
    });

    return [...result].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "scans") return b.scans - a.scans;
      return (b.featuredRank || 0) - (a.featuredRank || 0);
    });
  }, [artifacts, query, category, status, sort, savedOnly, favorites]);

  const exportResults = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "palimpsest-archive-results.json"; a.click(); URL.revokeObjectURL(url);
  };

  const reset = () => {
    setQuery("");
    setCategory("All");
    setStatus("All");
    setSort("recent");
    setSavedOnly(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <span className="eyebrow">Archive</span>
          <h1 className="mt-4 text-4xl sm:text-5xl max-w-2xl">Browse every digitized artifact.</h1>
          <p className="mt-4 text-bone-dim max-w-xl leading-relaxed">
            Search the collection by material, era, origin, contributor, or restoration state.
            Save records locally for a personal research shortlist.
          </p>
        </div>
        <div className="panel px-4 py-3 font-mono text-xs text-bone-faint">
          <span className="text-bone">{artifacts.length}</span> total records
          {dataSource === "demo" && <span className="ml-2 text-bronze-bright">· demo data</span>}
        </div>
      </div>

      {loading && (
        <div className="mt-10 flex items-center justify-center gap-2 text-bone-faint text-sm py-16">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading archive…
        </div>
      )}

      {!loading && (
      <>
      <div className="mt-10 panel p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-bone-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, era, origin, contributor..."
              className="field pl-10"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setSavedOnly((v) => !v)} className={`btn-ghost !px-3.5 !py-2.5 text-xs ${savedOnly ? "!border-rust-bright !text-rust-bright" : ""}`}>
              <Heart className={`w-3.5 h-3.5 ${savedOnly ? "fill-current" : ""}`} /> Saved
            </button>
            <label className="flex items-center gap-2">
              <span className="sr-only">Sort archive</span>
              <ArrowUpDown className="w-4 h-4 text-bone-faint" />
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="field !w-auto !py-2.5 text-xs">
                <option value="recent">Featured</option>
                <option value="title">Title A–Z</option>
                <option value="scans">Most scans</option>
              </select>
            </label>
            <div className="flex border border-ink-line rounded-lg overflow-hidden">
              <button onClick={() => setView("grid")} className={`p-2.5 ${view === "grid" ? "bg-scan/10 text-scan" : "text-bone-faint"}`} aria-label="Grid view"><Grid3X3 className="w-4 h-4" /></button>
              <button onClick={() => setView("list")} className={`p-2.5 ${view === "list" ? "bg-scan/10 text-scan" : "text-bone-faint"}`} aria-label="List view"><List className="w-4 h-4" /></button>
            </div>
            <button onClick={exportResults} className="p-2.5 text-bone-faint hover:text-scan" aria-label="Export results"><Download className="w-4 h-4" /></button><button onClick={reset} className="p-2.5 text-bone-faint hover:text-bone" aria-label="Reset filters"><RotateCcw className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button key={c} onClick={() => setCategory(c)} className={`px-3.5 py-2 rounded-full text-xs font-mono uppercase tracking-wide border transition-all ${category === c ? "border-scan text-scan bg-scan/5" : "border-ink-line text-bone-dim hover:border-bone/30"}`}>
              {c}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {["All", ...Object.keys(statusMeta)].map((s) => (
            <Tooltip key={s} label={s === "All" ? undefined : statusMeta[s].hint}>
              <button onClick={() => setStatus(s)} className={`px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-wide border transition-all ${status === s ? "border-verdigris-bright text-verdigris-bright" : "border-ink-line text-bone-faint hover:border-bone/30"}`}>
                {s === "All" ? "All statuses" : statusMeta[s].label}
              </button>
            </Tooltip>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between font-mono text-xs text-bone-faint">
        <span>{filtered.length} {filtered.length === 1 ? "record" : "records"} shown</span>
        <span className="hidden sm:inline">{compare.length}/3 selected for comparison</span>
        {savedOnly && <span className="text-rust-bright">{favorites.length} saved locally</span>}
      </div>
      {compare.length > 0 && <div className="mt-4 panel px-4 py-3 flex flex-wrap items-center gap-3"><Scale className="w-4 h-4 text-scan" /><span className="text-sm text-bone">{compare.length} artifact{compare.length === 1 ? "" : "s"} selected.</span><Link to="/compare" className="btn-primary !px-4 !py-2 !text-xs ml-auto">Compare now <Scale className="w-3.5 h-3.5" /></Link><button onClick={clearCompare} className="text-bone-faint hover:text-bone" aria-label="Clear comparison"><X className="w-4 h-4" /></button></div>}

      {filtered.length > 0 ? (
        view === "grid" ? (
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((a, i) => <Reveal key={a.id} delay={(i % 3) * 70}><ArtifactCard artifact={a} /></Reveal>)}
          </div>
        ) : (
          <div className="mt-6 panel divide-y divide-ink-line overflow-hidden">
            {filtered.map((a) => {
              const statusInfo = statusMeta[a.status] || statusMeta.queued;
              return (
                <LinkRow key={a.id} artifact={a} status={statusInfo} />
              );
            })}
          </div>
        )
      ) : (
        <div className="mt-16 text-center panel py-20 px-6">
          <SlidersHorizontal className="w-8 h-8 text-bone-faint mx-auto" />
          <p className="text-lg text-bone mt-4">No records match those filters.</p>
          <p className="text-sm text-bone-dim mt-2">Try resetting the filters or saving an artifact first.</p>
          <button onClick={reset} className="btn-ghost mt-6">Reset filters</button>
        </div>
      )}
      </>
      )}
    </div>
  );
}

function LinkRow({ artifact, status }) {
  return (
    <Link to={`/archive/${artifact.id}`} className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4 hover:bg-ink-soft transition-colors">
      <div className="w-14 h-14 rounded-lg mesh-grid shrink-0 flex items-center justify-center border border-ink-line" style={{ background: `linear-gradient(135deg, ${artifact.thumbnailTone}22, transparent)` }}>
        <span className="w-6 h-6 rounded-full" style={{ background: artifact.thumbnailTone }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-bone truncate">{artifact.title}</p>
        <p className="text-xs text-bone-dim mt-1">{artifact.era} · {artifact.origin}</p>
      </div>
      <span className={`font-mono text-[10px] uppercase ${status.color}`}>{status.label}</span>
      <span className="font-mono text-xs text-bone-faint">{artifact.meshVerts} verts</span>
    </Link>
  );
}
