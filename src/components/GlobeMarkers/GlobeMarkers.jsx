import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { DoubleSide, AdditiveBlending } from 'three';
import { useAppStore, SCENE_PHASE } from '@hooks/useAppStore';
import { geoToVector3 } from '@utils/geoToVector3';
import { EARTH_RADIUS } from '@components/EarthScene/EarthMesh';
import locationsData from '@data/locations.json';

const MARKER_IDS = ['india', 'usa', 'brazil', 'germany', 'australia', 'japan'];

/**
 * SingleMarker
 *
 * Each marker is three visual pieces:
 *   1. A small emissive sphere (the marker point itself)
 *   2. A pulsing ring (continuous, subtle — signals "clickable" at rest)
 *   3. An Html label (country name), shown on hover, using drei's Html
 *      so it's real DOM (crisp text at any zoom) rather than a canvas
 *      texture or sprite, which would blur under the bloom postprocessing
 *      pass applied to the WebGL canvas.
 *
 * Selected state adds a THIRD, larger, brighter ring — see
 * SelectionRings.jsx for the more elaborate animated-rings-around-
 * selected-location effect the brief asks for; this component only
 * handles per-marker idle/hover/selected visual state, not the bigger
 * "holographic rings and pulses" ceremony that plays on selection.
 */
function SingleMarker({ locationId, position }) {
  const [hovered, setHovered] = useState(false);
  const pulseRef = useRef();
  const groupRef = useRef();

  const selectedLocationId = useAppStore((state) => state.selectedLocationId);
  const setSelectedLocationId = useAppStore((state) => state.setSelectedLocationId);
  const scenePhase = useAppStore((state) => state.scenePhase);

  const isSelected = selectedLocationId === locationId;
  const location = locationsData[locationId];

  // Markers are only meaningfully clickable while the globe is in a
  // state where a fly-to makes sense (hero/scrolling/already-focused-
  // elsewhere) — not while a fly-to animation is actively in progress,
  // to avoid a click landing mid-transition and starting a second
  // fly-to before the first has settled, which would look like a
  // camera glitch rather than a deliberate re-target.
  const isInteractive =
    scenePhase === SCENE_PHASE.HERO ||
    scenePhase === SCENE_PHASE.SCROLLING ||
    (scenePhase === SCENE_PHASE.LOCATION_FOCUS && isSelected === false);

  useFrame((state) => {
    if (pulseRef.current) {
      const t = state.clock.elapsedTime;
      // Each marker's pulse phase offset by a hash of its id, so all
      // six don't pulse in visible lockstep — small detail, but
      // synchronized pulsing across six markers reads as "obviously
      // the same animation repeated" rather than "alive."
      const phaseOffset = locationId.charCodeAt(0) * 0.7;
      const pulse = 0.5 + Math.sin(t * 2 + phaseOffset) * 0.5;
      pulseRef.current.scale.setScalar(1 + pulse * 0.35);
      pulseRef.current.material.opacity = 0.5 - pulse * 0.3;
    }
  });

  function handleClick(event) {
    event.stopPropagation();
    if (!isInteractive) return;
    setSelectedLocationId(locationId);
  }

  const markerColor = isSelected ? '#00FFA3' : '#00D9FF';

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (isInteractive) setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
    >
      {/* Core marker point */}
      <mesh>
        <sphereGeometry args={[0.022, 16, 16]} />
        <meshBasicMaterial color={markerColor} />
      </mesh>

      {/* Continuous idle pulse ring, faces outward from the sphere surface */}
      <mesh ref={pulseRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.03, 0.042, 32]} />
        <meshBasicMaterial
          color={markerColor}
          transparent
          opacity={0.4}
          side={DoubleSide}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Hover label — real DOM via drei's Html, billboarded automatically */}
      {hovered && isInteractive && (
        <Html center distanceFactor={6} style={{ pointerEvents: 'none' }}>
          <div className="glass-panel-strong px-3 py-1.5 whitespace-nowrap -translate-y-8">
            <span className="font-display text-xs text-mist tracking-wide">
              {location?.name}
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}

/**
 * GlobeMarkers
 *
 * Positions all six markers via geoToVector3 against each location's
 * real lat/lng from locations.json — see the earlier note in
 * services/environmentalDataService.js about why those coordinates are
 * real centroids and not arbitrary placements. Rendered as a child of
 * whatever rotates with the Earth surface (parent group is passed
 * implicitly by mounting this INSIDE EarthMesh's group in
 * EarthExperience.jsx) so markers stay pinned to their countries as
 * the planet rotates, rather than needing to counter-rotate manually.
 */
export default function GlobeMarkers() {
  const markerPositions = useMemo(
    () =>
      MARKER_IDS.map((id) => {
        const location = locationsData[id];
        return {
          id,
          position: geoToVector3(location.lat, location.lng, EARTH_RADIUS * 1.002),
        };
      }),
    []
  );

  return (
    <group>
      {markerPositions.map(({ id, position }) => (
        <SingleMarker key={id} locationId={id} position={position} />
      ))}
    </group>
  );
}
