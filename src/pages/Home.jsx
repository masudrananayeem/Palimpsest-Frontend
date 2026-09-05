import { Link } from "react-router-dom";
import { ArrowRight, ScanLine, Layers, ShieldCheck, Users } from "lucide-react";
import MeshViewer from "../components/MeshViewer";
import RestorationSlider from "../components/RestorationSlider";
import ArtifactCard from "../components/ArtifactCard";
import TiltCard from "../components/TiltCard";
import Reveal from "../components/Reveal";
import Tooltip from "../components/Tooltip";
import { artifacts } from "../data/artifacts";

const statHints = {
  "1,842": "Total artifacts with at least one published scan record.",
  "96": "Museums, excavation teams, and independent conservators contributing scans.",
  "31TB": "Combined raw scan, mesh, and texture data preserved across the archive.",
};

const steps = [
  {
    n: "Capture",
    title: "Scan the physical object",
    body: "Upload photogrammetry sets, structured-light scans, or CT slices straight from the field or the studio.",
  },
  {
    n: "Reconstruct",
    title: "Generate the digital twin",
    body: "The pipeline builds a mesh, flags missing geometry, and proposes symmetry-based fills for review.",
  },
  {
    n: "Restore",
    title: "Guide the restoration",
    body: "Curators approve, reject, or hand-correct every inferred region before anything is marked restored.",
  },
  {
    n: "Publish",
    title: "Archive with provenance",
    body: "Publish the twin with full scan history, contributor credit, and export rights attached.",
  },
];

export default function Home() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-ink-line">
        <div className="aurora-bg" />
        <div className="absolute inset-0 mesh-grid opacity-60 pointer-events-none" />
        <div className="absolute -top-24 -left-20 w-72 h-72 rounded-full bg-scan/10 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-10 w-80 h-80 rounded-full bg-bronze/10 blur-[110px] pointer-events-none" />
        <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-16 pb-20 lg:pt-24 lg:pb-28 relative grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fadeUp">
            <span className="eyebrow flex items-center gap-2">
              <ScanLine className="w-3.5 h-3.5" /> Digital Heritage Archive
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.05] font-medium">
              Every fracture, scanned.
              <br />
              <span className="text-verdigris-bright">Every restoration,</span>
              <br />
              accountable.
            </h1>
            <p className="mt-6 text-bone-dim text-base sm:text-lg max-w-lg leading-relaxed">
              Palimpsest turns fragile physical artifacts into citable 3D
              digital twins — with every inferred fragment marked, sourced,
              and reversible. Built for museums, excavation teams, and
              independent conservators.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link to="/upload" className="btn-primary glow-pulse">
                Submit a scan <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/archive" className="btn-ghost">
                Browse the archive
              </Link>
            </div>
            <div className="mt-12 flex gap-10 font-mono text-xs text-bone-faint">
              <Tooltip label={statHints["1,842"]}>
                <div className="cursor-help">
                  <p className="text-2xl text-bone font-display transition-colors hover:text-scan">1,842</p>
                  artifacts archived
                </div>
              </Tooltip>
              <Tooltip label={statHints["96"]}>
                <div className="cursor-help">
                  <p className="text-2xl text-bone font-display transition-colors hover:text-scan">96</p>
                  contributing institutions
                </div>
              </Tooltip>
              <Tooltip label={statHints["31TB"]}>
                <div className="cursor-help">
                  <p className="text-2xl text-bone font-display transition-colors hover:text-scan">31TB</p>
                  of scan data preserved
                </div>
              </Tooltip>
            </div>
          </div>

          <Reveal variant="scale" delay={120} as="div" className="relative aspect-square rounded-xl border border-ink-line mesh-grid overflow-hidden">
            <TiltCard strength={9} tone="#7FDCE0" className="w-full h-full">
              <MeshViewer tone="#7FDCE0" shape="mask" className="w-full h-full" />
              <span className="grade-wash" />
            </TiltCard>
            <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-scan/10 to-transparent animate-scanline pointer-events-none" />
            <div className="absolute bottom-4 left-4 font-mono text-[10px] text-scan tracking-wide">
              LIVE MESH PREVIEW · amphora-317.glb
            </div>
          </Reveal>
        </div>
      </section>

      {/* SIGNATURE: restoration slider */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-24 grid lg:grid-cols-2 gap-14 items-center">
        <Reveal variant="left">
          <span className="eyebrow">The signature move</span>
          <h2 className="mt-4 text-3xl sm:text-4xl leading-tight">
            See exactly what was found —
            <br className="hidden sm:block" /> and exactly what was inferred.
          </h2>
          <p className="mt-5 text-bone-dim leading-relaxed max-w-md">
            Drag the divider on any artifact page to move between the raw
            scan and the restored twin. Nothing is hidden: reconstructed
            geometry stays visibly flagged even after publication.
          </p>
          <Link
            to="/archive/amphora-317"
            className="inline-flex items-center gap-2 mt-6 text-scan text-sm font-mono uppercase tracking-wide hover:gap-3 transition-all"
          >
            Open full artifact record <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>
        <Reveal variant="right" delay={120}><RestorationSlider /></Reveal>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-y border-ink-line bg-ink-soft/40">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24">
          <Reveal><span className="eyebrow">Process</span>
          <h2 className="mt-4 text-3xl sm:text-4xl max-w-xl">
            From fragment to archive record in four checked stages.
          </h2></Reveal>
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-ink-line">
            {steps.map((s, i) => (
              <Reveal key={s.n} variant="scale" delay={i * 100} className="group/step bg-ink p-7 flex flex-col gap-3 transition-colors duration-300 hover:bg-ink-soft">
                <span className="font-mono text-xs text-verdigris-bright transition-transform duration-300 group-hover/step:translate-x-1 inline-block w-fit">
                  {s.n}
                </span>
                <h3 className="text-lg leading-snug">{s.title}</h3>
                <p className="text-sm text-bone-dim leading-relaxed">{s.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED ARTIFACTS */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-24">
        <Reveal className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <span className="eyebrow">Recently archived</span>
            <h2 className="mt-4 text-3xl sm:text-4xl">From the collection</h2>
          </div>
          <Link to="/archive" className="btn-ghost">
            View full archive <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {artifacts.slice(0, 3).map((a, i) => (
            <Reveal key={a.id} variant="scale" delay={i * 100}>
              <ArtifactCard artifact={a} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* CREATOR ECONOMY / TRUST STRIP */}
      <section className="border-t border-ink-line">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-20 grid sm:grid-cols-3 gap-10">
          <Reveal delay={0} className="group/trust flex gap-4">
            <ShieldCheck className="w-6 h-6 text-verdigris-bright shrink-0 transition-transform duration-300 group-hover/trust:scale-110 group-hover/trust:rotate-6" />
            <div>
              <h3 className="text-base">Provenance stays attached</h3>
              <p className="text-sm text-bone-dim mt-1.5 leading-relaxed">
                Every export carries scan history, contributor credit, and
                usage rights — nothing is stripped downstream.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100} className="group/trust flex gap-4">
            <Layers className="w-6 h-6 text-verdigris-bright shrink-0 transition-transform duration-300 group-hover/trust:scale-110 group-hover/trust:rotate-6" />
            <div>
              <h3 className="text-base">Restoration is versioned</h3>
              <p className="text-sm text-bone-dim mt-1.5 leading-relaxed">
                Roll back any inferred fix. The raw capture is preserved
                permanently alongside every published twin.
              </p>
            </div>
          </Reveal>
          <Reveal delay={200} className="group/trust flex gap-4">
            <Users className="w-6 h-6 text-verdigris-bright shrink-0 transition-transform duration-300 group-hover/trust:scale-110 group-hover/trust:rotate-6" />
            <div>
              <h3 className="text-base">Built for independent contributors</h3>
              <p className="text-sm text-bone-dim mt-1.5 leading-relaxed">
                Individual conservators and hobbyist scanners publish
                alongside institutions, credited the same way.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
