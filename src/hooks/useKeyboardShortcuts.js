import { useEffect } from 'react';
import { useAppStore, SCENE_PHASE } from './useAppStore';
import locationsData from '@data/locations.json';

const LOCATION_IDS = Object.keys(locationsData);

/**
 * useKeyboardShortcuts
 *
 * Global keyboard navigation, mounted once in App:
 *   ← / →   cycle through locations (fly-to on the globe, in-place
 *           data swap inside the dashboard — same rules as clicking)
 *   Esc     leave the dashboard / location focus, back to the hero
 *   /       open the location search (dashboard views only)
 *
 * Reads store state via getState() inside the handler rather than
 * subscribing — shortcuts don't need re-renders, just current values
 * at keypress time.
 */
export function useKeyboardShortcuts() {
  useEffect(() => {
    function handleKeyDown(event) {
      const target = event.target;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const {
        scenePhase,
        selectedLocationId,
        setSelectedLocationId,
        clearSelectedLocation,
        requestSearchOpen,
      } = useAppStore.getState();

      if (scenePhase === SCENE_PHASE.INTRO) return;

      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        const direction = event.key === 'ArrowRight' ? 1 : -1;
        const currentIndex = LOCATION_IDS.indexOf(selectedLocationId ?? 'india');
        const nextId =
          LOCATION_IDS[(currentIndex + direction + LOCATION_IDS.length) % LOCATION_IDS.length];
        setSelectedLocationId(nextId);
      } else if (event.key === 'Escape') {
        if (
          scenePhase === SCENE_PHASE.DASHBOARD ||
          scenePhase === SCENE_PHASE.LOCATION_FOCUS
        ) {
          clearSelectedLocation();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else if (event.key === '/') {
        if (scenePhase === SCENE_PHASE.DASHBOARD) {
          event.preventDefault();
          requestSearchOpen();
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
