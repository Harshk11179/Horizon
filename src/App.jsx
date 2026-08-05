import { useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useScrollProgress } from '@hooks/useScrollProgress';
import { usePointerPosition } from '@hooks/usePointerPosition';
import { useKeyboardShortcuts } from '@hooks/useKeyboardShortcuts';
import { useUrlSync } from '@hooks/useUrlSync';
import EarthExperience from '@components/EarthScene/EarthExperience';

/**
 * CursorGlow — pure CSS effect driven by the usePointerPosition hook's
 * side-effect (writing --x/--y custom properties). Rendered once, at
 * the top of the tree, so it sits above everything else regardless of
 * which route/phase is active.
 */
function CursorGlow() {
  usePointerPosition();
  return <div className="cursor-glow" aria-hidden="true" />;
}

export default function App() {
  const scrollContainerRef = useRef(null);
  useScrollProgress(scrollContainerRef);
  useKeyboardShortcuts();
  useUrlSync();

  return (
    <div ref={scrollContainerRef} className="relative min-h-screen bg-void-950">
      <CursorGlow />

      <Routes>
        {/*
          Single root route for now: the Earth experience IS the landing
          page, and it internally transitions from hero -> scroll ->
          location-focus -> dashboard via useAppStore's scenePhase,
          rather than through separate router pages. This matches the
          brief's "no page reloads... everything should animate
          smoothly" requirement for the marker-click and
          enter-dashboard transitions.

          Dedicated /citizen and /professional routes are added in the
          next build phase once those views exist, for direct-link
          and back/forward-button support — but the primary path into
          them stays the in-scene navigation, not URL navigation.
        */}
        <Route path="/*" element={<EarthExperience />} />
      </Routes>
    </div>
  );
}
