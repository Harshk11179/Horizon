import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { DoubleSide, AdditiveBlending, BufferGeometry, Float32BufferAttribute } from 'three';
import { useAppStore, SCENE_PHASE } from '@hooks/useAppStore';
import { geoToVector3 } from '@utils/geoToVector3';
import { EARTH_RADIUS } from '@components/EarthScene/EarthMesh';
import locationsData from '@data/locations.json';

/**
 * ExpandingRing — a single ring that continuously grows outward from
 * the marker and fades as it grows, then resets. Three of these at
 * staggered phase offsets (see SelectionRings below) produces the
 * "radar ping" / "holographic scan" look the brief describes, rather
 * than one ring pulsing in place.
 */
function ExpandingRing({ phaseOffset, color }) {
  const meshRef = useRef();
  const CYCLE = 2.4; // seconds per expansion cycle

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = ((state.clock.elapsedTime + phaseOffset) % CYCLE) / CYCLE;
    const scale = 0.04 + t * 0.5;
    meshRef.current.scale.setScalar(scale);
    meshRef.current.material.opacity = (1 - t) * 0.55;
  });

  return (
    <mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.85, 1, 48]} />
      <meshBasicMaterial
        color={color}
        transparent
        side={DoubleSide}
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

/**
 * ConnectingLines — a small number of thin radial lines from the
 * marker point outward, rotating slowly, evoking a holographic
 * targeting/scanning readout rather than a purely decorative ring.
 * Built as a single BufferGeometry LineSegments object (not multiple
 * <line> elements) for the same draw-call reason as Starfield.
 */
function ConnectingLines({ color }) {
  const groupRef = useRef();
  const lineCount = 8;

  const geometry = useMemo(() => {
    const positions = [];
    for (let i = 0; i < lineCount; i++) {
      const angle = (i / lineCount) * Math.PI * 2;
      const innerR = 0.06;
      const outerR = 0.16 + (i % 3) * 0.03; // slight length variance so it doesn't read as a perfect uniform star
      positions.push(
        Math.cos(angle) * innerR, 0, Math.sin(angle) * innerR,
        Math.cos(angle) * outerR, 0, Math.sin(angle) * outerR
      );
    }
    const geo = new BufferGeometry();
    geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <group ref={groupRef} rotation={[Math.PI / 2, 0, 0]}>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <lineSegments geometry={geometry}>
        <lineBasicMaterial color={color} transparent opacity={0.5} blending={AdditiveBlending} />
      </lineSegments>
    </group>
  );
}

/**
 * SelectionRings
 *
 * Only renders once a location is actually selected AND the camera
 * fly-to has settled into LOCATION_FOCUS — gating on scenePhase rather
 * than just selectedLocationId presence means this elaborate ring
 * ceremony doesn't start playing while the camera is still mid-flight
 * toward the location, which would visually compete with the fly-to
 * itself instead of rewarding its arrival.
 */
export default function SelectionRings() {
  const selectedLocationId = useAppStore((state) => state.selectedLocationId);
  const scenePhase = useAppStore((state) => state.scenePhase);

  if (scenePhase !== SCENE_PHASE.LOCATION_FOCUS || !selectedLocationId) {
    return null;
  }

  const location = locationsData[selectedLocationId];
  if (!location) return null;

  const position = geoToVector3(location.lat, location.lng, EARTH_RADIUS * 1.004);

  return (
    <group position={position}>
      <ExpandingRing phaseOffset={0} color="#00FFA3" />
      <ExpandingRing phaseOffset={0.8} color="#00D9FF" />
      <ExpandingRing phaseOffset={1.6} color="#00FFA3" />
      <ConnectingLines color="#00D9FF" />
    </group>
  );
}
