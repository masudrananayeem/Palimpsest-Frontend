import { ScanLine, ShieldCheck, GitBranch, FileDown } from "lucide-react";
import Reveal from "../components/Reveal";

const principles = [
  {
    icon: ShieldCheck,
    title: "Minimal intervention",
    body: "Digital restoration fills gaps only where evidence supports it. Speculative geometry is generated, reviewed, and permanently flagged — never presented as fact.",
  },
  {
    icon: GitBranch,
    title: "Full version history",
    body: "Every mesh edit, curator approval, and correction is kept. The original raw scan is never overwritten and stays downloadable from every artifact page.",
  },
  {
    icon: FileDown,
    title: "Open export formats",
    body: "Published twins export as GLB, OBJ, and PLY with provenance metadata embedded, so credit and context travel with the file.",
  },
];

export default function About() {
  return (
    <div className="mx-auto max-w-4xl px-6 lg:px-10 py-16">
      <span className="eyebrow flex items-center gap-2"><ScanLine className="w-3.5 h-3.5" /> About the archive</span>
      <h1 className="mt-4 text-4xl sm:text-5xl leading-tight">
        Restoration you can audit, not just admire.
      </h1>
      <p className="mt-6 text-bone-dim text-lg leading-relaxed max-w-2xl">
        Palimpsest exists because too much digital restoration work happens
        invisibly — a damaged artifact goes in, a polished render comes out,
        and nobody outside the studio can tell which parts were real. This
        archive keeps the seam visible on purpose.
      </p>

      <div className="mt-16 grid sm:grid-cols-3 gap-8">
        {principles.map((p, i) => (
          <Reveal key={p.title} delay={i * 100} className="group/principle">
            <p.icon className="w-6 h-6 text-verdigris-bright transition-transform duration-300 group-hover/principle:scale-110 group-hover/principle:rotate-6" />
            <h3 className="mt-4 text-lg">{p.title}</h3>
            <p className="mt-2 text-sm text-bone-dim leading-relaxed">{p.body}</p>
          </Reveal>
        ))}
      </div>

      <div className="mt-20 panel p-8">
        <h2 className="text-2xl">Who this is for</h2>
        <p className="mt-4 text-bone-dim leading-relaxed">
          Museums digitizing fragile collections, excavation teams
          documenting finds in the field, independent conservators building a
          public portfolio, and researchers who need a citable, inspectable
          record rather than a marketing render.
        </p>
      </div>

      <div className="mt-12 text-sm text-bone-faint font-mono">
        This is a frontend prototype built for a UI/UX capstone assignment.
        Backend services (auth, storage, mesh processing) are not yet
        connected.
      </div>
    </div>
  );
}
