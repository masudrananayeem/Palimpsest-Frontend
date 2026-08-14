import { Link } from 'react-router-dom';
import { ArrowUpRight, Layers3, ScanLine } from 'lucide-react';
import Reveal from '../components/Reveal';
import { collectionStats } from '../data/collections';

export default function Collections() {
  return <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16">
    <span className="eyebrow">Curated collections</span>
    <div className="mt-4 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
      <div><h1 className="text-4xl sm:text-5xl max-w-3xl">Research by theme, not just by record.</h1><p className="mt-4 max-w-2xl text-bone-dim leading-relaxed">Curated sets connect artifacts through material, inscription, reconstruction, and imaging methods.</p></div>
      <div className="panel px-4 py-3 font-mono text-xs text-bone-faint"><span className="text-bone">{collectionStats.length}</span> active collections</div>
    </div>
    <div className="mt-12 grid md:grid-cols-2 gap-6">
      {collectionStats.map((collection, i) => <Reveal key={collection.id} delay={i*80}><article className="panel p-6 min-h-[330px] overflow-hidden relative lift-card">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-scan/5 blur-2xl" />
        <div className="flex items-center justify-between"><span className="eyebrow">{collection.eyebrow}</span><Layers3 className="w-5 h-5 text-bone-faint" /></div>
        <h2 className="mt-4 text-3xl">{collection.title}</h2><p className="mt-3 text-bone-dim max-w-xl leading-relaxed">{collection.description}</p>
        <div className="mt-7 grid grid-cols-3 gap-2">{collection.artifacts.map(a => <Link key={a.id} to={`/archive/${a.id}`} className="panel p-3 hover:border-scan/50 transition-colors"><div className="h-14 rounded mesh-grid flex items-center justify-center"><span className="w-6 h-6 rounded-full" style={{background:a.thumbnailTone}} /></div><p className="mt-2 text-xs truncate">{a.title}</p></Link>)}</div>
        <div className="mt-6 flex items-center justify-between font-mono text-[10px] text-bone-faint uppercase tracking-wider"><span>{collection.artifacts.length} records linked</span><Link to="/archive" className="text-scan flex items-center gap-1">Open archive <ArrowUpRight className="w-3 h-3" /></Link></div>
      </article></Reveal>)}
    </div>
    <div className="mt-10 panel p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center"><ScanLine className="w-5 h-5 text-scan"/><div className="flex-1"><p className="text-bone">Collection logic is transparent.</p><p className="text-sm text-bone-dim mt-1">Each set is generated from explicit artifact IDs so future backend collection rules can replace the frontend data without changing the interface.</p></div></div>
  </div>;
}
