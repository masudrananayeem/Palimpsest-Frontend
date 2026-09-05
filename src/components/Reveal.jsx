import { useEffect, useRef, useState } from "react";

/**
 * Fades/slides/scales content in as it scrolls into view.
 * Wrap any section/element with it; pass a `delay` (ms) to stagger siblings.
 *
 *   <Reveal><section>...</section></Reveal>
 *   <Reveal variant="scale" delay={120}><ArtifactCard .../></Reveal>
 *   <Reveal variant="left" as="li">...</Reveal>
 *
 * variant: "up" (default) | "down" | "left" | "right" | "scale" | "blur"
 */
export default function Reveal({ children, delay = 0, variant = "up", className = "", as: Tag = "div" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal reveal-${variant} ${visible ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </Tag>
  );
}

/**
 * Staggers a Reveal around every direct child automatically — drop a list
 * of cards/sections in and each one animates in slightly after the last.
 *
 *   <RevealGroup variant="scale" gap={80}>
 *     {items.map(item => <Card key={item.id} {...item} />)}
 *   </RevealGroup>
 */
export function RevealGroup({ children, variant = "up", gap = 90, className = "", as = "div" }) {
  const items = Array.isArray(children) ? children : [children];
  return (
    <>
      {items.map((child, i) => (
        <Reveal key={child?.key ?? i} variant={variant} delay={i * gap} as={as} className={className}>
          {child}
        </Reveal>
      ))}
    </>
  );
}
