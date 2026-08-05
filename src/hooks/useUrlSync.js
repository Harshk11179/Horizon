import { useEffect } from 'react';
import { useAppStore, SCENE_PHASE, DASHBOARD_VIEW } from './useAppStore';
import locationsData from '@data/locations.json';

const VALID_VIEWS = new Set(Object.values(DASHBOARD_VIEW));

/**
 * useUrlSync
 *
 * Two-way sync between the scene state machine and ?location=&view=
 * query params, so any app state can be shared as a link:
 *
 *   ?location=kenya                 -> flies to Kenya's marker
 *   ?location=kenya&view=compare    -> opens the dashboard on Compare
 *
 * Uses raw URLSearchParams + history.replaceState rather than React
 * Router navigation — the app's phases are store-driven, not
 * route-driven (see App.jsx's route comment), and replaceState keeps
 * the URL current without stacking history entries on every location
 * hop (which would make the Back button walk through every selection
 * ever made).
 */
export function useUrlSync() {
  // Apply the incoming URL once on mount. Setting DASHBOARD here is
  // safe against the intro sequence: IntroVeil's INTRO -> HERO handoff
  // is guarded to only fire if the phase is still INTRO.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const locationId = params.get('location');
    const view = params.get('view');

    const { setSelectedLocationId, setScenePhase, setActiveDashboardView } =
      useAppStore.getState();

    if (view && VALID_VIEWS.has(view)) {
      setActiveDashboardView(view);
      setScenePhase(SCENE_PHASE.DASHBOARD);
    }
    if (locationId && locationsData[locationId]) {
      // Order matters: with the phase already in DASHBOARD (view param),
      // this swaps data in place; otherwise it triggers the fly-to.
      setSelectedLocationId(locationId);
    }
  }, []);

  const selectedLocationId = useAppStore((state) => state.selectedLocationId);
  const scenePhase = useAppStore((state) => state.scenePhase);
  const activeDashboardView = useAppStore((state) => state.activeDashboardView);

  // Reflect state changes back into the URL.
  useEffect(() => {
    if (scenePhase === SCENE_PHASE.INTRO) return;

    const params = new URLSearchParams(window.location.search);
    if (selectedLocationId) {
      params.set('location', selectedLocationId);
    } else {
      params.delete('location');
    }
    if (scenePhase === SCENE_PHASE.DASHBOARD) {
      params.set('view', activeDashboardView);
    } else {
      params.delete('view');
    }

    const query = params.toString();
    window.history.replaceState(
      null,
      '',
      query ? `${window.location.pathname}?${query}` : window.location.pathname
    );
  }, [selectedLocationId, scenePhase, activeDashboardView]);
}
