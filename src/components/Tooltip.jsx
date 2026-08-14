/**
 * Small hover/focus tooltip. Wrap any element with it to show a short
 * explanatory bubble on hover (and on keyboard focus, for accessibility).
 *
 * Usage:
 *   <Tooltip label="Marked geometry is inferred, not physically verified.">
 *     <span>Restored</span>
 *   </Tooltip>
 */
export default function Tooltip({ label, children, className = "" }) {
  if (!label) return children;
  return (
    <span className={`tooltip-wrap ${className}`} tabIndex={0}>
      {children}
      <span role="tooltip" className="tooltip-bubble">
        {label}
      </span>
    </span>
  );
}
