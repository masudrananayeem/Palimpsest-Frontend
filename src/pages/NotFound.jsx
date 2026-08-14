import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-6 py-32 text-center">
      <p className="font-mono text-scan text-sm tracking-wide">404</p>
      <h1 className="mt-4 text-4xl">This record isn't in the archive.</h1>
      <p className="mt-3 text-bone-dim">
        The page you're looking for may have moved, or the link is out of date.
      </p>
      <Link to="/" className="btn-primary mt-8 inline-flex">
        <ArrowLeft className="w-4 h-4" /> Return home
      </Link>
    </div>
  );
}
