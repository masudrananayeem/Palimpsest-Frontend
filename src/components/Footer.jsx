import { Link } from "react-router-dom";
import { ScanLine, Globe, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-ink-line mt-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <Link to="/" className="group flex items-center gap-2.5 mb-4 w-fit">
            <span className="flex items-center justify-center w-9 h-9 rounded-lg border border-ink-line bg-ink-soft group-hover:border-scan/50 transition-colors">
              <ScanLine className="w-4 h-4 text-scan group-hover:rotate-90 transition-transform duration-500" />
            </span>
            <span className="font-display text-xl tracking-wide">Palimpsest</span>
          </Link>
          <p className="text-bone-dim text-sm max-w-sm leading-relaxed">
            An open archive for scanning, restoring, and preserving physical
            artifacts as citable 3D digital twins — built for museums,
            excavation teams, and independent conservators alike. Every
            inferred fragment stays visibly flagged and sourced.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full border border-ink-line flex items-center justify-center text-bone-faint hover:text-scan hover:border-scan/50 transition-colors" aria-label="Project website">
              <Globe className="w-4 h-4" />
            </a>
            <a href="mailto:hello@palimpsest.example" className="w-9 h-9 rounded-full border border-ink-line flex items-center justify-center text-bone-faint hover:text-scan hover:border-scan/50 transition-colors" aria-label="Email">
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div>
          <p className="eyebrow mb-4">Archive</p>
          <ul className="space-y-2.5 text-sm text-bone-dim">
            <li><Link to="/archive" className="nav-link hover:text-scan transition-colors">Browse artifacts</Link></li>
            <li><Link to="/collections" className="nav-link hover:text-scan transition-colors">Collections</Link></li>
            <li><Link to="/timeline" className="nav-link hover:text-scan transition-colors">Timeline</Link></li>
            <li><Link to="/research" className="nav-link hover:text-scan transition-colors">Research workspace</Link></li>
            <li><Link to="/upload" className="nav-link hover:text-scan transition-colors">Submit a scan</Link></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-4">Standards</p>
          <ul className="space-y-2.5 text-sm text-bone-dim">
            <li><Link to="/about" className="nav-link hover:text-scan transition-colors">Restoration ethics</Link></li>
            <li><Link to="/about" className="nav-link hover:text-scan transition-colors">Licensing &amp; provenance</Link></li>
            <li><Link to="/about" className="nav-link hover:text-scan transition-colors">Export formats</Link></li>
            <li><Link to="/dashboard" className="nav-link hover:text-scan transition-colors">Your dashboard</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-line">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-5 flex flex-col sm:flex-row justify-between gap-2 text-xs font-mono text-bone-faint">
          <span>© {new Date().getFullYear()} Palimpsest Archive Project</span>
          <span>Firebase + Cloudinary + Cloudflare Workers</span>
        </div>
      </div>
    </footer>
  );
}
