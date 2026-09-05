import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/**
 * Renders an actual generated .glb mesh (from the Meshy image-to-3D
 * pipeline) with orbit controls and studio lighting. This is real
 * geometry, unlike PhotoRelief3D's illusion-from-a-single-photo.
 */
export default function GLBViewer({ src, className = "", height = 420 }) {
  const mountRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!src || !mountRef.current) return;
    let disposed = false;
    const mount = mountRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / height, 0.05, 100);
    camera.position.set(1.6, 1.2, 2.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.innerHTML = "";
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xfff2e0, 0x22201a, 1.4));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(3, 4, 2);
    scene.add(key);
    const rim = new THREE.PointLight(0x7fdce0, 1.8, 14);
    rim.position.set(-2, 1, -2);
    scene.add(rim);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.1;

    const loader = new GLTFLoader();
    loader.load(
      src,
      (gltf) => {
        if (disposed) return;
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3()).length() || 1;
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        const scale = 1.6 / size;
        model.scale.setScalar(scale);
        scene.add(model);
      },
      undefined,
      () => setError("Couldn't load the generated model.")
    );

    let frame;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      controls.update();
      rim.position.x = Math.sin(Date.now() * 0.0005) * 3;
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      camera.aspect = mount.clientWidth / height;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, height);
    };
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      controls.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [src, height]);

  return (
    <div className={`relative rounded-xl overflow-hidden border border-ink-line bg-ink/60 ${className}`}>
      <div ref={mountRef} style={{ height }} className="w-full cursor-grab active:cursor-grabbing" />
      {error && <p className="absolute inset-0 flex items-center justify-center text-xs text-rust-bright px-6 text-center">{error}</p>}
    </div>
  );
}
