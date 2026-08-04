import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending } from 'three';

/**
 * Starfield
 *
 * PERFORMANCE NOTE: this renders thousands of stars as a SINGLE
 * Points object with a single BufferGeometry, not as thousands of
 * individual <mesh> elements. Three.js/R3F can technically render
 * thousands of small meshes, but each one is a separate draw call —
 * at "thousands" scale that's the single most direct way to blow the
 * prompt's own 60fps requirement. Points with a shared geometry is one
 * draw call regardless of star count.
 *
 * Depth: stars are distributed across three radius bands (near/mid/far)
 * with slightly different sizes and opacities per band, so the
 * starfield has actual parallax-readable depth when the camera moves,
 * rather than reading as a flat dome painted with dots.
 */
function generateStarPositions(count, minRadius, maxRadius) {
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    // Uniform distribution on a sphere shell (not just random x/y/z,
    // which would bias density toward the corners of the bounding
    // cube) — standard rejection-free approach via spherical coords
    // with a random radius within the band.
    const radius = minRadius + Math.random() * (maxRadius - minRadius);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);

    sizes[i] = 0.5 + Math.random() * 1.5;
  }

  return { positions, sizes };
}

function StarLayer({ count, minRadius, maxRadius, baseSize, opacity, color }) {
  const pointsRef = useRef();

  const { positions, sizes } = useMemo(
    () => generateStarPositions(count, minRadius, maxRadius),
    [count, minRadius, maxRadius]
  );

  // Very slow independent rotation per layer — stars aren't static in
  // the brief's "everything should feel alive" sense, but movement
  // needs to be nearly imperceptible per-frame (real stars don't
  // visibly drift on human timescales) — this is closer to "the whole
  // sky turns almost imperceptibly slowly" than an animated effect.
  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.002;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={baseSize}
        color={color}
        transparent
        opacity={opacity}
        sizeAttenuation
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export default function Starfield() {
  return (
    <group>
      {/* Far layer: most numerous, smallest, dimmest — the bulk of the
          "thousands" requirement, reads as fine background texture. */}
      <StarLayer
        count={4200}
        minRadius={180}
        maxRadius={260}
        baseSize={0.55}
        opacity={0.55}
        color="#A8C8FF"
      />
      {/* Mid layer: fewer, slightly larger/brighter — gives the sky
          some visible variation in star brightness, like real
          magnitude variance. */}
      <StarLayer
        count={1400}
        minRadius={120}
        maxRadius={175}
        baseSize={0.9}
        opacity={0.75}
        color="#E8F4FF"
      />
      {/* Near layer: sparse, largest, brightest — these are the ones
          that will show visible parallax as the camera orbits. */}
      <StarLayer
        count={280}
        minRadius={70}
        maxRadius={115}
        baseSize={1.4}
        opacity={0.9}
        color="#FFFFFF"
      />
    </group>
  );
}
