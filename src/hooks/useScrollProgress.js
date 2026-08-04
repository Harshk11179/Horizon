import { useEffect } from 'react';
import { useAppStore, SCENE_PHASE } from './useAppStore';

/**
 * Tracks overall page scroll as a 0-1 progress value against a target
 * scroll container's height, writes it into useAppStore.
 *
 * Uses a passive scroll listener with requestAnimationFrame throttling
 * rather than firing a store update on every scroll event directly —
 * scroll events can fire faster than one per frame, and Zustand's set()
 * still triggers subscriber re-renders, so throttling to rAF keeps this
 * aligned with the actual render budget instead of over-updating.
 */
export function useScrollProgress(containerRef) {
  const setScrollProgress = useAppStore((state) => state.setScrollProgress);
  const scenePhase = useAppStore((state) => state.scenePhase);
  const setScenePhase = useAppStore((state) => state.setScenePhase);

  useEffect(() => {
    let ticking = false;

    function computeProgress() {
      const container = containerRef.current;
      if (!container) {
        ticking = false;
        return;
      }

      const scrollableHeight = container.scrollHeight - window.innerHeight;
      const progress = scrollableHeight > 0
        ? Math.min(Math.max(window.scrollY / scrollableHeight, 0), 1)
        : 0;

      setScrollProgress(progress);

      // Only transition HERO -> SCROLLING automatically. Once a location
      // is focused or the user has entered the dashboard, scroll no
      // longer drives scene phase — those transitions are explicit
      // (marker click, "Enter Dashboard" button), not scroll-driven.
      if (progress > 0.02 && scenePhase === SCENE_PHASE.HERO) {
        setScenePhase(SCENE_PHASE.SCROLLING);
      } else if (progress <= 0.02 && scenePhase === SCENE_PHASE.SCROLLING) {
        setScenePhase(SCENE_PHASE.HERO);
      }

      ticking = false;
    }

    function handleScroll() {
      if (!ticking) {
        requestAnimationFrame(computeProgress);
        ticking = true;
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, scenePhase]);
}
