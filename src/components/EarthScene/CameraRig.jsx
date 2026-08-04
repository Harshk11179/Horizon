import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useAppStore, SCENE_PHASE } from '@hooks/useAppStore';
import { usePointerPosition } from '@hooks/usePointerPosition';
import { geoToCameraPosition } from '@utils/geoToVector3';
import { EARTH_RADIUS } from './EarthMesh';
import locationsData from '@data/locations.json';

const HERO_DISTANCE = 8.5;
const SCROLL_MIN_DISTANCE = 8.5;
const SCROLL_MAX_DISTANCE = 3.4;
const FOCUS_DISTANCE = 1.15;
const AUTO_ORBIT_SPEED = 0.035;
const PARALLAX_STRENGTH = 0.28;
const FLY_TO_DURATION = 2.2; // seconds

/**
 * CameraRig
 *
 * ONE component owns camera.position/lookAt each frame. This is
 * deliberate and important: the brief asks for auto-orbit, mouse
 * parallax, scroll-driven zoom, AND marker fly-to, all "smooth" and
 * "cinematic" — if these were four separate useFrame hooks in four
 * separate components each nudging the camera, they'd stomp on each
 * other's writes every frame (whichever runs last wins, arbitrarily,
 * per React's effect ordering) and produce visible jitter. Centralizing
 * ownership here means exactly one behavior is authoritative per frame,
 * chosen by scenePhase, with the others blended in as modifiers rather
 * than competing writers.
 *
 * Orbit angle is a ref, not state, since it's a continuous value only
 * ever read inside useFrame — putting it in React state would trigger
 * unnecessary re-renders at 60fps for a value nothing outside the
 * render loop needs to read.
 *
 * locationsData is imported directly (not via the async service layer)
 * because this is a synchronous geometry lookup (lat/lng for a fly-to
 * target), not a data-fetching concern — the async service layer
 * exists for UI-facing data that will eventually come from the FastAPI
 * backend; camera math needs the coordinate the instant scenePhase
 * changes, with no acceptable loading state in between.
 */
export default function CameraRig() {
  const { camera } = useThree();
  const pointerRef = usePointerPosition();

  const scenePhase = useAppStore((state) => state.scenePhase);
  const scrollProgress = useAppStore((state) => state.scrollProgress);
  const selectedLocationId = useAppStore((state) => state.selectedLocationId);

  const orbitAngleRef = useRef(0);
  const currentDistanceRef = useRef(HERO_DISTANCE);
  const flyToStartRef = useRef(null); // { fromPos: Vector3, toPos: Vector3, startTime: number } | null
  const lookAtTargetRef = useRef(new Vector3(0, 0, 0));

  // When a location becomes selected, kick off a fly-to animation from
  // wherever the camera currently is toward a position above that
  // location. Runs as an effect (not inline in useFrame) because it
  // should fire exactly once per selection change, not be evaluated
  // every frame.
  useEffect(() => {
    if (scenePhase !== SCENE_PHASE.LOCATION_FOCUS || !selectedLocationId) {
      flyToStartRef.current = null;
      return;
    }

    const location = locationsData[selectedLocationId];
    if (!location) return;

    const toPos = geoToCameraPosition(location.lat, location.lng, EARTH_RADIUS, FOCUS_DISTANCE);
    flyToStartRef.current = {
      fromPos: camera.position.clone(),
      toPos,
      startTime: performance.now() / 1000,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenePhase, selectedLocationId]);

  useFrame((state, delta) => {
    // --- FLY-TO: takes full authority when active, overrides everything else ---
    if (scenePhase === SCENE_PHASE.LOCATION_FOCUS && flyToStartRef.current) {
      const { fromPos, toPos, startTime } = flyToStartRef.current;
      const elapsed = performance.now() / 1000 - startTime;
      const t = Math.min(elapsed / FLY_TO_DURATION, 1);

      // Ease-in-out cubic — matches the brief's "cinematic" camera
      // movement without literal elastic/bounce easing, which would
      // look wrong for a camera: elastic overshoot reads fine for a UI
      // element snapping into place, but a camera overshooting past
      // its target and snapping back reads as a mistake, not polish.
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      camera.position.lerpVectors(fromPos, toPos, eased);
      camera.lookAt(0, 0, 0);

      if (t >= 1) {
        flyToStartRef.current = null; // animation complete, hand control to steady-state focus below
      }
      return;
    }

    // --- STEADY-STATE FOCUS: fly-to finished, hold position with gentle mouse parallax only ---
    if (scenePhase === SCENE_PHASE.LOCATION_FOCUS && !flyToStartRef.current) {
      const px = pointerRef.current.x * PARALLAX_STRENGTH * 0.4;
      const py = pointerRef.current.y * PARALLAX_STRENGTH * 0.4;
      const target = camera.position.clone();
      target.x = target.x * 0.98 + px * 0.02;
      target.y = target.y * 0.98 + py * 0.02;
      camera.position.lerp(target, Math.min(delta * 2, 1));
      camera.lookAt(0, 0, 0);
      return;
    }

    // --- HERO / SCROLLING: auto-orbit + mouse parallax + scroll-driven distance ---
    orbitAngleRef.current += delta * AUTO_ORBIT_SPEED;

    const targetDistance =
      scenePhase === SCENE_PHASE.SCROLLING
        ? SCROLL_MIN_DISTANCE + (SCROLL_MAX_DISTANCE - SCROLL_MIN_DISTANCE) * scrollProgress
        : HERO_DISTANCE;

    // Smooth (not instant) distance interpolation — an instant jump to
    // targetDistance on every scroll-tick would feel stepped rather
    // than fluid, even though scrollProgress itself updates smoothly
    // (see useScrollProgress.js's rAF throttling). Lerping the actual
    // distance value adds a small trailing-follow feel that reads as
    // "the camera is flying," not "the camera is a slider handle."
    currentDistanceRef.current += (targetDistance - currentDistanceRef.current) * Math.min(delta * 2.2, 1);

    const orbitX = Math.sin(orbitAngleRef.current) * currentDistanceRef.current;
    const orbitZ = Math.cos(orbitAngleRef.current) * currentDistanceRef.current;

    // Mouse parallax: small offset added on top of the orbit position,
    // NOT a replacement for it — this is what makes it read as "the
    // camera gently drifts with the mouse" rather than "the mouse
    // fully controls the camera" (the brief specifically says orbit is
    // automatic and mouse only "gently influences" it).
    const parallaxX = pointerRef.current.x * PARALLAX_STRENGTH;
    const parallaxY = pointerRef.current.y * PARALLAX_STRENGTH * 0.6; // less vertical than horizontal — reads as more natural, avoids the camera tilting into the poles

    camera.position.x += (orbitX + parallaxX - camera.position.x) * Math.min(delta * 3, 1);
    camera.position.y += (parallaxY - camera.position.y) * Math.min(delta * 3, 1);
    camera.position.z += (orbitZ - camera.position.z) * Math.min(delta * 3, 1);

    lookAtTargetRef.current.set(0, 0, 0);
    camera.lookAt(lookAtTargetRef.current);
  });

  return null;
}
