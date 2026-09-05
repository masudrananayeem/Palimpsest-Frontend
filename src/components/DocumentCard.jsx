import { FileText, Download, ArrowUpRight, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import TiltCard from './TiltCard';

export default function DocumentCard({ document, onExport, onEdit, onDelete, canEdit }) {
  return (
    <TiltCard strength={6} className="rounded-xl">
      <article className="panel p-5 lift-card flex flex-col min-h-[220px] relative overflow-hidden">
        <span className="grade-wash" />
        <div className="relative flex items-start justify-between gap-4">
          <div className="w-10 h-10 rounded-lg bg-scan/10 border border-scan/20 flex items-center justify-center">
            <FileText className="w-4 h-4 text-scan" />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-bone-faint">v{document.version}</span>
        </div>
        <p className="relative mt-5 font-mono text-[10px] uppercase tracking-[.16em] text-verdigris-bright">{document.type}</p>
        <h3 className="relative mt-2 text-xl">{document.title}</h3>
        <p className="relative mt-2 text-sm text-bone-dim leading-relaxed flex-1">{document.summary}</p>
        <div className="relative mt-5 flex items-center gap-2">
          <Link to={`/research/docs/${document.id}`} className="btn-ghost !px-3.5 !py-2 !text-xs">Read <ArrowUpRight className="w-3.5 h-3.5" /></Link>
          <button onClick={() => onExport(document)} className="p-2 text-bone-faint hover:text-scan" aria-label={`Export ${document.title}`}><Download className="w-4 h-4" /></button>
          {canEdit && (
            <>
              <button onClick={() => onEdit(document)} className="p-2 text-bone-faint hover:text-scan" aria-label={`Edit ${document.title}`}><Pencil className="w-4 h-4" /></button>
              <button onClick={() => onDelete(document)} className="p-2 text-bone-faint hover:text-rust-bright" aria-label={`Delete ${document.title}`}><Trash2 className="w-4 h-4" /></button>
            </>
          )}
        </div>
      </article>
    </TiltCard>
  );
}
