import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { RepeatWrapping } from 'three';
import './EarthMaterial';
import AtmosphereMaterial, { ATMOSPHERE_MATERIAL_PROPS } from './AtmosphereMaterial';

import dayTexturePath from '@/assets/textures/earth-day.jpg';
import nightTexturePath from '@/assets/textures/earth-night.png';
import normalTexturePath from '@/assets/textures/earth-normal.jpg';
import cloudTexturePath from '@/assets/textures/earth-clouds.png';

export const EARTH_RADIUS = 2;
const ATMOSPHERE_RADIUS = EARTH_RADIUS * 1.045;

/**
 * EarthMesh
 *
 * Owns the sun-direction calculation because both the surface shader
 * AND the atmosphere shader need the same value each frame — computing
 * it once here and passing down as a uniform avoids two components
 * independently reimplementing (and potentially drifting out of sync
 * on) the same orbital math.
 *
 * Sun direction is a slow rotation around the Y axis over time,
 * simulating a day/night cycle. Real-world day/night is a ~24h cycle;
 * running that literally would mean the terminator visibly barely
 * moves during a typical session, which defeats the brief's explicit
 * "dynamic sunlight changing Earth's illumination" requirement. Instead
 * this uses an artistically-compressed cycle (~90 seconds per full
 * rotation) so the lighting change is visibly alive within a normal
 * viewing session while still reading as a smooth, continuous cycle
 * rather than a fast strobing day/night flicker.
 */
export default function EarthMesh({ sunDirectionRef }) {
  const earthGroupRef = useRef();
  const surfaceMaterialRef = useRef();
  const atmosphereMaterialRef = useRef();

  const [dayMap, nightMap, normalMap, cloudAlphaMap] = useTexture([
    dayTexturePath,
    nightTexturePath,
    normalTexturePath,
    cloudTexturePath,
  ]);

  // Equirectangular maps should wrap horizontally (longitude wraps
  // seamlessly at ±180°) but NOT vertically (there's no wraparound at
  // the poles — wrapping vertically would visibly stitch the north
  // pole to the south pole at the seam). RepeatWrapping only on S
  // (horizontal); T (vertical) stays at the default ClampToEdge.
  useMemo(() => {
    [dayMap, nightMap, normalMap, cloudAlphaMap].forEach((tex) => {
      tex.wrapS = RepeatWrapping;
      tex.needsUpdate = true;
    });
  }, [dayMap, nightMap, normalMap, cloudAlphaMap]);

  useFrame((state, delta) => {
    // Slow planetary rotation — this is the surface/atmosphere
    // rotating together (the "Earth" as a rigid body). The cloud layer
    // is a SEPARATE mesh with its own independent rotation speed, see
    // CloudLayer.jsx — deliberately not a child of this group, so its
    // rotation doesn't compound with the Earth's.
    if (earthGroupRef.current) {
      earthGroupRef.current.rotation.y += delta * 0.018;
    }

    // Compressed day/night cycle: full rotation in ~90 seconds.
    const cycleSpeed = (Math.PI * 2) / 90;
    const elapsed = state.clock.elapsedTime;
    const sunAngle = elapsed * cycleSpeed;
    const sunDir = [Math.cos(sunAngle), 0.15, Math.sin(sunAngle)];

    if (surfaceMaterialRef.current) {
      surfaceMaterialRef.current.uSunDirection.set(...sunDir);
      surfaceMaterialRef.current.uTime = elapsed;
    }
    if (atmosphereMaterialRef.current) {
      atmosphereMaterialRef.current.uSunDirection.set(...sunDir);
    }

    // Expose the current sun direction to the parent scene (EarthExperience)
    // via ref, since the scene's actual DirectionalLight (for specular/
    // general illumination on non-Earth objects, and for the
    // holographic marker glow to visually agree with "which side is
    // lit") needs the same value without this component needing to
    // know anything about the light itself — one-way data flow out,
    // not a prop dependency in.
    if (sunDirectionRef) {
      sunDirectionRef.current = sunDir;
    }
  });

  return (
    <group ref={earthGroupRef}>
      {/* Surface sphere. 96 segments — high enough that the sphere's
          silhouette reads as smooth even at close zoom (post marker
          fly-to), without going high enough to meaningfully affect
          frame budget; sphere geometry is one mesh regardless of
          segment count, so the cost here is vertex count, not draw
          calls. */}
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS, 96, 96]} />
        {/* @ts-ignore -- custom shaderMaterial registered via extend() in EarthMaterial.js */}
        <earthMaterial
          ref={surfaceMaterialRef}
          uDayTexture={dayMap}
          uNightTexture={nightMap}
          uNormalTexture={normalMap}
          uCloudShadowTexture={cloudAlphaMap}
        />
      </mesh>

      {/* Atmosphere shell — larger radius, BackSide + additive blend
          per ATMOSPHERE_MATERIAL_PROPS (see AtmosphereMaterial.js) so
          it reads as a Fresnel rim glow around the planet's limb. */}
      <mesh scale={[ATMOSPHERE_RADIUS / EARTH_RADIUS, ATMOSPHERE_RADIUS / EARTH_RADIUS, ATMOSPHERE_RADIUS / EARTH_RADIUS]}>
        <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
        {/* @ts-ignore -- custom shaderMaterial registered via extend() in AtmosphereMaterial.js */}
        <atmosphereMaterial ref={atmosphereMaterialRef} {...ATMOSPHERE_MATERIAL_PROPS} />
      </mesh>
    </group>
  );
}
