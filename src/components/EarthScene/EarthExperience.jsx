import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useAppStore } from '@hooks/useAppStore';
import EarthMesh from './EarthMesh';
import CloudLayer from './CloudLayer';
import CameraRig from './CameraRig';
import AuroraEffect from './AuroraEffect';
import GlobeMarkers from '@components/GlobeMarkers/GlobeMarkers';
import SelectionRings from '@components/GlobeMarkers/SelectionRings';
import Starfield from '@components/ParticleSystem/Starfield';
import SpaceDust from '@components/ParticleSystem/SpaceDust';
import Nebula from '@components/ParticleSystem/Nebula';
import { EARTH_RADIUS } from './EarthMesh';
import HeroOverlay from '@components/Hero/HeroOverlay';
import LocationOverlay from '@components/LocationOverlay/LocationOverlay';
import DashboardShell from '@components/Dashboard/DashboardShell';

/**
 * SunLight
 *
 * A real DirectionalLight that tracks the SAME sunDirectionRef value
 * EarthMesh/CloudLayer's shaders use — this is what makes non-shader
 * elements (marker materials catching a glint, anything using standard
 * Three.js lighting rather than a custom shader) agree visually with
 * where the shader-computed "sun" appears to be. Without this, you'd
 * get a scene where the Earth's shader-lit terminator says the sun is
 * in one place but any standard-material object is lit from a totally
 * different, static direction — a subtle but very noticeable
 * "something's wrong with the lighting" tell.
 */
function SunLight({ sunDirectionRef }) {
  const lightRef = useRef();

  useFrame(() => {
    if (lightRef.current && sunDirectionRef.current) {
      const [x, y, z] = sunDirectionRef.current;
      // Directional lights are positioned far away and point at the
      // target — position is direction * large distance, not the
      // direction vector itself, since DirectionalLight has no falloff
      // but DOES need a position to derive its direction from (it
      // points from position toward target).
      lightRef.current.position.set(x * 50, y * 50, z * 50);
    }
  });

  return (
    <directionalLight
      ref={lightRef}
      intensity={2.4}
      color="#FFF4E0"
      castShadow={false /* shadows disabled: this scene has no shadow-receiving
        ground plane, and the Earth's own day/night shading is computed
        in-shader (see EarthMaterial.js), not via Three.js's shadow-map
        pipeline — enabling castShadow here would cost a full shadow-map
        render pass for zero visual benefit. */}
    />
  );
}

/**
 * SceneContents
 *
 * Split out from EarthExperience itself so the sunDirectionRef can be
 * created once, above the Canvas boundary is fine too, but keeping the
 * whole 3D scene graph in one function keeps the "what's actually
 * inside the WebGL context" boundary visually obvious in this file.
 */
function SceneContents() {
  const sunDirectionRef = useRef([1, 0.15, 0]);
  // Reduced-motion setting: the animated decorative particle layers
  // (drifting nebula, space dust) are dropped entirely; the Earth,
  // markers, and static starfield remain.
  const reducedMotion = useAppStore((state) => state.reducedMotion);

  return (
    <>
      <ambientLight intensity={0.12} color="#0A1A2E" />
      <SunLight sunDirectionRef={sunDirectionRef} />

      {!reducedMotion && <Nebula />}
      <Starfield />
      {!reducedMotion && <SpaceDust />}

      <group>
        <EarthMesh sunDirectionRef={sunDirectionRef} />
        <GlobeMarkers />
        <SelectionRings />
        <AuroraEffect radius={EARTH_RADIUS} />
      </group>

      <CloudLayer sunDirectionRef={sunDirectionRef} />

      <CameraRig />
    </>
  );
}

/**
 * LoadingFallback
 *
 * Suspense fallback while textures load (useTexture in EarthMesh/
 * CloudLayer suspends until the four PNGs are decoded). Rendered
 * OUTSIDE the Canvas as a DOM overlay, not as a 3D loading mesh inside
 * it — a WebGL-context loading indicator can't render until the
 * context and its dependent async resources are ready, which is
 * exactly the state this is covering for.
 */
function LoadingFallback() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-void-950 z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-neon-blue/20 border-t-neon-blue animate-spin" />
        <span className="font-mono text-xs text-mist-dim tracking-widest uppercase">
          Initializing Earth
        </span>
      </div>
    </div>
  );
}

/**
 * EarthExperience
 *
 * Top-level mount point. The Canvas is fixed/full-viewport and sits
 * BEHIND the DOM content (HeroOverlay, and later the dashboard
 * sections) via z-index, rather than the 3D scene being one element
 * among several in normal document flow — this is what makes "the
 * globe remains visible while navigating" (an explicit brief
 * requirement) structurally true rather than something later code has
 * to work around.
 *
 * dpr capped at [1, 1.75] rather than allowing full device pixel
 * ratio (which can be 3+ on high-density mobile screens) — this is a
 * direct response to the brief's "maintain 60 FPS" / "optimize
 * rendering" requirements: rendering at 3x pixel density for a scene
 * this shader-heavy (multiple full-screen custom fragment shaders,
 * bloom postprocessing) is the single most expensive lever available,
 * and the visual difference above ~1.75x is not perceptible enough on
 * a scene with no fine text inside the WebGL canvas itself to justify
 * the cost.
 */
export default function EarthExperience() {
  return (
    <div className="relative w-full">
      {/* Fixed 3D layer — stays mounted and visible behind all DOM content */}
      <div className="fixed inset-0 z-0">
        <Canvas
          dpr={[1, 1.75]}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          camera={{ fov: 42, near: 0.1, far: 300, position: [0, 0, 8.5] }}
        >
          <Suspense fallback={null}>
            <SceneContents />
          </Suspense>

          <EffectComposer multisampling={0} /* multisampling disabled: bloom + custom shaders
            already cost meaningfully more than a standard scene; MSAA
            on top of that is the second-most expensive lever after DPR,
            and Canvas's own antialias:true above already smooths mesh
            edges — this avoids paying for antialiasing twice through
            two different mechanisms. */>
            <Bloom
              intensity={0.65}
              luminanceThreshold={0.2}
              luminanceSmoothing={0.9}
              mipmapBlur
            />
            <Vignette eskil={false} offset={0.15} darkness={0.6} />
          </EffectComposer>
        </Canvas>
      </div>

      {/* DOM overlay layer — hero text, buttons, location overlay, and
          the Mission Control dashboard all render ABOVE the fixed 3D
          layer via normal document flow + z-10, and this element's
          height is what actually drives scroll (the Canvas itself has
          no scrollable height, it's fixed/full-viewport) — see
          useScrollProgress's containerRef usage in App.jsx, which
          measures THIS document's scroll height, not the Canvas's. */}
      <div className="relative z-10">
        <Suspense fallback={<LoadingFallback />}>
          <HeroOverlay />
          <LocationOverlay />
          <DashboardShell />
        </Suspense>
      </div>
    </div>
  );
}
