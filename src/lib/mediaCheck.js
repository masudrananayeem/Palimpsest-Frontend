/**
 * Resolves true/false depending on whether an image URL actually loads.
 * No URL at all (mesh-only submission, no photo) is treated as a pass —
 * there's no photo-based 3D preview to break for those.
 */
export function verifyImageLoads(url, timeoutMs = 10000) {
  return new Promise((resolve) => {
    if (!url) {
      resolve(true);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    const timer = setTimeout(() => resolve(false), timeoutMs);
    img.onload = () => {
      clearTimeout(timer);
      resolve(true);
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(false);
    };
    img.src = url;
  });
}
