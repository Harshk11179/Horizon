import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending } from 'three';

/**
 * SpaceDust
 *
 * Distinct from Starfield: this sits much closer to the camera (small
 * radius band) and each particle drifts individually rather than the
 * whole layer rotating as one rigid group. This is what actually reads
 * as "floating particles near the viewer" versus "distant sky" — the
 * two effects look similar in a screenshot but behave very differently
 * once the camera moves, which is most of what "cinematic" means here.
 *
 * Per-particle drift is computed on the CPU each frame (not a vertex
 * shader) because the particle count here is small (a few hundred, not
 * thousands) — cheap enough that the simplicity of updating a
 * Float32Array directly outweighs the setup cost of a custom drift
 * shader for this particular layer.
 */
export default function SpaceDust({ count = 400, radius = 45 }) {
  const pointsRef = useRef();

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const r = Math.cbrt(Math.random()) * radius; // cbrt for uniform volume distribution, not just shell
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Slow, random per-axis drift velocity
      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }

    return { positions, velocities };
  }, [count, radius]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const posArray = pointsRef.current.geometry.attributes.position.array;

    for (let i = 0; i < count; i++) {
      posArray[i * 3] += velocities[i * 3] * delta * 10;
      posArray[i * 3 + 1] += velocities[i * 3 + 1] * delta * 10;
      posArray[i * 3 + 2] += velocities[i * 3 + 2] * delta * 10;

      // Wrap particles that drift outside the radius bound back to the
      // opposite side, rather than letting them drift away forever
      // (which would slowly empty the visible volume over a long
      // session) or resetting them abruptly (which would be a visible
      // pop). Wrapping at the boundary is imperceptible since it
      // happens far from the camera's focal point.
      const dist = Math.hypot(posArray[i * 3], posArray[i * 3 + 1], posArray[i * 3 + 2]);
      if (dist > radius) {
        posArray[i * 3] *= -0.95;
        posArray[i * 3 + 1] *= -0.95;
        posArray[i * 3 + 2] *= -0.95;
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
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
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        color="#00D9FF"
        transparent
        opacity={0.35}
        sizeAttenuation
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
