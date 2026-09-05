import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RotateCcw, Move3d, AlertTriangle } from "lucide-react";

/**
 * Turns a flat photo into an interactive pseudo-3D object: the image is
 * sampled for luminance and mapped onto a displaced plane (brighter pixels
 * pushed toward the viewer), lit with a moving rim light, and draggable /
 * auto-rotating. This is a relief/depth illusion, not photogrammetry — but
 * it reads as a real 3D object in the UI, which is what a single photo can
 * honestly support.
 */
export default function PhotoRelief3D({ src, className = "", height = 360 }) {
  const mountRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [autoSpin, setAutoSpin] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!src || !mountRef.current) return;
    let disposed = false;
    const mount = mountRef.current;
    setError("");
    setLoading(true);

    // Overall timeout: if nothing succeeds within 12s (slow/blocked image,
    // extension interference, etc.), surface an error instead of sitting
    // on "Building relief…" forever.
    const timeout = setTimeout(() => {
      if (!disposed) {
        setLoading(false);
        setError("This image took too long to load — it may be blocked by a browser extension, ad blocker, or a broken link.");
      }
    }, 12000);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, mount.clientWidth / height, 0.1, 100);
    camera.position.set(0, 0.15, 3.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, height);
    mount.innerHTML = "";
    mount.appendChild(renderer.domElement);

    const key = new THREE.DirectionalLight(0xfff2e0, 1.5);
    key.position.set(2, 3, 4);
    scene.add(key);
    const rim = new THREE.PointLight(0x7fdce0, 2.2, 12);
    rim.position.set(-2.5, 1, 2);
    scene.add(rim);
    scene.add(new THREE.AmbientLight(0x404040, 1.1));

    const group = new THREE.Group();
    scene.add(group);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (disposed) return;
      try {
        const w = 96;
        const h = Math.round((img.height / img.width) * w) || 96;
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h).data;

        const aspect = img.width / img.height;
        const planeW = aspect >= 1 ? 2.6 : 2.6 * aspect;
        const planeH = aspect >= 1 ? 2.6 / aspect : 2.6;
        const geometry = new THREE.PlaneGeometry(planeW, planeH, w - 1, h - 1);
        const pos = geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const px = i % w;
          const py = Math.floor(i / w);
          const idx = (py * w + px) * 4;
          const lum = (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114) / 255;
          pos.setZ(i, lum * 0.42);
        }
        pos.needsUpdate = true;
        geometry.computeVertexNormals();

        const texture = new THREE.Texture(img);
        texture.needsUpdate = true;
        texture.colorSpace = THREE.SRGBColorSpace;
        const material = new THREE.MeshStandardMaterial({
          map: texture,
          roughness: 0.55,
          metalness: 0.08,
          side: THREE.DoubleSide,
        });

        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);

        // Faint backing card behind the relief for depth cue.
        const backGeo = new THREE.PlaneGeometry(planeW * 1.06, planeH * 1.06);
        const backMat = new THREE.MeshBasicMaterial({ color: 0x111111, transparent: true, opacity: 0.5 });
        const back = new THREE.Mesh(backGeo, backMat);
        back.position.z = -0.3;
        group.add(back);

        clearTimeout(timeout);
        setLoading(false);
      } catch {
        // Most likely a CORS-tainted canvas (image host doesn't allow
        // cross-origin pixel reads) — fall back to a flat, untextured-read
        // plane using the image purely as a WebGL texture, no pixel sampling.
        try {
          const aspect = img.width / img.height || 1;
          const planeW = aspect >= 1 ? 2.6 : 2.6 * aspect;
          const planeH = aspect >= 1 ? 2.6 / aspect : 2.6;
          const geometry = new THREE.PlaneGeometry(planeW, planeH, 1, 1);
          const texture = new THREE.Texture(img);
          texture.needsUpdate = true;
          texture.colorSpace = THREE.SRGBColorSpace;
          const material = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.6, side: THREE.DoubleSide });
          group.add(new THREE.Mesh(geometry, material));
          clearTimeout(timeout);
          setLoading(false);
        } catch {
          clearTimeout(timeout);
          setLoading(false);
          setError("Couldn't read this image's pixels (likely blocked by CORS) — showing isn't possible for this source.");
        }
      }
    };
    img.onerror = () => {
      if (disposed) return;
      clearTimeout(timeout);
      setLoading(false);
      setError("This image failed to load — the link may be broken, or a browser extension/ad blocker is blocking it.");
    };
    img.src = src;

    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let targetRotY = 0.15;
    let targetRotX = -0.1;

    const onDown = (e) => {
      dragging = true;
      setAutoSpin(false);
      lastX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      lastY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    };
    const onMove = (e) => {
      if (!dragging) return;
      const x = e.clientX ?? e.touches?.[0]?.clientX ?? lastX;
      const y = e.clientY ?? e.touches?.[0]?.clientY ?? lastY;
      targetRotY += (x - lastX) * 0.008;
      targetRotX += (y - lastY) * -0.006;
      targetRotX = Math.max(-0.6, Math.min(0.6, targetRotX));
      lastX = x;
      lastY = y;
    };
    const onUp = () => { dragging = false; };

    renderer.domElement.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    let frame;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      if (autoSpin && !dragging) targetRotY += 0.0032;
      group.rotation.y += (targetRotY - group.rotation.y) * 0.08;
      group.rotation.x += (targetRotX - group.rotation.x) * 0.08;
      rim.position.x = Math.sin(Date.now() * 0.0006) * 3;
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / height;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, height);
    };
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      clearTimeout(timeout);
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, height]);

  return (
    <div className={`relative rounded-xl overflow-hidden border border-ink-line bg-ink/60 ${className}`}>
      <div ref={mountRef} style={{ height }} className="w-full cursor-grab active:cursor-grabbing" />
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center font-mono text-[11px] text-bone-faint uppercase tracking-wider">
          Building relief…
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center bg-ink/80">
          <AlertTriangle className="w-5 h-5 text-rust-bright" />
          <p className="text-xs text-bone-dim max-w-xs">{error}</p>
        </div>
      )}
      {!error && (
        <>
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-bone-faint bg-ink/70 backdrop-blur px-2.5 py-1.5 rounded-md">
            <Move3d className="w-3.5 h-3.5 text-scan" /> Drag to rotate
          </div>
          <button
            onClick={() => setAutoSpin((s) => !s)}
            className="absolute bottom-3 right-3 w-8 h-8 rounded-full border border-ink-line bg-ink/70 backdrop-blur flex items-center justify-center text-bone-faint hover:text-scan hover:border-scan transition-colors"
            aria-label="Toggle auto-rotate"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </>
      )}
    </div>
  );
}
