import { useEffect, useRef } from "react";
import * as THREE from "three";

// Lathed vessel silhouettes, evoking an amphora/urn profile from a 2D curve
// revolved around the vertical axis.
function buildLatheGeometry(profile, segments = 40) {
  const points = profile.map(([x, y]) => new THREE.Vector2(x, y));
  return new THREE.LatheGeometry(points, segments);
}

const AMPHORA_PROFILE = [
  [0, -1.6], [0.55, -1.55], [0.72, -1.2], [0.6, -0.7],
  [0.82, -0.1], [0.68, 0.5], [0.4, 0.95], [0.46, 1.3],
  [0.3, 1.55], [0, 1.6],
];

// Squatter, lidded silhouette so it reads as a distinct vessel from the amphora.
const URN_PROFILE = [
  [0, -1.3], [0.62, -1.25], [0.78, -0.85], [0.7, -0.35],
  [0.5, 0.05], [0.58, 0.35], [0.48, 0.55], [0.5, 0.72],
  [0.18, 0.82], [0, 0.86],
];

function buildGeometry(shape) {
  switch (shape) {
    case "urn":
      return buildLatheGeometry(URN_PROFILE, 36);

    case "stele": {
      // Flat, slightly irregular slab standing upright — a relief panel.
      const g = new THREE.BoxGeometry(1.7, 2.5, 0.22, 6, 10, 1);
      const pos = g.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        const taper = 1 - Math.max(0, (y + 1.25) / 2.5) * 0.12;
        pos.setX(i, pos.getX(i) * taper);
        if (y > 1.1) pos.setY(i, y - Math.random() * 0.06);
      }
      pos.needsUpdate = true;
      g.computeVertexNormals();
      return g;
    }

    case "tablet": {
      // Small flat clay tablet with a subtly uneven, hand-formed surface.
      const g = new THREE.BoxGeometry(1.9, 1.3, 0.28, 14, 10, 2);
      const pos = g.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const z = pos.getZ(i);
        if (Math.abs(z) > 0.1) {
          pos.setZ(i, z + (Math.random() - 0.5) * 0.05);
        }
      }
      pos.needsUpdate = true;
      g.computeVertexNormals();
      return g;
    }

    case "mask": {
      // Organic, asymmetric face-like form from a displaced sphere.
      const g = new THREE.SphereGeometry(1.15, 48, 32, 0, Math.PI * 1.15);
      const pos = g.attributes.position;
      const v = new THREE.Vector3();
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i);
        const brow = Math.exp(-Math.pow((v.y - 0.35) * 3, 2)) * 0.12;
        const cheek = Math.exp(-Math.pow((v.y + 0.25) * 2.2, 2)) * 0.1;
        const noseRidge = Math.exp(-Math.pow(v.x * 6, 2)) * 0.18 * Math.max(0, v.z);
        const bulge = brow + cheek + noseRidge;
        v.multiplyScalar(1 + bulge * 0.6);
        pos.setXYZ(i, v.x, v.y * 1.25, v.z);
      }
      pos.needsUpdate = true;
      g.computeVertexNormals();
      return g;
    }

    case "coins": {
      // A loose cluster of coin discs merged into one geometry.
      const merged = [];
      const rng = (seed) => {
        const x = Math.sin(seed * 999.7) * 43758.5453;
        return x - Math.floor(x);
      };
      for (let i = 0; i < 9; i++) {
        const r = 0.42 + rng(i) * 0.14;
        const disc = new THREE.CylinderGeometry(r, r, 0.08, 24);
        const angle = rng(i + 50) * Math.PI * 2;
        const radius = rng(i + 90) * 0.9;
        disc.translate(
          Math.cos(angle) * radius,
          -1 + i * 0.16 + rng(i + 10) * 0.08,
          Math.sin(angle) * radius
        );
        disc.rotateX((rng(i + 20) - 0.5) * 0.5);
        disc.rotateZ((rng(i + 30) - 0.5) * 0.5);
        merged.push(disc);
      }
      let vertCount = 0;
      merged.forEach((g) => (vertCount += g.attributes.position.count));
      const positions = new Float32Array(vertCount * 3);
      const normals = new Float32Array(vertCount * 3);
      let offset = 0;
      merged.forEach((g) => {
        positions.set(g.attributes.position.array, offset * 3);
        normals.set(g.attributes.normal.array, offset * 3);
        offset += g.attributes.position.count;
        g.dispose();
      });
      const out = new THREE.BufferGeometry();
      out.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      out.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
      return out;
    }

    case "amphora":
    default:
      return buildLatheGeometry(AMPHORA_PROFILE, 40);
  }
}

/**
 * Procedural stand-in for a real scanned mesh, rendered as a wireframe +
 * point cloud to read as "digital scan" rather than a finished render.
 * Geometry varies by the artifact's `shape` so different object types are
 * visually distinguishable at a glance. Swap for a GLTFLoader once real
 * captured meshes are available from the backend.
 */
export default function MeshViewer({ tone = "#7FDCE0", shape = "amphora", spin = true, className = "" }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.3, 5.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const geometry = buildGeometry(shape);

    const wireMat = new THREE.MeshBasicMaterial({
      color: tone,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
    });
    const wireMesh = new THREE.Mesh(geometry, wireMat);
    scene.add(wireMesh);

    const pointsMat = new THREE.PointsMaterial({ color: tone, size: 0.02, transparent: true, opacity: 0.9 });
    const cloud = new THREE.Points(geometry, pointsMat);
    scene.add(cloud);

    const group = new THREE.Group();
    group.add(wireMesh, cloud);
    scene.add(group);

    let frameId;
    const animate = () => {
      if (spin) group.rotation.y += 0.0035;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      geometry.dispose();
      wireMat.dispose();
      pointsMat.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [tone, shape, spin]);

  return <div ref={mountRef} className={className} />;
}
