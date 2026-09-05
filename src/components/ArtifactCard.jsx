import { Link } from "react-router-dom";
import { Layers, Box, Heart, Scale } from "lucide-react";
import { statusMeta } from "../data/artifacts";
import Tooltip from "./Tooltip";
import ArtifactGlyph from "./ArtifactGlyph";
import useFavorites from "../hooks/useFavorites";
import useCompare from "../hooks/useCompare";
import useAuthGate from "../hooks/useAuthGate";
import TiltCard from "./TiltCard";

export default function ArtifactCard({ artifact }) {
  const status = statusMeta[artifact.status] || statusMeta.queued;
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isCompared, toggleCompare } = useCompare();
  const requireAuth = useAuthGate();
  const favorite = isFavorite(artifact.id);
  const compared = isCompared(artifact.id);

  return (
    <div className={`group lift-card panel overflow-hidden transition-colors duration-300 flex flex-col ${compared ? "border-scan/70 shadow-[0_0_0_1px_rgb(var(--c-scan)/.18)]" : "hover:border-scan/50"}`}>
      <Link to={`/archive/${artifact.id}`} className="block">
        <TiltCard strength={7} tone={artifact.thumbnailTone} className="relative aspect-[4/3] mesh-grid overflow-hidden rounded-none" style={{ background: `linear-gradient(150deg, ${artifact.thumbnailTone}26, rgb(var(--c-ink)))` }}>
          {artifact.imageUrl ? (
            <img src={artifact.imageUrl} alt={artifact.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
          ) : (
            <>
              <div className="absolute w-24 h-24 rounded-full blur-3xl opacity-30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform duration-500" style={{ background: artifact.thumbnailTone }} />
              <ArtifactGlyph shape={artifact.shape} className="absolute w-20 h-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-90 group-hover:scale-110 group-hover:-translate-y-[calc(50%+4px)] transition-all duration-500" style={{ color: artifact.thumbnailTone }} />
            </>
          )}
          <span className="grade-wash" />
          <Tooltip label={status.hint} className="absolute top-3 left-3"><span className="flex items-center gap-1.5 bg-ink/70 backdrop-blur px-2 py-1 rounded-md cursor-help"><span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} /><span className={`font-mono text-[10px] uppercase tracking-wide ${status.color}`}>{status.label}</span></span></Tooltip>
          <div className="absolute top-3 right-3 flex gap-2">
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); requireAuth(() => toggleCompare(artifact.id)); }} className={`w-9 h-9 rounded-full backdrop-blur border flex items-center justify-center transition-all ${compared ? "border-scan text-scan bg-scan/10" : "border-ink-line bg-ink/70 text-bone-faint hover:text-scan hover:border-scan"}`} aria-label={compared ? `Remove ${artifact.title} from comparison` : `Compare ${artifact.title}`}><Scale className="w-4 h-4" /></button>
          </div>
          <div className="absolute bottom-3 right-3 flex items-center gap-1 font-mono text-[10px] text-bone-dim bg-ink/70 backdrop-blur px-2 py-1 rounded-md"><Box className="w-3 h-3" /> {artifact.meshVerts}</div>
        </TiltCard>
      </Link>
      <div className="p-5 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-3">
          <Link to={`/archive/${artifact.id}`} className="min-w-0"><span className="eyebrow">{artifact.category}</span><h3 className="mt-1 text-lg leading-snug group-hover:text-scan transition-colors">{artifact.title}</h3></Link>
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); requireAuth(() => toggleFavorite(artifact.id)); }} className={`shrink-0 w-9 h-9 rounded-full border flex items-center justify-center transition-all ${favorite ? "border-rust-bright text-rust-bright bg-rust/10" : "border-ink-line text-bone-faint hover:text-rust-bright hover:border-rust-bright"}`} aria-label={favorite ? `Remove ${artifact.title} from saved` : `Save ${artifact.title}`}><Heart className={`w-4 h-4 ${favorite ? "fill-current" : ""}`} /></button>
        </div>
        <p className="text-bone-dim text-sm">{artifact.era}</p>
        <div className="mt-auto pt-3 flex items-center justify-between text-xs font-mono text-bone-faint border-t border-ink-line"><span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" /> {artifact.scans} scans</span><span>{artifact.contributor}</span></div>
      </div>
    </div>
  );
}
