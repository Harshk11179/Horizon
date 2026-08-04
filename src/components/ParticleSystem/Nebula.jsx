import { useMemo } from 'react';
import { AdditiveBlending, DoubleSide, Color } from 'three';

/**
 * Nebula
 *
 * A handful (not thousands) of large, soft-edged, low-opacity planes
 * with radial-gradient-like shading, scattered far behind the
 * starfield. This is deliberately the cheapest possible effect in this
 * whole scene — a few plane meshes with a simple shader — because it
 * should be near-imperceptible on direct focus and only readable as
 * "the background isn't pure black, there's faint color drifting out
 * there" in peripheral vision. Spending shader complexity here isn't
 * worth it: nebula are the least foreground-critical effect the brief
 * asks for.
 */
const NEBULA_CONFIGS = [
  { position: [-90, 30, -140], scale: 70, color: '#0A2A4D', rotation: 0.4 },
  { position: [110, -20, -160], scale: 85, color: '#0D1F3A', rotation: 1.1 },
  { position: [-40, -60, -180], scale: 60, color: '#062440', rotation: 2.3 },
  { position: [60, 70, -150], scale: 55, color: '#0A1F35', rotation: 0.8 },
];

function NebulaPlane({ position, scale, color, rotation }) {
  const colorObj = useMemo(() => new Color(color), [color]);

  return (
    <mesh position={position} rotation={[0, 0, rotation]}>
      <planeGeometry args={[scale, scale, 1, 1]} />
      <meshBasicMaterial
        color={colorObj}
        transparent
        opacity={0.25}
        side={DoubleSide}
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function Nebula() {
  return (
    <group>
      {NEBULA_CONFIGS.map((config, i) => (
        <NebulaPlane key={i} {...config} />
      ))}
    </group>
  );
}
