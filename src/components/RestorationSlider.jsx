import { useRef, useState, useCallback } from "react";
import { MoveHorizontal } from "lucide-react";

/**
 * Drag-to-reveal comparison between the raw scan capture ("as found") and
 * the restored digital twin. Built with pointer events so it works with
 * mouse, touch, and pen alike.
 */
export default function RestorationSlider({
  beforeTone = "#3E3527",
  afterTone = "#4C7A6E",
  beforeLabel = "As scanned",
  afterLabel = "Restored twin",
}) {
  const [pos, setPos] = useState(50);
  const trackRef = useRef(null);
  const dragging = useRef(false);

  const updateFromClientX = useCallback((clientX) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, pct)));
  }, []);

  const onPointerDown = (e) => {
    dragging.current = true;
    updateFromClientX(e.clientX);
    e.target.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!dragging.current) return;
    updateFromClientX(e.clientX);
  };
  const onPointerUp = () => {
    dragging.current = false;
  };

  return (
    <div className="w-full">
      <div
        ref={trackRef}
        className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-ink-line select-none touch-none cursor-ew-resize"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {/* Restored (base layer) */}
        <div
          className="absolute inset-0 mesh-grid flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${afterTone}22, rgb(var(--c-ink)))` }}
        >
          <div
            className="w-40 h-40 rounded-full blur-3xl opacity-40"
            style={{ background: afterTone }}
          />
          <span className="absolute bottom-4 right-4 font-mono text-[10px] tracking-[0.2em] uppercase text-scan">
            {afterLabel}
          </span>
        </div>

        {/* As-found (clipped top layer) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        >
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${beforeTone}55, rgb(var(--c-ink)))` }}
          >
            <div
              className="w-40 h-40 rounded-full blur-3xl opacity-30 grayscale"
              style={{ background: beforeTone }}
            />
            {/* damage flecks */}
            {[...Array(14)].map((_, i) => (
              <span
                key={i}
                className="absolute rounded-full bg-rust/60"
                style={{
                  width: `${4 + (i % 4) * 3}px`,
                  height: `${4 + (i % 4) * 3}px`,
                  top: `${(i * 37) % 90}%`,
                  left: `${(i * 53) % 90}%`,
                }}
              />
            ))}
          </div>
          <span className="absolute bottom-4 left-4 font-mono text-[10px] tracking-[0.2em] uppercase text-bone-dim">
            {beforeLabel}
          </span>
        </div>

        {/* Handle */}
        <div
          className="absolute top-0 bottom-0 w-px bg-scan/70"
          style={{ left: `${pos}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-ink border border-scan flex items-center justify-center shadow-lg">
            <MoveHorizontal className="w-4 h-4 text-scan" />
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <span className="font-mono text-[10px] text-bone-faint w-10">0%</span>
        <input
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          className="w-full accent-scan"
          aria-label="Restoration comparison position"
        />
        <span className="font-mono text-[10px] text-bone-faint w-10 text-right">100%</span>
      </div>
    </div>
  );
}
