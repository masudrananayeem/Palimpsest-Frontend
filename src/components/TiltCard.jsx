import { useRef, useCallback } from "react";

/**
 * Wraps any card/media in a mouse-reactive 3D tilt with a moving specular
 * "glare" sheen and a subtle colour-grade wash — gives flat images/cards a
 * tactile, modern 3D feel without any real geometry.
 *
 *   <TiltCard><ArtifactThumb /></TiltCard>
 *   <TiltCard tone="#7fdce0" strength={14}><img .../></TiltCard>
 */
export default function TiltCard({
  children,
  className = "",
  strength = 10,
  glare = true,
  tone,
  style,
}) {
  const ref = useRef(null);
  const raf = useRef(null);

  const handleMove = useCallback(
    (e) => {
      const node = ref.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rotY = (px - 0.5) * strength;
      const rotX = (0.5 - py) * strength;

      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        node.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(0)`;
        node.style.setProperty("--glare-x", `${px * 100}%`);
        node.style.setProperty("--glare-y", `${py * 100}%`);
        node.style.setProperty("--glare-o", glare ? "1" : "0");
      });
    },
    [strength, glare]
  );

  const handleLeave = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    if (raf.current) cancelAnimationFrame(raf.current);
    node.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)";
    node.style.setProperty("--glare-o", "0");
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onTouchMove={(e) => {
        const t = e.touches[0];
        if (t) handleMove(t);
      }}
      onTouchEnd={handleLeave}
      className={`tilt-card ${className}`}
      style={{ "--tilt-tone": tone || "var(--c-scan)", ...style }}
    >
      {children}
      <span className="tilt-glare" aria-hidden="true" />
    </div>
  );
}
