import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import { RingGeometry, DoubleSide, AdditiveBlending, Color } from 'three';

/**
 * AuroraMaterial — animated, shifting band of color simulating aurora
 * borealis/australis. Uses time-varying noise-like sine layering
 * (cheap, GPU-friendly — a real simplex noise function would be more
 * accurate but this is a small, distant, glow-only element where the
 * extra cost isn't visually justified) to make the band ripple rather
 * than sit as a static gradient ring.
 */
const AuroraMaterial = shaderMaterial(
  {
    uTime: 0,
    uColorA: new Color('#00FFA3'),
    uColorB: new Color('#00D9FF'),
    uOpacity: 0.55,
  },
  /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  /* glsl */ `
    uniform float uTime;
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform float uOpacity;
    varying vec2 vUv;

    void main() {
      // vUv.x wraps around the ring (angle), vUv.y goes across its width.
      float ripple = sin(vUv.x * 18.0 + uTime * 0.8) * 0.5 + 0.5;
      float ripple2 = sin(vUv.x * 7.0 - uTime * 0.5) * 0.5 + 0.5;
      float combinedRipple = mix(ripple, ripple2, 0.5);

      // Fade to transparent at both edges of the ring's width (vUv.y
      // near 0 or 1), so it reads as a soft band rather than a hard-
      // edged shape.
      float edgeFade = sin(vUv.y * 3.14159265);
      edgeFade = pow(max(edgeFade, 0.0), 1.5);

      vec3 color = mix(uColorA, uColorB, combinedRipple);
      float alpha = edgeFade * combinedRipple * uOpacity;

      gl_FragColor = vec4(color, alpha);
    }
  `
);

extend({ AuroraMaterial });

/**
 * Single aurora ring, positioned and tilted to sit near one pole.
 * @param {number} poleSign - 1 for north, -1 for south
 * @param {number} radius - Earth's surface radius, ring sits just above it
 */
function AuroraRing({ poleSign, radius }) {
  const materialRef = useRef();

  const geometry = useMemo(
    () => new RingGeometry(radius * 0.35, radius * 0.62, 64, 8),
    [radius]
  );

  useFrame((_, delta) => {
    if (materialRef.current) {
      materialRef.current.uTime += delta;
    }
  });

  return (
    <mesh
      geometry={geometry}
      position={[0, poleSign * radius * 0.92, 0]}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <auroraMaterial
        ref={materialRef}
        transparent
        side={DoubleSide}
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

/**
 * AuroraEffect — north + south polar aurora rings together.
 * Radius should match (or slightly exceed) the Earth surface mesh
 * radius; positioned via poleSign * radius * 0.92 so the ring sits
 * near the pole's surface curvature rather than floating at the exact
 * pole point (which would look like a flat disk stuck to the sphere).
 */
export default function AuroraEffect({ radius = 2 }) {
  return (
    <group>
      <AuroraRing poleSign={1} radius={radius} />
      <AuroraRing poleSign={-1} radius={radius} />
    </group>
  );
}
