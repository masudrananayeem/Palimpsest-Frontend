import { useEffect, useState } from "react";

/**
 * Probes an image URL in the background and reports whether it actually
 * loads. Lets pages skip straight to a graceful fallback (procedural
 * glyph, hidden tab, etc.) instead of showing a broken <img> or an empty
 * 3D canvas when a stored URL is dead, blocked, or CORS-restricted.
 *
 * Returns "checking" | "ok" | "broken". Re-checks whenever `url` changes.
 */
export default function useImageHealth(url) {
  const [status, setStatus] = useState(url ? "checking" : "broken");

  useEffect(() => {
    if (!url) {
      setStatus("broken");
      return;
    }
    let cancelled = false;
    setStatus("checking");

    const img = new Image();
    const timeout = setTimeout(() => {
      if (!cancelled) setStatus("broken");
    }, 10000);

    img.onload = () => {
      clearTimeout(timeout);
      if (!cancelled) setStatus("ok");
    };
    img.onerror = () => {
      clearTimeout(timeout);
      if (!cancelled) setStatus("broken");
    };
    img.src = url;

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      img.onload = null;
      img.onerror = null;
    };
  }, [url]);

  return status;
}
