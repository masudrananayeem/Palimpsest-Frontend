import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock3, ArrowUpRight } from 'lucide-react';
import { artifacts } from '../data/artifacts';

const periods = [
  { id:'ancient', label:'Before 500 BCE', matches:['BCE'] },
  { id:'classical', label:'500 BCE — 1 CE', matches:['520 BCE','400 BCE','350–400 CE'] },
  { id:'late', label:'1 — 500 CE', matches:['150 CE','350–400 CE'] },
  { id:'medieval', label:'500 — 1500 CE', matches:['600–800 CE'] },
  { id:'modern', label:'1500 CE — present', matches:['19th c.'] },
];

export default function Timeline() {
  const [selected, setSelected] = useState('all');
  const groups = useMemo(() => artifacts.map(a => ({...a, period: periods.find(p => p.matches.some(m => a.era.includes(m)))?.label || 'Unmapped'})), []);
  const shown = selected === 'all' ? groups : groups.filter(a => a.period === periods.find(p => p.id === selected)?.label);
  return <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16">
    <span className="eyebrow">Chronology</span><h1 className="mt-4 text-4xl sm:text-5xl">A timeline of the archive.</h1><p className="mt-4 max-w-2xl text-bone-dim leading-relaxed">Move through the current collection chronologically and jump directly into the surviving evidence behind each record.</p>
    <div className="mt-10 flex flex-wrap gap-2"><button onClick={()=>setSelected('all')} className={`btn-ghost !px-4 !py-2.5 text-xs ${selected==='all'?'!border-scan !text-scan':''}`}>All periods</button>{periods.map(p=><button key={p.id} onClick={()=>setSelected(p.id)} className={`btn-ghost !px-4 !py-2.5 text-xs ${selected===p.id?'!border-scan !text-scan':''}`}>{p.label}</button>)}</div>
    <div className="mt-12 relative pl-7 sm:pl-10 border-l border-ink-line">
      {shown.map((a, i)=><article key={a.id} className="relative pb-10"><span className="absolute -left-[31px] sm:-left-[41px] top-1 w-3 h-3 rounded-full bg-scan ring-4 ring-ink"/><div className="panel p-5 sm:p-6"><div className="flex flex-wrap gap-3 items-center font-mono text-[10px] uppercase tracking-wider text-bone-faint"><Clock3 className="w-3.5 h-3.5 text-scan"/>{a.era}<span>•</span>{a.category}</div><div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><h2 className="text-xl">{a.title}</h2><p className="mt-1 text-sm text-bone-dim">{a.origin}</p></div><Link to={`/archive/${a.id}`} className="btn-ghost !px-3.5 !py-2 !text-xs shrink-0">Open record <ArrowUpRight className="w-3.5 h-3.5"/></Link></div></div>{i<shown.length-1&&<div/>}</article>)}
    </div>
  </div>;
}
