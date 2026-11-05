import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const MODEL = "/models/hashhole-box.glb";

/**
 * The Hashhole Tubes display box in 3D.
 *
 * It always faces the visitor: it sways a few degrees on its own and follows a
 * drag up to ~35°, then eases back to the front. No full turns — seen from the
 * side the box is just a thin edge and reads as broken.
 */
function Box({ drag }: { drag: React.MutableRefObject<{ x: number; y: number; active: boolean }> }) {
  const { scene } = useGLTF(MODEL);
  const group = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  const model = useMemo(() => {
    const root = scene.clone(true);
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    root.position.sub(center);
    const s = 2.25 / Math.max(size.x, size.y);
    const wrap = new THREE.Group();
    wrap.add(root);
    wrap.scale.setScalar(s);
    root.traverse(o => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.castShadow = true;
        const mat = m.material as THREE.MeshStandardMaterial;
        if (mat && "envMapIntensity" in mat) mat.envMapIntensity = 1;
      }
    });
    return wrap;
  }, [scene]);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const d = drag.current;
    if (!d.active) {
      d.x *= 0.94;
      d.y *= 0.94;
    }
    const targetY = Math.sin(t * 0.7) * 0.22 + d.x;
    const targetX = Math.sin(t * 0.5) * 0.05 + d.y;
    g.rotation.y += (targetY - g.rotation.y) * Math.min(1, dt * 5);
    g.rotation.x += (targetX - g.rotation.x) * Math.min(1, dt * 5);
    g.position.y = Math.sin(t * 1.1) * 0.06;
  });

  const scale = Math.min(1, viewport.width / 3.4);
  return (
    <group ref={group} scale={scale}>
      <primitive object={model} />
    </group>
  );
}

export default function BoxViewer({ accent }: { accent: string }) {
  const drag = useRef({ x: 0, y: 0, active: false, sx: 0, sy: 0 });
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const down = (e: PointerEvent) => {
      drag.current.active = true;
      drag.current.sx = e.clientX - drag.current.x * 300;
      drag.current.sy = e.clientY - drag.current.y * 300;
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!drag.current.active) return;
      drag.current.x = THREE.MathUtils.clamp((e.clientX - drag.current.sx) / 300, -0.6, 0.6);
      drag.current.y = THREE.MathUtils.clamp((e.clientY - drag.current.sy) / 300, -0.25, 0.25);
    };
    const up = () => {
      drag.current.active = false;
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, []);

  return (
    <div ref={wrap} className="h-full w-full cursor-grab touch-pan-y active:cursor-grabbing">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0.15, 4.2], fov: 35 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <ambientLight intensity={1.1} />
        <directionalLight position={[2.5, 3, 4]} intensity={2.4} />
        <directionalLight position={[-3, 1, 2]} intensity={1.1} color={accent} />
        <pointLight position={[0, -1.5, 2.5]} intensity={6} color={accent} distance={8} />
        <Suspense fallback={null}>
          <Box drag={drag} />
          <ContactShadows position={[0, -1.25, 0]} opacity={0.55} scale={6} blur={2.6} far={3} color="#000" />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload(MODEL);
