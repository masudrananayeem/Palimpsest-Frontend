import { FileText, Download, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DocumentCard({ document, onExport }) {
  return (
    <article className="panel p-5 lift-card flex flex-col min-h-[220px]">
      <div className="flex items-start justify-between gap-4">
        <div className="w-10 h-10 rounded-lg bg-scan/10 border border-scan/20 flex items-center justify-center">
          <FileText className="w-4 h-4 text-scan" />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-bone-faint">v{document.version}</span>
      </div>
      <p className="mt-5 font-mono text-[10px] uppercase tracking-[.16em] text-verdigris-bright">{document.type}</p>
      <h3 className="mt-2 text-xl">{document.title}</h3>
      <p className="mt-2 text-sm text-bone-dim leading-relaxed flex-1">{document.summary}</p>
      <div className="mt-5 flex items-center gap-2">
        <Link to={`/research/docs/${document.id}`} className="btn-ghost !px-3.5 !py-2 !text-xs">Read <ArrowUpRight className="w-3.5 h-3.5" /></Link>
        <button onClick={() => onExport(document)} className="p-2 text-bone-faint hover:text-scan" aria-label={`Export ${document.title}`}><Download className="w-4 h-4" /></button>
      </div>
    </article>
  );
}
