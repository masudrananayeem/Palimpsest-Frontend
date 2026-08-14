/**
 * Crisp line-art silhouette for an artifact's shape, used on cards where a
 * full 3D viewer would be too heavy. Keeps each category visually distinct
 * instead of every card showing the same generic blob.
 */
export default function ArtifactGlyph({ shape = "amphora", className = "", style }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style,
  };

  switch (shape) {
    case "urn":
      return (
        <svg viewBox="0 0 64 64" className={className} {...common}>
          <path d="M24 10h16M27 10c-1 4-4 6-4 12 0 8 6 10 6 16 0 4-3 5-3 9h12c0-4-3-5-3-9 0-6 6-8 6-16 0-6-3-8-4-12" />
          <ellipse cx="32" cy="47" rx="9" ry="2.5" opacity="0.5" />
        </svg>
      );

    case "stele":
      return (
        <svg viewBox="0 0 64 64" className={className} {...common}>
          <path d="M20 54V20c0-5 4-9 12-9s12 4 12 9v34z" />
          <line x1="14" y1="54" x2="50" y2="54" />
          <path d="M24 24h16M24 30h16M24 36h10" opacity="0.55" />
        </svg>
      );

    case "tablet":
      return (
        <svg viewBox="0 0 64 64" className={className} {...common}>
          <rect x="12" y="20" width="40" height="26" rx="2" transform="rotate(-3 32 33)" />
          <path
            d="M18 27l4 3-4 3M26 27l3 6M33 26v8M40 27l4 3-4 3"
            opacity="0.6"
            transform="rotate(-3 32 33)"
          />
        </svg>
      );

    case "mask":
      return (
        <svg viewBox="0 0 64 64" className={className} {...common}>
          <path d="M32 8c-11 0-17 8-17 19 0 13 8 21 17 21s17-8 17-21c0-11-6-19-17-19z" />
          <path d="M23 26c1-3 3-4 5-4M41 26c-1-3-3-4-5-4" opacity="0.7" />
          <circle cx="25" cy="30" r="1.6" fill="currentColor" stroke="none" />
          <circle cx="39" cy="30" r="1.6" fill="currentColor" stroke="none" />
          <path d="M32 30v8M27 42c2 2 8 2 10 0" opacity="0.7" />
        </svg>
      );

    case "coins":
      return (
        <svg viewBox="0 0 64 64" className={className} {...common}>
          <ellipse cx="26" cy="44" rx="14" ry="5" />
          <ellipse cx="30" cy="37" rx="14" ry="5" />
          <ellipse cx="24" cy="30" rx="14" ry="5" />
          <ellipse cx="33" cy="24" rx="12" ry="4.5" />
        </svg>
      );

    case "amphora":
    default:
      return (
        <svg viewBox="0 0 64 64" className={className} {...common}>
          <path d="M27 8h10M29 8c0 4-6 5-6 12 0 5 4 6 4 11-3 1-6 4-6 9 0 8 6 13 11 13s11-5 11-13c0-5-3-8-6-9 0-5 4-6 4-11 0-7-6-8-6-12" />
          <path d="M19 22c-3 1-4 3-4 5M45 22c3 1 4 3 4 5" opacity="0.7" />
        </svg>
      );
  }
}
